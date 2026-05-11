import { transform } from "sucrase";
import fs from "fs";
import path from "path";
import u from "@/utils";

export function writeCode(id: string | number, tsCode: string): void {
  const rootDir = u.getPath("vendor");
  fs.mkdirSync(rootDir, { recursive: true });
  const targetPath = path.join(rootDir, `${id}.ts`);
  fs.writeFileSync(targetPath, tsCode, "utf-8");
}

export function getCode(id: string): string {
  const rootDir = u.getPath("vendor");
  const targetFile = path.join(rootDir, `${id}.ts`);
  if (!fs.existsSync(targetFile)) return "";
  return fs.readFileSync(targetFile, "utf-8");
}

export function deleteCode(id: string | number): boolean {
  const rootDir = u.getPath("vendor");
  const targetFile = path.join(rootDir, `${id}.ts`);
  if (!fs.existsSync(targetFile)) return false;
  fs.unlinkSync(targetFile);
  return true;
}

export async function getModelList(id: string): Promise<any[]> {
  const models = await u.db("o_vendorConfig").where("id", id).select("models").first();
  if (!models || !models.models) return [];
  const code = getCode(id);
  const jsCode = transform(code, { transforms: ["typescript"] }).code;
  const vendorData = u.vm(jsCode);
  if (!vendorData || !vendorData.vendor || !vendorData.vendor.models) return [];
  const combined = [...JSON.parse(JSON.stringify(vendorData.vendor.models)), ...JSON.parse(models?.models ?? "[]")];
  const map = new Map<string, any>();
  for (const m of combined) {
    map.set(m.modelName, m);
  }
  return [...map.values()];
}

export function getVendor(id: string) {
  const code = getCode(id);
  const jsCode = transform(code, { transforms: ["typescript"] }).code;
  const vendorData = u.vm(jsCode);
  return vendorData.vendor;
}

export function listVendors(): string[] {
  const rootDir = u.getPath("vendor");
  if (!fs.existsSync(rootDir)) return [];
  return fs.readdirSync(rootDir)
    .filter((f) => f.endsWith(".ts"))
    .map((f) => f.replace(/\.ts$/, ""));
}

export function cloneVendor(sourceId: string, targetId: string): boolean {
  const sourceCode = getCode(sourceId);
  if (!sourceCode) return false;
  writeCode(targetId, sourceCode);
  return true;
}