import { useMemo, useState } from "react";
import { AppDefinition, DesktopSettings, WindowInstance } from "../../../types";
import {
  createDragWindowHandler,
  createResizeWindowHandler,
} from "../../../utils/os/window/windowInteractions";
import { WindowBounds } from "../../../utils/os/window/windowGeometry";
import { useWindowStacking } from "./useWindowStacking";
import {
  createWindowState,
  fitWindowStatesToWorkArea,
  minimizeWindowState,
  restoreWindow,
  toggleMaximizedWindow,
} from "./windowState";

type UseWindowManagerOptions = {
  settings: DesktopSettings;
  onNewWindowOpen: () => void;
};

export function useWindowManager({
  settings,
  onNewWindowOpen,
}: UseWindowManagerOptions) {
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [snapPreview, setSnapPreview] = useState<WindowBounds | null>(null);
  const stacking = useWindowStacking({ setWindows });

  const visibleWindows = useMemo(
    () => windows.filter((windowState) => !windowState.minimized),
    [windows],
  );

  function openApp(app: AppDefinition) {
    const existing = windows.find((windowState) => windowState.appId === app.id);

    if (existing) {
      stacking.focusWindow(existing.windowId);
      setWindows((current) => restoreWindow(current, existing.windowId));
      return;
    }

    const offset = windows.length * 28;
    const zIndex = stacking.nextZIndex();
    const nextWindow = createWindowState(app, offset, zIndex);

    setWindows((current) => [...current, nextWindow]);
    stacking.setActiveWindow(nextWindow.windowId);
    onNewWindowOpen();
  }

  function openUrl(app: AppDefinition) {
    const existing = windows.find((windowState) => windowState.appId === app.id);

    if (existing) {
      stacking.focusWindow(existing.windowId);
      setWindows((current) =>
        restoreWindow(current, existing.windowId).map((windowState) =>
          windowState.windowId === existing.windowId
            ? { ...windowState, title: app.title, url: app.url }
            : windowState,
        ),
      );
      onNewWindowOpen();
      return;
    }

    openApp(app);
  }

  function closeWindow(windowId: string) {
    setWindows((current) =>
      current.filter((windowState) => windowState.windowId !== windowId),
    );
    stacking.setActiveWindow((current) => (current === windowId ? null : current));
  }

  function minimizeWindow(windowId: string) {
    setWindows((current) => minimizeWindowState(current, windowId));
  }

  function toggleMaximize(windowId: string) {
    setWindows((current) => toggleMaximizedWindow(current, windowId));
    stacking.focusWindow(windowId);
  }

  function fitWindowsToWorkArea() {
    setWindows(fitWindowStatesToWorkArea);
  }

  function resetWindows() {
    setWindows([]);
    setSnapPreview(null);
    stacking.resetStacking();
  }

  return {
    activeWindow: stacking.activeWindow,
    snapPreview,
    visibleWindows,
    windows,
    closeWindow,
    dragWindow: createDragWindowHandler({
      focusWindow: stacking.focusWindow,
      setSnapPreview,
      setWindows,
      settings,
      windows,
    }),
    fitWindowsToWorkArea,
    focusWindow: stacking.focusWindow,
    minimizeWindow,
    openApp,
    openUrl,
    resizeWindow: createResizeWindowHandler({
      focusWindow: stacking.focusWindow,
      setSnapPreview,
      setWindows,
      settings,
      windows,
    }),
    resetWindows,
    setSnapPreview,
    setWindows,
    toggleMaximize,
  };
}
