import { Dispatch, FC, ReactNode, SetStateAction } from "react";
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

type AppRenderer = (props: WindowContentProps) => ReactNode;

const appRenderers: Record<string, AppRenderer> = {
  browser: () => <BrowserPane />,
  terminal: () => <TerminalPane />,
  files: ({
    explorer,
    onExplorerBack,
    onExplorerForward,
    onExplorerNavigate,
    onExplorerOpen,
    onExplorerSelect,
    onExplorerUp,
  }) => (
    <ExplorerPane
      state={explorer}
      onNavigate={onExplorerNavigate}
      onBack={onExplorerBack}
      onForward={onExplorerForward}
      onUp={onExplorerUp}
      onSelect={onExplorerSelect}
      onOpen={onExplorerOpen}
    />
  ),
  settings: ({ settings, onSettingsChange, onResetPersistentSettings }) => (
    <SettingsPane
      settings={settings}
      onSettingsChange={onSettingsChange}
      onResetPersistentSettings={onResetPersistentSettings}
    />
  ),
};

const WindowContent: FC<WindowContentProps> = ({
  app,
  ...props
}) => {
  if (app.kind === "web" && app.url) {
    return <BrowserPane fixedTitle={app.title} fixedUrl={app.url} />;
  }

  return appRenderers[app.id]?.({ app, ...props }) ?? appRenderers.settings({ app, ...props });
};

WindowContent.displayName = "WindowContent";

export default WindowContent;
