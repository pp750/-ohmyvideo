/**
 * VectorEngine 图片生成供应商适配
 * @version 1.0
 * @description VectorEngine AI API 中转平台 - 仅图片生成
 * @website https://api.vectorengine.ai
 */

// ============================================================
// 类型定义
// ============================================================

type VideoMode =
  | "singleImage"
  | "startEndRequired"
  | "endFrameOptional"
  | "startFrameOptional"
  | "text"
  | (`videoReference:${number}` | `imageReference:${number}` | `audioReference:${number}`)[];

interface TextModel {
  name: string;
  modelName: string;
  type: "text";
  think: boolean;
}

interface ImageModel {
  name: string;
  modelName: string;
  type: "image";
  mode: ("text" | "singleImage" | "multiReference")[];
  associationSkills?: string;
}

interface VideoModel {
  name: string;
  modelName: string;
  type: "video";
  mode: VideoMode[];
  associationSkills?: string;
  audio: "optional" | false | true;
  durationResolutionMap: { duration: number[]; resolution: string[] }[];
}

interface TTSModel {
  name: string;
  modelName: string;
  type: "tts";
  voices: { title: string; voice: string }[];
}

interface VendorConfig {
  id: string;
  version: string;
  name: string;
  author: string;
  description?: string;
  icon?: string;
  inputs: { key: string; label: string; type: "text" | "password" | "url"; required: boolean; placeholder?: string }[];
  inputValues: Record<string, string>;
  models: (TextModel | ImageModel | VideoModel | TTSModel)[];
}

type ReferenceList =
  | { type: "image"; sourceType: "base64"; base64: string }
  | { type: "audio"; sourceType: "base64"; base64: string }
  | { type: "video"; sourceType: "base64"; base64: string };

interface ImageConfig {
  prompt: string;
  referenceList?: Extract<ReferenceList, { type: "image" }>[];
  size: "1K" | "2K" | "4K";
  aspectRatio: `${number}:${number}`;
}

interface VideoConfig {
  duration: number;
  resolution: string;
  aspectRatio: "16:9" | "9:16";
  prompt: string;
  referenceList?: ReferenceList[];
  audio?: boolean;
  mode: VideoMode[];
}

interface TTSConfig {
  text: string;
  voice: string;
  speechRate: number;
  pitchRate: number;
  volume: number;
  referenceList?: Extract<ReferenceList, { type: "audio" }>[];
}

interface PollResult {
  completed: boolean;
  data?: string;
  error?: string;
}

// ============================================================
// 全局声明
// ============================================================

declare const axios: any;
declare const logger: (msg: string) => void;
declare const jsonwebtoken: any;
declare const zipImage: (base64: string, size: number) => Promise<string>;
declare const zipImageResolution: (base64: string, w: number, h: number) => Promise<string>;
declare const mergeImages: (base64Arr: string[], maxSize?: string) => Promise<string>;
declare const urlToBase64: (url: string) => Promise<string>;
declare const pollTask: (fn: () => Promise<PollResult>, interval?: number, timeout?: number) => Promise<PollResult>;
declare const createOpenAI: any;
declare const createDeepSeek: any;
declare const createZhipu: any;
declare const createQwen: any;
declare const createAnthropic: any;
declare const createOpenAICompatible: any;
declare const createXai: any;
declare const createMinimax: any;
declare const createGoogleGenerativeAI: any;
declare const exports: {
  vendor: VendorConfig;
  textRequest: (m: TextModel, t: boolean, tl: 0 | 1 | 2 | 3) => any;
  imageRequest: (c: ImageConfig, m: ImageModel) => Promise<string>;
  videoRequest: (c: VideoConfig, m: VideoModel) => Promise<string>;
  ttsRequest: (c: TTSConfig, m: TTSModel) => Promise<string>;
  checkForUpdates?: () => Promise<{ hasUpdate: boolean; latestVersion: string; notice: string }>;
  updateVendor?: () => Promise<string>;
};

// ============================================================
// 供应商配置
// ============================================================

