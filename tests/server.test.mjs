import test from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {createServer,parseModelResult} from '../server.mjs';
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

test('project endpoint accepts a new request and returns a constrained model draft', async t => {
  const server=createServer({LAB_API_BASE:'https://provider.test/v1',LAB_API_KEY:'secret-upstream',LAB_MODEL:'model-id',LAB_ALLOWED_ORIGIN:'http://127.0.0.1:4173'},async()=>new Response(JSON.stringify({choices:[{message:{content:JSON.stringify({project:{title:'水循环探索',interactionType:'process-simulation',conditions:[{label:'蒸发',observation:'水受热变成水蒸气。'},{label:'凝结',observation:'水蒸气遇冷形成水滴。'}]}})}}]}),{status:200}));
  server.listen(0,'127.0.0.1');await once(server,'listening');t.after(()=>server.close());const base=`http://127.0.0.1:${server.address().port}`;
  const headers={'Content-Type':'application/json',Origin:'http://127.0.0.1:4173'};
  const response=await fetch(base+'/api/project/generate',{method:'POST',headers,body:JSON.stringify({brief,request:{text:'请制作水循环过程交互'}})});
  assert.equal(response.status,200);const result=await response.json();assert.equal(result.project.interactionType,'process-simulation');assert.equal(result.project.conditions.length,2);
});
