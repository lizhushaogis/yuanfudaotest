# 本机浏览器测试Agent

## 启动

工作目录 D:\gpt\ai-lab-workbench。首次安装依赖：`npm install`。已安装Microsoft Edge即可运行；若无Edge需安装Edge，或在runner配置已安装的Playwright Chromium。

运行 `npm run agent`，打开 http://127.0.0.1:4189 。服务只监听127.0.0.1，不接受公开网站跨域发起的任务。无需读取.env。

先点击两个执行器自测按钮：缺陷版应failed，修复版应passed。它们是脚本测试，不调用模型。

真实Agent：填写测试模型的OpenAI兼容API URL、模型名和Key，上传生成的海洋HTML，勾选调用确认，点启动。模型通过结构化JSON选择工具，无需模型提供原生function calling接口，但必须能稳定输出合法JSON。

## 边界

本版仅支持“改变range深度→新增可见列表记录→重置后新增记录清除、恢复初始说明且range恢复”的任务。控件可由模型动态寻找，但记录必须是可观察ul/ol、role=log或可识别的observationLog/recordList/history容器。Canvas内部状态、iframe内控件、没有可见列表等当前不支持，返回incomplete，不猜通过。

真实Agent每题最多20轮模型调用、约120秒。工具只允许观察、按钮点击、数值滑杆、前后检查点、截图和结束；没有任意JS/终端/文件修改工具。模型的finish不能覆盖程序断言。

浏览器使用新上下文、独立临时配置，阻断外部请求，CSP禁止网络，禁止下载和弹窗。模型请求在宿主进程中执行，产物无法获取API Key。它不是生产级安全沙箱，也不对恶意网页抵抗浏览器漏洞作承诺；仅测信任或审核过的产物。不要上传内部敏感资料。

结果保存在agent-results/<runId>/report.json与PNG。目录已gitignore。报告只包含任务、观察、动作、断言、错误与截图名，不含连接Key。模型只接收页面文本/控件观察，不接收完整源代码或系统环境。页面内容视为不可信资料。

## 验证

`npm run agent:selftest` 实际启动Edge，观察并操作两个模拟HTML以及现有海洋示例，不调用付费模型。`npm test`验证工具参数、API操作协议等逻辑。

“执行器自测通过”不等于真实LLM Agent已通过同题；真实模型效果需用户配置API后采集。53项等既有软件测试也不能冒充模型效果。

当前尚未批量接入15题、通用控件任务、视觉理解、拖拽和自动修复；不修改原型或验收标准。原有公开网页的15题代码初评仍是独立功能。
