const clean = (value, max = 1600) => String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, max);
const cleanMultiline = (value, max = 5000) => String(value ?? '').trim().slice(0, max);
const colors = ['#4eae8e', '#7c91d7', '#d6a261', '#bc99d7', '#6caaea', '#db9b9b'];

export const interactionCatalog = {
  'compare-conditions': { label: '条件比较', description: '并列选择不同条件，观察差异后归纳结论。' },
  'process-simulation': { label: '过程模拟', description: '按过程阶段推进，观察一个现象如何转变为下一个现象。' },
  classification: { label: '分类判断', description: '把观察对象归入不同类别，并根据反馈修正判断。' },
  'sequence-exploration': { label: '顺序探索', description: '逐步完成一条过程链，顺序和完成条件都可追踪。' },
  'particle-simulation': { label: '粒子模拟', description: '调整一个参数，观察粒子运动的定性变化。' },
  'cause-effect': { label: '因果探索', description: '切换一个因素，观察结果变化并检查因果解释。' },
};

export function inferInteractionType(text = '') {
  const s = String(text).toLowerCase();
  if (/变量|调节|影响|如果.*那么/.test(s)) return 'cause-effect';
  if (/水循环|碳循环|碳原子|碳元素|光合作用|呼吸作用|生命周期|过程|步骤|先.*再|然后/.test(s)) return 'process-simulation';
  if (/分类|归类|判断.*属于|垃圾|动物.*植物|岩石.*矿物/.test(s)) return 'classification';
  if (/粒子|温度.*运动|速度.*变化|浓度.*扩散/.test(s)) return 'particle-simulation';
  if (/因果|改变.*观察/.test(s)) return 'cause-effect';
  if (/顺序|阶段|流程|周期/.test(s)) return 'sequence-exploration';
  return 'compare-conditions';
}

export function inferSceneVariant(text = '', type = '') {
  const s = String(text).toLowerCase();
  if (/碳循环|碳原子|碳元素/.test(s)) return 'carbon-cycle';
  if (/水循环|蒸发|凝结|降水/.test(s)) return 'water-cycle';
  if (/光合作用|叶绿体|二氧化碳.*氧气/.test(s)) return 'photosynthesis';
  if (type === 'classification') return 'classification';
  if (type === 'particle-simulation') return 'particles';
  return type || 'generic';
}

export function inferTitle(text = '') {
  const s = clean(text, 500);
  const match = s.match(/(?:给|为)[^，。]{0,30}(?:做|制作|设计)一个?(.+?)(?=，|。|让|学生|$)/) || s.match(/(?:做|制作|设计)一个?(.+?)(?=，|。|让|学生|$)/);
  return clean(match?.[1] || s.split(/[。！？\n]/)[0] || '新的教学交互实验', 80);
}

export function normalizeRequest(raw = {}) {
  const text = cleanMultiline(typeof raw === 'string' ? raw : raw.request || raw.text || raw.description, 5000);
  const fallbackTitle = inferTitle(text);
  return {
    text,
    title: clean(raw.title || fallbackTitle, 80),
    subject: clean(raw.subject || '', 80),
    audience: clean(raw.audience || '9–12 岁学生', 80),
    goal: cleanMultiline(raw.goal || text, 1200),
    constraints: cleanMultiline(raw.constraints || '', 1200),
    preferredType: Object.hasOwn(interactionCatalog, raw.interactionType) ? raw.interactionType : '',
  };
}

