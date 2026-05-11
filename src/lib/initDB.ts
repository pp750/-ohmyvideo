import { Knex } from "knex";
import { v4 as uuid } from "uuid";
import { getEmbedding } from "@/utils/agent/embedding";

interface TableSchema {
  name: string;
  builder: (table: Knex.CreateTableBuilder) => void;
  initData?: (knex: Knex) => Promise<void>;
}

export default async (knex: Knex, forceInit: boolean = false): Promise<void> => {
  const tables: TableSchema[] = [
    // 用户表
    {
      name: "o_user",
      builder: (table) => {
        table.integer("id").notNullable();
        table.text("name");
        table.text("password");
        table.primary(["id"]);
        table.unique(["id"]);
      },
      initData: async (knex) => {
        await knex("o_user").insert([{ id: 1, name: "admin", password: "admin123" }]);
      },
    },
    //项目表
    {
      name: "o_project",
      builder: (table) => {
        table.integer("id");
        table.string("projectType");
        table.string("imageModel");
        table.string("imageQuality");
        table.string("videoModel");
        table.text("name");
        table.text("intro");
        table.text("type");
        table.text("artStyle");
        table.text("directorManual");
        table.text("mode");
        table.text("videoRatio");
        table.integer("createTime");
        table.integer("userId");
        table.primary(["id"]);
        table.unique(["id"]);
      },
    },
    //风格表
    {
      name: "o_artStyle",
      builder: (table) => {
        table.integer("id").notNullable();
        table.string("name");
        table.text("fileUrl");
        table.text("label");
        table.text("prompt");
        table.primary(["id"]);
        table.unique(["id"]);
      },
      initData: async (knex) => {},
    },
    //Agent配置表
    {
      name: "o_agentDeploy",
      builder: (table) => {
        table.integer("id").notNullable();
        table.string("model");
        table.string("key");
        table.string("modelName");
        table.text("vendorId");
        table.string("desc");
        table.string("name");
        table.integer("temperature");
        table.integer("maxOutputTokens");
        table.boolean("disabled").defaultTo(false);
        table.primary(["id"]);
        table.unique(["id"]);
      },
      initData: async (knex) => {
        await knex("o_agentDeploy").insert([
          {
            model: "",
            modelName: "",
            vendorId: null,
            key: "scriptAgent",
            name: "剧本Agent",
            desc: "用于读取原文生成故事骨架、改编策略，建议使用具备强大文本理解和生成能力的模型",
            disabled: false,
          },
          {
            model: "",
            modelName: "",
            vendorId: null,
            key: "productionAgent",
            name: "生产Agent",
            desc: "对工作流进行调度和管理，建议使用具备较强的逻辑推理和任务管理能力的模型",
            disabled: false,
          },
          {
            model: "",
            modelName: "",
            vendorId: null,
            key: "universalAi",
            name: "通用AI",
            desc: "用于小说事件提取、资产提示词生成、台词提取等边缘功能，建议使用具备较强文本处理能力的模型",
            disabled: false,
          },
          {
            model: "",
            modelName: "",
            vendorId: null,
            key: "ttsDubbing",
            name: "TTS配音",
            desc: "根据剧本内容生成角色配音，支持多种声音风格和情绪",
            disabled: true,
          },
          {
            model: "",
            modelName: "",
            vendorId: null,
            key: "scriptAgent:decisionAgent",
            name: "剧本Agent:决策层",
            desc: "决策层",
            temperature: 1,
            maxOutputTokens: 0,
            disabled: false,
          },
          {
            model: "",
            modelName: "",
            vendorId: null,
            key: "scriptAgent:supervisionAgent",
            name: "剧本Agent:监督层",
            desc: "监督层",
            temperature: 1,
            maxOutputTokens: 0,
            disabled: false,
          },
          {
            model: "",
            modelName: "",
            vendorId: null,
            key: "scriptAgent:storySkeletonAgent",
            name: "剧本Agent:故事骨架",
            desc: "故事骨架生成",
            temperature: 1,
            maxOutputTokens: 0,
            disabled: false,
          },
          {
            model: "",
            modelName: "",
            vendorId: null,
            key: "scriptAgent:adaptationStrategyAgent",
            name: "剧本Agent:改编策略",
            desc: "改编策略生成",
            temperature: 1,
            maxOutputTokens: 0,
            disabled: false,
          },
          {
            model: "",
            modelName: "",
            vendorId: null,
            key: "scriptAgent:scriptAgent",
            name: "剧本Agent:剧本生成",
            desc: "剧本生成",
            temperature: 1,
            maxOutputTokens: 0,
            disabled: false,
          },
          {
            model: "",
            modelName: "",
            vendorId: null,
            key: "productionAgent:decisionAgent",
            name: "生产Agent:决策层",
            desc: "决策层",
            temperature: 1,
            maxOutputTokens: 0,
            disabled: false,
          },
          {
            model: "",
            modelName: "",
            vendorId: null,
            key: "productionAgent:supervisionAgent",
            name: "生产Agent:监督层",
            desc: "监督层",
            temperature: 1,
            maxOutputTokens: 0,
            disabled: false,
          },
          {
            model: "",
            modelName: "",
            vendorId: null,
            key: "productionAgent:deriveAssetsAgent",
            name: "生产Agent:衍生资产",
            desc: "衍生资产",
            temperature: 1,
            maxOutputTokens: 0,
            disabled: false,
          },
          {
            model: "",
            modelName: "",
            vendorId: null,
            key: "productionAgent:generateAssetsAgent",
            name: "生产Agent:生成资产",
            desc: "生成资产",
            temperature: 1,
            maxOutputTokens: 0,
            disabled: false,
          },
          {
            model: "",
            modelName: "",
            vendorId: null,
            key: "productionAgent:directorPlanAgent",
            name: "生产Agent:导演规划",
            desc: "导演规划",
            temperature: 1,
            maxOutputTokens: 0,
            disabled: false,
          },
          {
            model: "",
            modelName: "",
            vendorId: null,
            key: "productionAgent:storyboardGenAgent",
            name: "生产Agent:分镜生成",
            desc: "分镜生成",
            temperature: 1,
            maxOutputTokens: 0,
            disabled: false,
          },
          {
            model: "",
            modelName: "",
            vendorId: null,
            key: "productionAgent:storyboardPanelAgent",
            name: "生产Agent:分镜面板",
            desc: "分镜面板生成",
            temperature: 1,
            maxOutputTokens: 0,
            disabled: false,
          },
          {
            model: "",
            modelName: "",
            vendorId: null,
            key: "productionAgent:storyboardTableAgent",
            name: "生产Agent:分镜表格",
            desc: "分镜表格生成",
            temperature: 1,
            maxOutputTokens: 0,
            disabled: false,
          },
        ]);
      },
    },
    //设置表
    {
      name: "o_setting",
      builder: (table) => {
        table.text("key");
        table.text("value");
        table.primary(["key"]);
        table.unique(["key"]);
      },
      initData: async (knex) => {
        await knex("o_setting").insert([
          {
            key: "tokenKey",
            value: uuid().slice(0, 8),
          },
          {
            key: "messagesPerSummary",
            value: 10,
          },
          {
            key: "shortTermLimit",
            value: 5,
          },
          {
            key: "summaryMaxLength",
            value: 500,
          },
          {
            key: "summaryLimit",
            value: 10,
          },
          {
            key: "ragLimit",
            value: 3,
          },
          {
            key: "deepRetrieveSummaryLimit",
            value: 5,
          },
          {
            key: "modelOnnxFile",
            value: '["all-MiniLM-L6-v2", "onnx", "model_fp16.onnx"]',
          },
          {
            key: "modelDtype",
            value: "fp16",
          },
          {
            key: "switchAiDevTool",
            value: "0",
          },
        ]);
      },
    },
    //任务中心表
    {
      name: "o_tasks",
      builder: (table) => {
        table.integer("id").notNullable();
        table.integer("projectId");
        table.string("taskClass");
        table.string("relatedObjects");
        table.string("model");
        table.text("describe");
        table.string("state");
        table.integer("startTime");
        table.text("reason");
        table.primary(["id"]);
        table.unique(["id"]);
      },
      initData: async (knex) => {},
    },
    //提示词表
    {
      name: "o_prompt",
      builder: (table) => {
        table.integer("id").notNullable();
        table.string("name");
        table.string("type");
        table.text("data");
        table.text("useData");
        table.primary(["id"]);
        table.unique(["id"]);
      },
      initData: async (knex) => {
        await knex("o_prompt").insert([
          {
            name: "事件提取",
            type: "eventExtraction",
            data: `# 事件提取指令\n\n你是小说文本分析助手。用户每次提供一个章节的原文，你提取该章的结构化事件信息。\n\n## ⚠️ 输出约束（最高优先级，违反任何一条即为失败）\n\n1. 你的**完整回复**只有一行，以 \`|\` 开头、以 \`|\` 结尾，恰好 7 个字段\n2. 回复的**第一个字符**必须是 \`|\`，**最后一个字符**必须是 \`|\`\n3. \`|\` 之前不许有任何字符——没有引导语、没有解释、没有"根据……"、没有"以下是……"\n4. \`|\` 之后不许有任何字符——没有总结、没有提取说明、没有改编建议\n5. 不输出表头行、分隔线、Markdown 标题、emoji、代码块标记\n\n## 输出格式\n\n格式: | 第X章 {章节标题} | {涉及角色} | {核心事件} | {主线关系} | {信息密度} | {预估集长} | {情绪强度} |\n\n### 字段规范\n\n| 字段 | 格式要求 | 示例 |\n|------|----------|------|\n| 章节 | \`第X章 {章节标题}\` | \`第1章 职业危机与许愿\` |\n| 涉及角色 | 有实际戏份的角色，顿号分隔 | \`林逸、白有容\` |\n| 核心事件 | 30-60字，必须含动作+结果 | \`林逸因解密风潮事业崩塌，颓废中许愿触发魔法系统绑定\` |\n| 主线关系 | **必须**为 \`强/中/弱（3-8字理由）\` | \`强（动机建立+系统激活）\` |\n| 信息密度 | \`高\` / \`中\` / \`低\` | \`高\` |\n| 预估集长 | **必须**为 \`X秒\`，禁止用分钟 | \`50秒\` |\n| 情绪强度 | 文字标签，\`+\` 连接，禁止星级/数字 | \`转折+悬疑\` |\n\n**主线关系判定**：强＝直接推动主角弧线；中＝补充世界观/人物关系/伏笔；弱＝过渡/气氛。\n\n**预估集长参考**：高密度+高情绪→45-60秒；中→35-45秒；低→25-35秒。\n\n**可用情绪标签**：\`冲突\`、\`恐怖\`、\`情感\`、\`转折\`、\`高潮\`、\`平铺\`、\`喜剧\`、\`悬疑\`、\`情感崩溃\`。\n\n## 输出示例\n\n\`\`\`\n| 第1章 职业危机与许愿 | 林逸 | 职业魔术师林逸因解密打假风潮导致事业崩塌，颓废中感慨"如果会魔法就好了"，意外触发神奇魔法系统绑定 | 强（主角动机建立+系统激活） | 高 | 50秒 | 转折+悬疑 |\n\`\`\`\n`,
          },
          {
            name: "剧本资产提取",
            type: "scriptAssetExtraction",
            data: `你是一个专业的剧本内容分析助手，专注于从剧本文本中识别和提取所有涉及的资产（人物角色、场景地点、道具物件），并为每项资产生成可供下游制作流程使用的结构化描述和提示词。`,
          },
          {
            name: "视频提示词生成",
            type: "videoPromptGeneration",
            data: `# 视频提示词生成 Skill\n\n你是**视频提示词生成 Agent**，专门负责根据指定的 AI 视频模型，读取分镜信息并输出该模型对应格式的视频提示词。`,
          },
          {
            name: "音色绑定",
            type: "audioBindPrompt",
            data: `你是一个音色匹配助手。\n你的任务是：根据给定角色资产的名称与描述，从候选音频列表中选出最合适的音色。\n匹配规则：\n1. 优先根据角色性别、年龄、性格等特征与音色描述进行语义匹配；\n2. 同一角色仅可匹配一个音色；\n3. 若候选列表中没有合适的音色，则无需返回 audioId；`,
          },
        ]);
      },
    },
    //模型绑定提示词表
    {
      name: "o_modelPrompt",
      builder: (table) => {
        table.integer("id").notNullable();
        table.string("vendorId");
        table.string("model");
        table.text("fileName");
        table.text("path");
        table.primary(["id"]);
        table.unique(["id"]);
      },
      initData: async (knex) => {},
    },
    //小说原文表
    {
      name: "o_novel",
      builder: (table) => {
        table.integer("id").notNullable();
        table.integer("chapterIndex");
        table.text("reel");
        table.text("chapter");
        table.text("chapterData");
        table.integer("projectId");
        table.integer("eventState");
        table.text("event");
        table.text("errorReason");
        table.integer("createTime");
        table.primary(["id"]);
        table.unique(["id"]);
      },
    },
    //小说事件表
    {
      name: "o_event",
      builder: (table) => {
        table.integer("id").notNullable();
        table.string("name");
        table.string("detail");
        table.integer("createTime");
        table.primary(["id"]);
        table.unique(["id"]);
      },
    },
    //事件-章节表
    {
      name: "o_eventChapter",
      builder: (table) => {
        table.integer("id").notNullable();
        table.integer("eventId").unsigned().references("id").inTable("o_event");
        table.integer("novelId").unsigned().references("id").inTable("o_novel");
        table.primary(["id"]);
        table.unique(["id"]);
      },
    },
    //剧本
    {
      name: "o_script",
      builder: (table) => {
        table.integer("id").notNullable();
        table.text("name");
        table.text("content");
        table.integer("projectId");
        table.integer("extractState");
        table.integer("createTime");
        table.text("errorReason");
        table.primary(["id"]);
        table.unique(["id"]);
      },
    },
    //资产表
    {
      name: "o_assets",
      builder: (table) => {
        table.integer("id").notNullable();
        table.text("name");
        table.text("prompt");
        table.text("remark");
        table.text("type");
        table.text("describe");
        table.integer("scriptId");
        table.integer("imageId").unsigned().references("id").inTable("o_image");
        table.integer("assetsId");
        table.integer("projectId");
        table.integer("flowId");
        table.integer("startTime");
        table.string("promptState");
        table.integer("audioBindState");
        table.text("promptErrorReason");
        table.primary(["id"]);
        table.unique(["id"]);
      },
      initData: async (knex) => {},
    },
    //生成图片表
    {
      name: "o_image",
      builder: (table) => {
        table.integer("id").notNullable();
        table.text("filePath");
        table.text("type");
        table.integer("assetsId");
        table.text("model");
        table.text("resolution");
        table.text("state");
        table.text("errorReason");
        table.primary(["id"]);
        table.unique(["id"]);
      },
    },
    //分镜
    {
      name: "o_storyboard",
      builder: (table) => {
        table.integer("id").notNullable();
        table.integer("scriptId");
        table.text("prompt");
        table.text("filePath");
        table.text("duration");
        table.text("state");
        table.integer("trackId");
        table.text("reason");
        table.text("track");
        table.text("videoDesc");
        table.integer("shouldGenerateImage");
        table.integer("projectId");
        table.integer("flowId");
        table.integer("index");
        table.integer("createTime");
        table.primary(["id"]);
        table.unique(["id"]);
      },
    },
    //flowData-剧本
    {
      name: "o_agentWorkData",
      builder: (table) => {
        table.integer("id").notNullable();
        table.integer("projectId");
        table.integer("episodesId");
        table.string("key");
        table.string("data");
        table.integer("createTime");
        table.integer("updateTime");
        table.primary(["id"]);
        table.unique(["id"]);
      },
    },
    //视频
    {
      name: "o_video",
      builder: (table) => {
        table.integer("id").notNullable();
        table.text("filePath");
        table.text("errorReason");
        table.integer("time");
        table.text("state");
        table.integer("scriptId");
        table.integer("projectId");
        table.integer("videoTrackId");
        table.primary(["id"]);
        table.unique(["id"]);
      },
    },
    // 视频轨道
    {
      name: "o_videoTrack",
      builder: (table) => {
        table.integer("id").notNullable();
        table.integer("videoId");
        table.integer("projectId");
        table.integer("scriptId");
        table.text("state");
        table.text("reason");
        table.text("prompt");
        table.integer("selectVideoId");
        table.integer("duration");
        table.primary(["id"]);
        table.unique(["id"]);
      },
    },
    //供应商配置表
    {
      name: "o_vendorConfig",
      builder: (table) => {
        table.string("id").notNullable();
        table.text("inputValues");
        table.text("models");
        table.integer("enable");
        table.primary(["id"]);
        table.unique(["id"]);
      },
      initData: async (knex) => {
        await knex("o_vendorConfig").insert([
          { id: "ohmyvideo", inputValues: "{}", models: "[]", enable: 0 },
          { id: "deepseek", inputValues: "{}", models: "[]", enable: 0 },
          { id: "atlascloud", inputValues: "{}", models: "[]", enable: 0 },
          { id: "volcengine", inputValues: "{}", models: "[]", enable: 0 },
          { id: "minimax", inputValues: "{}", models: "[]", enable: 0 },
          { id: "openai", inputValues: "{}", models: "[]", enable: 0 },
          { id: "klingai", inputValues: "{}", models: "[]", enable: 0 },
          { id: "vidu", inputValues: "{}", models: "[]", enable: 0 },
        ]);
      },
    },
    //图片工作流表
    {
      name: "o_imageFlow",
      builder: (table) => {
        table.integer("id").notNullable();
        table.text("flowData").notNullable();
        table.primary(["id"]);
        table.unique(["id"]);
      },
    },
    {
      name: "o_assets2Storyboard",
      builder: (table) => {
        table.integer("storyboardId").notNullable();
        table.integer("assetId").notNullable();
        table.primary(["storyboardId", "assetId"]);
        table.unique(["storyboardId", "assetId"]);
      },
    },
    {
      name: "o_scriptAssets",
      builder: (table) => {
        table.integer("scriptId").notNullable();
        table.integer("assetId").notNullable();
        table.primary(["scriptId", "assetId"]);
        table.unique(["scriptId", "assetId"]);
      },
    },
    {
      name: "o_skillList",
      builder: (table) => {
        table.text("id").notNullable();
        table.text("md5").notNullable();
        table.text("path").notNullable();
        table.text("name").notNullable();
        table.text("description").notNullable();
        table.text("embedding");
        table.text("type").notNullable();
        table.integer("createTime").notNullable();
        table.integer("updateTime").notNullable();
        table.integer("state").notNullable();
        table.primary(["id"]);
      },
      initData: async (knex) => {
        const list = [
          { id: "4fb36012e56e395b425569987f5dab0e", md5: "fca3c269c5f325a65dafa663c9bb9773", path: "production_agent_decision.md", name: "production_agent_decision", description: "", embedding: "", type: "main", createTime: 1774447310118, updateTime: 1774447310118, state: -1 },
          { id: "017b6338d7aa227cd614ec1fb25fd83e", md5: "2610b80abe4bd048fe61c73adc7388ac", path: "production_agent_execution.md", name: "production_agent_execution", description: "", embedding: "", type: "main", createTime: 1774447310118, updateTime: 1774447310118, state: -1 },
          { id: "f03c8e67b61580de9ea5b9d166521b67", md5: "d41d8cd98f00b204e9800998ecf8427e", path: "production_agent_supervision.md", name: "production_agent_supervision", description: "", embedding: "", type: "main", createTime: 1774447310118, updateTime: 1774447310118, state: -1 },
          { id: "50b49d8af5d364665b463c23f6a4d8bb", md5: "fbba66e0df2426996277b299710c3033", path: "script_agent_decision.md", name: "script_agent_decision", description: "", embedding: "", type: "main", createTime: 1774447310118, updateTime: 1774447310118, state: -1 },
          { id: "427727727e1095c54b6840cd21382d82", md5: "7e5911242af7233854d533278c6a8ccb", path: "script_agent_execution.md", name: "script_agent_execution", description: "", embedding: "", type: "main", createTime: 1774447310118, updateTime: 1774447310118, state: -1 },
          { id: "02848fb0dd582fd926502c77ecf9679c", md5: "7a8b6a311b015cd47bf17cc52b935348", path: "script_agent_supervision.md", name: "script_agent_supervision", description: "", embedding: "", type: "main", createTime: 1774447310118, updateTime: 1774447310118, state: -1 },
          { id: "a1e818cc03a0b355b239ac1fb0512969", md5: "1fd22029e8047aa30b0dfd703cb837ed", path: "universal_agent.md", name: "universal_agent", description: "", embedding: "", type: "main", createTime: 1774447310118, updateTime: 1774447310118, state: -1 },
          { id: "3e5efec258c8d8e6a39bcef12f8ee058", md5: "efccb0464cfd472861b49ebf737d4820", path: "references/event_extract.md", name: "event_extract", description: "事件提取助手", embedding: "", type: "references", createTime: 1774447310118, updateTime: 1774450165911, state: 1 },
          { id: "52c51fa8655f899a1b7aae9b6aad7251", md5: "783678aaab829b34e7c30a414c356bf6", path: "references/novel_character_extract.md", name: "novel_character_extract", description: "角色提取助手", embedding: "", type: "references", createTime: 1774447310118, updateTime: 1774450080903, state: 1 },
        ];
        await Promise.all(
          list.map(async (item) => {
            const embedding = await getEmbedding(item.description);
            item.embedding = JSON.stringify(embedding);
          }),
        );
        await knex("o_skillList").insert(list);
      },
    },
    {
      name: "o_skillAttribution",
      builder: (table) => {
        table.text("skillId").notNullable().references("id").inTable("o_skillList").onDelete("CASCADE");
        table.text("attribution").notNullable();
        table.primary(["skillId", "attribution"]);
        table.index(["attribution"]);
      },
      initData: async (knex) => {
        await knex("o_skillAttribution").insert([
          { skillId: "52c51fa8655f899a1b7aae9b6aad7251", attribution: "universal_agent.md" },
          { skillId: "6d46cdca10b2f49e07e515885d1387a0", attribution: "universal_agent.md" },
          { skillId: "1864df75d1d65f76e275046649ecaef8", attribution: "universal_agent.md" },
          { skillId: "3e5efec258c8d8e6a39bcef12f8ee058", attribution: "universal_agent.md" },
          { skillId: "7fbce6f90d7d85496ba9817e9622e640", attribution: "universal_agent.md" },
          { skillId: "31fb5c5a1f514ec1e66b4eba9f22d4db", attribution: "script_agent_decision.md" },
          { skillId: "27dc2dfc901de2180227d0269217583a", attribution: "script_agent_execution.md" },
          { skillId: "d49fa09504fe784a8e6eb102756c6d56", attribution: "script_agent_execution.md" },
          { skillId: "797906c2ddf0750f050bcdeae23eae3d", attribution: "script_agent_execution.md" },
          { skillId: "1abd8675c0c3e62b20c0b151d2ec0fb1", attribution: "script_agent_execution.md" },
          { skillId: "0b7828d7a6ab458a4b201122f08d6c16", attribution: "script_agent_supervision.md" },
          { skillId: "5c1772b5f9c420d9eae9ca02914ba087", attribution: "production_agent_decision.md" },
          { skillId: "75a45cf996015ca819582873887ec301", attribution: "production_agent_execution.md" },
          { skillId: "fce75f69d704c19bebcb356bc1bd6e81", attribution: "production_agent_execution.md" },
        ]);
      },
    },
    //记忆表
    {
      name: "memories",
      builder: (table) => {
        table.text("id").notNullable();
        table.text("isolationKey").notNullable();
        table.text("type").notNullable();
        table.text("role");
        table.text("name");
        table.text("content").notNullable();
        table.text("embedding");
        table.text("relatedMessageIds");
        table.integer("summarized").defaultTo(0);
        table.integer("createTime").notNullable();
        table.primary(["id"]);
        table.index(["isolationKey", "type"]);
        table.index(["isolationKey", "summarized"]);
      },
    },
    {
      name: "o_assetsRole2Audio",
      builder: (table) => {
        table.integer("assetsRoleId").notNullable();
        table.integer("assetsAudioId").notNullable();
        table.primary(["assetsAudioId", "assetsRoleId"]);
        table.unique(["assetsAudioId", "assetsRoleId"]);
      },
    },
  ];

  for (const t of tables) {
    const tableExists = await knex.schema.hasTable(t.name);
    if (!tableExists || forceInit) {
      if (tableExists && forceInit) {
        await knex.schema.dropTable(t.name);
        console.log("[初始化数据库] 已存在表删除并重建:", t.name);
      } else {
        console.log("[初始化数据库] 创建数据表:", t.name);
      }
      await knex.schema.createTable(t.name, t.builder);
      if (t.initData) {
        await t.initData(knex);
        console.log("[初始化数据库] 表数据初始化:", t.name);
      }
    }
  }
};