import { ContextMenuItem, DesktopApp, SimWindow } from "../../../types";

type AppMenuOptions = {
  app: DesktopApp;
  appWindow?: SimWindow;
  includeWindowActions?: boolean;
  isPinned: boolean;
  onCloseWindow: (windowId: string) => void;
  onMinimizeWindow: (windowId: string) => void;
  onOpenApp: (app: DesktopApp) => void;
  onToggleMaximize: (windowId: string) => void;
  onToggleShellPin: (appId: string) => void;
};

type DesktopMenuOptions = {
  onOpenDisplaySettings: () => void;
  onSortDesktopIcons: (sortBy: "name" | "type") => void;
};

export function createAppContextMenu({
  app,
  appWindow,
  includeWindowActions = false,
  isPinned,
  onCloseWindow,
  onMinimizeWindow,
  onOpenApp,
  onToggleMaximize,
  onToggleShellPin,
}: AppMenuOptions): ContextMenuItem[] {
  return [
    { label: "Open", onSelect: () => onOpenApp(app) },
    {
      label: isPinned ? "Unpin from taskbar" : "Pin to taskbar",
      onSelect: () => onToggleShellPin(app.id),
    },
    ...(includeWindowActions && appWindow
      ? [
          {
            label: "Minimize",
            onSelect: () => onMinimizeWindow(appWindow.windowId),
          },
          {
            label: appWindow.maximized ? "Restore" : "Maximize",
            onSelect: () => onToggleMaximize(appWindow.windowId),
          },
          {
            label: "Close",
            onSelect: () => onCloseWindow(appWindow.windowId),
          },
        ]
      : []),
  ];
}

export function createDesktopContextMenu({
  onOpenDisplaySettings,
  onSortDesktopIcons,
}: DesktopMenuOptions): ContextMenuItem[] {
  return [
    { label: "Sort by name", onSelect: () => onSortDesktopIcons("name") },
    { label: "Sort by type", onSelect: () => onSortDesktopIcons("type") },
    { label: "Display settings", onSelect: onOpenDisplaySettings },
  ];
}
