# DeepSeek Nova

DeepSeek Nova 是一款 Windows 本地桌面智能编程工作台。它提供连续会话、文件编辑、命令执行、媒体与网页预览、审批控制、任务历史、Skill 管理以及中英文界面。

## 安装与运行

本公开仓库提供 DeepSeek Nova 自有桌面界面和本地适配层源码，不附带第三方智能体运行时，也不提供包含受限运行时的安装程序。

开发运行需要 Node.js 18 或更高版本：

```powershell
cd desktop
npm install
npm start
```

运行检查：

```powershell
cd desktop
npm run check
```

任务执行需要接入你有权使用的运行时适配器，接口说明见 [`RUNTIME_ADAPTER.md`](RUNTIME_ADAPTER.md)。未配置适配器时，界面仍可用于开发和视觉检查，但不会执行智能体任务。

## 项目结构

- `desktop/renderer/`：聊天界面、设置、任务过程和预览面板
- `desktop/main.mjs`：Electron 主进程、本地存储、任务和预览服务
- `desktop/approval-policy.mjs`：审批模式规则
- `desktop/scripts/`：检查、品牌资源和开发预览脚本
- `desktop/build/`：构建所需的应用图标源文件
- `runtime-adapter.mjs`：不包含第三方实现的公开适配入口

## 凭据安全

API Key 默认通过 Windows 安全存储保存在本机。命令行使用者也可复制 `.deepseek.env.example` 为 `.deepseek.env` 后填写密钥。不要提交 `.deepseek.env`、日志或个人会话数据。

## 第三方运行时与许可

本仓库不包含 Claude Code、修改后的 `cli.js` 或其他专有智能体运行时。接入外部运行时时，使用者应自行确认其使用和分发权利。
