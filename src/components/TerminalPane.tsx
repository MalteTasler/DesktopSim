import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import {
  ROOT_PATH,
  TerminalLine,
  createLine,
  getPrompt,
  runCommand,
} from "../utils/terminalCommands";

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
