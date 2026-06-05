export type DesktopApp = {
  id: string;
  title: string;
  icon: "folder" | "terminal" | "settings";
};

export type DesktopIcon = DesktopApp & {
  x: number;
  y: number;
};

export type SimWindow = DesktopApp & {
  windowId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  previousBounds?: Pick<SimWindow, "x" | "y" | "width" | "height">;
  zIndex: number;
  minimized: boolean;
  maximized: boolean;
};

export type ResizeDirection =
  | "n"
  | "e"
  | "s"
  | "w"
  | "ne"
  | "se"
  | "sw"
  | "nw";

export type ContextMenuState = {
  x: number;
  y: number;
  items: string[];
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
