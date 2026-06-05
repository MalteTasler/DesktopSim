import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { fileSystem } from "../data";
import { ExplorerItem } from "../types";

type TerminalLine = {
  id: string;
  kind: "input" | "output";
  prompt?: string;
  text: string;
};

const ROOT_PATH = "Desktop";
const PROMPT_ROOT = "C:\\Users\\Guest";

const typeLabels: Record<ExplorerItem["type"], string> = {
  file: "FILE",
  folder: "DIR",
  image: "IMG",
  system: "SYS",
};

function createLine(kind: TerminalLine["kind"], text: string, prompt?: string): TerminalLine {
  return {
    id: crypto.randomUUID(),
    kind,
    prompt,
    text,
  };
}

function getPrompt(path: string) {
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

function runCommand(currentPath: string, command: string) {
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

const TerminalPane = () => {
  const [path, setPath] = useState(ROOT_PATH);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [lines, setLines] = useState<TerminalLine[]>([
    createLine("output", "Terminal"),
    createLine("output", "Connected to the DesktopSim virtual file system."),
    createLine("output", "Type help for available commands."),
    createLine("output", ""),
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function submitCommand(event: FormEvent) {
    event.preventDefault();

    const command = input.trim();
    const prompt = getPrompt(path);
    const result = runCommand(path, command);
    const nextLines = result.clear
      ? []
      : [
          ...lines,
          createLine("input", command, prompt),
          ...result.output.map((text) => createLine("output", text)),
        ];

    setLines(nextLines);
    setPath(result.nextPath);
    setInput("");
    setHistoryIndex(null);

    if (command) {
      setHistory((current) => [...current, command].slice(-50));
    }
  }

  function browseHistory(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") {
      return;
    }

    event.preventDefault();

    if (history.length === 0) {
      return;
    }

    const nextIndex =
      event.key === "ArrowUp"
        ? historyIndex === null
          ? history.length - 1
          : Math.max(0, historyIndex - 1)
        : historyIndex === null
          ? null
          : historyIndex + 1 >= history.length
            ? null
            : historyIndex + 1;

    setHistoryIndex(nextIndex);
    setInput(nextIndex === null ? "" : history[nextIndex]);
  }

  return (
    <div className="terminal-pane" onClick={() => inputRef.current?.focus()}>
      <div className="terminal-pane__scrollback" aria-live="polite">
        {lines.map((line) => (
          <p key={line.id}>
            {line.prompt && <span className="terminal-pane__prompt">{line.prompt}</span>}
            {line.text}
          </p>
        ))}
        <form className="terminal-pane__form" onSubmit={submitCommand}>
          <label className="terminal-pane__prompt" htmlFor="terminal-command">
            {getPrompt(path)}
          </label>
          <input
            ref={inputRef}
            id="terminal-command"
            value={input}
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={browseHistory}
          />
        </form>
        <div ref={endRef} />
      </div>
    </div>
  );
};

TerminalPane.displayName = "TerminalPane";

export default TerminalPane;
