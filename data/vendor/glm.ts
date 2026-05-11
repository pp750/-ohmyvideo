/**
 * ohmyvideo AI供应商 - GLM Coding Plan
 * @version 2.0
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

interface ImageConfig {
  prompt: string;
  imageBase64: string[];
  size: "1K" | "2K" | "4K";
  aspectRatio: `${number}:${number}`;
}

interface VideoConfig {
  duration: number;
  resolution: string;
  aspectRatio: "16:9" | "9:16";
  prompt: string;
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
  id: "glm",
  version: "2.0",
  author: "ohmyvideo",
  name: "GLM Coding Plan",
  description: "Z.AI / GLM Coding Plan 官方接口，面向代码与代理场景。\n\n官方文档：[Z.AI Coding API](https://docs.z.ai/api-reference/coding/chat-completions)",
  icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAOgSURBVHgB7Z3LcRpBEIYb2QcfCWGVARkIIhAZQAaQAUsE4AggAysDUAZkAI6Avfq0noaljGERjxn6MdNf1V/S6qLZ/ufRM10MDbhO06nr9ObUrp6bYFxi5bRx+nD6rH5/CAzyyGnrVJoe1swpgzvpgQU+pNZVTG9iBMDe4Fg1Agu+XBP6ghoZu3pwQgb7eUpD42MQrq+7TPJbZcAU9immQcMPpz9Oywb86/0GLYXT6wtYz+dit8FFA97B4OINDcjA4KKNa0AJBheFGcDMCxismAHMmAHMmAHMmAHMfAdPms3mTpwURbHTMZTt2mw24IPXyV6/3y+5abfbZ+1ar9clBbPZzPdkVLcBeZ6ftWk0GpUUoMlZlqVrAAbgtD0YECparZZv8EvVi3Cn0/nvGef8xWIBFIzHY1itVhAClSOgbuqZTCYlBXUjz0P6DHC9nK0d2+02xLyv14C6hQ+fqbKe4XAYMvi6DMCeX9f78O8UBEg5z+R9HM294XEpJ7j1ACj+Ny76vpuuOkqtokw5e73es95DXmBvFdW8P51On/kesoJ6qyh3u09+F1mBvUV49kNF4JRTvwGUKWfdZi95A+bzeUlB3WYveQMGg0FJQaBTzrgMwIDgMQAFT0w59RqgqMASnwHKCixxGaCtwBKVAe6MKbaUU5cBVCknwW5XnwGKCyz6DVBeYNFvgOYCi3oDIk85ZRsQSYFFrwGRFFh0GhBRgUWfAd1ut6RCyLwvx4AICyy6DIiwwKLHgEgLLDoMiLjAosOAiAss8g1IcLcrx4AECixyDUikwCLXgEQKLDINSKjAIs+AxAos8gxIrMAiywBLORkNSLTAIseARAssMgxIuMDCb0DiBZa75H1f0CkuIDCZTIACvK+h7mOjVB+drbun6BGCOspZYMHRQJXyIri5DBCzcMHnLLBQbvYOiDKAu8BCNfKOEWUAZ4GFauSdIsYAzt0u5cg7RYQB3AUW6nn/mBAGeF1Zxn1FGN6Ugmmvdh52j7PAgqOBmxAjwOu+IKre53Mx6zPu9wmJfX8AM3Z3NDNmADNmADNmADNmADNogP+BtvEwZgAvKzTgEwwufqMBSzC4+IU7YdzPr6ufBi2vhzXgJxjUzJ02hwfs/fg126WJRGuo+RbbvsCGxqoeXCAX1MhYlcMVcgGNTDb4B/qwn6e0vJh0bauY3kUG+5Va04tKDHwOX6T4DbhO5tR2eq9+b4FxiaLSEvYnDB9w5ajnLzy3z1aOtKIfAAAAAElFTkSuQmCC",
  inputs: [
    { key: "apiKey", label: "API密钥", type: "password", required: true, placeholder: "请输入 Z.AI API Key" },
    { key: "baseUrl", label: "请求地址", type: "url", required: true, placeholder: "示例：https://api.z.ai/api/coding/paas/v4" },
  ],
  inputValues: {
    apiKey: "",
    baseUrl: "",
  },
  models: [
    { name: "GLM-5.1", modelName: "GLM-5.1", type: "text", think: true },
    { name: "GLM-5", modelName: "GLM-5", type: "text", think: true },
    { name: "GLM-5-Turbo", modelName: "GLM-5-Turbo", type: "text", think: true },
    { name: "GLM-4.7", modelName: "GLM-4.7", type: "text", think: true },
    { name: "GLM-4.5-Air", modelName: "GLM-4.5-Air", type: "text", think: true },
  ],
};

// ============================================================
// 适配器函数
// ============================================================

const getBaseUrl = () => {
  if (!vendor.inputValues.baseUrl) throw new Error("缺少请求地址");
  return vendor.inputValues.baseUrl.replace(/\/+$/, "");
};

const textRequest = (model: TextModel, think: boolean, thinkLevel: 0 | 1 | 2 | 3) => {
  if (!vendor.inputValues.apiKey) throw new Error("缺少API Key");
  const apiKey = vendor.inputValues.apiKey.replace(/^Bearer\s+/i, "");
  return createOpenAICompatible({
    name: "glm-coding",
    baseURL: getBaseUrl(),
    apiKey,
    fetch: async (url: string, options?: RequestInit) => {
      const rawBody = JSON.parse((options?.body as string) ?? "{}");
      const modifiedBody = {
        ...rawBody,
        thinking: think ? { type: "enabled", clear_thinking: true } : { type: "disabled" },
      };
      return await fetch(url, {
        ...options,
        body: JSON.stringify(modifiedBody),
      });
    },
  }).chatModel(model.modelName);
};

const imageRequest = async (config: ImageConfig, model: ImageModel): Promise<string> => {
  return "";
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
