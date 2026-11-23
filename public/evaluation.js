export const dimensions=[
{id:'science',name:'科学正确性',weight:30,standard:'核心概念、变量关系和结论无实质错误；示意与真实测量区分',evidence:'学科审核人、具体表述、依据与修订记录'},
{id:'goal',name:'教学目标与证据',weight:25,standard:'每个核心目标都有可观察任务；学生能解释或迁移，点击完成不等于学会',evidence:'目标→任务→观察→解释题的对应关系'},
{id:'interaction',name:'交互有效性',weight:20,standard:'动作改变主题状态；错误可恢复；重置、重复与端点行为符合设计',evidence:'测试步骤、预期与实际、录屏或截图位置'},
{id:'usability',name:'适龄与可用性',weight:15,standard:'目标用户能理解引导并完成核心任务；不依赖研究者代操作',evidence:'年龄、任务、提示次数、卡住位置和完成情况'},
{id:'visual',name:'视觉与资源一致性',weight:10,standard:'主题对象可辨认，必要资源被实现；360px与桌面可完成操作',evidence:'资源对照、屏幕尺寸、溢出和可访问性记录'}];
export const gates=[['science','无核心科学错误'],['runtime','核心操作可用且无阻断错误'],['resources','关键资源完整、无失效依赖'],['privacy','密钥未进入交付物，生成页无越权请求']];
export const cases=[['normal','正常任务','按教案完成一次完整探索','状态、反馈和学习证据与教案一致'],['boundary','边界与误操作','测试端点、无效操作与快速重复操作','不误计完成、不丢状态，可恢复'],['reset','中途重置','动画或语音中重置，再开始一次','旧任务不回写，记录与进度符合重置规则'],['layout','窄屏与替代输入','360px完成核心任务，尝试键盘或点击替代','关键控件可见且可操作，不依赖颜色或语音'],['transfer','理解与迁移','换一个未见过的情境，让学生预测并解释','记录答案与理由，由教研评分，不能以点击数替代']];
export function signature(project){const {generatedHtml,...rest}=project||{};const source=JSON.stringify({rest,generatedHtml});let h=2166136261;for(let i=0;i<source.length;i++)h=Math.imul(h^source.charCodeAt(i),16777619);return(h>>>0).toString(16);}
export function summarize(review){const complete=dimensions.every(d=>Number.isInteger(review.ratings?.[d.id]?.score)&&review.ratings[d.id].score>=0&&review.ratings[d.id].score<=4&&review.ratings[d.id].evidence?.trim());const failed=gates.some(([id])=>review.gates?.[id]?.status==='fail')||cases.some(([id])=>review.cases?.[id]?.status==='fail');const gateReady=gates.every(([id])=>review.gates?.[id]?.status==='pass'&&review.gates[id].evidence?.trim());const casesReady=cases.every(([id])=>review.cases?.[id]?.status==='pass'&&review.cases[id].evidence?.trim());const score=complete?dimensions.reduce((v,d)=>v+d.weight*review.ratings[d.id].score/4,0):null;return{score,status:failed?'不通过：存在阻断项或必要测试失败':!complete||!gateReady||!casesReady||!review.reviewer?.trim()||!review.customer?.trim()||!review.audience?.trim()||!review.task?.trim()?'待验证：证据或审核未完成':score>=75?'建议进入客户试用（人工复核）':'需修改后复测'};}
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const options=(value,values)=>values.map(([v,t])=>`<option value="${v}" ${String(value)===String(v)?'selected':''}>${t}</option>`).join('');
export function mountEvaluation(container,project){
 const revision=signature(project);
 container.innerHTML=`<section class="evaluation"><div class="eval-heading"><div><span class="eval-kicker">INTERNAL QUALITY WORKFLOW · 内部教研</span><h2>生成只是起点，评审需要证据</h2><p>直接用户是内部教研。当前原型版本 ${esc(revision)}；不以学生学习提升作为本工具的直接验收指标。</p></div><a class="btn btn-primary" href="./quality.html#runs">进入评测中心 →</a></div><p>新增教案用例 → 冻结评测集 → 记录执行与版本 → 双人评审 → bad case修复复测 → 发布验收。评测中心可填入当前原型的HTML，仍需核对用例是否一致。</p><div class="eval-actions"><a href="./quality.html#cases">管理评测集</a><a href="./quality.html#rubric">看1–5分标准</a><a href="./quality.html#issues">追踪bad case</a></div><p class="note">旧版单项目验收记录仍保留在浏览器，不自动当成新标准下的通过证据。新系统数据仅存本地，需导出备份；尚无权限隔离与服务端协作。</p></section>`;
}
