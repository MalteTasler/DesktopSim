import { ReactNode } from "react";

export type DesktopAppIcon =
  | "browser"
  | "calendar"
  | "chat"
  | "folder"
  | "mail"
  | "map"
  | "music"
  | "settings"
  | "shopping"
  | "terminal"
  | "video";

export type AppDefinition = {
  id: string;
  title: string;
  icon: DesktopAppIcon;
  kind: "native" | "web";
  url?: string;
  defaultWindowSize?: {
    width: number;
    height: number;
  };
  createInitialState?: () => unknown;
};

export type WebAppDefinition = {
  title: string;
  icon: DesktopAppIcon;
  url: string;
};

export type DesktopShortcut = {
  shortcutId: string;
  appId: AppDefinition["id"];
  title: string;
  icon: DesktopAppIcon;
  x: number;
  y: number;
};

export type WindowInstance = {
  windowId: string;
  appId: AppDefinition["id"];
  title: string;
  icon: DesktopAppIcon;
  kind: AppDefinition["kind"];
  url?: string;
  appState?: unknown;
  x: number;
  y: number;
  width: number;
  height: number;
  previousBounds?: Pick<WindowInstance, "x" | "y" | "width" | "height">;
  zIndex: number;
  minimized: boolean;
  maximized: boolean;
};

export type AppWindowRenderProps = {
  app: AppDefinition;
  window: WindowInstance;
};

export type AppWindowRenderer = (props: AppWindowRenderProps) => ReactNode;

export type ResizeDirection =
  | "n"
  | "e"
  | "s"
  | "w"
  | "ne"
  | "se"
  | "sw"
  | "nw";

export type ContextMenuItem = {
  label: string;
  onSelect?: () => void;
};

export type ContextMenuState = {
  x: number;
  y: number;
  items: ContextMenuItem[];
};

export type DesktopSettings = {
  theme: "light" | "dark";
  transparency: boolean;
  snapWindows: boolean;
  accentIntensity: number;
  accentColor: string;
};

export type ExplorerItem = {
  id: string;
  name: string;
  type: "folder" | "file" | "image" | "system";
  size?: string;
  modified: string;
  preview?: string;
  path?: string;
};

export type ExplorerState = {
  path: string;
  history: string[];
  future: string[];
  selectedId: string | null;
};

export type ActionCenterState = {
  wifi: boolean;
  bluetooth: boolean;
  batterySaver: boolean;
  focusAssist: boolean;
  volume: number;
  brightness: number;
};