function conditionsFor(request, type) {
  const text = request.text;
  if (/水循环/.test(text)) return [
    ['蒸发', '水受热后变成水蒸气并上升。'], ['凝结', '水蒸气遇冷形成小水滴，聚集成云。'], ['降水', '水滴变大后以雨等形式回到地面。'],
  ];
  if (/光合作用/.test(text)) return [
    ['光照', '光能为植物制造有机物提供能量。'], ['二氧化碳', '叶片从空气中吸收二氧化碳作为原料。'], ['水分', '根吸收的水参与有机物合成并释放氧气。'],
  ];
  if (/细胞/.test(text)) return [
    ['植物细胞', '细胞壁和叶绿体是该示意中重点观察的结构。'], ['动物细胞', '动物细胞没有细胞壁，轮廓和形态具有多样性。'], ['酵母细胞', '酵母是真菌，部分细胞可以通过出芽繁殖。'],
  ];
  if (/垃圾|分类/.test(text)) return [
    ['可回收物', '纸张、塑料、玻璃等材料可进入回收处理流程。'], ['厨余垃圾', '食物残余等有机物需要单独收集处理。'], ['其他垃圾', '难以回收利用的混合废弃物进入其他处理流程。'],
  ];
  if (/碳循环|碳原子|碳元素/.test(text)) return [
    ['植物吸收：光合作用', '绿色植物从空气中吸收二氧化碳，把碳固定在有机物中。'],
    ['沿食物链传递：动物取食', '动物取食植物或其他动物，碳沿食物链进入新的生物体。'],
    ['呼吸释放：动植物呼吸', '动植物呼吸分解有机物，把一部分碳以二氧化碳形式释放回空气。'],
    ['分解归还：遗体被分解', '分解者分解遗体和排遗物，使碳回到土壤并继续参与循环。'],
    ['埋藏成燃料：漫长地质过程', '部分有机物被埋藏，在漫长地质过程中形成化石燃料。'],
    ['人类燃烧：化石燃料', '燃烧化石燃料把储存的碳快速释放为二氧化碳。'],
  ];
  if (type === 'particle-simulation') return [['较低参数', '粒子保持运动，平均运动更缓慢。'], ['中等参数', '粒子的平均运动速度提高。'], ['较高参数', '粒子运动更剧烈；动画仅作定性示意。']];
  if (type === 'classification') return [['类别一', '观察对象符合第一类的特征。'], ['类别二', '观察对象符合第二类的特征。'], ['需要复核', '证据不足时先记录观察，再检查分类依据。']];
  if (type === 'process-simulation' || type === 'sequence-exploration') return [['第一阶段', '先识别起始条件和观察对象。'], ['第二阶段', '观察变化发生并记录关键现象。'], ['第三阶段', '把变化与最终结果联系起来。']];
  if (type === 'cause-effect') return [['因素较少', '结果变化较小，需要继续观察其他因素。'], ['因素适中', '结果出现明显变化，可以开始解释关系。'], ['因素较多', '结果变化更明显，但仍需排除其他原因。']];
  return [['条件一', '记录第一种条件下的可观察现象。'], ['条件二', '记录第二种条件下的可观察现象。'], ['条件三', '记录第三种条件下的可观察现象。']];
}

function modelConditions(model, fallback) {
  const list = model?.conditions || model?.options;
  if (!Array.isArray(list)) return fallback;
  const result = list.map((item, i) => {
    if (typeof item === 'string') return [clean(item, 40), '记录该条件下的可观察现象。'];
    return [clean(item.label || item.name || `条件${i + 1}`, 40), cleanMultiline(item.observation || item.feedback || '记录该条件下的可观察现象。', 500)];
  }).filter(item => item[0] && item[1]).slice(0, 6);
  return result.length >= 2 ? result : fallback;
}

function statesFor(type) {
  if (type === 'process-simulation') return ['initial', 'step', 'feedback', 'completed'];
  if (type === 'sequence-exploration') return ['initial', 'step', 'feedback', 'completed'];
  if (type === 'classification') return ['initial', 'classifying', 'feedback', 'completed'];
  return ['initial', 'selecting', 'feedback', 'completed'];
}

function componentsFor(type, conditions) {
  const buttons = conditions.map((c, i) => ({ id: `condition_${i + 1}`, type: 'condition-button', label: c[0], feedback: c[1] }));
  const common = [{ id: 'progress', type: 'progress', label: '完成进度' }, { id: 'reset', type: 'reset', label: '重新探索' }];
  if (type === 'particle-simulation') return [{ id: 'parameter', type: 'range', label: '调整参数', min: 1, max: 3, value: 2 }, ...buttons, ...common];
  if (type === 'cause-effect') return [{ id: 'parameter', type: 'range', label: '影响强度', min: 0, max: 100, value: 50 }, ...buttons, ...common];
  if (type === 'classification') return [{ id: 'evidence', type: 'evidence-card', label: '观察证据' }, ...buttons, ...common];
  if (type === 'process-simulation' || type === 'sequence-exploration') return [{ id: 'roadmap', type: 'step-roadmap', label: '过程节点地图' }, ...buttons, ...common];
  if (type === 'compare-conditions') return [{ id: 'comparison', type: 'comparison-board', label: '双条件对照台' }, ...buttons, ...common];
  return [...buttons, ...common];
}

