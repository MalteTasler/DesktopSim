import { AppDefinition, WindowInstance } from "../../../types";
import {
  MIN_WINDOW_HEIGHT,
  MIN_WINDOW_WIDTH,
  fitWindowToWorkArea,
  getWorkArea,
} from "../../../utils/os/window/windowGeometry";

export function createWindowState(
  app: AppDefinition,
  offset: number,
  zIndex: number,
): WindowInstance {
  const defaultSize = app.defaultWindowSize ?? {
    width: 520,
    height: 340,
  };

  return {
    windowId: `${app.id}-${crypto.randomUUID()}`,
    appId: app.id,
    title: app.title,
    icon: app.icon,
    kind: app.kind,
    url: app.url,
    appState: app.createInitialState?.(),
    x: 190 + offset,
    y: 80 + offset,
    width: defaultSize.width,
    height: defaultSize.height,
    zIndex,
    minimized: false,
    maximized: false,
  };
}

export function restoreWindow(windows: WindowInstance[], windowId: string) {
  return windows.map((windowState) =>
    windowState.windowId === windowId
      ? { ...windowState, minimized: false }
      : windowState,
  );
}

export function minimizeWindowState(windows: WindowInstance[], windowId: string) {
  return windows.map((windowState) =>
    windowState.windowId === windowId
      ? { ...windowState, minimized: true }
      : windowState,
  );
}

export function toggleMaximizedWindow(windows: WindowInstance[], windowId: string) {
  return windows.map((item) => {
    if (item.windowId !== windowId) {
      return item;
    }

    if (item.maximized && item.previousBounds) {
      return {
        ...item,
        ...item.previousBounds,
        previousBounds: undefined,
        maximized: false,
      };
    }

    return {
      ...item,
      previousBounds: {
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
      },
      x: 8,
      y: 8,
      width: Math.max(MIN_WINDOW_WIDTH, globalThis.window.innerWidth - 16),
      height: Math.max(MIN_WINDOW_HEIGHT, globalThis.window.innerHeight - 64),
      maximized: true,
    };
  });
}

export function fitWindowStatesToWorkArea(windows: WindowInstance[]) {
  const workArea = getWorkArea();

  return windows.map((windowState) => fitWindowToWorkArea(windowState, workArea));
}
