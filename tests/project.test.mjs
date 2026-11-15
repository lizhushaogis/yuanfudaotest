import test from 'node:test';
import assert from 'node:assert/strict';
import {generateProject, validateProject, projectDocuments, projectHtml, bundleProjectFiles, inferSceneVariant, interactionPlanFor} from '../public/project.js';

test('a new process request produces a project, documents, and standalone page', () => {
  const project = generateProject({text: '给八年级做一个水循环探索，学生观察蒸发、凝结和降水。', subject: '科学'});
  assert.equal(project.plan.interactionType, 'process-simulation');
  assert.equal(project.plan.title, '水循环探索');
  assert.deepEqual(project.conditions.map(c => c.label), ['蒸发', '凝结', '降水']);
  assert.equal(project.spec.states[1], 'step');
  const docs = projectDocuments(project);
  assert.ok(docs.plan.includes('过程模拟'));
  assert.ok(docs.spec.includes('反馈期间所有条件按钮禁用'));
  const html = projectHtml(project);
  assert.ok(html.includes('projectRuntime'));
  assert.ok(!html.includes('https://'));
  assert.equal(bundleProjectFiles(project, docs).length, 8);
});

test('interaction type and conditions change with a different request', () => {
  const project = generateProject({text: '让学生把纸张、果皮和电池放入正确的垃圾分类类别。'});
  assert.equal(project.plan.interactionType, 'classification');
  assert.match(project.conditions[0].label, /可回收物/);
  const particles = generateProject({text: '观察温度升高时粒子运动速度如何变化。'});
  assert.equal(particles.plan.interactionType, 'particle-simulation');
  assert.ok(particles.spec.components.some(c => c.type === 'range'));
});

test('projects expose a topic-specific interaction plan and richer controls', () => {
  const cause = generateProject({text: '让学生调节光照强度，观察光合作用产生氧气的变化。'});
  assert.equal(cause.interaction.mode, 'cause-effect');
  assert.equal(cause.interaction.controlLabel, '影响强度');
  assert.match(cause.interaction.sceneTitle, /叶片/);
  assert.ok(cause.interaction.userActions.length >= 2);
  assert.match(projectHtml(cause), /interaction-hint/);
  assert.match(projectHtml(cause), /design-card/);
  assert.match(projectHtml(cause), /result-meter/);
  const sequence = interactionPlanFor({text: '追踪水循环的先后阶段'}, 'sequence-exploration');
  assert.equal(sequence.mode, 'sequence');
  assert.match(sequence.prompt, /顺序/);
});

test('topic-specific scenes and conditions are generated for carbon cycle requests', () => {
  const project = generateProject({text: '给七年级制作碳循环探秘，让学生追踪碳原子从植物到动物、土壤和化石燃料的旅行。'});
  assert.equal(inferSceneVariant(project.request.text, project.plan.interactionType), 'carbon-cycle');
  assert.equal(project.scene.variant, 'carbon-cycle');
  assert.ok(project.conditions.length >= 5);
  assert.ok(project.conditions.some(condition => condition.label.includes('燃烧')));
  assert.ok(projectHtml(project).includes('碳循环'));
});

test('model content is constrained into the same project schema', () => {
  const project = generateProject({text: '探索植物生长中光照、二氧化碳和水分的作用。'}, {project: {
    title: '植物生长变量探索', interactionType: 'cause-effect', conditions: [
      {label: '光照', observation: '光能为植物制造有机物提供能量。'},
      {label: '二氧化碳', observation: '二氧化碳是制造有机物的原料。'},
    ], conclusion: '不同因素共同影响植物的物质合成。',
  }});
  validateProject(project);
  assert.equal(project.source, 'model');
  assert.equal(project.plan.interactionType, 'cause-effect');
  assert.equal(project.conditions.length, 2);
});

test('model interaction design is used instead of a fixed scenario', () => {
  const project = generateProject({text: '研究潮汐如何影响海岸湿地的生物。'}, {project: {
    title: '潮汐湿地观察台', interactionType: 'cause-effect', interactionDesign: {
      sceneTitle: '潮汐闸门观察站', rationale: '把潮位变化与湿地生物活动放在同一个观察站中。', metaphor: '海岸闸门和湿地样方',
      userActions: [{label: '抬高潮位', action: '拖动潮位滑杆', effect: '水线进入湿地，显示生物活动变化。'}, {label: '记录退潮', action: '点击退潮阶段', effect: '水线后退，保留前后两次观察。'}],
      visualElements: ['潮位线', '湿地样方'], feedbackRule: '每次操作更新水线并反馈生物活动变化。', completionRule: '完成涨潮和退潮观察后显示比较。'
    }, conditions: [{label: '涨潮', observation: '水线进入湿地。'}, {label: '退潮', observation: '水线退回海岸。'}]
  }});
  assert.equal(project.interaction.sceneTitle, '潮汐闸门观察站');
  assert.equal(project.interaction.userActions[0].effect, '水线进入湿地，显示生物活动变化。');
  assert.match(projectDocuments(project).spec, /潮汐闸门观察站/);
});
