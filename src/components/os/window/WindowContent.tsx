import { Dispatch, FC, SetStateAction } from "react";
import { DesktopApp, DesktopSettings, ExplorerItem, ExplorerState } from "../../../types";
import BrowserPane from "../../apps/BrowserPane";
import ExplorerPane from "../../apps/ExplorerPane";
import SettingsPane from "../../apps/SettingsPane";
import TerminalPane from "../../apps/TerminalPane";

type WindowContentProps = {
  app: DesktopApp;
  settings: DesktopSettings;
  onSettingsChange: Dispatch<SetStateAction<DesktopSettings>>;
  onResetPersistentSettings: () => void;
  explorer: ExplorerState;
  onExplorerNavigate: (path: string) => void;
  onExplorerBack: () => void;
  onExplorerForward: () => void;
  onExplorerUp: () => void;
  onExplorerSelect: (itemId: string | null) => void;
  onExplorerOpen: (item: ExplorerItem) => void;
};

const WindowContent: FC<WindowContentProps> = ({
  app,
  settings,
  onSettingsChange,
  onResetPersistentSettings,
  explorer,
  onExplorerNavigate,
  onExplorerBack,
  onExplorerForward,
  onExplorerUp,
  onExplorerSelect,
  onExplorerOpen,
}) => {
  if (app.kind === "web" && app.url) {
    return <BrowserPane fixedTitle={app.title} fixedUrl={app.url} />;
  }

  if (app.id === "browser") {
    return <BrowserPane />;
  }

  if (app.id === "terminal") {
    return <TerminalPane />;
  }

  if (app.id === "files") {
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

  return (
    <SettingsPane
      settings={settings}
      onSettingsChange={onSettingsChange}
      onResetPersistentSettings={onResetPersistentSettings}
    />
  );
};

WindowContent.displayName = "WindowContent";

export default WindowContent;
