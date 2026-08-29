type LogLevel = "debug" | "error" | "info" | "warn";

const enabledLevels: LogLevel[] = ["info", "warn", "error"];

function shouldLog(level: LogLevel) {
  if (import.meta.env.DEV) return true;
  return enabledLevels.includes(level);
}

function write(level: LogLevel, message: string, payload?: unknown) {
  if (!shouldLog(level)) return;

  const prefix = `[Peract:${level}] ${message}`;

  if (payload === undefined) {
    console[level](prefix);
    return;
  }

  console[level](prefix, payload);
}

export const logger = {
  debug(message: string, payload?: unknown) {
    write("debug", message, payload);
  },
  error(message: string, payload?: unknown) {
    write("error", message, payload);
  },
  info(message: string, payload?: unknown) {
    write("info", message, payload);
  },
  warn(message: string, payload?: unknown) {
    write("warn", message, payload);
  },
};