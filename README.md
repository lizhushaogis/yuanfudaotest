# 知行实验室 · AI 交互实验工作台

把一个科学教学想法，逐步转为可审核的交互方案、执行文档、资源清单、复现提示词和可运行网页。

这是基于通用教研生产流程独立实现的公开演示。示例文案、图形和代码在本仓库重新编写，不包含原单位文件、内部链接或生产数据。

## 可以实际做什么

1. 选择“根与微生物”“温度与粒子”“细胞观察”，或填写自定义教学简报。
2. 生成交互方案，审核目标、条件和结论。
3. 确认方案后查看状态机、画面、语音与按钮规则。
4. 查看从同一份配置提取的素材需求。
5. 导出包含配置、实现要求和验收步骤的复现 Prompt。
6. 体验实验，下载包含 Markdown、JSON 和独立 HTML 的 ZIP 交付包。HTML 可以离线打开。

没有配置模型时，网站明确显示**示例模式**：文档由模板组装，不调用 AI。**模型模式**会真实调用用户部署的代理：S1 生成课程方案的结构化配置；人审核后 S2 提供执行设计依据。状态机和文档骨架由确定性代码约束。S3 在本站导出复现提示词；当前预览由通用交互骨架运行，没有宣称模型现场编写了代码。

预览是定性概念示意，正式美术和配音尚未制作。浏览器朗读可选开启，正式课程仍需学科审核和用户测试。自定义主题使用通用图形，不会自动绘制专业实验装置。

## 本地运行

需要 Node.js 20 或以上，不需要安装第三方依赖。

```sh
npm start
```

打开 http://127.0.0.1:4173 。测试与语法检查：

```sh
npm run check
npm test
```

## GitHub Pages 发布

本项目仓库为 `lizhushaogis/yuanfudaotest`，默认分支为 `main`。在仓库 Settings → Pages → Build and deployment 中将 Source 设为 **GitHub Actions**，再运行 `Verify and deploy Pages` 工作流。

部署内容仅为 `public/`。配置成功后访问 https://lizhushaogis.github.io/yuanfudaotest/ 。

GitHub Pages 只运行静态文件，默认提供完整示例体验。需要真实 AI 时，另行部署下述 Node 代理，再在网页“连接模型”中填写代理地址与访问口令。

## 配置真实模型

复制 `.env.example` 为 `.env`，设置兼容 Chat Completions 的接口根地址（通常以 `/v1` 结尾）、模型名称和 API Key：

```dotenv
LAB_API_BASE=https://your-provider.example/v1
LAB_API_KEY=your-upstream-key
LAB_MODEL=your-model-name
LAB_ACCESS_TOKEN=choose-a-long-random-service-token
LAB_ALLOWED_ORIGIN=https://your-name.github.io,http://127.0.0.1:4173
HOST=127.0.0.1
PORT=4173
```

```sh
node --env-file=.env server.mjs
```

模型供应商需要支持 `response_format: {type: "json_object"}`。服务端验证 JSON 结构与条件名称；模型不满足约束时会提示错误，不会静默切换成模板。

公开代理使用 HTTPS（通常由托管平台或反向代理提供），按托管平台要求设置 `HOST=0.0.0.0`。公网调用必须设置 `LAB_ACCESS_TOKEN`；`LAB_ALLOWED_ORIGIN` 逗号分隔准确的允许来源。访问口令仅保留在网页内存，刷新后需要重新输入。模型 API Key 只配置在服务端，不能填写到网页、提交到 GitHub 或放入 `public/`。代理内置请求大小和频率限制，费用由配置的模型服务承担。

网页连接验证会检查代理配置；首次生成时才实际请求模型。未配置真实密钥的公开演示不能证明供应商接口已经联调成功。

## 文件如何衔接

| 文件 | 用途 |
| --- | --- |
| `public/app.js` | 六步流程、人工确认、浏览器保存、模型连接与下载 |
| `public/engine.js` | 结构校验、统一配置、文档生成、HTML 和 ZIP 导出 |
| `public/experiment.js` | 可离线复用的概念图与状态机，反馈期间锁定操作、重置取消旧任务 |
| `server.mjs` | 仅服务 public 静态文件；保护模型密钥，执行 S1 / S2 模型请求 |
| `tests/` | 配置、导出、内容转义、代理鉴权与模型协议测试 |
| `.github/workflows/deploy.yml` | 检查成功后发布 public 到 Pages |

教学简报 → S1 配置 → 人工确认 → S2 规格 → 资源需求 / Prompt → 同配置运行预览 → 导出交付。相同配置让条件名称、文档、文件名和实验行为保持一致。

## 参考

- [GitHub Pages 自动部署说明](https://docs.github.com/en/get-started/start-your-journey/deploying-your-website-automatically)
- [OpenAI Chat Completions 参考](https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create)
