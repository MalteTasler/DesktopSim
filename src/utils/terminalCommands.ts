import { fileSystem } from "../data";
import { ExplorerItem } from "../types";

export type TerminalLine = {
  id: string;
  kind: "input" | "output";
  prompt?: string;
  text: string;
};

export const ROOT_PATH = "Desktop";
const PROMPT_ROOT = "C:\\Users\\Guest";

const typeLabels: Record<ExplorerItem["type"], string> = {
  file: "FILE",
  folder: "DIR",
  image: "IMG",
  system: "SYS",
};

export function createLine(
  kind: TerminalLine["kind"],
  text: string,
  prompt?: string,
): TerminalLine {
  return {
    id: crypto.randomUUID(),
    kind,
    prompt,
    text,
  };
}

export function getPrompt(path: string) {
  return `${PROMPT_ROOT}\\${path.replaceAll("/", "\\")}>`;
}

function tokenize(command: string) {
  return command.match(/"[^"]*"|\S+/g)?.map((part) => part.replace(/^"|"$/g, "")) ?? [];
}

function resolvePath(currentPath: string, target = ".") {
  const isRootTarget = target === "\\" || target === "/";
  const normalizedTarget = target
    .replace(/^C:\\Users\\Guest\\?/i, "")
    .replace(/^~\\?/i, "")
    .replaceAll("\\", "/")
    .replace(/^\/+/, "");

  if (isRootTarget) {
    return ROOT_PATH;
  }

  const parts = normalizedTarget.startsWith(ROOT_PATH)
    ? normalizedTarget.split("/")
    : [...currentPath.split("/"), ...normalizedTarget.split("/")];
  const resolved: string[] = [];

  for (const part of parts) {
    if (!part || part === ".") {
      continue;
    }

    if (part === "..") {
      resolved.pop();
      continue;
    }

    resolved.push(part);
  }

  if (resolved[0] !== ROOT_PATH) {
    resolved.unshift(ROOT_PATH);
  }

  return resolved.join("/");
}

function findItem(path: string) {
  const parentPath = path.split("/").slice(0, -1).join("/");
  const itemName = path.split("/").at(-1);

  return (fileSystem[parentPath] ?? []).find(
    (item) => item.name.toLocaleLowerCase() === itemName?.toLocaleLowerCase(),
  );
}

function getItems(path: string) {
  return fileSystem[path] ?? null;
}

function formatDirectory(path: string) {
  const items = getItems(path);

  if (!items) {
    return [`Path not found: ${path}`];
  }

  if (items.length === 0) {
    return ["This folder is empty."];
  }

  return items.map((item) => {
    const type = typeLabels[item.type].padEnd(4, " ");
    const size = (item.size ?? "-").padStart(8, " ");

    return `${type}  ${size}  ${item.modified.padEnd(14, " ")}  ${item.name}`;
  });
}

function formatTree(path: string, depth = 0): string[] {
  const items = getItems(path);

  if (!items) {
    return [`Path not found: ${path}`];
  }

  return items.flatMap((item) => {
    const line = `${"  ".repeat(depth)}${item.path ? "+--" : "|--"} ${item.name}`;

    if (!item.path) {
      return [line];
    }

    return [line, ...formatTree(item.path, depth + 1)];
  });
}

export function runCommand(currentPath: string, command: string) {
  const [rawCommand, ...args] = tokenize(command);
  const name = rawCommand?.toLocaleLowerCase() ?? "";

  if (!name) {
    return { nextPath: currentPath, output: [] };
  }

  if (name === "clear" || name === "cls") {
    return { nextPath: currentPath, output: [], clear: true };
  }

  if (name === "help") {
    return {
      nextPath: currentPath,
      output: [
        "Commands: dir, ls, cd, pwd, type, cat, tree, echo, clear, help",
        'Tip: paths support spaces when quoted, for example type "Design Notes".',
      ],
    };
  }

  if (name === "pwd") {
    return { nextPath: currentPath, output: [getPrompt(currentPath).slice(0, -1)] };
  }

  if (name === "dir" || name === "ls") {
    return {
      nextPath: currentPath,
      output: formatDirectory(resolvePath(currentPath, args[0])),
    };
  }

  if (name === "cd") {
    const nextPath = resolvePath(currentPath, args[0] ?? ROOT_PATH);

    if (getItems(nextPath)) {
      return { nextPath, output: [] };
    }

    const item = findItem(nextPath);

    return {
      nextPath: currentPath,
      output: [item ? `${item.name} is not a directory.` : `Path not found: ${nextPath}`],
    };
  }

  if (name === "type" || name === "cat") {
    const targetPath = resolvePath(currentPath, args.join(" "));
    const item = findItem(targetPath);

    if (!item) {
      return { nextPath: currentPath, output: [`File not found: ${args.join(" ")}`] };
    }

    if (item.path) {
      return { nextPath: currentPath, output: [`${item.name} is a directory.`] };
    }

    return { nextPath: currentPath, output: (item.preview ?? "").split("\n") };
  }

  if (name === "tree") {
    return {
      nextPath: currentPath,
      output: [resolvePath(currentPath, args[0]), ...formatTree(resolvePath(currentPath, args[0]))],
    };
  }

  if (name === "echo") {
    return { nextPath: currentPath, output: [args.join(" ")] };
  }

  return {
    nextPath: currentPath,
    output: [`Unknown command: ${rawCommand}. Type help for available commands.`],
  };
}
