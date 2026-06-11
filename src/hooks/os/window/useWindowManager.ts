import { useMemo, useRef, useState } from "react";
import { DesktopApp, DesktopSettings, SimWindow } from "../../../types";
import {
  createDragWindowHandler,
  createResizeWindowHandler,
} from "../../../utils/os/window/windowInteractions";
import {
  MIN_WINDOW_HEIGHT,
  MIN_WINDOW_WIDTH,
  WindowBounds,
  fitWindowToWorkArea,
  getWorkArea,
} from "../../../utils/os/window/windowGeometry";

type UseWindowManagerOptions = {
  settings: DesktopSettings;
  onNewWindowOpen: () => void;
};

export function useWindowManager({
  settings,
  onNewWindowOpen,
}: UseWindowManagerOptions) {
  const [windows, setWindows] = useState<SimWindow[]>([]);
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [snapPreview, setSnapPreview] = useState<WindowBounds | null>(null);
  const zCounter = useRef(10);

  const visibleWindows = useMemo(
    () => windows.filter((windowState) => !windowState.minimized),
    [windows],
  );

  function focusWindow(windowId: string) {
    const zIndex = ++zCounter.current;
    setActiveWindow(windowId);
    setWindows((current) =>
      current.map((windowState) =>
        windowState.windowId === windowId ? { ...windowState, zIndex } : windowState,
      ),
    );
  }

  function openApp(app: DesktopApp) {
    const existing = windows.find((windowState) => windowState.id === app.id);

    if (existing) {
      focusWindow(existing.windowId);
      setWindows((current) =>
        current.map((windowState) =>
          windowState.windowId === existing.windowId
            ? { ...windowState, minimized: false }
            : windowState,
        ),
      );
      return;
    }

    const offset = windows.length * 28;
    const windowId = `${app.id}-${crypto.randomUUID()}`;
    const zIndex = ++zCounter.current;

    setWindows((current) => [
      ...current,
      {
        ...app,
        windowId,
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
      },
    ]);
    setActiveWindow(windowId);
    onNewWindowOpen();
  }

  function closeWindow(windowId: string) {
    setWindows((current) =>
      current.filter((windowState) => windowState.windowId !== windowId),
    );
    setActiveWindow((current) => (current === windowId ? null : current));
  }

  function minimizeWindow(windowId: string) {
    setWindows((current) =>
      current.map((windowState) =>
        windowState.windowId === windowId
          ? { ...windowState, minimized: true }
          : windowState,
      ),
    );
  }

  function toggleMaximize(windowId: string) {
    setWindows((current) =>
      current.map((item) => {
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
      }),
    );
    focusWindow(windowId);
  }

  function fitWindowsToWorkArea() {
    const workArea = getWorkArea();

    setWindows((current) =>
      current.map((windowState) => fitWindowToWorkArea(windowState, workArea)),
    );
  }

  function resetWindows() {
    setWindows([]);
    setActiveWindow(null);
    setSnapPreview(null);
    zCounter.current = 10;
  }

  return {
    activeWindow,
    snapPreview,
    visibleWindows,
    windows,
    closeWindow,
    dragWindow: createDragWindowHandler({
      focusWindow,
      setSnapPreview,
      setWindows,
      settings,
      windows,
    }),
    fitWindowsToWorkArea,
    focusWindow,
    minimizeWindow,
    openApp,
    resizeWindow: createResizeWindowHandler({
      focusWindow,
      setSnapPreview,
      setWindows,
      settings,
      windows,
    }),
    resetWindows,
    setSnapPreview,
    toggleMaximize,
  };
}