const vendor: VendorConfig = {
  id: "vectorengine",
  version: "1.1",
  author: "Toonflow",
  name: "VectorEngine 图片",
  description:
    "## VectorEngine 图片生成\n\nVectorEngine AI API 中转平台，专注于图片生成。\n\n### 支持的模型\n- **GPT-Image-2**：OpenAI 最新图像生成模型，支持 1K/2K/4K 分辨率\n- **DALL-E 3**：OpenAI 高质量图像生成\n- **Midjourney**：艺术风格图像生成\n- **Stable Diffusion 3**：开源图像生成\n- **Gemini Image**：Google Gemini 图像生成\n\n### 特点\n- 兼容 OpenAI Images API 协议\n- 支持文生图、图生图、多图参考\n- 多种分辨率和宽高比\n\n🔗 [前往平台](https://api.vectorengine.ai/)\n\n> 💡 提示：请先在 VectorEngine 平台注册并获取 API Key",
  icon: "",
  inputs: [
    { key: "apiKey", label: "API密钥", type: "password", required: true, placeholder: "请在 VectorEngine 平台获取" },
    { key: "baseUrl", label: "请求地址", type: "url", required: true, placeholder: "https://api.vectorengine.ai/v1" },
  ],
  inputValues: {
    apiKey: "",
    baseUrl: "https://api.vectorengine.ai/v1",
  },
  models: [
    {
      name: "GPT-Image-2",
      modelName: "gpt-image-2-all",
      type: "image",
      mode: ["text", "singleImage", "multiReference"],
    },
    {
      name: "DALL-E 3",
      modelName: "dall-e-3",
      type: "image",
      mode: ["text"],
    },
    {
      name: "Midjourney",
      modelName: "midjourney",
      type: "image",
      mode: ["text", "singleImage", "multiReference"],
    },
    {
      name: "Stable Diffusion 3",
      modelName: "sd3",
      type: "image",
      mode: ["text", "singleImage"],
    },
    {
      name: "Gemini Image",
      modelName: "gemini-3-pro-image-preview",
      type: "image",
      mode: ["text", "singleImage", "multiReference"],
    },
  ],
};

// ============================================================
// 辅助工具
// ============================================================

