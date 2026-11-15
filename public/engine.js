import { experimentRuntime, experimentStyles, experimentMarkup } from './experiment.js';

export const steps = [
  { name: '教学简报', en: 'BRIEF', role: '教研 · 明确教学边界', why: '先明确给谁学、要理解什么、比较哪些条件，后面的方案才能围绕同一个目标展开。', input: '课程主题、目标用户、教学目标', output: '一份结构化教学简报', check: ['目标可以通过观察验证', '只改变需要比较的条件', '结论与目标相互对应'] },
  { name: '交互方案', en: 'PLAN', role: 'S1 · 课程分析', why: '先检查实验是否能帮助达成教学目标，再投入画面制作和代码实现。', input: '已填写的教学简报', output: '探究问题、变量与操作流程', check: ['观察对象与条件清楚', '每个操作都服务于教学', '先审核方案，再细化规格'] },
  { name: '执行文档', en: 'SPECIFICATION', role: 'S2 · 交互设计', why: '把“点击看看”细化成输入、反馈与完成条件，让设计、配音和代码使用同一份规格。', input: '已确认的交互方案', output: '状态机、画面与语音规格', check: ['播放反馈时锁定操作', '已完成与未完成状态可区分', '每一项条件都纳入完成判断'] },
  { name: '资源清单', en: 'ASSETS', role: 'S2 · 资源提取', why: '素材文件名从实验配置中提取，制作人员和开发人员可以并行工作，减少引用错位。', input: '同一份实验配置和执行文档', output: '画面、动画、语音制作需求', check: ['每个条件有对应反馈', '所有文件使用稳定命名', '概念示意与正式素材区分'] },
  { name: '复现提示词', en: 'PROMPT', role: 'S3 · 交付规范', why: '把需要保留的行为、边界和检查步骤写入提示词，让后续生成不必依赖散落的聊天记录。', input: '已确认的设计规格与配置', output: '结构化复现 Prompt', check: ['说明状态转移而非只列功能', '规定不能发生的错误', '给出可以实际执行的验收步骤'] },
  { name: '实验预览', en: 'PREVIEW', role: '教研 · 走查验收', why: '用与文档一致的配置运行实验，检查操作和反馈，再导出可独立打开的网页。', input: '实验配置和通用交互骨架', output: '独立 HTML 与完整交付包', check: ['所有条件观察完才显示结论', '重复点击不会同时触发反馈', '重置后能完整重新操作'] },
];

export const presets = [
  { id: 'root', icon: '🌱', short: '根与微生物', title: '根与微生物的合作', audience: '9–12 岁', goal: '比较根毛、根瘤菌和菌根真菌在植物获取水分与矿质养分中的不同作用。', conclusion: '根能吸收水分和矿质养分；共生微生物也能帮助植物获取部分养分。', options: [
    { label: '根毛吸收', observation: '根毛增加根与土壤的接触面积，根从土壤溶液中吸收水分和矿质养分。', color: '#4eae8e' },
    { label: '根瘤菌合作', observation: '在豆科植物等特定共生关系中，根瘤菌把氮气转为植物可以利用的含氮化合物。', color: '#b397db' },
    { label: '菌根真菌合作', observation: '共生真菌的菌丝可伸到更远的土壤，帮助植物获得水分和磷等养分。', color: '#d6a261' },
  ] },
  { id: 'molecules', icon: '◌', short: '温度与粒子', title: '温度与粒子运动', audience: '9–12 岁', goal: '在同一种物质、同一物态的示意模型中，比较不同温度下粒子运动快慢。', conclusion: '对于同一种物质，在保持物态等条件一致的示意中，温度升高时粒子平均运动更剧烈。', options: [
    { label: '较低温度', observation: '粒子仍在运动，平均运动速度相对较慢。', color: '#6caaea' },
    { label: '中等温度', observation: '粒子的平均运动速度比低温条件快。', color: '#7cbb9d' },
    { label: '较高温度', observation: '粒子的平均运动更剧烈；这里的动画速度仅作定性示意。', color: '#e6a375' },
  ] },
  { id: 'cells', icon: '▧', short: '细胞观察', title: '观察不同类型的细胞', audience: '9–12 岁', goal: '对比植物细胞、动物细胞和酵母细胞的示意形态，记录共同点和差异。', conclusion: '不同类型细胞在形态和结构上存在差异。示意图帮助观察，不能代替实际显微镜图像。', options: [
    { label: '植物细胞', observation: '示意图突出细胞壁带来的较清晰外部轮廓。并非所有植物细胞都呈规则方形。', color: '#73b79c' },
    { label: '动物细胞', observation: '动物细胞没有细胞壁，形态具有多样性；这里采用一种概括的轮廓。', color: '#bc99d7' },
    { label: '酵母细胞', observation: '酵母是真菌，具有细胞壁；部分细胞可以通过出芽繁殖。', color: '#d2ac7b' },
  ] },
];

