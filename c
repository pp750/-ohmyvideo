# OhMyVideo

<p align="center">
  <strong>简体中文</strong>
</p>

<div align="center">

# OhMyVideo

  <p align="center">
    <b>
      AI短剧工厂
      <br />
      动动手指，小说秒变剧集！
      <br />
      AI剧本 × AI影像 × 极速生成 🔥
    </b>
  </p>
  
  > 🚀 **一站式短剧工程**：从文本到角色，从分镜到视频，0门槛全流程AI化，创作效率提升10倍+！
</div>

---

# 🌟 主要功能

OhMyVideo 是面向短剧生产的 AI 工作台，围绕"策划 → 编剧 → 分镜 → 出片"构建完整闭环，并支持本地化、可编程、可持续迭代的生产流程。

- ✅ **无限画布生产工作台**  
  以类无限画布形式组织剧本、角色、分镜、素材与视频节点，支持自由编排、回溯与并行生产，不受线性步骤限制。
- ✅ **三层 Agent 协作体系**  
  决策层、执行层、监督层协同工作，覆盖任务拆解、内容生成、质量审阅与修订反馈，提升稳定性与成片一致性。
- ✅ **持久化 Agent 记忆**  
  基于本地 ONNX 向量检索的跨会话记忆系统，支持短期消息、长期摘要和语义召回，确保多轮创作连续性。
- ✅ **可编程供应商系统**  
  支持在设置中心直接编写供应商 TypeScript 逻辑并即时生效，无需改源码或重启，便于私有化和多模型接入。
- ✅ **章节事件图谱驱动改编**  
  自动提取原著章节事件并结构化存储，剧本改编按事件图谱精准调用上下文，减少长文本信息丢失。
- ✅ **Skill 文件化配置**  
  ScriptAgent 与 ProductionAgent 的核心提示词外化为 Markdown Skill 文件，支持在线编辑与快速调优。

---

# 📦 应用场景

- 短视频内容创作
- 小说影视化实验
- AI 文学改编工具
- 剧本开发与快速原型
- 视频素材生成

---

# 🔰 使用指南

## 🚀 快速上手

1. 启动应用并登录（默认账号：`admin` / `admin123`）。
2. 在设置中心完成模型供应商配置（文本/图像/视频模型）。
3. 新建项目并导入原著，执行章节事件提取。
4. 进入 ScriptAgent 生成故事骨架、改编策略与结构化剧本。
5. 切换到 ProductionAgent，在无限画布中组织分镜、素材与视频节点。
6. 对分镜图进行节点化精调后回流工作台，完成视频拼接与导出。

---

# 🚀 安装

## 前置条件

在安装和使用本软件之前，请准备以下内容：

- ✅ 大语言模型 AI 服务接口地址
- ✅ Sora 或豆包视频服务接口地址
- ✅ Nano Banana Pro 图片生成模型服务接口

## 本机安装

### 1. 下载与安装

安装完成后，启动程序即可开始使用本服务。

> ⚠️ **首次登录**  
> 账号：`admin`  
> 密码：`admin123`

## Docker 部署

### 前置条件

