export const experimentMarkup = `<main class="lab"><header><div><span class="eyebrow">INTERACTIVE EXPLORATION</span><h1 id="title"></h1></div><button id="reset" class="quiet">↺ 重新探索</button></header><p id="question"></p><div class="layout"><section class="scene"><div id="drawing"></div><span class="scene-note">概念示意 · 非测量数据</span></section><section class="controls"><div class="progress"><span id="progress"></span><button id="voice" class="quiet" aria-pressed="false">语音：关闭</button></div><div id="options"></div><button id="start" class="primary">开始探索 →</button><div id="feedback" class="feedback" role="status" aria-live="polite"></div></section></div><div id="conclusion" class="conclusion" hidden></div></main>`;

export const experimentStyles = `*{box-sizing:border-box}body{margin:0;background:#f8fafc;color:#26354b;font-family:Inter,"Microsoft YaHei",system-ui,sans-serif;font-size:14px}.lab{max-width:1000px;margin:auto;padding:25px}header{display:flex;justify-content:space-between;gap:12px;align-items:center}.eyebrow{font-size:9px;letter-spacing:2px;color:#7d8fa8}h1{font-size:22px;margin:7px 0 0}#question{color:#758398;font-size:12px;line-height:1.7;margin:13px 0 20px}.layout{display:grid;grid-template-columns:1.25fr 1fr;gap:22px}.scene{position:relative;min-height:235px;border:1px solid #dce8e8;border-radius:16px;overflow:hidden;background:#eff6f4;display:flex;align-items:center}#drawing{width:100%;transition:opacity .2s}svg{display:block;width:100%;height:auto}.scene-note{position:absolute;bottom:10px;left:12px;color:#7a928a;font-size:9px}.progress{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px;font-size:11px;color:#8793a5}button{font:inherit;cursor:pointer;transition:background .2s}button:focus-visible{outline:3px solid #a9bafa;outline-offset:3px}.quiet{padding:7px 0;border:0;background:transparent;color:#78869c;font-size:11px;white-space:nowrap}.option{padding:12px 13px;width:100%;margin-bottom:8px;text-align:left;display:flex;align-items:center;justify-content:space-between;border:1px solid #dfe5ec;background:#fff;border-radius:9px;color:#364660;font-size:12px}.option:disabled{cursor:default;opacity:.5}.option.done{opacity:1;background:#eff7f2;border-color:#cce3d5;color:#467f60}.option.active{border-color:#a8b9f9;background:#f0f3ff;opacity:1}.primary{border:0;background:#344de8;color:#fff;padding:11px 18px;border-radius:8px;font-size:12px;width:100%;margin-top:5px}.feedback{margin-top:14px;line-height:1.85;font-size:11px;color:#66758c;min-height:55px}.conclusion{margin-top:18px;background:#edf2ff;border:1px solid #dce5fc;border-radius:10px;padding:14px 18px;font-size:12px;line-height:1.9;color:#506088}[hidden]{display:none!important}.nutrient{animation:float 2s ease-in-out infinite alternate}.particle{animation:bounce var(--speed,4s) ease-in-out infinite alternate;transform-origin:center}.active-scene .root-glow{animation:pulse 1.2s ease-in-out infinite alternate}@keyframes float{to{transform:translate(5px,-7px)}}@keyframes bounce{to{transform:translate(16px,-12px)}}@keyframes pulse{to{opacity:.45}}@media(max-width:600px){.lab{padding:18px}h1{font-size:18px}.layout{grid-template-columns:1fr;gap:16px}.scene{min-height:180px}svg{max-height:200px}header{align-items:start}#question{margin-bottom:12px}}@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation:none!important;transition:none!important}}`;

