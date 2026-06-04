import { Dispatch, FC, SetStateAction } from "react";
import { DesktopSettings, ExplorerItem, ExplorerState } from "../types";
import ExplorerPane from "./ExplorerPane";
import SettingsPane from "./SettingsPane";
import TerminalPane from "./TerminalPane";

type WindowContentProps = {
  appId: string;
  settings: DesktopSettings;
  onSettingsChange: Dispatch<SetStateAction<DesktopSettings>>;
  explorer: ExplorerState;
  onExplorerNavigate: (path: string) => void;
  onExplorerBack: () => void;
  onExplorerForward: () => void;
  onExplorerUp: () => void;
  onExplorerSelect: (itemId: string | null) => void;
  onExplorerOpen: (item: ExplorerItem) => void;
};

const WindowContent: FC<WindowContentProps> = ({
  appId,
  settings,
  onSettingsChange,
  explorer,
  onExplorerNavigate,
  onExplorerBack,
  onExplorerForward,
  onExplorerUp,
  onExplorerSelect,
  onExplorerOpen,
}) => {
  if (appId === "terminal") {
    return <TerminalPane />;
  }

  if (appId === "files") {
    return (
      <ExplorerPane
        state={explorer}
        onNavigate={onExplorerNavigate}
        onBack={onExplorerBack}
        onForward={onExplorerForward}
        onUp={onExplorerUp}
        onSelect={onExplorerSelect}
        onOpen={onExplorerOpen}
      />
    );
  }

  return <SettingsPane settings={settings} onSettingsChange={onSettingsChange} />;
};

WindowContent.displayName = "WindowContent";

export default WindowContent;