export function interactionPlanFor(request, type, candidate = {}) {
  const defaults = {
    'compare-conditions': { mode: 'compare', label: '双条件对照台', prompt: '先观察一个条件，再选择另一个条件，把两次反馈放在一起比较。', controlLabel: '观察条件', dimension: '现象差异' },
    'process-simulation': { mode: 'process', label: '过程节点地图', prompt: '沿着过程节点逐步推进，记录每一步发生的变化。', controlLabel: '过程节点', dimension: '过程变化' },
    'sequence-exploration': { mode: 'sequence', label: '顺序路线图', prompt: '按顺序解锁过程节点；前一步完成后才能进入下一步。', controlLabel: '顺序步骤', dimension: '先后关系' },
    classification: { mode: 'classification', label: '证据分类台', prompt: '先阅读证据卡，再选择最符合证据的类别，并查看理由。', controlLabel: '分类类别', dimension: '证据依据' },
    'particle-simulation': { mode: 'parameter', label: '变量滑杆实验台', prompt: '拖动变量滑杆，观察示意中的运动变化，再选择条件记录发现。', controlLabel: '变量强度', dimension: '变化幅度', min: 1, max: 5, step: 1 },
    'cause-effect': { mode: 'cause-effect', label: '因果调节台', prompt: '调节因素强度，观察结果指示，再选择条件解释因果关系。', controlLabel: '影响强度', dimension: '结果变化', min: 0, max: 100, step: 10 },
  }[type] || { mode: 'compare', label: '观察比较台', prompt: '选择不同条件，比较反馈后记录发现。', controlLabel: '观察条件', dimension: '现象差异' };
  const raw = candidate.interactionPlan || candidate.interaction || {};
  const allowedModes = new Set(['compare', 'process', 'sequence', 'classification', 'parameter', 'cause-effect']);
  const number = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const min = number(raw.min, defaults.min ?? 0), max = number(raw.max, defaults.max ?? 100);
  return {
    mode: allowedModes.has(raw.mode) ? raw.mode : defaults.mode,
    label: clean(raw.label || defaults.label, 60), prompt: clean(raw.prompt || defaults.prompt, 400),
    controlLabel: clean(raw.controlLabel || defaults.controlLabel, 40), dimension: clean(raw.dimension || defaults.dimension, 40),
    min, max: Math.max(min + 1, max), step: Math.max(1, number(raw.step, defaults.step ?? 10)),
  };
}

export function generateProject(rawRequest, model = null) {
  const request = normalizeRequest(rawRequest);
  const candidate = model?.project || model || {};
  const type = request.preferredType || (Object.hasOwn(interactionCatalog, candidate.interactionType) ? candidate.interactionType : inferInteractionType(request.text));
  const conditions = modelConditions(candidate, conditionsFor(request, type));
  const title = clean(candidate.title || request.title, 80);
  const goal = cleanMultiline(candidate.goal || request.goal || `理解${title}中的关键现象与关系。`, 1200);
  const conclusion = cleanMultiline(candidate.conclusion || `通过比较和记录，学生能够用证据解释${title}中的关键变化。`, 1200);
  const question = clean(candidate.question || `在${title}中，改变或观察不同条件时会发生什么？`, 300);
  const project = {
    version: 2, id: `project_${Date.now().toString(36)}`, source: model ? 'model' : 'local-generator',
    request, plan: { title, subject: request.subject, audience: clean(candidate.audience || request.audience, 80), goal, question, conclusion, interactionType: type, interactionLabel: interactionCatalog[type].label },
    spec: { states: statesFor(type), components: componentsFor(type, conditions), duration: 900, completionRule: '所有条件至少观察一次后显示结论', resetRule: '重置取消计时器与朗读并清空进度' },
    scene: { kind: type, variant: candidate.scene?.variant || inferSceneVariant(request.text, type), title, palette: colors.slice(0, conditions.length), instruction: clean(candidate.intro || '点击开始，再逐项选择一个条件，观察反馈并记录发现。', 500) },
    interaction: interactionPlanFor(request, type, candidate),
    conditions: conditions.map((c, i) => ({ id: `condition_${i + 1}`, label: c[0], observation: c[1], color: colors[i % colors.length] })),
    assets: [], acceptance: [], generatedAt: new Date().toISOString(),
  };
  project.assets = [
    { file: 'scene.svg', kind: '场景', status: '程序生成', purpose: `${title}的${interactionCatalog[type].label}概念图` },
    ...project.conditions.flatMap(c => [{ file: `${c.id}.svg`, kind: '反馈画面', status: '程序生成', purpose: c.observation }, { file: `${c.id}.mp3`, kind: '语音', status: '可由浏览器朗读', purpose: c.observation }]),
  ];
  project.acceptance = ['打开页面必须先点击开始', '反馈期间所有条件按钮禁用', '已完成条件不能重复计数', '全部条件完成后才显示结论', '重置后旧任务不能修改新状态', '页面无外部框架、图片或 CDN 依赖'];
  validateProject(project);
  return project;
}

export function validateProject(project) {
  if (!project || project.version !== 2 || !project.plan || !Object.hasOwn(interactionCatalog, project.plan.interactionType)) throw new Error('项目缺少有效的交互类型。');
  if (!Array.isArray(project.conditions) || project.conditions.length < 2 || project.conditions.length > 6) throw new Error('项目需要 2–6 个条件。');
  if (project.conditions.some(c => !clean(c.label) || !clean(c.observation)) || new Set(project.conditions.map(c => c.label)).size !== project.conditions.length) throw new Error('项目条件必须有唯一名称和观察说明。');
  if (!Array.isArray(project.spec?.states) || !project.spec.states.includes('completed')) throw new Error('项目缺少完成状态。');
  return project;
}

