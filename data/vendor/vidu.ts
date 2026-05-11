//如需遥测AI请使用在toonflow安装目录运行npx @ai-sdk/devtools （要求在其他设置中打开遥测功能，且toonflow有权限在安装目录创建.devtools文件夹）
// ==================== 类型定义 ====================
// 文本模型
interface TextModel {
  name: string; // 显示名称
  modelName: string;
  type: "text";
  think: boolean; // 前端显示用
}

// 图像模型
interface ImageModel {
  name: string; // 显示名称
  modelName: string;
  type: "image";
  mode: ("text" | "singleImage" | "multiReference")[];
  associationSkills?: string; // 关联技能，多个技能用逗号分隔
}
// 视频模型
interface VideoModel {
  name: string; // 显示名称
  modelName: string; //全局唯一
  type: "video";
  mode: (
    | "singleImage" // 单图
    | "startEndRequired" // 首尾帧（两张都得有）
    | "endFrameOptional" // 首尾帧（尾帧可选）
    | "startFrameOptional" // 首尾帧（首帧可选）
    | "text" // 文本生视频
    | (`videoReference:${number}` | `imageReference:${number}` | `audioReference:${number}`)[] // 多参考模式
  )[];
  associationSkills?: string; // 关联技能，多个技能用逗号分隔
  audio: "optional" | false | true; // 音频配置
  durationResolutionMap: { duration: number[]; resolution: string[] }[];
}

