import test from 'node:test';
import assert from 'node:assert/strict';
import {creativeMessages,readCreativeResult,protectHtml} from '../public/creative.js';
import {generateProject,projectDocuments,projectHtml,bundleProjectFiles} from '../public/project.js';
test('free design and complete resources reach generation without fixed mechanics',()=>{
 const p=generateProject({text:'探索海洋深度'});p.freePlan='学生自由观察';p.freeSpec='连续控制潜水深度，不设拖拽';p.assets=[{file:'turtle.svg',kind:'角色',purpose:'海龟上浮动画',status:'内联绘制'}];
 const docs=projectDocuments(p);assert.equal(docs.spec,p.freeSpec);assert.ok(docs.prompt.includes('海龟上浮动画'));
 const messages=creativeMessages('html',{project:p,prompt:docs.prompt});assert.ok(messages[1].content.includes('连续控制潜水深度'));assert.ok(messages[0].content.includes('不受旧'));
 p.generatedHtml=protectHtml('<html><body><button>下潜</button><script>let depth=0;</script></body></html>');
 assert.equal(projectHtml(p),p.generatedHtml);assert.equal(bundleProjectFiles(p,projectDocuments(p)).find(f=>f.name==='index.html').content,p.generatedHtml);
 assert.ok(!projectDocuments(p).prompt.includes('let depth=0'));assert.ok(p.generatedHtml.indexOf('connect-src')<p.generatedHtml.indexOf('<script>'));
});
test('reject truncated HTML and incomplete free design',()=>{
 assert.throws(()=>readCreativeResult('html','{"html":"<html>"}'));
 assert.throws(()=>readCreativeResult('project','{"plan":"x","spec":"y","assets":[]}'));
 assert.equal(readCreativeResult('revise','{"text":"新方案"}').text,'新方案');
});

test("standalone HTML does not need JSON escaping",()=>{const html='<!doctype html><html><body><script>const label="下潜";</script></body></html>';assert.equal(readCreativeResult("html",html).html,html);});

test("extract complete HTML surrounded by model explanations",()=>{const html='<html><body><script>let depth=1;</script></body></html>';assert.equal(readCreativeResult("html","下面是网页：\n```html\n"+html+"\n```\n说明").html,html);});
