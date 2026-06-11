import { AppDefinition, DesktopShortcut } from "../../../types";

export const DESKTOP_SHELL_HEIGHT = 48;

const ICON_START_X = 32;
const ICON_START_Y = 34;
const ICON_WIDTH = 86;
const ICON_HEIGHT = 78;
const ICON_ROW_STEP = 96;
const ICON_COLUMN_STEP = 104;
const ICON_BOTTOM_PADDING = 16;

type ViewportSize = {
  width: number;
  height: number;
};

const DEFAULT_VIEWPORT: ViewportSize = {
  width: 1280,
  height: 720,
};

export function getViewportSize(): ViewportSize {
  if (typeof globalThis.window === "undefined") {
    return DEFAULT_VIEWPORT;
  }

  return {
    width: globalThis.window.innerWidth,
    height: globalThis.window.innerHeight,
  };
}

export function layoutDesktopIcons(
  apps: Array<Pick<AppDefinition, "id" | "title" | "icon"> | DesktopShortcut>,
  viewport = getViewportSize(),
): DesktopShortcut[] {
  const desktopHeight = Math.max(ICON_HEIGHT, viewport.height - DESKTOP_SHELL_HEIGHT);
  const rows = Math.max(
    1,
    Math.floor(
      (desktopHeight - ICON_START_Y - ICON_HEIGHT - ICON_BOTTOM_PADDING) /
        ICON_ROW_STEP,
    ) + 1,
  );

  return apps.map((app, index) => {
    const column = Math.floor(index / rows);
    const row = index % rows;
    const appId = "appId" in app ? app.appId : app.id;

    return {
      shortcutId: "shortcutId" in app ? app.shortcutId : `shortcut-${app.id}`,
      appId,
      title: app.title,
      icon: app.icon,
      x: ICON_START_X + column * ICON_COLUMN_STEP,
      y: ICON_START_Y + row * ICON_ROW_STEP,
    };
  });
}
