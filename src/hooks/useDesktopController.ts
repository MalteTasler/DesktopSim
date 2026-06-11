import { useEffect, useMemo, useState } from "react";
import { apps } from "../data";
import { DesktopApp } from "../types";
import { formatTime } from "../utils/formatTime";
import { getViewportSize, layoutDesktopIcons } from "../utils/layoutDesktopIcons";
import { fitBoundsToWorkArea, getWorkArea } from "../utils/windowGeometry";
import { fitContextMenuToViewport, useContextMenus } from "./useContextMenus";
import { useDesktopIcons } from "./useDesktopIcons";
import { useExplorerState } from "./useExplorerState";
import { usePanels } from "./usePanels";
import { usePersistentDesktopState } from "./usePersistentDesktopState";
import { useWindowManager } from "./useWindowManager";

export function useDesktopController() {
  const [clock, setClock] = useState(() => new Date());
  const panels = usePanels();
  const persistent = usePersistentDesktopState();
  const icons = useDesktopIcons();
  const explorer = useExplorerState();
  const windows = useWindowManager({
    settings: persistent.settings,
    onNewWindowOpen: () => {
      panels.closePanels();
    },
  });
  const menus = useContextMenus({
    closeWindow: windows.closeWindow,
    minimizeWindow: windows.minimizeWindow,
    openApp: windows.openApp,
    openDisplaySettings,
    pinnedTaskbarApps: persistent.pinnedTaskbarApps,
    setPinnedTaskbarApps: persistent.setPinnedTaskbarApps,
    setSelectedIcon: icons.setSelectedIcon,
    sortDesktopIcons: icons.sortDesktopIcons,
    toggleMaximize: windows.toggleMaximize,
    windows: windows.windows,
  });

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      panels.closePanels();
      menus.setContextMenu(null);
      icons.setSelectedIcon(null);
    }

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [icons, panels]);

  useEffect(() => {
    let animationFrame = 0;

    function onResize() {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        const viewport = getViewportSize();
        const workArea = getWorkArea();

        icons.setIcons((current) => layoutDesktopIcons(current, viewport));
        windows.fitWindowsToWorkArea();
        windows.setSnapPreview((current) =>
          current ? fitBoundsToWorkArea(current, workArea) : current,
        );
        menus.setContextMenu((current) =>
          current ? fitContextMenuToViewport(current, viewport) : current,
        );
      });
    }

    window.addEventListener("resize", onResize);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", onResize);
    };
  }, [icons, windows]);

  const taskbarApps = useMemo(
    () =>
      apps.filter(
        (app) =>
          persistent.pinnedTaskbarApps.includes(app.id) ||
          windows.windows.some((windowState) => windowState.id === app.id),
      ),
    [persistent.pinnedTaskbarApps, windows.windows],
  );

  function openDisplaySettings() {
    const settingsApp = apps.find((app) => app.id === "settings");

    if (settingsApp) {
      windows.openApp(settingsApp);
    }
  }

  function resetDesktop() {
    icons.resetIcons();
    windows.resetWindows();
    menus.setContextMenu(null);
    panels.closePanels();
    explorer.setExplorer({
      path: "Desktop",
      history: [],
      future: [],
      selectedId: null,
    });
  }

  return {
    actionCenter: persistent.actionCenter,
    actionCenterOpen: panels.actionCenterOpen,
    activeWindow: windows.activeWindow,
    clock: formatTime(clock),
    clockDate: clock,
    clockFlyoutOpen: panels.clockFlyoutOpen,
    contextMenu: menus.contextMenu,
    desktopStyle: persistent.desktopStyle,
    explorer: explorer.explorer,
    icons: icons.icons,
    selectedIcon: icons.selectedIcon,
    settings: persistent.settings,
    snapPreview: windows.snapPreview,
    startOpen: panels.startOpen,
    taskbarApps,
    visibleWindows: windows.visibleWindows,
    windows: windows.windows,
    closeWindow: windows.closeWindow,
    dragIcon: (event: Parameters<typeof icons.dragIcon>[0], iconId: string) => {
      menus.setContextMenu(null);
      icons.dragIcon(event, iconId);
    },
    dragWindow: windows.dragWindow,
    focusWindow: windows.focusWindow,
    goExplorerBack: explorer.goExplorerBack,
    goExplorerForward: explorer.goExplorerForward,
    goExplorerUp: explorer.goExplorerUp,
    minimizeWindow: windows.minimizeWindow,
    openApp: windows.openApp,
    openExplorerItem: explorer.openExplorerItem,
    selectDesktopIcon: icons.selectDesktopIcon,
    selectExplorerItem: explorer.selectExplorerItem,
    setActionCenter: persistent.setActionCenter,
    setActionCenterOpen: panels.setActionCenterOpen,
    setClockFlyoutOpen: panels.setClockFlyoutOpen,
    setContextMenu: menus.setContextMenu,
    setSelectedIcon: icons.setSelectedIcon,
    setSettings: persistent.setSettings,
    setStartOpen: panels.setStartOpen,
    showDesktopMenu: menus.showDesktopMenu,
    showIconMenu: menus.showIconMenu,
    showTaskbarAppMenu: menus.showTaskbarAppMenu,
    toggleMaximize: windows.toggleMaximize,
    navigateExplorer: explorer.navigateExplorer,
    resizeWindow: windows.resizeWindow,
    resetDesktop,
    resetPersistentSettings: persistent.resetPersistentSettings,
  };
}