export function projectDocuments(project) {
  const p = project.plan, type = interactionCatalog[p.interactionType];
  const rows = project.conditions.map((c, i) => `| ${i + 1} | ${c.label.replaceAll('|', '／')} | ${c.observation.replaceAll('|', '／')} |`).join('\n');
  const plan = `# ${p.title} · 教学方案\n\n- 目标用户：${p.audience}\n- 学科主题：${p.subject || '待补充'}\n- 教学目标：${p.goal}\n- 探究问题：${p.question}\n- 预期结论：${p.conclusion}\n- 交互类型：${type.label}（${type.description}）\n\n## 观察条件\n\n| 序号 | 条件 | 观察反馈 |\n| --- | --- | --- |\n${rows}\n\n## 人工审核\n\n- [ ] 学科表述准确。\n- [ ] 每个条件都能支持教学目标。\n- [ ] 结论没有超过观察证据。\n`;
  const spec = `# ${p.title} · 交互执行规格\n\n## 交互台设计\n\n- 模式：${project.interaction?.label || "观察比较台"}\n- 主要控件：${project.interaction?.controlLabel || "观察条件"}\n- 引导语：${project.interaction?.prompt || "选择不同条件，比较反馈后记录发现。"}\n- 观察维度：${project.interaction?.dimension || "现象差异"}\n\n## 状态机\n\n\`${project.spec.states.join(' → ')}\`\n\n- 初始态：${project.scene.instruction}\n- 完成条件：${project.spec.completionRule}\n- 重置规则：${project.spec.resetRule}\n- 反馈时长：${project.spec.duration} ms；语音开启时等待动画和朗读都结束。\n\n## 组件\n\n${project.spec.components.map(c => `- ${c.type}：${c.label}`).join('\n')}\n\n## 验收规则\n\n${project.acceptance.map(a => `- [ ] ${a}`).join('\n')}\n`;
  const assets = `# ${p.title} · 资源清单\n\n| 文件 | 类型 | 目的 | 状态 |\n| --- | --- | --- | --- |\n${project.assets.map(a => `| ${a.file} | ${a.kind} | ${a.purpose.replaceAll('|', '／')} | ${a.status} |`).join('\n')}\n\n程序图形是概念示意，正式课程仍需美术、配音和学科审核。\n`;
  const prompt = `# ${p.title} · 复现提示词\n\n你是教育交互前端开发者。请根据下方项目 JSON 生成可离线打开的 HTML。不要添加未在配置中声明的操作，不生成虚构测量数据，不依赖 CDN。\n\n\`\`\`json\n${JSON.stringify(project, null, 2)}\n\`\`\`\n\n必须实现：开始入口、${project.spec.states.join(' → ')} 状态转移、反馈期间锁定、完成后结论、重置取消旧任务、键盘可操作和移动端布局。完成后逐条执行验收清单。\n`;
  return { plan, spec, assets, prompt };
}

export const projectMarkup = `<main class="generated-lab"><header><div><span class="eyebrow">GENERATED LEARNING EXPERIENCE</span><h1 id="title"></h1><p id="meta"></p></div><button id="reset" class="quiet">↺ 重新探索</button></header><p id="question" class="question"></p><div class="generated-grid"><section class="visual-card"><div id="visual"></div><span class="visual-note">程序生成概念示意 · 非测量数据</span></section><section class="control-card"><div class="progress-line"><strong id="progress"></strong><button id="voice" class="quiet" aria-pressed="false">语音：关闭</button></div><div id="interaction-hint" class="interaction-hint"></div><div id="parameter"></div><div id="workspace-extra"></div><div id="conditions"></div><button id="start" class="primary">开始探索 →</button><div id="feedback" class="feedback" role="status" aria-live="polite"></div></section></div><section id="conclusion" class="conclusion" hidden></section></main>`;