interface TTSModel {
  name: string; // 显示名称
  modelName: string;
  type: "tts";
  voices: {
    title: string; //显示名称
    voice: string; //说话人
  }[];
}
// 供应商配置
interface VendorConfig {
  id: string; //供应商唯一标识，必须全局唯一
  author: string;
  description?: string; //md5格式
  name: string;
  icon?: string; //仅支持base64格式
  inputs: {
    key: string;
    label: string;
    type: "text" | "password" | "url";
    required: boolean;
    placeholder?: string;
  }[];
  inputValues: Record<string, string>;
  models: (TextModel | ImageModel | VideoModel)[];
}
// ==================== 全局工具函数 ====================
//Axios实例
//压缩图片大小(1MB = 1 * 1024 * 1024)
declare const zipImage: (completeBase64: string, size: number) => Promise<string>;
//压缩图片分辨率
declare const zipImageResolution: (completeBase64: string, width: number, height: number) => Promise<string>;
//多图拼接乘单图 maxSize  最大输出大小，默认为 10mb
declare const mergeImages: (completeBase64: string[], maxSize?: string) => Promise<string>;
//Url转Base64
declare const urlToBase64: (url: string) => Promise<string>;
//轮询函数
declare const pollTask: (
  fn: () => Promise<{ completed: boolean; data?: string; error?: string }>,
  interval?: number,
  timeout?: number,
) => Promise<{ completed: boolean; data?: string; error?: string }>;
declare const axios: any;
declare const createOpenAI: any;
declare const createDeepSeek: any;
declare const createZhipu: any;
declare const createQwen: any;
declare const createAnthropic: any;
declare const createOpenAICompatible: any;
declare const createXai: any;
declare const createMinimax: any;
declare const createGoogleGenerativeAI: any;
declare const logger: (logstring: string) => void;
declare const jsonwebtoken: any;
// ==================== 供应商数据 ====================
const vendor: VendorConfig = {
  id: "vidu",
  author: "搬砖的Coder",
  description:
    "Vidu 官方视频生成平台。 [前往平台](https://platform.vidu.cn/login/)",
  name: "Vidu 开放平台",
  inputs: [
    { key: "apiKey", label: "API密钥", type: "password", required: true, placeholder: "请到Vidu官方申请" },
    { key: "baseUrl", label: "接口路径", type: "url", required: true, placeholder: "https://api.vidu.cn/ent/v2" },
  ],
  inputValues: {
    apiKey: "",
    baseUrl: "https://api.vidu.cn/ent/v2",
  },
  models: [
    {
      name: "ViduQ3 mix",
      type: "video",
      modelName: "viduq3-mix",
      durationResolutionMap: [{ duration: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], resolution: ["720p", "1080p"] }],
      mode: ["singleImage", "startEndRequired", "text"],
      audio: true,
    },
    {
      name: "ViduQ3 turbo",
      type: "video",
      modelName: "viduq3-turbo",
      durationResolutionMap: [{ duration: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], resolution: ["540p", "720p", "1080p"] }],
      mode: ["singleImage", "startEndRequired", "text"],
      audio: true,
    },
    {
      name: "ViduQ3 pro",
      type: "video",
      modelName: "viduq3",
      durationResolutionMap: [{ duration: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], resolution: ["540p", "720p", "1080p"] }],
      mode: ["singleImage", "startEndRequired", "text"],
      audio: true,
    },
    {
      name: "ViduQ2 pro fast",
      type: "video",
      modelName: "viduq2-pro-fast",
      durationResolutionMap: [{ duration: [5, 6, 7, 8, 9, 10], resolution: ["720p", "1080p"] }],
      mode: ["singleImage", "startEndRequired"],
      audio: true,
    },
    {
      name: "viduQ2 turbo",
      type: "video",
      modelName: "viduq2-turbo",
      durationResolutionMap: [{ duration: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], resolution: ["540p", "720p", "1080p"] }],
      mode: ["singleImage", "startEndRequired"],
      audio: true,
    },
    {
      name: "ViduQ2 pro",
      type: "video",
      modelName: "viduq2-pro",
      durationResolutionMap: [{ duration: [5, 6, 7, 8, 9, 10], resolution: ["540p", "720p", "1080p"] }],
      mode: ["singleImage", "startEndRequired"],
      audio: true,
    },
    {
      name: "ViduQ2",
      type: "video",
      modelName: "viduq2",
      durationResolutionMap: [{ duration: [5], resolution: ["1080p"] }],
      mode: ["text"],
      audio: true,
    },
    {
      name: "ViduQ1",
      type: "video",
      modelName: "viduq1",
      durationResolutionMap: [{ duration: [5], resolution: ["1080p"] }],
      mode: ["singleImage", "startEndRequired", "text"],
      audio: true,
    },
    {
      name: "ViduQ1 classic",
      type: "video",
      modelName: "viduq1-classic",
      durationResolutionMap: [{ duration: [5], resolution: ["1080p"] }],
      mode: ["singleImage", "startEndRequired"],
      audio: true,
    },
    {
      name: "Vidu2.0",
      type: "video",
      modelName: "vidu2.0",
      durationResolutionMap: [{ duration: [4, 8], resolution: ["360p", "720p", "1080p"] }],
      mode: ["singleImage", "startEndRequired"],
      audio: true,
    },
    {
      name: "viduq1 for image",
      type: "image",
      modelName: "viduq1",
      mode: ["text"],
    },
    {
      name: "viduq2 for image",
      type: "image",
      modelName: "viduq2",
      mode: ["text", "singleImage", "multiReference"],
    },
  ],
};
exports.vendor = vendor;

// ==================== 适配器函数 ====================

// 文本请求函数
const textRequest: (textModel: TextModel) => { url: string; model: string } = (textModel) => {
  throw new Error("当前供应商仅支持视频大模型，谢谢！");
};
exports.textRequest = textRequest;

