import http from 'node:http';import {readFile} from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';import {randomUUID,timingSafeEqual} from 'node:crypto';
import {runAgent,modelPlanner} from './runner.mjs';import {demoHtml,demoPlanner} from './demo.mjs';
const home=path.dirname(fileURLToPath(import.meta.url)),root=path.dirname(home),outputDir=path.join(root,'agent-results');const port=Number(process.env.AGENT_PORT||4189),token=randomUUID(),jobs=new Map();let active=null;
const json=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
const server=http.createServer(async(req,res)=>{res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');if(!['127.0.0.1:'+port,'localhost:'+port].includes(req.headers.host))return json(res,403,{error:'仅允许本机访问'});const origin=req.headers.origin;if(origin&&!['http://127.0.0.1:'+port,'http://localhost:'+port].includes(origin))return json(res,403,{error:'仅允许本机页面发起请求'});const url=new URL(req.url,'http://127.0.0.1:'+port);
 try{
  if(req.method==='GET'&&url.pathname==='/')return serve(res,path.join(home,'ui.html'),'text/html; charset=utf-8');
  if(req.method==='GET'&&url.pathname==='/session')return json(res,200,{token,active});
  if(url.pathname.startsWith('/api/')){const given=Buffer.from(req.headers['x-agent-token']||''),expected=Buffer.from(token);if(given.length!==expected.length||!timingSafeEqual(given,expected))return json(res,403,{error:'本机会话失效，请刷新'});
   if(req.method==='POST'&&url.pathname==='/api/run'){
    if(active)return json(res,409,{error:'已有任务运行，请等完成或停止'});let body='';for await(const part of req){body+=part;if(Buffer.byteLength(body)>1200000)return json(res,413,{error:'HTML过大'});}const input=JSON.parse(body);const demo=['broken','fixed'].includes(input.demo),html=demo?demoHtml(input.demo==='fixed'):input.html;if(!demo&&input.consent!==true)return json(res,400,{error:'请确认本次模型调用'});if(typeof html!=='string'||html.length>1000000||!/<html[\s>]/i.test(html))return json(res,400,{error:'需上传1MB内完整HTML'});const planner=demo?demoPlanner():modelPlanner(input.model||{});const id=randomUUID(),controller=new AbortController();const job={id,status:'running',mode:demo?'执行器脚本自测（非LLM）':'模型驱动Agent',events:[],controller};jobs.set(id,job);active=id;json(res,202,{id});
    void runAgent({html,planner,outputDir,signal:controller.signal,maxSteps:20,timeoutMs:120000,onEvent:event=>job.events.push(event)}).then(report=>{job.report=report;job.status='done';}).catch(err=>{job.error=String(err.message);job.status='error';}).finally(()=>{active=null;});return;
   }
   const match=url.pathname.match(/^\/api\/jobs\/([a-f0-9-]+)(\/stop)?$/);if(match){const job=jobs.get(match[1]);if(!job)return json(res,404,{error:'任务不存在'});if(req.method==='POST'&&match[2]){job.controller.abort();return json(res,200,{stopping:true});}if(req.method==='GET')return json(res,200,{id:job.id,status:job.status,mode:job.mode,error:job.error,events:job.events,report:job.report});}
   const artifact=url.pathname.match(/^\/api\/artifacts\/([a-f0-9-]{36})\/([\w-]+\.(?:png|json))$/);if(req.method==='GET'&&artifact){return serve(res,path.join(outputDir,artifact[1],artifact[2]),artifact[2].endsWith('.png')?'image/png':'application/json');}
  }
  json(res,404,{error:'不存在'});
 }catch(err){json(res,400,{error:err instanceof SyntaxError?'请求不是有效JSON':err.message});}
});
async function serve(res,file,type){try{const data=await readFile(file);res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'});res.end(data);}catch{json(res,404,{error:'文件不存在'});}}
server.listen(port,'127.0.0.1',()=>console.log('测试Agent：http://127.0.0.1:'+port+'（只监听本机，不会自动调用API）'));
