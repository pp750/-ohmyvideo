/**
 * ohmyvideo AI supplier - Suxi image models.
 * Supports Suxi's GPT Image and Gemini image generation/editing APIs.
 */

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
  | { type: "image"; base64: string; sourceType?: string }
  | { type: "audio"; base64: string; sourceType?: string }
  | { type: "video"; base64: string; sourceType?: string };

interface ImageConfig {
  prompt: string;
  referenceList?: Extract<ReferenceList, { type: "image" }>[];
  imageBase64?: string[];
  size: "1K" | "2K" | "4K";
  aspectRatio: `${number}:${number}`;
}

interface VideoConfig {
  duration: number;
  resolution: string;
  aspectRatio: "16:9" | "9:16";
  prompt: string;
  referenceList?: ReferenceList[];
  imageBase64?: string[];
  audio?: boolean;
  mode: VideoMode[];
}

interface TTSConfig {
  text: string;
  voice: string;
  speechRate: number;
  pitchRate: number;
  volume: number;
}

interface PollResult {
  completed: boolean;
  data?: string;
  error?: string;
}

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

const vendor: VendorConfig = {
  id: "suxi",
  version: "2.0",
  author: "ohmyvideo",
  name: "Suxi AI",
  description:
    "new.suxi.ai 图像模型中转，支持 GPT Image 2 与 Gemini 3 Pro Image。\n\n文档：[GPT Image 2](https://new-suxi-ai.apifox.cn/449021779e0) / [Gemini 图片生成](https://new-suxi-ai.apifox.cn/427881307e0)",
  inputs: [
    { key: "apiKey", label: "API密钥", type: "password", required: true, placeholder: "请输入 Suxi API Key" },
    { key: "baseUrl", label: "请求地址", type: "url", required: true, placeholder: "示例：https://new.suxi.ai" },
  ],
  inputValues: {
    apiKey: "",
    baseUrl: "",
  },
  models: [
    { name: "GPT Image 2", modelName: "gpt-image-2", type: "image", mode: ["text", "singleImage"], associationSkills: "文生图、单图编辑" },
    {
      name: "Gemini 3 Pro Image",
      modelName: "gemini-3-pro-image-preview",
      type: "image",
      mode: ["text", "singleImage", "multiReference"],
      associationSkills: "文生图、多图参考、图片编辑",
    },
  ],
};

const getBaseUrl = () => {
  if (!vendor.inputValues.baseUrl) throw new Error("缺少请求地址");
  return vendor.inputValues.baseUrl.replace(/\/+$/, "");
};

const getHeaders = () => {
  const apiKey = vendor.inputValues.apiKey.replace(/^Bearer\s+/i, "").trim();
  if (!apiKey) throw new Error("缺少API Key");
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
};

const ensureDataUrl = (value: string, mimeType = "image/png") => {
  if (value.startsWith("data:image/")) return value;
  return `data:${mimeType};base64,${value}`;
};

const stripDataUrl = (value: string) => value.replace(/^data:[^;]+;base64,/, "");

const inferMimeType = (value: string) => {
  const match = value.match(/^data:([^;]+);base64,/);
  return match?.[1] || "image/png";
};

const imageReferences = (config: ImageConfig) => {
  const refs = (config.referenceList ?? []).map((item) => item.base64);
  return Array.from(new Set([...refs, ...(config.imageBase64 ?? [])].filter(Boolean)));
};

const normalizeImageSize = (size: ImageConfig["size"]) => size.toLowerCase();

const extractImageFromOpenAI = async (data: any): Promise<string> => {
  const first = data?.data?.[0] ?? data?.image ?? data?.images?.[0] ?? data?.output?.[0];
  const b64 = first?.b64_json || first?.b64 || first?.base64 || data?.b64_json || data?.base64;
  if (typeof b64 === "string" && b64) return ensureDataUrl(b64);
  const url = first?.url || first?.image_url || data?.url || data?.image_url;
  if (typeof url === "string" && url) return await urlToBase64(url);
  throw new Error(`Suxi未返回可用图片: ${JSON.stringify(data)}`);
};

