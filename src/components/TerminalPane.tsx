import { FC } from "react";

const TerminalPane: FC = () => (
  <div className="terminal-pane">
    <p>Windows PowerShell</p>
    <p>Copyright (C) Microsoft Corporation. All rights reserved.</p>
    <p />
    <p>
      <span className="terminal-pane__prompt">PS C:\Users\Guest&gt;</span> dir
    </p>
    <p>Desktop&nbsp;&nbsp;&nbsp;Documents&nbsp;&nbsp;&nbsp;Downloads</p>
    <p>
      <span className="terminal-pane__prompt">PS C:\Users\Guest&gt;</span>
      <span className="terminal-pane__caret" />
    </p>
  </div>
);

TerminalPane.displayName = "TerminalPane";

export default TerminalPane;
