import isPathInside from "is-path-inside";
import getPath, { isEletron } from "@/utils/getPath";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// 规范化路径：去除前导斜杠，并将路径分隔符统一转换为系统分隔符
function normalizeUserPath(userPath: string): string {
  const trimmedPath = userPath.replace(/^[/\\]+/, "");
  return trimmedPath.split("/").join(path.sep);
}

// 校验路径
function resolveSafeLocalPath(userPath: string, rootDir: string): string {
  const safePath = normalizeUserPath(userPath);
  const absPath = path.join(rootDir, safePath);
  if (!isPathInside(absPath, rootDir)) {
    throw new Error(`${userPath} 不在 OSS 根目录内`);
  }
  return absPath;
}

interface FileMetadata {
  size: number;
  created: Date;
  modified: Date;
  isDirectory: boolean;
  mimeType?: string;
}

class OSS {
  private rootDir: string;
  private initPromise: Promise<void>;

  constructor() {
    this.rootDir = getPath("oss");
    this.initPromise = fs.mkdir(this.rootDir, { recursive: true }).then(() => {});
  }

  private async ensureInit() {
    await this.initPromise;
  }

  async getFileUrl(userRelPath: string, prefix?: string): Promise<string> {
    if (!prefix) prefix = "oss";
    await this.ensureInit();
    const safePath = normalizeUserPath(userRelPath);
    let url = `/${prefix}/`;
    if (process.env.ossURL && process.env.ossURL !== "") url = process.env.ossURL + `/${prefix}/`;
    if (process.env.NODE_ENV == "dev") url = `http://localhost:10588/${prefix}/`;
    if (isEletron()) url = `http://localhost:${process.env.PORT}/${prefix}/`;
    return `${url}${safePath.split(path.sep).join("/")}`;
  }

  async getFile(userRelPath: string): Promise<Buffer> {
    await this.ensureInit();
    return fs.readFile(resolveSafeLocalPath(userRelPath, this.rootDir));
  }

  async getImageBase64(userRelPath: string): Promise<string> {
    await this.ensureInit();
    const absPath = resolveSafeLocalPath(userRelPath, this.rootDir);
    const stat = await fs.stat(absPath);
    if (!stat.isFile()) {
      throw new Error(`${userRelPath} 不是文件`);
    }

    const ext = path.extname(userRelPath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".bmp": "image/bmp",
      ".svg": "image/svg+xml",
      ".ico": "image/x-icon",
      ".tiff": "image/tiff",
      ".tif": "image/tiff",
      ".mp4": "video/mp4",
      ".mp3": "audio/mpeg",
    };

    const mimeType = mimeTypes[ext];
    if (!mimeType) {
      throw new Error(`不支持的图片格式: ${ext}。支持的格式: ${Object.keys(mimeTypes).join(", ")}`);
    }

    const data = await fs.readFile(absPath);
    const base64 = data.toString("base64");
    return `data:${mimeType};base64,${base64}`;
  }

  async deleteFile(userRelPath: string): Promise<void> {
    await this.ensureInit();
    await fs.unlink(resolveSafeLocalPath(userRelPath, this.rootDir));
  }

  async deleteDirectory(userRelPath: string): Promise<void> {
    await this.ensureInit();
    const absPath = resolveSafeLocalPath(userRelPath, this.rootDir);
    const stat = await fs.stat(absPath);
    if (!stat.isDirectory()) {
      throw new Error(`${userRelPath} 不是文件夹`);
    }
    await fs.rm(absPath, { recursive: true, force: true });
  }

  async writeFile(userRelPath: string, data: Buffer | string): Promise<void> {
    await this.ensureInit();
    const absPath = resolveSafeLocalPath(userRelPath, this.rootDir);
    await fs.mkdir(path.dirname(absPath), { recursive: true });
    const buffer = typeof data === "string" ? Buffer.from(data.replace(/^data:[^;]+;base64,/, ""), "base64") : data;
    await fs.writeFile(absPath, buffer);
  }

  async fileExists(userRelPath: string): Promise<boolean> {
    await this.ensureInit();
    try {
      const stat = await fs.stat(resolveSafeLocalPath(userRelPath, this.rootDir));
      return stat.isFile();
    } catch {
      return false;
    }
  }

  async directoryExists(userRelPath: string): Promise<boolean> {
    await this.ensureInit();
    try {
      const stat = await fs.stat(resolveSafeLocalPath(userRelPath, this.rootDir));
      return stat.isDirectory();
    } catch {
      return false;
    }
  }

  async getSmallImageUrl(userRelPath: string): Promise<string> {
    const smallImageRelPath = `smallImage/${userRelPath.replace(/^[/\\]+/, "")}`;

    if (await this.fileExists(smallImageRelPath)) {
      return this.getFileUrl(smallImageRelPath);
    }

    const originalUrl = await this.getFileUrl(userRelPath);

    try {
      await this.ensureInit();
      const srcAbsPath = resolveSafeLocalPath(userRelPath, this.rootDir);
      const dstAbsPath = resolveSafeLocalPath(smallImageRelPath, this.rootDir);
      await fs.mkdir(path.dirname(dstAbsPath), { recursive: true });
      await sharp(srcAbsPath)
        .resize(512, 512, { fit: "inside", withoutEnlargement: true })
        .toFile(dstAbsPath);
      return this.getFileUrl(smallImageRelPath);
    } catch (e) {
      return originalUrl;
    }
  }

  async getMetadata(userRelPath: string): Promise<FileMetadata> {
    await this.ensureInit();
    const absPath = resolveSafeLocalPath(userRelPath, this.rootDir);
    const stat = await fs.stat(absPath);
    const ext = path.extname(userRelPath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".bmp": "image/bmp",
      ".svg": "image/svg+xml",
      ".mp4": "video/mp4",
      ".mp3": "audio/mpeg",
    };
    return {
      size: stat.size,
      created: stat.birthtime,
      modified: stat.mtime,
      isDirectory: stat.isDirectory(),
      mimeType: mimeTypes[ext],
    };
  }

  async copyFile(sourcePath: string, destPath: string): Promise<void> {
    await this.ensureInit();
    const srcAbsPath = resolveSafeLocalPath(sourcePath, this.rootDir);
    const dstAbsPath = resolveSafeLocalPath(destPath, this.rootDir);
    await fs.mkdir(path.dirname(dstAbsPath), { recursive: true });
    await fs.copyFile(srcAbsPath, dstAbsPath);
  }

  async moveFile(sourcePath: string, destPath: string): Promise<void> {
    await this.ensureInit();
    const srcAbsPath = resolveSafeLocalPath(sourcePath, this.rootDir);
    const dstAbsPath = resolveSafeLocalPath(destPath, this.rootDir);
    await fs.mkdir(path.dirname(dstAbsPath), { recursive: true });
    await fs.rename(srcAbsPath, dstAbsPath);
  }

  async listFiles(userRelPath: string, recursive = false): Promise<string[]> {
    await this.ensureInit();
    const absPath = resolveSafeLocalPath(userRelPath, this.rootDir);
    if (!(await this.directoryExists(userRelPath))) {
      return [];
    }
    const entries = await fs.readdir(absPath, { withFileTypes: true });
    const files: string[] = [];
    for (const entry of entries) {
      const fullPath = path.join(absPath, entry.name);
      if (entry.isDirectory()) {
        if (recursive) {
          const subFiles = await this.listFiles(path.join(userRelPath, entry.name), true);
          files.push(...subFiles.map(f => path.join(entry.name, f)));
        }
      } else {
        files.push(entry.name);
      }
    }
    return files;
  }
}

export default new OSS();
export { FileMetadata };