- 已安装 [Docker](https://docs.docker.com/get-docker/)（版本 20.10+）

### 本地构建

使用本地已有的源码直接构建，适合开发者或已克隆仓库的用户：

```shell
# 先克隆项目（如已有则跳过）
git clone <your-repo-url>
cd ohmyvideo

# 使用 docker-compose 本地构建并启动
yarn docker:local

# 或者手动构建
docker build -t ohmyvideo .
docker run -d -p <本地端口>:10588 -v <本地数据路径>:/app/data ohmyvideo

# 此时在相应端口的 /web/index.html 路径即可访问页面
# 例如 http://localhost:10588/web/index.html
```

### 服务端口说明

| 端口    | 用途     | 部署映射      |
| ------- | -------- | ------------- |
| `10588` | 软件界面 | `10588:10588` |

**环境变量说明：**

| 变量       | 说明                               |
| ---------- | ---------------------------------- |
| `NODE_ENV` | 运行环境，`prod` 表示生产环境      |
| `PORT`     | 服务监听端口（默认 10588）         |
| `OSSURL`   | 文件存储访问地址，用于静态资源访问 |

---

## 云端部署

### 一、服务器环境要求

- **系统**：Ubuntu 20.04+ / CentOS 7+
- **Node.js**：24.x（推荐，最低 23.11.1+）
- **内存**：2GB+

### 二、服务器部署

#### 1. 安装环境

```bash
# 安装 Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 24
# 安装 Yarn 和 PM2
npm install -g yarn pm2
```

#### 2. 部署项目

```bash
cd /opt
git clone <your-repo-url>
cd ohmyvideo
yarn install
yarn build
```

#### 3. 配置 PM2

创建 `pm2.json` 文件：

```json
{
  "name": "ohmyvideo",
  "script": "data/serve/app.js",
  "instances": "max",
  "exec_mode": "cluster",
  "env": {
    "NODE_ENV": "prod",
    "PORT": 10588,
    "OSSURL": "http://127.0.0.1:10588/"
  }
}
```

**环境变量说明：**

| 变量       | 说明                               |
| ---------- | ---------------------------------- |
| `NODE_ENV` | 运行环境，`prod` 表示生产环境      |
| `PORT`     | 服务监听端口                       |
| `OSSURL`   | 文件存储访问地址，用于静态资源访问 |

---

#### 4. 启动服务

```bash
pm2 start pm2.json
pm2 startup
pm2 save
```

#### 5. 常用命令

```bash
pm2 list              # 查看进程
pm2 logs ohmyvideo    # 查看日志
pm2 restart all       # 重启服务
pm2 monit             # 监控面板
```

> ⚠️ **首次登录**  
> 账号：`admin`  
> 密码：`admin123`

---

# 🔧 开发流程指南

## 🛠️ 技术栈

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

## 开发环境准备

- **Node.js**：版本要求 23.11.1 及以上
- **Yarn**：推荐作为项目包管理器

## 快速启动项目

1. **克隆项目**

   ```bash
   git clone <your-repo-url>
   cd ohmyvideo
   ```

2. **安装依赖**

   请先在项目根目录下执行以下命令以安装依赖项：

   ```bash
   yarn install
   ```

3. **启动开发环境**

   本项目包含 **后端 API 服务** 和 **前端页面** 两部分，请根据需要选择启动方式：

   - **方式一：仅启动后端服务**

     ```bash
     yarn dev
     ```

     > ⚠️ 此命令仅启动后端 API 服务（端口 10588），**不包含前端页面**。直接访问 `http://localhost:10588` 只能调用 API 接口，无法看到完整的网页界面。如需同时使用前端页面，请配合前端项目单独启动，或使用下方的 GUI 模式。

   - **方式二：启动 Electron 桌面客户端**

     ```bash
     yarn dev:gui
     ```

     > 此命令会同时启动后端服务和 Electron 桌面窗口，自带内置前端页面，开箱即用，无需额外配置。适合想要完整体验所有功能的开发者。

   - **方式三：生产模式启动**

     ```bash
     yarn start
     ```

     > 以生产模式直接运行编译后的服务（需先执行 `yarn build`）。

4. **项目打包**

   - 编译并生成 TypeScript 文件：

     ```bash
     yarn build
     ```

   - 打包为 Windows 平台可执行程序：

     ```bash
     yarn dist:win
     ```

   - 打包为 Mac 平台可执行程序：

     ```bash
     yarn dist:mac
     ```

   - 打包为 Linux 平台可执行程序：

     ```bash
     yarn dist:linux
     ```

5. **代码质量检查**

   - 进行全局语法和规范检查：

     ```bash
     yarn lint
     ```

6. **AI 调试面板（可选）**

   启动 AI SDK 的可视化调试工具，方便调试 AI 调用：

   ```bash
   yarn debug:ai
   ```

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
├─ 📂 lib/                  # 公共库（数据库初始化、响应格式）
├─ 📂 middleware/            # 中间件
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
📄 skillList.json            # 技能清单
📄 LICENSE                   # 许可证（Apache-2.0）
📄 NOTICES.txt               # 第三方依赖声明
📄 package.json              # 项目配置
📄 tsconfig.json             # TypeScript 配置
```

---

# 📜 许可证

OhMyVideo 基于 Apache-2.0 协议开源发布。

许可证详情：https://www.apache.org/licenses/LICENSE-2.0

---

# 🙏 致谢

感谢以下开源项目为 OhMyVideo 提供强大支持：

- [Express](https://expressjs.com/) - 快速、开放、极简的 Node.js Web 框架
- [AI SDK](https://ai-sdk.dev/) - 面向 TypeScript 的 AI 工具包
- [Better-SQLite3](https://github.com/WiseLibs/better-sqlite3) - 高性能 SQLite3 绑定库
- [Sharp](https://sharp.pixelplumbing.com/) - 高性能 Node.js 图像处理库
- [Axios](https://axios-http.com/) - 基于 Promise 的 HTTP 客户端
- [Zod](https://zod.dev/) - TypeScript 优先的模式验证库
- [Socket.IO](https://socket.io/) - 实时双向事件通信引擎
- [Electron](https://www.electronjs.org/) - 跨平台桌面应用开发框架
- [Hugging Face Transformers](https://huggingface.co/docs/transformers.js) - 本地 ML 推理库

完整的第三方依赖清单请查阅 `NOTICES.txt`

##### copyright © OhMyVideo