// Self-contained so the same function can run in a sandboxed preview or an offline HTML file.
export function experimentRuntime(config) {
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let state = 'initial', completed = new Set(), active = -1, voice = false, epoch = 0;
  const timers = new Set();
  const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
  const speak = text => new Promise(resolve => {
    if (!voice || !('speechSynthesis' in window)) return resolve();
    window.speechSynthesis.cancel();
    let settled = false;
    const finish = () => { if (settled) return; settled = true; clearTimeout(timeout); timers.delete(timeout); resolve(); };
    const timeout = later(() => { window.speechSynthesis.cancel(); finish(); }, 25000);
    try { const u = new SpeechSynthesisUtterance(text); u.lang='zh-CN'; u.rate=1; u.onend=finish; u.onerror=finish; window.speechSynthesis.speak(u); } catch { finish(); }
  });
  function draw(index) {
    const color = /^#[0-9a-f]{6}$/i.test(config.options[index]?.color || '') ? config.options[index].color : '#8cb6a5';
    let content;
    if (config.scene === 'root') {
      const dots = Array.from({length:20},(_,i)=>`<circle class="nutrient" cx="${24+(i*67)%310}" cy="${104+(i*23)%140}" r="${i%3+2}" fill="${i%2?'#93c4d9':'#e2c791'}" style="animation-delay:${i*.13}s"/>`).join('');
      content=`<path d="M0 99 Q100 87 180 99 T360 95V280H0Z" fill="#e7e0cc"/><path d="M180 103V56" stroke="#579b73" stroke-width="8"/><path d="M180 65Q140 69 133 35Q173 27 180 65M183 57Q187 19 222 25Q222 59 183 57" fill="#83b395"/>${dots}<g stroke="#ba926c" stroke-width="6" fill="none" stroke-linecap="round"><path d="M180 102Q166 167 183 241M177 131Q137 146 121 194M174 159Q209 166 235 208M178 190Q153 209 149 237"/></g>${index===1?'<g fill="#b397db" class="root-glow"><circle cx="168" cy="149" r="10"/><circle cx="179" cy="190" r="8"/><circle cx="200" cy="170" r="7"/></g>':index===2?'<g stroke="#bfa26b" stroke-width="2" fill="none" class="root-glow"><path d="M175 153L105 135L59 161M105 135L82 108M181 184L263 150L310 177M263 150L294 120M153 211L84 228L49 207M84 228L73 251"/></g>':'<g stroke="#ba926c" stroke-width="1.5"><path d="M125 180l-15-4m17-6l-16-7m55-8l-12-7m76 47l16-4m-64 30l14 3"/></g>'}`;
    } else if (config.scene === 'molecules') {
      content=`<rect x="35" y="26" width="290" height="220" rx="18" fill="#fff" stroke="#c7d9e9" stroke-width="3"/>${Array.from({length:22},(_,i)=>`<circle class="particle" style="--speed:${index<0?4:5-index*1.8}s;animation-delay:-${i*.37}s" cx="${58+(i*47)%240}" cy="${51+(i*61)%170}" r="7" fill="${color}" opacity=".8"/>`).join('')}`;
    } else if (config.scene === 'cells') {
      content=index===1?'<ellipse cx="180" cy="140" rx="104" ry="80" fill="#eee6f5" stroke="#bc99d7" stroke-width="5"/><ellipse cx="190" cy="143" rx="25" ry="20" fill="#c0a2d5"/><path d="M111 119q20-18 37 1m62 57q22-18 34 1" fill="none" stroke="#c9b1db" stroke-width="8"/>':index===2?'<ellipse cx="175" cy="150" rx="62" ry="79" fill="#f1e5d3" stroke="#c7a578" stroke-width="5"/><ellipse cx="234" cy="76" rx="28" ry="34" fill="#f1e5d3" stroke="#c7a578" stroke-width="5"/><ellipse cx="175" cy="150" rx="17" ry="22" fill="#c7a578"/>':'<rect x="75" y="54" width="210" height="172" rx="25" fill="#e0efdf" stroke="#83ad84" stroke-width="7"/><rect x="118" y="91" width="120" height="99" rx="26" fill="#cae3e8"/><circle cx="103" cy="105" r="12" fill="#acbad9"/><g fill="#7eac83"><ellipse cx="103" cy="175" rx="8" ry="16"/><ellipse cx="258" cy="100" rx="8" ry="16"/><ellipse cx="247" cy="199" rx="14" ry="7"/></g>';
    } else {
      content=`<circle cx="180" cy="135" r="75" fill="${color}" opacity=".15"/><circle cx="180" cy="135" r="44" fill="${color}" opacity=".6"/><circle cx="180" cy="135" r="15" fill="white"/><text x="180" y="241" text-anchor="middle" fill="#65778a" font-size="13">${esc(index<0?'选择条件，查看文字观察':config.options[index].label)}</text>`;
    }
    $('drawing').innerHTML=`<svg viewBox="0 0 360 280" role="img" aria-label="${esc(index<0?config.title:config.options[index].label)}的概念示意">${content}</svg>`;
    $('drawing').classList.toggle('active-scene',state==='feedback');
  }
  function render() {
    document.body.dataset.state=state;
    $('progress').textContent=`已观察 ${completed.size} / ${config.options.length}`;
    $('start').hidden=state!=='initial';
    $('options').replaceChildren(...config.options.map((o,i)=>{
      const b=document.createElement('button'); b.className=`option${completed.has(i)?' done':''}${active===i?' active':''}`;
      b.disabled=state!=='selecting'||completed.has(i); b.textContent=`${o.label} ${completed.has(i)?'✓':active===i&&state==='feedback'?'观察中…':'↗'}`;
      b.addEventListener('click',()=>choose(i)); return b;
    }));
    $('conclusion').hidden=state!=='completed';
    $('conclusion').textContent=`探索结论 · ${config.conclusion}`;
    draw(active);
  }
  async function choose(i) {
    if(state!=='selecting'||completed.has(i))return;
    const ticket=epoch; state='feedback'; active=i; $('feedback').textContent=config.options[i].observation; render();
    await Promise.all([new Promise(resolve=>later(resolve,config.duration)),speak(config.options[i].observation)]);
    if(ticket!==epoch)return;
    completed.add(i); state=completed.size===config.options.length?'completed':'selecting'; render();
  }
  $('title').textContent=config.title; $('question').textContent=config.question; $('feedback').textContent=config.intro;
  $('start').addEventListener('click',()=>{state='selecting';$('feedback').textContent='请选择一个观察条件。';render();});
  $('reset').addEventListener('click',()=>{epoch++;timers.forEach(clearTimeout);timers.clear();window.speechSynthesis?.cancel();state='initial';completed.clear();active=-1;$('feedback').textContent=config.intro;render();});
  $('voice').addEventListener('click',()=>{voice=!voice&&'speechSynthesis'in window;$('voice').textContent=voice?'语音：开启':'语音：关闭';$('voice').setAttribute('aria-pressed',String(voice));if(!voice)window.speechSynthesis?.cancel();});
  if(!('speechSynthesis'in window)){$('voice').disabled=true;$('voice').textContent='语音不可用';}
  window.addEventListener('pagehide',()=>{epoch++;timers.forEach(clearTimeout);window.speechSynthesis?.cancel();});
  render();
}