//图片请求函数
interface ImageConfig {
  prompt: string; //图片提示词
  imageBase64: string[]; //输入的图片提示词
  size: "1K" | "2K" | "4K"; // 图片尺寸
  aspectRatio: `${number}:${number}`; // 长宽比
}
const imageRequest = async (imageConfig: ImageConfig, imageModel: ImageModel) => {
  if (!vendor.inputValues.apiKey) throw new Error("缺少API Key");
  const apiKey = vendor.inputValues.apiKey.replace("Token ", "");

  const size = imageConfig.size === "1K" ? "2K" : imageConfig.size;
  const sizeMap: Record<string, Record<string, string>> = {
    "16:9": {
      "1k": "1920x1080",
      "2K": "2848x1600",
      "4K": "4096x2304",
    },
    "9:16": {
      "1k": "1920x1080",
      "2K": "1600x2848",
      "4K": "2304x4096",
    },
  };

  const body: Record<string, any> = {
    model: imageModel.modelName,
    prompt: imageConfig.prompt,
    aspect_ratio: sizeMap[imageConfig.aspectRatio][size],
    seed: 0,
    resolution: size,
    ...(imageConfig.imageBase64 && { image: imageConfig.imageBase64 }),
  };

  const createImageUrl = vendor.inputValues.baseUrl + "/reference2image";
  const response = await fetch(createImageUrl, {
    method: "POST",
    headers: { Authorization: `Token ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorText = await response.text(); // 获取错误信息
    console.error("请求失败，状态码:", response.status, ", 错误信息:", errorText);
    throw new Error(`请求失败，状态码: ${response.status}, 错误信息: ${errorText}`);
  }
  const data = await response.json();
  const res = await checkTaskResult(data.task_id);
  if (!res.data) {
    throw new Error("图片未能生成");
  }
  const list = JSON.parse(JSON.stringify(res.data));
  return list[0].url;
};
exports.imageRequest = imageRequest;

interface VideoConfig {
  duration: number;
  resolution: string;
  aspectRatio: "16:9" | "9:16";
  prompt: string;
  imageBase64?: string[];
  audio?: boolean;
  mode:
  | "singleImage" // 单图
  | "multiImage" // 多图模式
  | "gridImage" // 网格单图（传入一张图片，但该图片是网格图）
  | "startEndRequired" // 首尾帧（两张都得有）
  | "endFrameOptional" // 首尾帧（尾帧可选）
  | "startFrameOptional" // 首尾帧（首帧可选）
  | "text" // 文本生视频
  | "subjectReference" // 主体参考模式
  | ("video" | "image" | "audio" | "text")[]; // 混合参考
  subjects?: {
    name: string;
    images: string[];
  }[];
}

// 构建 各个平台的metadata参数

const buildViduMetadata = (videoConfig: VideoConfig) => ({
  aspect_ratio: videoConfig.aspectRatio,
  audio: videoConfig.audio ?? false,
  off_peak: false,
});

type MetadataBuilder = (config: VideoConfig) => Record<string, any>;
const METADATA_BUILDERS: Array<[string, MetadataBuilder]> = [["vidu", buildViduMetadata]];
const buildModelMetadata = (modelName: string, videoConfig: VideoConfig) => {
  const lowerName = modelName.toLowerCase();
  const match = METADATA_BUILDERS.find(([key]) => lowerName.includes(key));
  return match ? match[1](videoConfig) : {};
};
// 检查生成物结果
// 检查生成物结果
const checkTaskResult = async (taskId: string) => {
  const queryUrl = vendor.inputValues.baseUrl + "/tasks/{id}/creations";
  const apiKey = vendor.inputValues.apiKey;
  logger(`[Vidu 查询任务] URL: ${queryUrl.replace("{id}", taskId)}`);
  const res = await pollTask(async () => {
    try {
      const queryResponse = await fetch(queryUrl.replace("{id}", taskId), {
        method: "GET",
        headers: { Authorization: `Token ${apiKey}`, "Content-Type": "application/json" },
      });
      if (!queryResponse.ok) {
        const errorText = await queryResponse.text();
        console.error("请求失败，状态码:", queryResponse.status, ", 错误信息:", errorText);
        return { completed: false, error: `请求失败: ${queryResponse.status}` };
      }
      const queryData = await queryResponse.json();
      logger(`[Vidu 查询任务] 响应: ${JSON.stringify(queryData)}`);
      const status = queryData?.state ?? queryData?.data?.state;
      const fail_reason = queryData?.data?.err_code ?? queryData?.data;
      switch (status) {
        case "completed":
        case "SUCCESS":
        case "success":
          const creations = queryData?.creations || queryData?.data?.creations;
          logger(`[Vidu 查询任务] creations: ${JSON.stringify(creations)}`);
          if (!creations || !Array.isArray(creations) || creations.length === 0) {
            return { completed: false, error: "未找到生成结果" };
          }
          return { completed: true, data: JSON.stringify(creations) };
        case "FAILURE":
        case "failed":
          return { completed: false, error: String(fail_reason || "生成失败") };
        default:
          return { completed: false };
      }
    } catch (e: any) {
      logger(`[Vidu 查询任务] 异常: ${String(e?.message || e)}`);
      return { completed: false, error: String(e?.message || e || "unknown error") };
    }
  });
  logger(`[Vidu 查询任务] 最终结果: ${JSON.stringify(res)}`);
  if (res.error) throw new Error(String(res.error));
  return res;
};

// 转换为 Vidu API 的分辨率格式
const toViduResolution = (resolution: string): string => {
  const res = resolution.toLowerCase();
  if (res === "540p") return "540p";
  if (res === "720p") return "720p";
  if (res === "1080p") return "1080p";
  if (res === "360p") return "360p";
  return resolution;
};

// 转换宽高比格式
const toViduAspectRatio = (aspectRatio: string): string => {
  if (aspectRatio === "16:9") return "16:9";
  if (aspectRatio === "9:16") return "9:16";
  if (aspectRatio === "1:1") return "1:1";
  return aspectRatio;
};

const videoRequest = async (videoConfig: VideoConfig, videoModel: VideoModel) => {
  if (!vendor.inputValues.apiKey) throw new Error("缺少API Key");
  const apiKey = vendor.inputValues.apiKey.replace("Token ", "");
  const baseUrl = vendor.inputValues.baseUrl;

  // 构建 metadata
  const metadata = buildModelMetadata(videoModel.modelName, videoConfig);

  // 处理主体参考模式 - 使用 Vidu subjects API
  if (videoConfig.mode === "subjectReference") {
    // 构建主体引用请求 (使用 /ent/v2/reference2video + subjects)
    const subjects = videoConfig.subjects || [];

    if (subjects.length === 0) {
      throw new Error("主体参考模式需要提供 subjects 参数");
    }

    // 将 @主体名 替换为 @1, @2 等数字编号
    let processedPrompt = videoConfig.prompt;
    subjects.forEach((subject, index) => {
      const num = index + 1;
      // 替换 @主体名 为 @数字
      processedPrompt = processedPrompt.replace(
        new RegExp(`@${subject.name}\\s`, 'g'),
        `@${num} `
      );
      // 也处理句尾的情况
      processedPrompt = processedPrompt.replace(
        new RegExp(`@${subject.name}($|[\\s，。！？])`, 'g'),
        `@${num}$1`
      );
    });

    // 压缩主体图片以符合 API 大小限制 (10MB)
    const compressedSubjects = await Promise.all(
      subjects.map(async (subject) => ({
        name: subject.name,
        images: await Promise.all(subject.images.map((img) => zipImage(img, 10))),
      }))
    );

    const requestBody: Record<string, any> = {
      model: videoModel.modelName,
      prompt: processedPrompt,
      duration: videoConfig.duration,
      aspect_ratio: toViduAspectRatio(videoConfig.aspectRatio),
      resolution: toViduResolution(videoConfig.resolution),
      subjects: compressedSubjects,
      ...metadata,
    };

    // audio 参数 (仅 q3 系列支持)
    if (videoConfig.audio !== undefined) {
      requestBody.audio = videoConfig.audio;
    }

    const requestUrl = baseUrl + "/reference2video";
    logger(`[Vidu 主体参考模式] 请求URL: ${requestUrl}`);
    logger(`[Vidu 主体参考模式] 请求体: ${JSON.stringify(requestBody, null, 2)}`);

    const response = await fetch(requestUrl, {
      method: "POST",
      headers: { Authorization: `Token ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("请求失败，状态码:", response.status, ", 错误信息:", errorText);
      throw new Error(`请求失败，状态码: ${response.status}, 错误信息: ${errorText}`);
    }
    const data = await response.json();
    const taskId = data.task_id;
    logger(`[Vidu 主体参考模式] 任务ID: ${taskId}`);
    const result = await checkTaskResult(taskId);
    if (!result.data) {
      throw new Error("视频生成结果为空");
    }
    // 解析 JSON 字符串，提取第一个 creation 的 url
    const creations = JSON.parse(result.data);
    if (!creations || !Array.isArray(creations) || creations.length === 0) {
      throw new Error("视频生成结果解析失败");
    }
    const videoUrl = creations[0].url;
    if (!videoUrl) {
      throw new Error("视频URL为空");
    }
    logger(`[Vidu 视频生成] 视频URL: ${videoUrl}`);
    return videoUrl;
  }

  // 非主体参考模式 - 使用 images 直接调用
  // 构建公共请求参数
  const requestBody: Record<string, any> = {
    model: videoModel.modelName,
    prompt: videoConfig.prompt,
    duration: videoConfig.duration,
    aspect_ratio: toViduAspectRatio(videoConfig.aspectRatio),
    resolution: toViduResolution(videoConfig.resolution),
    seed: 234,
    ...metadata,
  };

  // 添加图片参考 (非主体模式)
  if (videoConfig.imageBase64 && videoConfig.imageBase64.length > 0) {
    // 压缩图片以符合 API 大小限制 (10MB)
    const compressedImages = await Promise.all(
      videoConfig.imageBase64.map((img) => zipImage(img, 10))
    );
    requestBody.images = compressedImages;
  }

  // audio 参数
  if (videoConfig.audio !== undefined) {
    requestBody.audio = videoConfig.audio;
  }

  // 根据 mode 确定 API 端点
  let requestUrl = baseUrl + "/reference2video";

  // 根据模式选择不同的 API
  if (videoConfig.mode === "text") {
    // 文生视频 - 可能使用不同的端点
    requestUrl = baseUrl + "/text2video";
  }

  logger(`[Vidu 视频生成] 请求URL: ${requestUrl}`);
  logger(`[Vidu 视频生成] 请求体: ${JSON.stringify(requestBody, null, 2)}`);

  const response = await fetch(requestUrl, {
    method: "POST",
    headers: { Authorization: `Token ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });
  if (!response.ok) {
    const errorText = await response.text(); // 获取错误信息
    console.error("请求失败，状态码:", response.status, ", 错误信息:", errorText);
    throw new Error(`请求失败，状态码: ${response.status}, 错误信息: ${errorText}`);
  }
  const data = await response.json();
  const taskId = data.task_id;
  logger(`[Vidu 视频生成] 任务ID: ${taskId}`);
  const result = await checkTaskResult(taskId);
  if (!result.data) {
    throw new Error("视频生成结果为空");
  }
  // 解析 JSON 字符串，提取第一个 creation 的 url
  const creations = JSON.parse(result.data);
  if (!creations || !Array.isArray(creations) || creations.length === 0) {
    throw new Error("视频生成结果解析失败");
  }
  const videoUrl = creations[0].url;
  if (!videoUrl) {
    throw new Error("视频URL为空");
  }
  logger(`[Vidu 视频生成] 视频URL: ${videoUrl}`);
  return videoUrl;
};
exports.videoRequest = videoRequest;

interface TTSConfig {
  text: string;
  voice: string;
  speechRate: number;
  pitchRate: number;
  volume: number;
}
const ttsRequest = async (ttsConfig: TTSConfig, ttsModel: TTSModel) => {
  throw new Error("Vidu 暂不支持语音合成（TTS）");
};
