# OhMyVideo

AI短剧工厂 —— 动动手指，小说秒变剧集！

<p align="center">
  <a href="https://github.com/your-username/ohmyvideo">
    <img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub" />
  </a>
</p>

## 功能简介

OhMyVideo 是面向短剧生产的 AI 工作台，围绕"策划 → 编剧 → 分镜 → 出片"构建完整闭环：

- **无限画布生产工作台** — 自由编排剧本、角色、分镜、素材与视频节点
- **三层 Agent 协作体系** — 决策层、执行层、监督层协同工作
- **持久化 Agent 记忆** — 基于本地 ONNX 向量检索的跨会话记忆系统
- **可编程供应商系统** — 支持在设置中心直接编写供应商 TypeScript 逻辑
- **章节事件图谱驱动改编** — 自动提取原著章节事件并结构化存储
- **Skill 文件化配置** — 核心提示词外化为 Markdown Skill 文件，支持在线编辑

## 快速开始

```bash
# 安装依赖
yarn install

# 启动后端服务
yarn dev

# 或启动 Electron 桌面客户端
yarn dev:gui

# 生产模式
yarn build
yarn start
```

> 首次登录账号：`admin` / `admin123`

## 项目结构

```
📂 build/                    # 编译产物
📂 data/                     # 运行时数据
│  ├─ 📂 models/            # 本地推理模型（ONNX）
│  ├─ 📂 oss/               # 对象存储（素材/角色/场景）
│  ├─ 📂 serve/             # 生产环境入口
│  ├─ 📂 skills/            # Agent 技能提示词
│  └─ 📂 web/               # 前端编译产物（内置）
📂 docs/                     # 文档资源
📂 env/                      # 环境配置
📂 scripts/                  # 构建与辅助脚本
📂 src/
├─ 📂 agents/               # AI Agent 模块
│  ├─ 📂 productionAgent/   # 生产 Agent
│  └─ 📂 scriptAgent/       # 剧本 Agent
├─ 📂 lib/                  # 公共库
├─ 📂 middleware/           # 中间件
├─ 📂 routes/               # 路由模块
│  ├─ 📂 agents/            # Agent 记忆管理
│  ├─ 📂 artStyle/          # 画风管理
│  ├─ 📂 assets/            # 素材管理
│  ├─ 📂 assetsGenerate/    # 素材生成
│  ├─ 📂 cornerScape/       # 分镜管理
│  ├─ 📂 general/           # 通用接口
│  ├─ 📂 login/             # 登录认证
│  ├─ 📂 migrate/           # 数据迁移
│  ├─ 📂 modelSelect/       # 模型选择
│  ├─ 📂 novel/             # 小说管理
│  ├─ 📂 other/             # 其他功能
│  ├─ 📂 production/        # 制作管理
│  ├─ 📂 project/           # 项目管理
│  ├─ 📂 script/            # 剧本生成
│  ├─ 📂 scriptAgent/       # 剧本 Agent 接口
│  ├─ 📂 setting/           # 系统设置
│  ├─ 📂 task/              # 任务管理
│  └─ 📂 test/              # 测试接口
├─ 📂 socket/               # WebSocket 实时通信
├─ 📂 types/                # TypeScript 类型声明
├─ 📂 utils/                # 工具函数
├─ 📄 app.ts                # 应用入口
├─ 📄 core.ts               # 核心初始化
├─ 📄 env.ts                # 环境变量处理
├─ 📄 err.ts                # 错误处理
├─ 📄 logger.ts             # 日志模块
├─ 📄 router.ts             # 路由注册
└─ 📄 utils.ts              # 通用工具
📄 Dockerfile                # Docker 构建文件
📄 electron-builder.yml      # Electron 打包配置
📄 package.json              # 项目配置
📄 tsconfig.json             # TypeScript 配置
```

## 技术栈

| 类别       | 技术                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------- |
| 运行时     | Node.js 23.11.1+                                                                          |
| 语言       | TypeScript 5.x                                                                            |
| 后端框架   | Express 5                                                                                 |
| 数据库     | SQLite（better-sqlite3 / knex）                                                           |
| AI 集成    | Vercel AI SDK（OpenAI / Anthropic / Google / DeepSeek / 智谱 / MiniMax / 通义千问 / xAI） |
| 本地推理   | @huggingface/transformers（ONNX）                                                         |
| 实时通信   | Socket.IO                                                                                 |
| 桌面客户端 | Electron 40                                                                               |
| 图像处理   | Sharp                                                                                     |
| 容器化     | Docker                                                                                    |

## 常用命令

| 命令 | 说明 |
|------|------|
| `yarn dev` | 启动后端开发服务（端口 10588） |
| `yarn dev:gui` | 启动 Electron 桌面客户端 |
| `yarn start` | 生产模式运行 |
| `yarn build` | 编译 TypeScript |
| `yarn dist:win` | 打包 Windows 可执行程序 |
| `yarn dist:mac` | 打包 Mac 可执行程序 |
| `yarn dist:linux` | 打包 Linux 可执行程序 |
| `yarn lint` | 代码质量检查 |
| `yarn debug:ai` | AI SDK 调试面板 |

## Docker 部署

```bash
# 构建镜像
docker build -t ohmyvideo .

# 运行容器
docker run -d -p 10588:10588 -v <本地数据路径>:/app/data ohmyvideo

# 访问 http://localhost:10588/web/index.html
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `NODE_ENV` | 运行环境 | `prod` |
| `PORT` | 服务监听端口 | `10588` |
| `OSSURL` | 文件存储访问地址 | - |

## 许可证

Apache-2.0
