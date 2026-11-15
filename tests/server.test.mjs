import test from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {createServer,parseModelResult,resolveModelBase} from '../server.mjs';
import {presets,normalizeBrief} from '../public/engine.js';
const brief=normalizeBrief({...presets[0],preset:'root'});
test('proxy protects credentials and validates the model result',async t=>{
  let upstream;
  const server=createServer({LAB_API_BASE:'https://provider.test/v1',LAB_API_KEY:'secret-upstream',LAB_MODEL:'model-id',LAB_ACCESS_TOKEN:'access',LAB_ALLOWED_ORIGIN:'https://demo.test'},async(url,opts)=>{upstream={url,opts};return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify({experiment:brief})}}]}),{status:200});});
  server.listen(0,'127.0.0.1');await once(server,'listening');t.after(()=>server.close());const base=`http://127.0.0.1:${server.address().port}`;
  assert.equal((await fetch(base+'/api/health')).status,401);
  const headers={Authorization:'Bearer access','Content-Type':'application/json',Origin:'https://demo.test'};
  const health=await fetch(base+'/api/health',{headers});assert.deepEqual(await health.json(),{configured:true,service:'ai-lab-workbench'});
  assert.equal((await fetch(base+'/api/health',{headers:{...headers,Origin:'https://other.test'}})).status,403);
  const res=await fetch(base+'/api/generate',{method:'POST',headers,body:JSON.stringify({stage:'plan',brief})});assert.equal(res.status,200);const result=await res.json();assert.equal(result.experiment.scene,'root');assert.equal(upstream.url,'https://provider.test/v1/chat/completions');assert.equal(upstream.opts.headers.Authorization,'Bearer secret-upstream');assert.equal(JSON.parse(upstream.opts.body).response_format.type,'json_object');assert.ok(!JSON.stringify(result).includes('secret-upstream'));
  assert.equal((await fetch(base+'/.env')).status,404);assert.equal((await fetch(base+'/server.mjs')).status,404);
});
test('model output cannot silently replace approved conditions',()=>{assert.throws(()=>parseModelResult(JSON.stringify({experiment:{...brief,options:brief.options.slice(1)}}),'plan',brief));assert.throws(()=>parseModelResult('not json','plan',brief));});
test('project model output must declare a real drag interaction',()=>{const project={project:{title:'水循环',interactionDesign:{sceneTitle:'水滴路线',rationale:'把水的状态变化变成路线。',userActions:[{label:'拖动',action:'拖动水滴',effect:'水滴移动。'},{label:'观察',action:'查看云层',effect:'云滴形成。'}],visualElements:['水滴','云层']},conditions:[{label:'蒸发',observation:'水蒸气上升。'},{label:'凝结',observation:'云滴形成。'}]}};assert.throws(()=>parseModelResult(JSON.stringify(project),'project',brief,{text:'请制作水循环过程交互'}),/可拖拽/);});
test('project parser normalizes conditions nested in the design',()=>{const project={project:{title:'水循环',interactionType:'process-simulation',interactionDesign:{sceneTitle:'水滴路线',rationale:'把水的状态变化变成路线。',userActions:[{label:'拖动',action:'拖动水滴',effect:'水滴移动。'},{label:'观察',action:'查看云层',effect:'云滴形成。'}],visualElements:['水滴','云层','雨线'],directManipulation:{type:'drag-route',instruction:'按水循环顺序拖动水滴。',successFeedback:'水滴完成循环。',errorFeedback:'先补上缺少的阶段。',draggableElements:[{id:'drop',label:'水滴',description:'正在循环的水滴'}],dropZones:[{id:'surface',label:'地表水',description:'水循环起点',accepts:['drop'],successFeedback:'从地表出发。',errorFeedback:'先回到地表。'}]},conditions:[{label:'蒸发',observation:'水受热变成水蒸气。'},{label:'凝结',observation:'水蒸气遇冷形成云滴。'}]}}};const parsed=parseModelResult(JSON.stringify(project),'project',brief,{text:'请制作水循环过程交互'});assert.equal(parsed.project.conditions.length,2);});
test('model project must stay related to the request and provider base can be inferred',()=>{
  const unrelated={project:{title:'星系探索',interactionType:'process-simulation',interactionDesign:{sceneTitle:'星系轨道台',rationale:'观察天体关系。',userActions:[{label:'看恒星',action:'点击恒星',effect:'显示恒星。'},{label:'看行星',action:'点击行星',effect:'显示行星。'}],visualElements:['恒星','行星'],directManipulation:{type:'drag-route',instruction:'拖动天体到轨道。',successFeedback:'轨道完成。',errorFeedback:'根据轨道关系修正。',draggableElements:[{id:'star',label:'恒星',description:'发光天体'}],dropZones:[{id:'orbit',label:'轨道',description:'行星运行的路径',accepts:['star'],successFeedback:'恒星进入轨道。',errorFeedback:'先观察轨道。'}] }},conditions:[{label:'恒星',observation:'恒星发光。'},{label:'行星',observation:'行星绕恒星运行。'}]}};
  assert.throws(()=>parseModelResult(JSON.stringify(unrelated),'project',brief,{text:'请制作水循环过程交互'}),/不相关/);
  assert.equal(resolveModelBase('','deepseek-chat'),'https://api.deepseek.com/v1');
  assert.equal(resolveModelBase('','qwen-plus'),'https://dashscope.aliyuncs.com/compatible-mode/v1');
  assert.equal(resolveModelBase('https://custom.example/v1','deepseek-chat'),'https://custom.example/v1');
});

test('project endpoint accepts a new request and returns a constrained model draft', async t => {
  const payload={project:{title:'水循环探索',interactionType:'process-simulation',interactionDesign:{sceneTitle:'一滴水的天空旅行',rationale:'把水循环变成可观察路线。',userActions:[{label:'蒸发',action:'点击蒸发',effect:'水滴上升。'},{label:'凝结',action:'点击凝结',effect:'云中形成水滴。'}],visualElements:['地表水池','云层'],directManipulation:{type:'drag-route',instruction:'拖动水滴沿路线移动。',successFeedback:'水滴完成路线。',errorFeedback:'按照水循环顺序修正。',draggableElements:[{id:'drop',label:'水滴',description:'正在旅行的水滴'}],dropZones:[{id:'surface',label:'地表',description:'水循环起点',accepts:['drop'],successFeedback:'水滴从地表出发。',errorFeedback:'从地表开始。'}] }},conditions:[{label:'蒸发',observation:'水受热变成水蒸气。'},{label:'凝结',observation:'水蒸气遇冷形成水滴。'}]}};
  const server=createServer({LAB_API_BASE:'https://provider.test/v1',LAB_API_KEY:'secret-upstream',LAB_MODEL:'model-id',LAB_ALLOWED_ORIGIN:'http://127.0.0.1:4173'},async()=>new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(payload)}}]}),{status:200}));
  server.listen(0,'127.0.0.1');await once(server,'listening');t.after(()=>server.close());const base=`http://127.0.0.1:${server.address().port}`;
  const headers={'Content-Type':'application/json',Origin:'http://127.0.0.1:4173'};
  const response=await fetch(base+'/api/project/generate',{method:'POST',headers,body:JSON.stringify({brief,request:{text:'请制作水循环过程交互'}})});
  assert.equal(response.status,200);const result=await response.json();assert.equal(result.project.interactionType,'process-simulation');assert.equal(result.project.interactionDesign.directManipulation.type,'drag-route');assert.equal(result.project.conditions.length,2);
});