function getHeaders() {
  const apiKey = vendor.inputValues.apiKey?.replace(/^Bearer\s+/i, "");
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

function getBaseUrl() {
  return vendor.inputValues.baseUrl || "https://api.vectorengine.ai/v1";
}

/**
 * 判断是否为网络/DNS错误（适合重试）
 */
function isNetworkError(err: any): boolean {
  const msg = String(err?.message || err || "");
  return /ENOTFOUND|EAI_AGAIN|ECONNRESET|ETIMEDOUT|timeout|fetch.*fail|network/i.test(msg);
}

/**
 * 判断是否为可重试的 HTTP 状态码
 */
function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

// ============================================================
// 适配器函数
// ============================================================

const textRequest = (model: TextModel, think: boolean, thinkLevel: 0 | 1 | 2 | 3) => {
  throw new Error("VectorEngine 图片供应商仅支持图片生成，不支持文本模型");
};

const imageRequest = async (config: ImageConfig, model: ImageModel): Promise<string> => {
  if (!vendor.inputValues.apiKey) throw new Error("缺少API Key，请在设置中配置 VectorEngine API密钥");
  const baseUrl = getBaseUrl();

  logger(`[VectorEngine] 使用图像模型: ${model.modelName}`);

  // 提取参考图片
  const imageBase64List = (config.referenceList ?? []).map((r) => r.base64);

  // 构建请求体
  const body: Record<string, any> = {
    model: model.modelName,
    prompt: config.prompt,
    n: 1,
  };

  // 根据模型类型调整参数
  const lowerName = model.modelName.toLowerCase();

  // GPT-Image-2 模型
  if (lowerName.includes("gpt-image-2")) {
    // GPT-Image-2 尺寸和分辨率映射
    const sizeMap: Record<string, Record<string, string>> = {
      "1:1": { "1K": "1024x1024", "2K": "2048x2048" },
      "3:2": { "1K": "1536x1024", "2K": "2048x1360" },
      "2:3": { "1K": "1024x1536", "2K": "1360x2048" },
      "4:3": { "1K": "1024x768", "2K": "2048x1536" },
      "3:4": { "1K": "768x1024", "2K": "1536x2048" },
      "16:9": { "1K": "1536x864", "2K": "2048x1152", "4K": "3840x2160" },
      "9:16": { "1K": "864x1536", "2K": "1152x2048", "4K": "2160x3840" },
      "2:1": { "1K": "2048x1024", "2K": "2688x1344", "4K": "3840x1920" },
      "1:2": { "1K": "1024x2048", "2K": "1344x2688", "4K": "1920x3840" },
      "21:9": { "1K": "2016x864", "2K": "2688x1152", "4K": "3840x1648" },
      "9:21": { "1K": "864x2016", "2K": "1152x2688", "4K": "1648x3840" },
    };

    const resolution = config.size === "4K" ? "4K" : config.size === "2K" ? "2K" : "1K";
    body.size = sizeMap[config.aspectRatio]?.[resolution] || "1024x1024";
    body.resolution = resolution.toLowerCase();
    body.quality = config.size === "4K" ? "high" : "medium";

    // GPT-Image-2 使用 image 参数（URL 数组），而不是 reference_images
    if (imageBase64List.length > 0) {
      // 需要将 base64 转换为 URL 或保持 base64 格式
      body.image = imageBase64List;
    }
  }
  // DALL-E 模型
  else if (lowerName.includes("dall")) {
    // DALL-E 3 尺寸映射
    const sizeMap: Record<string, string> = {
      "16:9": "1792x1024",
      "9:16": "1024x1792",
      "1:1": "1024x1024",
      "4:3": "1024x768",
      "3:4": "768x1024",
    };
    body.size = sizeMap[config.aspectRatio] || "1024x1024";
    body.quality = config.size === "4K" ? "hd" : "standard";
  }
  // Midjourney 模型
  else if (lowerName.includes("midjourney")) {
    body.aspect_ratio = config.aspectRatio;
    if (imageBase64List.length > 0) {
      body.image = imageBase64List;
    }
  }
  // Stable Diffusion 模型
  else if (lowerName.includes("sd") || lowerName.includes("stable")) {
    body.aspect_ratio = config.aspectRatio;
    body.size = config.size;
    if (imageBase64List.length > 0) {
      body.image = imageBase64List;
    }
  }
  // Gemini 图像模型
  else if (lowerName.includes("gemini")) {
    body.aspect_ratio = config.aspectRatio;
    body.image_size = config.size;
    if (imageBase64List.length > 0) {
      body.image = imageBase64List;
    }
  }
  // 通用模型
  else {
    body.aspect_ratio = config.aspectRatio;
    if (imageBase64List.length > 0) {
      body.image = imageBase64List;
    }
  }

  logger(`[VectorEngine] 发送图像生成请求，尺寸: ${config.size}, 比例: ${config.aspectRatio}`);

  // 带重试的请求
  let lastError: Error | null = null;
  let responseData: any = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(`${baseUrl}/images/generations`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(body),
      });

      const responseText = await response.text();

      if (response.ok) {
        responseData = JSON.parse(responseText);
        break;
      }

      // 可重试状态码：429 / 5xx / 408
      if (isRetryableStatus(response.status)) {
        const waitMs = response.status === 429 ? 3000 : 1500 * attempt;
        logger(`[VectorEngine] 请求失败 (${response.status})，${attempt}/3 次重试，${waitMs}ms 后再试`);
        lastError = new Error(`图像生成失败，HTTP ${response.status}: ${responseText.slice(0, 200)}`);
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, waitMs));
          continue;
        }
      } else {
        // 4xx 非重试错误（除 429 外）
        throw new Error(`图像生成失败，HTTP ${response.status}: ${responseText.slice(0, 200)}`);
      }
    } catch (err) {
      // 网络/DNS 错误适合重试
      if (isNetworkError(err)) {
        logger(`[VectorEngine] 网络异常，${attempt}/3 次重试`);
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 1500 * attempt));
          continue;
        }
      } else {
        // 业务/代码异常不重试，直接抛出
        throw err;
      }
    }
  }

  if (!responseData) {
    throw lastError || new Error("图像生成失败，已达到最大重试次数");
  }

  // 提取图片 URL
  let imageUrl = "";
  const data = responseData.data;

  if (Array.isArray(data) && data.length > 0) {
    const first = data[0];
    // 优先取 b64_json（绕过 URL 转换）
    imageUrl = first.b64_json || first.url || first.image_url || first.output_url || "";
  }

  // 兜底：直接字段
  if (!imageUrl) {
    imageUrl =
      responseData.url ||
      responseData.image_url ||
      responseData.output_url ||
      responseData.result ||
      "";
  }

  if (!imageUrl) {
    const hint = JSON.stringify(responseData).slice(0, 200);
    throw new Error(`未能从响应中获取图片地址，响应: ${hint}`);
  }

  // base64 数据直接返回
  if (imageUrl.startsWith("data:image")) {
    return imageUrl;
  }

  // URL → base64 转换
  logger(`[VectorEngine] 转换图片 URL 为 base64`);
  try {
    return await urlToBase64(imageUrl);
  } catch (e) {
    throw new Error(`图片 URL 转换失败: ${imageUrl.slice(0, 100)}, error: ${String(e)}`);
  }
};

// ============================================================
// 视频生成（暂不支持）
// ============================================================

const videoRequest = async (config: VideoConfig, model: VideoModel): Promise<string> => {
  throw new Error("VectorEngine 图片供应商仅支持图片生成，不支持视频模型");
};

const ttsRequest = async (config: TTSConfig, model: TTSModel): Promise<string> => {
  throw new Error("VectorEngine 图片供应商仅支持图片生成，不支持语音合成");
};

const checkForUpdates = async (): Promise<{ hasUpdate: boolean; latestVersion: string; notice: string }> => {
  return { hasUpdate: false, latestVersion: "1.1", notice: "" };
};

const updateVendor = async (): Promise<string> => {
  return "";
};

// ============================================================
// 导出
// ============================================================

exports.vendor = vendor;
exports.textRequest = textRequest;
exports.imageRequest = imageRequest;
exports.videoRequest = videoRequest;
exports.ttsRequest = ttsRequest;
exports.checkForUpdates = checkForUpdates;
exports.updateVendor = updateVendor;

export { };
