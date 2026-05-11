import * as fs from "fs";
import * as path from "path";
import getPath from "@/utils/getPath";

type LogLevel = "log" | "info" | "warn" | "error" | "debug";
type ConsoleMethod = (...args: unknown[]) => void;

const LOG_DIR = getPath("logs");
const LOG_FILE = path.join(LOG_DIR, "app.log");
const MAX_SIZE = 1000 * 1024 * 1024;
const LEVELS: LogLevel[] = ["log", "info", "warn", "error", "debug"];

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  metadata?: Record<string, unknown>;
}

class Logger {
  private stream: fs.WriteStream | null = null;
  private originalConsole: Partial<Record<LogLevel, ConsoleMethod>> = {};
  private originalStdoutWrite: typeof process.stdout.write | null = null;
  private originalStderrWrite: typeof process.stderr.write | null = null;
  private isHijacked = false;
  private buffer: LogEntry[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private readonly FLUSH_INTERVAL = 5000;
  private readonly MAX_BUFFER_SIZE = 100;

  init(): this {
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
    this.stream = fs.createWriteStream(LOG_FILE, { flags: "a" });
    this.startFlushTimer();
    this.hijack();
    return this;
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flushBuffer();
    }, this.FLUSH_INTERVAL);
  }

  private flushBuffer(): void {
    if (this.buffer.length === 0) return;
    const entries = this.buffer.splice(0, this.buffer.length);
    for (const entry of entries) {
      const line = JSON.stringify(entry) + "\n";
      if (this.stream && !this.stream.destroyed) {
        this.stream.write(line);
      }
    }
  }

  private formatTime(): string {
    const d = new Date();
    const p = (n: number, l = 2) => String(n).padStart(l, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}.${p(
      d.getMilliseconds(),
      3,
    )}`;
  }

  private stringify(arg: unknown): string {
    if (arg == null) return String(arg);
    if (arg instanceof Error) return `${arg.message}\n${arg.stack || ""}`;
    if (typeof arg === "object") {
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    }
    return String(arg);
  }

  private writing = false;

  private write(level: LogLevel, args: unknown[]): void {
    const entry: LogEntry = {
      timestamp: this.formatTime(),
      level,
      message: args.map((a) => this.stringify(a)).join(" "),
    };
    this.buffer.push(entry);
    if (this.buffer.length >= this.MAX_BUFFER_SIZE) {
      this.flushBuffer();
    }
    this.checkRotate();
  }

  private writeRaw(chunk: any): void {
    if (this.writing) return;
    this.writing = true;
    try {
      let str = typeof chunk === "string" ? chunk : chunk?.toString?.("utf-8") ?? "";
      str = str.replace(/\x1B\[\d*m/g, "");
      if (str.trim() && this.stream && !this.stream.destroyed) this.stream.write(str.endsWith("\n") ? str : str + "\n");
    } finally {
      this.writing = false;
    }
  }

  private checkRotate(): void {
    try {
      if (!fs.existsSync(LOG_FILE) || fs.statSync(LOG_FILE).size < MAX_SIZE) return;
      this.stream?.end();
      const content = fs.readFileSync(LOG_FILE, "utf-8");
      const half = content.slice(content.length >>> 1);
      const firstNewline = half.indexOf("\n");
      fs.writeFileSync(LOG_FILE, firstNewline >= 0 ? half.slice(firstNewline + 1) : half);
      this.stream = fs.createWriteStream(LOG_FILE, { flags: "a" });
    } catch {}
  }

  private hijack(): void {
    if (this.isHijacked) return;
    for (const level of LEVELS) {
      const original = console[level];
      if (typeof original !== "function") continue;
      this.originalConsole[level] = original.bind(console);
      (console as any)[level] = (...args: unknown[]) => {
        this.writing = true;
        try {
          this.write(level, args);
        } catch (err) {
          this.originalConsole.error?.("[Logger Error]", err);
        }
        this.writing = false;
        this.originalConsole[level]!(...args);
      };
    }

    this.originalStdoutWrite = process.stdout.write.bind(process.stdout);
    this.originalStderrWrite = process.stderr.write.bind(process.stderr);

    process.stdout.write = ((chunk: any, ...rest: any[]) => {
      this.writeRaw(chunk);
      return this.originalStdoutWrite!(chunk, ...rest);
    }) as typeof process.stdout.write;

    process.stderr.write = ((chunk: any, ...rest: any[]) => {
      this.writeRaw(chunk);
      return this.originalStderrWrite!(chunk, ...rest);
    }) as typeof process.stderr.write;

    this.isHijacked = true;
  }

  exportLogs(): string {
    if (!fs.existsSync(LOG_FILE)) return "";
    return fs.readFileSync(LOG_FILE, "utf-8");
  }

  exportLogsAsJson(): LogEntry[] {
    if (!fs.existsSync(LOG_FILE)) return [];
    const content = fs.readFileSync(LOG_FILE, "utf-8");
    return content.split("\n").filter(Boolean).map((line) => {
      try {
        return JSON.parse(line) as LogEntry;
      } catch {
        return null;
      }
    }).filter(Boolean) as LogEntry[];
  }

  clear(): void {
    this.flushBuffer();
    this.stream?.end();
    if (fs.existsSync(LOG_FILE)) fs.unlinkSync(LOG_FILE);
    this.stream = fs.createWriteStream(LOG_FILE, { flags: "a" });
  }

  close(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flushBuffer();
    if (this.isHijacked) {
      for (const level of LEVELS) {
        const original = this.originalConsole[level];
        if (original) (console as any)[level] = original;
      }
      this.originalConsole = {};
      if (this.originalStdoutWrite) process.stdout.write = this.originalStdoutWrite;
      if (this.originalStderrWrite) process.stderr.write = this.originalStderrWrite;
      this.originalStdoutWrite = null;
      this.originalStderrWrite = null;
      this.isHijacked = false;
    }
    this.stream?.end();
    this.stream = null;
  }
}

const logger = new Logger().init();
export default logger;
export { LogEntry };
export { LogLevel };