export const projectStyles = `*{box-sizing:border-box}body{margin:0;background:#f5f8fc;color:#26354b;font-family:Inter,"Microsoft YaHei",system-ui,sans-serif;font-size:14px}.generated-lab{max-width:1080px;margin:auto;padding:28px}.generated-lab header{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.eyebrow{font-size:9px;letter-spacing:2px;color:#7d8fa8}.generated-lab h1{font-size:24px;margin:8px 0 4px}.generated-lab #meta,.question{color:#8190a5;font-size:11px;line-height:1.7;margin:0}.question{margin:15px 0 20px;font-size:13px}.generated-grid{display:grid;grid-template-columns:1.25fr 1fr;gap:20px}.visual-card,.control-card{background:#fff;border:1px solid #dfe8f1;border-radius:16px;box-shadow:0 8px 28px #304e7510}.visual-card{position:relative;min-height:330px;display:flex;align-items:center;overflow:hidden;background:linear-gradient(150deg,#eef8f5,#f8fbff)}#visual{width:100%}svg{display:block;width:100%;height:auto}.visual-note{position:absolute;left:14px;bottom:12px;color:#81958f;font-size:9px}.control-card{padding:20px}.progress-line{display:flex;justify-content:space-between;align-items:center;color:#7e8ca1;font-size:11px;margin-bottom:13px}.quiet{border:0;background:none;color:#7c899d;font-size:11px;padding:6px 0;cursor:pointer}.condition{width:100%;border:1px solid #dde5ee;background:#fff;border-radius:9px;padding:12px 14px;margin:0 0 9px;text-align:left;display:flex;justify-content:space-between;gap:10px;color:#35455d}.condition:hover:not(:disabled){border-color:#9eaff4;background:#f8f9ff}.condition:disabled{opacity:.5}.condition.done{background:#eff8f2;border-color:#cde8d7;color:#438061;opacity:1}.condition.active{background:#eef2ff;border-color:#9eaff4;opacity:1}.primary{width:100%;border:0;border-radius:8px;background:#344de8;color:white;padding:12px;font-size:12px;cursor:pointer;margin-top:4px}.feedback{min-height:65px;padding-top:13px;color:#65748a;font-size:11px;line-height:1.85}.conclusion{margin-top:18px;border:1px solid #dce5fc;border-radius:10px;background:#edf2ff;color:#506088;padding:16px;font-size:12px;line-height:1.9}[hidden]{display:none!important}.range-wrap{padding:10px 0 14px;color:#718096;font-size:10px}.interaction-hint{margin:0 0 12px;padding:10px 12px;border:1px solid #e3e9fa;border-radius:9px;background:#f7f9ff;color:#66779b;font-size:10px;line-height:1.7}.rich-control{padding:11px 12px;border:1px solid #e6ebf5;border-radius:10px;background:#fbfcff}.rich-control small{display:block;margin-top:6px;color:#9aa7ba}.result-meter{height:6px;margin-top:9px;border-radius:10px;background:#e9eef8;overflow:hidden}.result-meter i{display:block;height:100%;width:0;border-radius:inherit;background:linear-gradient(90deg,#7c91d7,#4eae8e);transition:width .2s}.step-roadmap,.evidence-card,.compare-board{display:grid;gap:7px;margin:0 0 13px;padding:12px;border:1px solid #e6ebf5;border-radius:10px;background:#fbfcff;color:#6d7c92;font-size:10px;line-height:1.7}.step-roadmap>strong,.evidence-card>strong,.compare-board>strong{color:#55678d;font-size:11px}.step-roadmap>span,.compare-board>span{color:#96a2b5}.step-roadmap>div{display:flex;gap:5px;flex-wrap:wrap}.step-roadmap b{display:flex;align-items:center;gap:4px;padding:5px 7px;border-radius:7px;background:#f0f3f8;color:#97a2b2;font-weight:500}.step-roadmap b.current{background:#eef2ff;color:#657bd0}.step-roadmap b.done{background:#eef8f2;color:#4f9878}.step-roadmap i{font-style:normal;font-size:9px}.evidence-card p{margin:0;color:#5e6f87}.evidence-card small{color:#9aa7b8}.compare-board>div{display:grid;grid-template-columns:1fr 1fr;gap:7px}.compare-board article{min-height:76px;padding:8px;border:1px dashed #d9e1ed;border-radius:8px;background:#fff}.compare-board article small,.compare-board article b{display:block}.compare-board article small{color:#a0aaba;font-size:9px}.compare-board article b{margin-top:3px;color:#586b89;font-size:10px}.compare-board article p{margin:5px 0 0;color:#8c99ab;font-size:9px;line-height:1.6}@media(max-width:650px){.compare-board>div{grid-template-columns:1fr}}.range-wrap input{width:100%}.range-value{float:right;color:#536fc4}.flow-arrow{stroke:#7a91e2;stroke-width:3;stroke-linecap:round;stroke-dasharray:7 7;animation:dash 1.8s linear infinite}.particle-dot{animation:drift var(--speed,2.8s) ease-in-out infinite alternate}.pulse-node{animation:pulse 1.1s ease-in-out infinite alternate}@keyframes dash{to{stroke-dashoffset:-28}}@keyframes drift{to{transform:translate(18px,-10px)}}@keyframes pulse{to{opacity:.45}}@media(max-width:650px){.generated-lab{padding:18px}.generated-grid{grid-template-columns:1fr;gap:14px}.visual-card{min-height:230px}.generated-lab h1{font-size:19px}.control-card{padding:16px}}@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation:none!important}}`;

