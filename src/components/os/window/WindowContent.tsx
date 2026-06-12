import { Dispatch, FC, SetStateAction } from "react";
import { getAppDefinition } from "../../../apps/appRegistry";
import BrowserPane from "../../apps/BrowserPane";
import SettingsPane from "../../apps/SettingsPane";
import {
  DesktopSettings,
  ExplorerItem,
  ExplorerState,
  WindowInstance,
} from "../../../types";

type WindowContentProps = {
  window: WindowInstance;
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

const WindowContent: FC<WindowContentProps> = ({ window, ...services }) => {
  const app = getAppDefinition(window.appId);

  if (!app) {
    if (window.kind === "web" && window.url) {
      return <BrowserPane fixedTitle={window.title} fixedUrl={window.url} />;
    }

    return (
      <SettingsPane
        settings={services.settings}
        onSettingsChange={services.onSettingsChange}
        onResetPersistentSettings={services.onResetPersistentSettings}
      />
    );
  }

  return app.renderWindow({
    app,
    window,
    services,
  });
};

WindowContent.displayName = "WindowContent";

export default WindowContent;
