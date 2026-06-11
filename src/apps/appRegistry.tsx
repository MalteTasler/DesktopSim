import { Dispatch, ReactNode, SetStateAction } from "react";
import BrowserPane from "../components/apps/BrowserPane";
import ExplorerPane from "../components/apps/ExplorerPane";
import SettingsPane from "../components/apps/SettingsPane";
import TerminalPane from "../components/apps/TerminalPane";
import {
  AppDefinition,
  DesktopAppIcon,
  DesktopSettings,
  ExplorerItem,
  ExplorerState,
  WebAppDefinition,
  WindowInstance,
} from "../types";

export type AppWindowServices = {
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

export type RegisteredApp = AppDefinition & {
  renderWindow: (props: {
    app: AppDefinition;
    window: WindowInstance;
    services: AppWindowServices;
  }) => ReactNode;
};

const webAppDefinitions: WebAppDefinition[] = [
  { title: "Example", icon: "browser", url: "https://example.com" },
  { title: "Tobit", icon: "shopping", url: "https://tobit.com?fullscreen=6" },
  { title: "You.Taxi", icon: "map", url: "https://you.taxi?fullscreen=6" },
  { title: "SuperApp", icon: "folder", url: "https://chayns.de?fullscreen=6" },
];

function createWebAppId(title: string, index: number) {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `web-${slug || index + 1}`;
}

function createWebAppDefinition(
  app: WebAppDefinition,
  index: number,
): RegisteredApp {
  const id = createWebAppId(app.title, index);

  return {
    ...app,
    id,
    kind: "web",
    defaultWindowSize: {
      width: 820,
      height: 560,
    },
    renderWindow: ({ app }) => (
      <BrowserPane fixedTitle={app.title} fixedUrl={app.url ?? ""} />
    ),
  };
}

function createNativeApp(
  app: Omit<RegisteredApp, "kind"> & {
    icon: DesktopAppIcon;
  },
): RegisteredApp {
  return {
    ...app,
    kind: "native",
  };
}

const nativeApps: RegisteredApp[] = [
  createNativeApp({
    id: "browser",
    title: "Browser",
    icon: "browser",
    defaultWindowSize: {
      width: 820,
      height: 560,
    },
    renderWindow: () => <BrowserPane />,
  }),
  createNativeApp({
    id: "files",
    title: "Explorer",
    icon: "folder",
    defaultWindowSize: {
      width: 520,
      height: 340,
    },
    renderWindow: ({ services }) => (
      <ExplorerPane
        state={services.explorer}
        onNavigate={services.onExplorerNavigate}
        onBack={services.onExplorerBack}
        onForward={services.onExplorerForward}
        onUp={services.onExplorerUp}
        onSelect={services.onExplorerSelect}
        onOpen={services.onExplorerOpen}
      />
    ),
  }),
  createNativeApp({
    id: "terminal",
    title: "Terminal",
    icon: "terminal",
    defaultWindowSize: {
      width: 640,
      height: 390,
    },
    renderWindow: () => <TerminalPane />,
  }),
  createNativeApp({
    id: "settings",
    title: "Settings",
    icon: "settings",
    defaultWindowSize: {
      width: 520,
      height: 340,
    },
    renderWindow: ({ services }) => (
      <SettingsPane
        settings={services.settings}
        onSettingsChange={services.onSettingsChange}
        onResetPersistentSettings={services.onResetPersistentSettings}
      />
    ),
  }),
];

export const apps: RegisteredApp[] = [
  ...nativeApps,
  ...webAppDefinitions.map(createWebAppDefinition),
];

export function getAppDefinition(appId: AppDefinition["id"]) {
  return apps.find((app) => app.id === appId) ?? null;
}