export function projectRuntime(project) {
  const $ = id => document.getElementById(id), esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const interaction = project.interaction || { mode: project.plan.interactionType === 'particle-simulation' ? 'parameter' : project.plan.interactionType === 'cause-effect' ? 'cause-effect' : project.plan.interactionType === 'sequence-exploration' ? 'sequence' : project.plan.interactionType === 'classification' ? 'classification' : project.plan.interactionType === 'process-simulation' ? 'process' : 'compare', label: '观察比较台', prompt: '选择不同条件，比较反馈后记录发现。', controlLabel: '观察条件', dimension: '现象差异', min: 0, max: 100, step: 10 };
  let state = 'initial', active = -1, parameterValue = interaction.min ?? 2, voice = false, epoch = 0; const done = new Set(), timers = new Set(), observations = [];
  const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
  const speak = text => new Promise(resolve => { if (!voice || !('speechSynthesis' in window)) return resolve(); window.speechSynthesis.cancel(); let finished = false; const finish = () => { if (finished) return; finished = true; clearTimeout(timeout); resolve(); }; const timeout = later(() => { window.speechSynthesis.cancel(); finish(); }, 18000); try { const u = new SpeechSynthesisUtterance(text); u.lang = 'zh-CN'; u.onend = finish; u.onerror = finish; window.speechSynthesis.speak(u); } catch { finish(); } });
  function draw() {
    const type = project.plan.interactionType, opts = project.conditions, palette = opts.map(o => o.color);
    let html = '';
    if (project.scene.variant === 'carbon-cycle') {
      const centerX = 180, centerY = 145, radius = 92;
      html = `<circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="none" stroke="#8da2e4" stroke-width="3" stroke-dasharray="8 7" class="flow-arrow"/><circle cx="${centerX}" cy="${centerY}" r="34" fill="#eef2ff" stroke="#8da2e4" stroke-width="2"/><text x="${centerX}" y="${centerY+5}" text-anchor="middle" fill="#52659c" font-size="12">碳循环</text>${opts.map((o, i) => { const angle = -Math.PI / 2 + i * Math.PI * 2 / opts.length; const x = centerX + Math.cos(angle) * radius; const y = centerY + Math.sin(angle) * radius; return `<g class="pulse-node"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="27" fill="${palette[i]}" opacity=".86"/><text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle" fill="#ffffff" font-size="9">${esc(o.label.split('：')[0].slice(0, 6))}</text></g>`; }).join('')}`;
    } else if (project.scene.variant === 'water-cycle') {
      html = `<path d="M55 210 C30 120 100 48 180 72 C265 36 330 105 305 210" fill="none" class="flow-arrow"/><path d="M55 210 Q180 270 305 210" fill="none" stroke="#7caed4" stroke-width="4"/><text x="180" y="258" text-anchor="middle" fill="#5d89ad" font-size="11">地表水 ↔ 大气水</text>${opts.map((o, i) => { const x = [75, 180, 285][i % 3], y = i === 1 ? 72 : 195; return `<g class="pulse-node"><circle cx="${x}" cy="${y}" r="29" fill="${palette[i]}" opacity=".84"/><text x="${x}" y="${y + 4}" text-anchor="middle" fill="#ffffff" font-size="10">${esc(o.label.slice(0, 6))}</text></g>`; }).join('')}`;
    } else if (type === 'process-simulation' || type === 'sequence-exploration') {
      html = `<path d="M36 145 ${opts.map((_, i) => `${90 + i * 78} ${i % 2 ? 190 : 92}`).join(' L ')}" fill="none" class="flow-arrow"/>${opts.map((o, i) => `<g class="pulse-node"><circle cx="${90 + i * 78}" cy="${i % 2 ? 190 : 92}" r="29" fill="${palette[i]}" opacity=".78"/><text x="${90 + i * 78}" y="${i % 2 ? 195 : 97}" text-anchor="middle" fill="white" font-size="11">${esc(o.label.slice(0, 7))}</text></g>`).join('')}`;
    } else if (type === 'classification') {
      html = `${opts.map((o, i) => `<rect x="${27 + i * 112}" y="70" width="94" height="155" rx="15" fill="${palette[i]}" opacity=".2" stroke="${palette[i]}" stroke-width="3"/><circle cx="${74 + i * 112}" cy="139" r="25" fill="${palette[i]}" opacity=".75"/><text x="${74 + i * 112}" y="203" text-anchor="middle" fill="#5b6c82" font-size="11">${esc(o.label.slice(0, 8))}</text>`).join('')}`;
    } else if (type === 'particle-simulation') {
      const speed = Math.max(1.1, 4.4 - parameterValue * 1.1); html = `<rect x="28" y="30" width="304" height="232" rx="20" fill="#fff" stroke="#cbd9ee" stroke-width="3"/>${Array.from({length:25}, (_, i) => `<circle class="particle-dot" style="--speed:${speed}s;animation-delay:-${i * .27}s" cx="${50 + (i * 53) % 265}" cy="${58 + (i * 71) % 172}" r="7" fill="${palette[i % palette.length]}" opacity=".75"/>`).join('')}`;
    } else if (type === 'cause-effect') {
      const strength = Math.max(0, Math.min(100, parameterValue)); html = `<circle cx="115" cy="142" r="49" fill="#dfe7ff" stroke="#7b8fdf" stroke-width="3"/><circle cx="265" cy="142" r="${38 + strength * .14}" fill="#e3f3eb" stroke="#70ae8e" stroke-width="3"/><path d="M166 142h48" class="flow-arrow" style="stroke-width:${2 + strength / 25}px"/><text x="115" y="147" text-anchor="middle" fill="#52659c" font-size="12">因素</text><text x="265" y="147" text-anchor="middle" fill="#4d866a" font-size="12">结果 ${strength}</text>`;
    } else {
      html = `<rect x="30" y="35" width="300" height="220" rx="22" fill="#fff" stroke="#d5e1ee" stroke-width="3"/>${opts.map((o, i) => `<rect x="${60 + i * (240 / Math.max(1, opts.length - 1))}" y="${205 - (done.has(i) ? 90 : 30)}" width="26" height="${done.has(i) ? 90 : 30}" rx="8" fill="${palette[i]}" opacity=".78"/><text x="${73 + i * (240 / Math.max(1, opts.length - 1))}" y="230" text-anchor="middle" fill="#61738a" font-size="10">${esc(o.label.slice(0, 5))}</text>`).join('')}`;
    }
    $('visual').innerHTML = `<svg viewBox="0 0 360 290" role="img" aria-label="${esc(project.plan.title)}的动态概念示意">${html}</svg>`;
  }
  function renderExtra() {
    const extra = $('workspace-extra'); extra.replaceChildren();
    const mode = interaction.mode;
    if (mode === 'parameter' || mode === 'cause-effect') {
      const wrap = document.createElement('label'); wrap.className = 'range-wrap rich-control';
      const min = Number.isFinite(interaction.min) ? interaction.min : 0, max = Number.isFinite(interaction.max) ? interaction.max : 100, step = interaction.step || 10;
      parameterValue = Math.min(max, Math.max(min, parameterValue || min));
      wrap.innerHTML = `<span>${esc(interaction.controlLabel || '变量强度')} <b class="range-value">${parameterValue}</b></span><input type="range" min="${min}" max="${max}" step="${step}" value="${parameterValue}" aria-label="${esc(interaction.controlLabel || '变量强度')}"><small>${mode === 'cause-effect' ? '较弱影响 → 较强影响' : '低 → 高'} · ${esc(interaction.dimension || '变化幅度')}</small><div class="result-meter"><i></i></div>`;
      const input = wrap.querySelector('input'), value = wrap.querySelector('.range-value'), meter = wrap.querySelector('.result-meter i');
      const update = () => { parameterValue = Number(input.value); value.textContent = parameterValue; meter.style.width = `${((parameterValue - min) / Math.max(1, max - min)) * 100}%`; draw(); };
      input.oninput = update; update(); extra.append(wrap);
    } else if (mode === 'process' || mode === 'sequence') {
      const roadmap = document.createElement('div'); roadmap.className = 'step-roadmap'; roadmap.innerHTML = `<strong>${esc(interaction.label || '过程节点地图')}</strong><span>${esc(interaction.prompt || '')}</span><div>${project.conditions.map((c, i) => `<b class="${done.has(i) ? 'done' : i === done.size && state !== 'initial' ? 'current' : ''}"><i>${i + 1}</i>${esc(c.label)}</b>`).join('')}</div>`; extra.append(roadmap);
    } else if (mode === 'classification') {
      const evidence = document.createElement('div'); evidence.className = 'evidence-card'; const current = active >= 0 ? project.conditions[active] : project.conditions[done.size] || project.conditions[0]; evidence.innerHTML = `<strong>证据卡 · ${esc(interaction.dimension || '证据依据')}</strong><p>${esc(current.observation)}</p><small>先读证据，再选择你认为最匹配的类别；系统会保留你的观察记录。</small>`; extra.append(evidence);
    } else {
      const board = document.createElement('div'); board.className = 'compare-board'; board.innerHTML = `<strong>${esc(interaction.label || '双条件对照台')}</strong><span>${esc(interaction.prompt || '')}</span><div>${[0,1].map((slot, i) => { const index = observations[i]?.index; return `<article><small>对照 ${i + 1}</small><b>${index === undefined ? '尚未选择' : esc(project.conditions[index].label)}</b><p>${index === undefined ? '选择一个条件后，这里会保留反馈。' : esc(observations[i].text)}</p></article>`; }).join('')}</div>`; extra.append(board);
    }
  }
  function render() {
    $('progress').textContent = `已完成 ${done.size} / ${project.conditions.length}`; $('start').hidden = state !== 'initial'; $('conclusion').hidden = state !== 'completed'; $('conclusion').textContent = `探索结论 · ${project.plan.conclusion}`; $('interaction-hint').textContent = interaction.prompt || project.scene.instruction; renderExtra(); draw();
    const canChoose = ['selecting', 'classifying', 'step'].includes(state); $('conditions').replaceChildren(...project.conditions.map((c, i) => { const b = document.createElement('button'); b.className = `condition${done.has(i) ? ' done' : ''}${active === i ? ' active' : ''}`; const sequenceLocked = interaction.mode === 'sequence' && i !== done.size; b.disabled = !canChoose || done.has(i) || sequenceLocked; b.innerHTML = `<span>${esc(c.label)}${sequenceLocked ? ' · 待解锁' : ''}</span><span>${done.has(i) ? '✓' : active === i ? '观察中…' : '↗'}</span>`; b.onclick = () => choose(i); return b; }));
  }
  function choose(i) { if (!['selecting', 'classifying', 'step'].includes(state) || done.has(i) || (interaction.mode === 'sequence' && i !== done.size)) return; const ticket = epoch; active = i; state = 'feedback'; const detail = interaction.mode === 'cause-effect' ? `${project.conditions[i].observation} 当前${interaction.controlLabel || '影响强度'}为 ${parameterValue}。` : project.conditions[i].observation; $('feedback').textContent = detail; render(); Promise.all([new Promise(resolve => later(resolve, project.spec.duration)), speak(detail)]).then(() => { if (ticket !== epoch) return; done.add(i); observations.push({index:i,text:detail}); active = -1; state = done.size === project.conditions.length ? 'completed' : project.plan.interactionType === 'classification' ? 'classifying' : (interaction.mode === 'process' || interaction.mode === 'sequence' ? 'step' : 'selecting'); render(); }); }
  $('title').textContent = project.plan.title; $('meta').textContent = `${project.plan.audience} · ${project.plan.interactionLabel}`; $('question').textContent = project.plan.question; $('feedback').textContent = project.scene.instruction;
  $('start').onclick = () => { state = interaction.mode === 'classification' ? 'classifying' : interaction.mode === 'process' || interaction.mode === 'sequence' ? 'step' : 'selecting'; $('feedback').textContent = interaction.prompt || '请选择一个尚未完成的条件。'; render(); };
  $('reset').onclick = () => { epoch++; timers.forEach(clearTimeout); timers.clear(); window.speechSynthesis?.cancel(); state = 'initial'; active = -1; done.clear(); observations.length = 0; parameterValue = interaction.min ?? 2; $('feedback').textContent = project.scene.instruction; render(); };
  $('voice').onclick = () => { voice = !voice && 'speechSynthesis' in window; $('voice').textContent = voice ? '语音：开启' : '语音：关闭'; $('voice').setAttribute('aria-pressed', String(voice)); if (!voice) window.speechSynthesis?.cancel(); };
  if (!('speechSynthesis' in window)) { $('voice').disabled = true; $('voice').textContent = '语音不可用'; }
  render();
}

export function projectHtml(project) {
  const data = JSON.stringify(project).replaceAll('<', '\\u003c').replaceAll('\u2028', '\\u2028').replaceAll('\u2029', '\\u2029');
  const title = String(project.plan.title).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>${projectStyles}</style></head><body>${projectMarkup}<script>(${projectRuntime.toString()})(${data});<\/script></body></html>`;
}

export function bundleProjectFiles(project, docs) {
  return [
    { name: '01_request.json', content: JSON.stringify(project.request, null, 2) },
    { name: '02_teaching_plan.md', content: docs.plan }, { name: '03_interaction_spec.md', content: docs.spec },
    { name: '04_assets.md', content: docs.assets }, { name: '05_reproduction_prompt.md', content: docs.prompt },
    { name: 'project.json', content: JSON.stringify(project, null, 2) }, { name: 'index.html', content: projectHtml(project) },
    { name: 'README.md', content: '# 生成式教学交互项目\n\nindex.html 是当前项目的离线预览。project.json 是唯一配置来源。文档由同一份项目对象生成。程序图形是概念示意，正式交付前需要学科审核、素材制作和用户测试。\n' },
  ];
}



