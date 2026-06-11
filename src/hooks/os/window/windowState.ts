import { DesktopApp, SimWindow } from "../../../types";
import {
  MIN_WINDOW_HEIGHT,
  MIN_WINDOW_WIDTH,
  fitWindowToWorkArea,
  getWorkArea,
} from "../../../utils/os/window/windowGeometry";

export function createWindowState(app: DesktopApp, offset: number, zIndex: number): SimWindow {
  return {
    ...app,
    windowId: `${app.id}-${crypto.randomUUID()}`,
    x: 190 + offset,
    y: 80 + offset,
    width:
      app.kind === "web" || app.id === "browser"
        ? 820
        : app.id === "terminal"
          ? 640
          : 520,
    height:
      app.kind === "web" || app.id === "browser"
        ? 560
        : app.id === "terminal"
          ? 390
          : 340,
    zIndex,
    minimized: false,
    maximized: false,
  };
}

export function restoreWindow(windows: SimWindow[], windowId: string) {
  return windows.map((windowState) =>
    windowState.windowId === windowId
      ? { ...windowState, minimized: false }
      : windowState,
  );
}

export function minimizeWindowState(windows: SimWindow[], windowId: string) {
  return windows.map((windowState) =>
    windowState.windowId === windowId
      ? { ...windowState, minimized: true }
      : windowState,
  );
}

export function toggleMaximizedWindow(windows: SimWindow[], windowId: string) {
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

export function fitWindowStatesToWorkArea(windows: SimWindow[]) {
  const workArea = getWorkArea();

  return windows.map((windowState) => fitWindowToWorkArea(windowState, workArea));
}
