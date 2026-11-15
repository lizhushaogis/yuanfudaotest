import test from 'node:test';
import assert from 'node:assert/strict';
import {presets,normalizeBrief,buildConfig,buildDocuments,assetsFor,markdownToHtml,experimentHtml,bundleFiles,createZip} from '../public/engine.js';
const brief=normalizeBrief({...presets[0],preset:presets[0].id});
test('all presets keep their scene and matching document / asset references',()=>{
  for(const p of presets){const b=normalizeBrief({...p,preset:p.id}),c=buildConfig(b),docs=buildDocuments(b,c),files=bundleFiles(b,c,docs,'template');assert.equal(c.scene,p.id);assert.equal(files.length,8);for(const o of c.options){assert.ok(docs.spec.includes(o.label));assert.ok(docs.assets.includes(o.image));assert.ok(docs.prompt.includes(o.id));}assert.equal(assetsFor(c).length,2*c.options.length+3);assert.ok(docs.spec.includes('动画与已开启的朗读均结束'));}
});
test('invalid briefs and model condition structures are rejected',()=>{
  assert.throws(()=>normalizeBrief({...brief,options:[brief.options[0]]}));
  assert.throws(()=>normalizeBrief({...brief,options:[brief.options[0],brief.options[0]]}));
  assert.throws(()=>buildConfig(brief,{options:[{label:'a',observation:''},{label:'b',observation:'x'}]}));
});
test('untrusted text is escaped in documents and standalone scripts',()=>{
  const attack='</script><img src=x onerror=alert(1)>';
  assert.ok(!markdownToHtml('# '+attack).includes('<img'));
  const c=buildConfig({...brief,title:attack}),html=experimentHtml(c);
  assert.ok(!html.includes(attack));assert.ok(html.includes('\\u003c/script>'));assert.equal((html.match(/<script>/g)||[]).length,1);assert.ok(!html.includes('https://'));
});
test('ZIP central directory points to exact UTF-8 file payloads',()=>{
  const files=[{name:'示例.md',content:'教学内容\n你好'},{name:'index.html',content:'<p>test</p>'}],zip=createZip(files),v=new DataView(zip.buffer),decoder=new TextDecoder();
  const end=zip.length-22;assert.equal(v.getUint32(end,true),0x06054b50);assert.equal(v.getUint16(end+8,true),files.length);
  let at=v.getUint32(end+16,true);
  for(const f of files){assert.equal(v.getUint32(at,true),0x02014b50);const len=v.getUint16(at+28,true),offset=v.getUint32(at+42,true);assert.equal(decoder.decode(zip.slice(at+46,at+46+len)),f.name);assert.equal(v.getUint32(offset,true),0x04034b50);const n=v.getUint16(offset+26,true),size=v.getUint32(offset+18,true);assert.equal(decoder.decode(zip.slice(offset+30+n,offset+30+n+size)),f.content);at+=46+len;}
});
