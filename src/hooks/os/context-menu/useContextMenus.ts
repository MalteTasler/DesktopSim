import { Dispatch, MouseEvent, SetStateAction, useState } from "react";
import { ContextMenuState, DesktopApp, SimWindow } from "../../../types";
import { getViewportSize } from "../../../utils/os/desktop/layoutDesktopIcons";
import { createAppContextMenu, createDesktopContextMenu } from "./contextMenuFactories";

type UseContextMenusOptions = {
  closeWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  openApp: (app: DesktopApp) => void;
  openDisplaySettings: () => void;
  pinnedShellApps: string[];
  setPinnedShellApps: Dispatch<SetStateAction<string[]>>;
  setSelectedIcon: (iconId: string | null) => void;
  sortDesktopIcons: (sortBy: "name" | "type") => void;
  toggleMaximize: (windowId: string) => void;
  windows: SimWindow[];
};

export function fitContextMenuToViewport(
  menu: ContextMenuState,
  viewport = getViewportSize(),
) {
  return {
    ...menu,
    x: Math.min(Math.max(menu.x, 0), viewport.width - 200),
    y: Math.min(Math.max(menu.y, 0), viewport.height - 220),
  };
}

export function useContextMenus({
  closeWindow,
  minimizeWindow,
  openApp,
  openDisplaySettings,
  pinnedShellApps,
  setPinnedShellApps,
  setSelectedIcon,
  sortDesktopIcons,
  toggleMaximize,
  windows,
}: UseContextMenusOptions) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  function toggleShellPin(appId: string) {
    setPinnedShellApps((current) =>
      current.includes(appId)
        ? current.filter((pinnedAppId) => pinnedAppId !== appId)
        : [...current, appId],
    );
  }

  function showAppMenu(
    event: MouseEvent,
    app: DesktopApp,
    options: { includeWindowActions?: boolean } = {},
  ) {
    event.preventDefault();
    event.stopPropagation();

    const appWindow = windows.find((windowState) => windowState.id === app.id);
    const isPinned = pinnedShellApps.includes(app.id);

    setSelectedIcon(app.id);
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      items: createAppContextMenu({
        app,
        appWindow,
        includeWindowActions: options.includeWindowActions,
        isPinned,
        onCloseWindow: closeWindow,
        onMinimizeWindow: minimizeWindow,
        onOpenApp: openApp,
        onToggleMaximize: toggleMaximize,
        onToggleShellPin: toggleShellPin,
      }),
    });
  }

  function showDesktopMenu(event: MouseEvent) {
    event.preventDefault();
    const target = event.target;

    if (
      !(target instanceof Element) ||
      target.closest(
        ".window, .desktop-icon, .desktop__shell, .start-menu, .action-center, .context-menu",
      )
    ) {
      return;
    }

    event.stopPropagation();
    setSelectedIcon(null);
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      items: createDesktopContextMenu({
        onOpenDisplaySettings: openDisplaySettings,
        onSortDesktopIcons: sortDesktopIcons,
      }),
    });
  }

  return {
    contextMenu,
    setContextMenu,
    showDesktopMenu,
    showIconMenu: (event: MouseEvent, icon: DesktopApp) => showAppMenu(event, icon),
    showShellAppMenu: (event: MouseEvent, app: DesktopApp) =>
      showAppMenu(event, app, { includeWindowActions: true }),
  };
}
