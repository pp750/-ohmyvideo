import { Request, Response, NextFunction } from "express";
import { z, ZodTypeAny } from "zod";

import { zhCN } from "zod/locales";

z.config(zhCN());

export type ValidationSource = "body" | "query" | "params";

export interface ValidationError {
  field: string;
  message: string;
}

export function validateFields(
  shape: Record<string, ZodTypeAny>,
  source: ValidationSource = "body",
) {
  const schema = z.object(shape);

  return (req: Request, res: Response, next: NextFunction) => {
    const data = req[source];
    const parseResult = schema.safeParse(data);
    if (!parseResult.success) {
      const errors: ValidationError[] = parseResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      console.error("[Validation Error]", errors);
      return res.status(400).json({ message: "参数错误", errors });
    }
    next();
  };
}

export function createValidator<T extends ZodTypeAny>(schema: T) {
  return (data: unknown) => schema.safeParse(data);
}