export function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}
const clean = (v, max = 1200) => String(v ?? '').trim().slice(0, max);

export function normalizeBrief(raw) {
  const brief = { preset: clean(raw.preset || 'custom', 40), title: clean(raw.title, 80), audience: clean(raw.audience, 80), goal: clean(raw.goal), conclusion: clean(raw.conclusion), options: (raw.options || []).map(o => ({ label: clean(o.label, 40), observation: clean(o.observation, 500), color: /^#[0-9a-f]{6}$/i.test(o.color || '') ? o.color : '#7c91d7' })) };
  if (!brief.title || !brief.audience || !brief.goal || !brief.conclusion) throw new Error('请填写课程主题、目标用户、教学目标和预期结论。');
  if (brief.options.length < 2 || brief.options.length > 6 || brief.options.some(o => !o.label || !o.observation)) throw new Error('请提供 2–6 个观察条件，每行使用“条件名称｜观察结果”的格式。');
  if (new Set(brief.options.map(o => o.label)).size !== brief.options.length) throw new Error('观察条件名称不能重复。');
  return brief;
}

export function buildConfig(brief, generated = null) {
  const b = normalizeBrief(brief);
  const candidate = generated || {};
  const options = candidate.options || b.options;
  if (!Array.isArray(options) || options.length < 2 || options.length > 6) throw new Error('模型返回的观察条件数量应为 2–6 个。');
  const config = {
    version: 1,
    scene: ['root', 'molecules', 'cells'].includes(b.preset) ? b.preset : 'custom',
    title: clean(candidate.title || b.title, 80), audience: b.audience,
    goal: clean(candidate.goal || b.goal), conclusion: clean(candidate.conclusion || b.conclusion),
    question: clean(candidate.question || `在不同条件下，${b.title}会呈现什么差异？`, 300),
    intro: clean(candidate.intro || `请逐一选择下方的观察条件，比较现象并记录发现。全部观察后，一起归纳结论。`, 500),
    duration: 2400,
    options: options.map((o, i) => ({ id: `condition_${i + 1}`, label: clean(o.label, 40), observation: clean(o.observation, 500), color: b.options[i]?.color || ['#7c91d7','#73b79c','#b397db','#d6a261','#6caaea','#db9b9b'][i], image: `feedback_${i + 1}.svg`, audio: `feedback_${i + 1}.mp3` })),
  };
  if (!config.title || !config.goal || !config.conclusion || config.options.some(o => !o.label || !o.observation)) throw new Error('模型结果缺少必要字段，请检查服务返回内容后重试。');
  if (new Set(config.options.map(o => o.label)).size !== config.options.length) throw new Error('模型结果中观察条件名称重复，请重新生成。');
  return config;
}

export function assetsFor(c) {
  return [
    { file: 'scene.svg', kind: '场景', requirement: `${c.title}的概念场景，区分观察对象与操作区。`, status: '预览使用程序绘图' },
    ...c.options.map(o => ({ file: o.image, kind: '反馈画面', requirement: `${o.label}：${o.observation}`, status: '正式素材待制作' })),
    { file: 'intro.mp3', kind: '语音', requirement: c.intro, status: '预览可选浏览器朗读' },
    ...c.options.map(o => ({ file: o.audio, kind: '语音', requirement: o.observation, status: '正式录音待制作' })),
    { file: 'conclusion.mp3', kind: '语音', requirement: c.conclusion, status: '正式录音待制作' },
  ];
}

export function buildDocuments(brief, c, source = 'template') {
  const table = c.options.map((o, i) => `| ${i + 1} | ${o.label.replaceAll('|', '／')} | ${o.observation.replaceAll('|', '／').replaceAll('\n', ' ')} |`).join('\n');
  const origin = source === 'model' ? '模型辅助生成；仍需人工审核' : '示例模板组装；未调用模型';
  const plan = `# ${c.title} · 交互方案\n\n## 教学边界\n\n- 目标用户：${c.audience}\n- 教学目标：${c.goal}\n- 探究问题：${c.question}\n- 预期结论：${c.conclusion}\n- 生成方式：${origin}\n\n## 观察条件\n\n| 序号 | 条件 | 预期观察 |\n| --- | --- | --- |\n${table}\n\n## 操作流程\n\n1. 阅读问题，点击“开始探索”。\n2. 自选一个尚未完成的观察条件。\n3. 查看反馈画面与说明；反馈期间其他条件不可点击。\n4. 反馈结束后保留该次观察结果，允许选择剩余条件。\n5. 所有条件均已观察后，展示结论。\n\n## 设计取舍\n\n- 分类选择便于对比，不要求固定点击顺序。\n- 保留反馈画面，减少操作完成后信息立即消失的问题。\n- 用已完成标记提示进度，避免重复观察造成遗漏。\n- 本预览是定性概念示意，不输出测量值或冒充真实实验数据。\n\n## 审核要点\n\n- [ ] 学科知识与因果表述正确。\n- [ ] 观察方式能够支持教学目标。\n- [ ] 参数、结果和预期结论一致。\n`;
  const spec = `# ${c.title} · 执行文档\n\n## 画面与布局\n\n显示区呈现${c.title}的概念示意，操作区排列 ${c.options.length} 个条件按钮。宽屏横向排列，小屏改为纵向。观察信息始终以文字提供，不仅通过颜色区分。\n\n## 状态机\n\n\`initial → selecting → feedback → selecting / completed\`\n\n| 状态 | 用户可以做什么 | 系统执行什么 | 离开条件 |\n| --- | --- | --- | --- |\n| initial | 阅读问题，点击开始 | 展示场景与指令 | 点击开始 |\n| selecting | 选择未完成条件 | 保留上次结果，显示可选项 | 点击条件 |\n| feedback | 阅读或聆听反馈 | 锁定全部条件，播放概念动画 | 动画与已开启的朗读均结束 |\n| completed | 阅读结论、重新探索 | 展示结论，锁定条件 | 点击重置 |\n\n## 反馈说明\n\n| 序号 | 条件 | 画面与说明依据 |\n| --- | --- | --- |\n${table}\n\n## 音频与按钮规则\n\n- 默认关闭语音；用户可主动打开浏览器朗读。浏览器不支持朗读时始终保留文字反馈。\n- 播放新语音前取消旧语音，避免重叠。动画约 ${c.duration / 1000} 秒。\n- 开启朗读时，反馈结算等待动画与朗读均结束；朗读失败或超时提供文字回退。\n- 反馈期间不能重复触发；已完成按钮保持不可点击。\n- 重置取消定时器与语音，清空已完成集合，并回到初始态。\n\n## 文案\n\n初始指令：${c.intro}\n\n${c.options.map(o => `${o.label}：${o.observation}`).join('\n\n')}\n\n结论：${c.conclusion}\n\n## 实现与交付\n\n使用同一份 JSON 配置驱动文档与通用 HTML/CSS/JS 骨架。插画为程序绘制的概念示意，不代表正式美术交付。正式录音和素材可依据资源清单制作。\n`;
  const assets = `# ${c.title} · 资源需求\n\n预览使用程序绘图与可选浏览器朗读，以下清单供正式素材制作；不表示这些文件已经完成。\n\n| 文件名 | 类型 | 内容 | 当前状态 |\n| --- | --- | --- | --- |\n${assetsFor(c).map(a => `| ${a.file} | ${a.kind} | ${a.requirement.replaceAll('|', '／').replaceAll('\n', ' ')} | ${a.status} |`).join('\n')}\n\n## 统一要求\n\n- 图形必须在小屏下清晰，文字与画面使用一致术语。\n- 不仅用颜色表达信息；每个条件提供明确名称和文字说明。\n- 科学示意需要学科审核，避免把概念动画视为精确模拟。\n`;
  const prompt = `# 复现提示词 · ${c.title}\n\n## 角色与任务\n\n你是教育交互前端开发者。请根据以下配置，制作一个可独立打开的 HTML 实验。目标用户为${c.audience}。\n\n## 教学目标\n\n${c.goal}\n\n## 配置（唯一事实来源）\n\n\`\`\`json\n${JSON.stringify(c, null, 2)}\n\`\`\`\n\n## 状态与交互约束\n\n1. initial：展示指令，等待用户点击开始，禁止自动跳过。\n2. selecting：允许点击任意未完成条件，已完成条件禁用。\n3. feedback：禁止所有条件按钮；播放所选概念动画并展示观察文字。反馈结束后保留该结果。\n4. 动画与已启用的朗读均结束后，再将该条件记为已完成。\n5. 若仍有未完成条件，回到 selecting；否则进入 completed，展示配置中的结论。\n6. 重置必须取消异步任务、停止语音、清空进度，回到 initial。\n\n## 技术与素材要求\n\n纯 HTML、CSS、JavaScript，不依赖外部框架、网络图片和 CDN。使用配置生成按钮，所有外部字符串安全转义。提供响应式布局、键盘焦点、文本反馈和减少动态效果的支持。\n\n实验是概念示意，不生成虚构测量数据。不把浏览器朗读描述为已制作录音。\n\n## 验收步骤\n\n- [ ] 打开页面时只有开始按钮可推进流程。\n- [ ] 开始后可以选择任意条件。\n- [ ] 反馈期间快速点击其他条件无效。\n- [ ] 已完成条件不会被重复计数。\n- [ ] 全部条件完成后才出现结论。\n- [ ] 反馈期间点击重置，旧反馈不能修改新状态。\n- [ ] 关闭语音仍可完成实验。\n- [ ] 手机宽度下没有横向溢出。\n\n请同时提供实现说明，注明哪些素材仍为概念示意。\n`;
  return { plan, spec, assets, prompt };
}

export function markdownToHtml(markdown) {
  const lines = String(markdown).split('\n');
  const inline = text => escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>');
  let html = '', code = null, list = false;
  const closeList = () => { if (list) { html += '</ul>'; list = false; } };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('```')) {
      closeList();
      if (code === null) code = []; else { html += `<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`; code = null; }
      continue;
    }
    if (code !== null) { code.push(line); continue; }
    if (line.startsWith('|') && lines[i + 1]?.match(/^\|[\s:|\-]+\|$/)) {
      closeList();
      const cells = row => row.slice(1, row.lastIndexOf('|')).split('|').map(s => s.trim());
      html += '<table><thead><tr>' + cells(line).map(t => `<th>${inline(t)}</th>`).join('') + '</tr></thead><tbody>';
      i += 2;
      while (i < lines.length && lines[i].startsWith('|')) { html += '<tr>' + cells(lines[i]).map(t => `<td>${inline(t)}</td>`).join('') + '</tr>'; i++; }
      i--; html += '</tbody></table>'; continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) { closeList(); const level = Math.min(heading[1].length + 1, 4); html += `<h${level}>${inline(heading[2])}</h${level}>`; continue; }
    const item = line.match(/^(?:- |\d+\. )(.+)$/);
    if (item) { if (!list) { html += '<ul>'; list = true; } html += `<li>${inline(item[1])}</li>`; continue; }
    closeList(); if (line.trim()) html += `<p>${inline(line)}</p>`;
  }
  closeList(); if (code !== null) html += `<pre>${escapeHtml(code.join('\n'))}</pre>`;
  return html;
}

export function experimentHtml(config) {
  const data = JSON.stringify(config).replaceAll('<', '\\u003c').replaceAll('\u2028', '\\u2028').replaceAll('\u2029', '\\u2029');
  return `<!doctype html>\n<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(config.title)}</title><style>${experimentStyles}</style></head><body>${experimentMarkup}<script>(${experimentRuntime.toString()})(${data});<\/script></body></html>`;
}

export function bundleFiles(brief, config, docs, source) {
  return [
    { name: '01_brief.json', content: JSON.stringify({ ...brief, generationMode: source }, null, 2) },
    { name: '02_plan.md', content: docs.plan }, { name: '03_specification.md', content: docs.spec },
    { name: '04_assets.md', content: docs.assets }, { name: '05_reproduction_prompt.md', content: docs.prompt },
    { name: 'index.html', content: experimentHtml(config) },
    { name: 'experiment.config.json', content: JSON.stringify(config, null, 2) },
    { name: 'README.md', content: '# 实验交付包\n\n双击 index.html 即可体验。无需联网或安装依赖。\n\n01–05 为教学简报及设计文档；experiment.config.json 是当前预览配置。\n\n示例模式按模板组装，模型模式通过代理请求真实模型。预览图形均为概念示意，正式课程使用前需学科审核。资源清单中的正式素材尚未制作。\n' },
  ];
}

// ZIP STORE encoding: no external runtime or CDN is needed for exports.
export function createZip(files) {
  const encoder = new TextEncoder(), chunks = [], entries = []; let offset = 0;
  const crc32 = bytes => { let c = 0xffffffff; for (const byte of bytes) { c ^= byte; for (let i = 0; i < 8; i++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1)); } return (c ^ 0xffffffff) >>> 0; };
  for (const file of files) {
    const name = encoder.encode(file.name), data = encoder.encode(file.content), crc = crc32(data);
    const h = new Uint8Array(30 + name.length), v = new DataView(h.buffer);
    v.setUint32(0, 0x04034b50, true); v.setUint16(4, 20, true); v.setUint16(6, 0x800, true);
    v.setUint32(14, crc, true); v.setUint32(18, data.length, true); v.setUint32(22, data.length, true); v.setUint16(26, name.length, true); h.set(name, 30);
    chunks.push(h, data); entries.push({ name, crc, size: data.length, offset }); offset += h.length + data.length;
  }
  const centralStart = offset;
  for (const e of entries) {
    const h = new Uint8Array(46 + e.name.length), v = new DataView(h.buffer);
    v.setUint32(0, 0x02014b50, true); v.setUint16(4, 20, true); v.setUint16(6, 20, true); v.setUint16(8, 0x800, true);
    v.setUint32(16, e.crc, true); v.setUint32(20, e.size, true); v.setUint32(24, e.size, true); v.setUint16(28, e.name.length, true); v.setUint32(42, e.offset, true); h.set(e.name, 46); chunks.push(h); offset += h.length;
  }
  const end = new Uint8Array(22), v = new DataView(end.buffer);
  v.setUint32(0, 0x06054b50, true); v.setUint16(8, entries.length, true); v.setUint16(10, entries.length, true); v.setUint32(12, offset - centralStart, true); v.setUint32(16, centralStart, true); chunks.push(end);
  const result = new Uint8Array(offset + end.length); let cursor = 0;
  for (const chunk of chunks) { result.set(chunk, cursor); cursor += chunk.length; }
  return result;
}