const extractImageFromGemini = async (data: any): Promise<string> => {
  const candidates = data?.candidates ?? [];
  for (const candidate of candidates) {
    const parts = candidate?.content?.parts ?? [];
    for (const part of parts) {
      const inline = part?.inlineData ?? part?.inline_data;
      const raw = inline?.data;
      if (typeof raw === "string" && raw) return ensureDataUrl(raw, inline?.mimeType || inline?.mime_type || "image/png");
      const fileUri = part?.fileData?.fileUri || part?.file_data?.file_uri;
      if (typeof fileUri === "string" && fileUri) return await urlToBase64(fileUri);
      const text = part?.text;
      const match = typeof text === "string" ? text.match(/!\[[^\]]*\]\((data:image\/[^)]+|https?:\/\/[^)\s]+)\)/) : null;
      if (match?.[1]) return match[1].startsWith("data:image/") ? match[1] : await urlToBase64(match[1]);
    }
  }
  throw new Error(`Suxi Gemini未返回可用图片: ${JSON.stringify(data)}`);
};

const requestJson = async (path: string, body: Record<string, any>) => {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  const text = await response.text();
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!response.ok) throw new Error(`Suxi请求失败，状态码: ${response.status}, 错误信息: ${text || response.statusText}`);
  return data;
};

const gptImageRequest = async (config: ImageConfig, model: ImageModel): Promise<string> => {
  const refs = imageReferences(config);
  const path = refs.length ? "/v1/images/edits" : "/v1/images/generations";
  const body: Record<string, any> = {
    model: model.modelName,
    prompt: config.prompt,
  };
  if (refs.length) body.image = refs.length === 1 ? ensureDataUrl(refs[0]) : refs.map((item) => ensureDataUrl(item));
  logger(`[Suxi] image request: ${model.modelName}, refs=${refs.length}`);
  return await extractImageFromOpenAI(await requestJson(path, body));
};

const geminiImageRequest = async (config: ImageConfig, model: ImageModel): Promise<string> => {
  const refs = imageReferences(config);
  const parts: any[] = refs.map((item) => ({
    inline_data: {
      mime_type: inferMimeType(item),
      data: stripDataUrl(item),
    },
  }));
  parts.push({ text: refs.length ? `${config.prompt}\n请直接输出图片，不要只返回文字描述。` : config.prompt });

  const body = {
    contents: [{ role: "user", parts }],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
      imageConfig: {
        aspectRatio: config.aspectRatio,
        imageSize: normalizeImageSize(config.size),
      },
    },
  };

  logger(`[Suxi] gemini image request: ${model.modelName}, refs=${refs.length}`);
  return await extractImageFromGemini(await requestJson(`/v1beta/models/${model.modelName}:generateContent`, body));
};

const textRequest = (model: TextModel, think: boolean, thinkLevel: 0 | 1 | 2 | 3) => {
  if (!vendor.inputValues.apiKey) throw new Error("Suxi供应商当前只配置图像模型");
  throw new Error("Suxi供应商当前只配置图像模型");
};

const imageRequest = async (config: ImageConfig, model: ImageModel): Promise<string> => {
  const name = model.modelName.toLowerCase();
  if (name.startsWith("gpt-image")) return await gptImageRequest(config, model);
  if (name.includes("gemini")) return await geminiImageRequest(config, model);
  throw new Error(`Suxi不支持的图像模型: ${model.modelName}`);
};

const videoRequest = async (config: VideoConfig, model: VideoModel): Promise<string> => {
  return "";
};

const ttsRequest = async (config: TTSConfig, model: TTSModel): Promise<string> => {
  return "";
};

const checkForUpdates = async (): Promise<{ hasUpdate: boolean; latestVersion: string; notice: string }> => {
  return { hasUpdate: false, latestVersion: "2.0", notice: "" };
};

const updateVendor = async (): Promise<string> => {
  return "";
};

exports.vendor = vendor;
exports.textRequest = textRequest;
exports.imageRequest = imageRequest;
exports.videoRequest = videoRequest;
exports.ttsRequest = ttsRequest;
exports.checkForUpdates = checkForUpdates;
exports.updateVendor = updateVendor;
export { };
