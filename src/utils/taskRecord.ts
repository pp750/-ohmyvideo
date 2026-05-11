import db from "@/utils/db";

const taskStateMap: Record<string, string> = {
  "0": "进行中",
  "1": "已完成",
  "-1": "生成失败",
};

export type TaskState = 0 | 1 | -1;
export type TaskStateString = "进行中" | "已完成" | "生成失败";

export interface TaskRecordOptions {
  describe?: string;
  content?: any;
}

export interface TaskRecordResult {
  id: number;
  done: (state: TaskState, reason?: string) => Promise<void>;
  update: (data: Partial<{ describe: string; content: any; state: TaskState }>) => Promise<void>;
}

/**
 * 记录任务并返回结束函数
 * @param projectId  项目 ID
 * @param taskClass  任务分类
 * @param modelName   模型名称
 * @param opts       可选项：关联对象、任务描述
 */
export default async function taskRecord(
  projectId: number,
  taskClass: string,
  modelName: string,
  opts: TaskRecordOptions = {},
): Promise<TaskRecordResult> {
  const { content, describe = "" } = opts;

  let operatorContent: string | undefined;
  if (content === undefined || content === null) {
    operatorContent = undefined;
  } else if (typeof content === "string") {
    operatorContent = content;
  } else if (typeof content === "function") {
    throw new Error("不支持的类型");
  } else {
    try {
      operatorContent = JSON.stringify(content);
    } catch (e) {
      operatorContent = content.toString();
    }
  }

  const [id] = await db("o_tasks").insert({
    projectId,
    taskClass,
    relatedObjects: operatorContent,
    model: modelName,
    describe,
    state: taskStateMap["0"],
    startTime: Date.now(),
  });

  return {
    id,
    done: async (state: TaskState, reason?: string) => {
      await db("o_tasks")
        .where("id", id)
        .update({
          state: taskStateMap[String(state)],
          reason: state === -1 ? (reason ?? "") : null,
        });
    },
    update: async (data: Partial<{ describe: string; content: any; state: TaskState }>) => {
      const updateData: Record<string, any> = {};
      if (data.describe !== undefined) updateData.describe = data.describe;
      if (data.state !== undefined) updateData.state = taskStateMap[String(data.state)];
      if (data.content !== undefined) {
        try {
          updateData.relatedObjects = JSON.stringify(data.content);
        } catch {
          updateData.relatedObjects = String(data.content);
        }
      }
      await db("o_tasks").where("id", id).update(updateData);
    },
  };
}

export async function getTaskRecord(id: number) {
  return db("o_tasks").where("id", id).first();
}

export async function listTaskRecords(projectId: number, taskClass?: string): Promise<any[]> {
  let query = db("o_tasks").where("projectId", projectId);
  if (taskClass) {
    query = query.where("taskClass", taskClass);
  }
  return query.orderBy("startTime", "desc");
}