import {
  CSSProperties,
  MouseEvent,
  PointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { accentColors, fileSystem, initialIcons } from "../data";
import {
  ActionCenterState,
  ContextMenuState,
  DesktopApp,
  DesktopIcon,
  DesktopSettings,
  ExplorerItem,
  ExplorerState,
  SimWindow,
} from "../types";
import { formatTime } from "../utils/formatTime";

export function useDesktopController() {
  const [icons, setIcons] = useState(initialIcons);
  const [windows, setWindows] = useState<SimWindow[]>([]);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [startOpen, setStartOpen] = useState(false);
  const [actionCenterOpen, setActionCenterOpen] = useState(false);
  const [clock, setClock] = useState(() => new Date());
  const [settings, setSettings] = useState<DesktopSettings>({
    theme: "light",
    transparency: true,
    snapWindows: true,
    accentIntensity: 65,
    accentColor: accentColors[1],
  });
  const [explorer, setExplorer] = useState<ExplorerState>({
    path: "Desktop",
    history: [],
    future: [],
    selectedId: null,
  });
  const [actionCenter, setActionCenter] = useState<ActionCenterState>({
    wifi: true,
    bluetooth: false,
    batterySaver: false,
    focusAssist: false,
    volume: 62,
    brightness: 74,
  });
  const zCounter = useRef(10);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 30000);

    return () => window.clearInterval(timer);
  }, []);

  const visibleWindows = useMemo(
    () => windows.filter((windowState) => !windowState.minimized),
    [windows],
  );

  const desktopStyle = {
    "--accent-color": settings.accentColor,
    "--accent-soft": `${settings.accentColor}${Math.round(
      (settings.accentIntensity / 100) * 64 + 24,
    )
      .toString(16)
      .padStart(2, "0")}`,
    "--accent-strong": `${settings.accentColor}${Math.round(
      (settings.accentIntensity / 100) * 96 + 64,
    )
      .toString(16)
      .padStart(2, "0")}`,
  } as CSSProperties;

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
        width: app.id === "terminal" ? 640 : 520,
        height: app.id === "terminal" ? 390 : 340,
        zIndex,
        minimized: false,
        maximized: false,
      },
    ]);
    setActiveWindow(windowId);
    setContextMenu(null);
    setStartOpen(false);
    setActionCenterOpen(false);
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
          width: Math.max(320, globalThis.window.innerWidth - 16),
          height: Math.max(260, globalThis.window.innerHeight - 64),
          maximized: true,
        };
      }),
    );
    focusWindow(windowId);
  }

  function showDesktopMenu(event: MouseEvent) {
    event.preventDefault();
    setSelectedIcon(null);
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      items: ["View", "Sort by", "Refresh", "New folder", "Display settings"],
    });
  }

  function showIconMenu(event: MouseEvent, icon: DesktopIcon) {
    event.preventDefault();
    event.stopPropagation();
    setSelectedIcon(icon.id);
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      items: ["Open", "Pin to taskbar", "Rename", "Properties"],
    });
  }

  function dragIcon(event: PointerEvent<HTMLButtonElement>, iconId: string) {
    const target = event.currentTarget;
    const startX = event.clientX;
    const startY = event.clientY;
    const icon = icons.find((item) => item.id === iconId);

    if (!icon) {
      return;
    }

    const baseX = icon.x;
    const baseY = icon.y;

    target.setPointerCapture(event.pointerId);
    setSelectedIcon(iconId);
    setContextMenu(null);

    function onPointerMove(moveEvent: globalThis.PointerEvent) {
      const nextX = Math.min(
        Math.max(10, baseX + moveEvent.clientX - startX),
        window.innerWidth - 96,
      );
      const nextY = Math.min(
        Math.max(10, baseY + moveEvent.clientY - startY),
        window.innerHeight - 132,
      );

      setIcons((current) =>
        current.map((item) =>
          item.id === iconId ? { ...item, x: nextX, y: nextY } : item,
        ),
      );
    }

    function onPointerUp() {
      target.removeEventListener("pointermove", onPointerMove);
      target.removeEventListener("pointerup", onPointerUp);
    }

    target.addEventListener("pointermove", onPointerMove);
    target.addEventListener("pointerup", onPointerUp);
  }

  function dragWindow(event: PointerEvent<HTMLDivElement>, windowId: string) {
    const target = event.currentTarget;
    const startX = event.clientX;
    const startY = event.clientY;
    const windowState = windows.find((item) => item.windowId === windowId);

    if (!windowState || windowState.maximized) {
      return;
    }

    const baseX = windowState.x;
    const baseY = windowState.y;
    const baseWidth = windowState.width;

    target.setPointerCapture(event.pointerId);
    focusWindow(windowId);

    function onPointerMove(moveEvent: globalThis.PointerEvent) {
      let nextX = Math.min(
        Math.max(0, baseX + moveEvent.clientX - startX),
        window.innerWidth - 96,
      );
      let nextY = Math.min(
        Math.max(0, baseY + moveEvent.clientY - startY),
        window.innerHeight - 86,
      );

      if (settings.snapWindows) {
        if (nextX < 18) {
          nextX = 0;
        }

        if (nextY < 18) {
          nextY = 0;
        }

        if (window.innerWidth - (nextX + baseWidth) < 18) {
          nextX = Math.max(0, window.innerWidth - baseWidth);
        }
      }

      setWindows((current) =>
        current.map((item) =>
          item.windowId === windowId ? { ...item, x: nextX, y: nextY } : item,
        ),
      );
    }

    function onPointerUp() {
      target.removeEventListener("pointermove", onPointerMove);
      target.removeEventListener("pointerup", onPointerUp);
    }

    target.addEventListener("pointermove", onPointerMove);
    target.addEventListener("pointerup", onPointerUp);
  }

  function navigateExplorer(path: string) {
    setExplorer((current) => {
      if (path === current.path || !fileSystem[path]) {
        return current;
      }

      return {
        path,
        history: [...current.history, current.path],
        future: [],
        selectedId: null,
      };
    });
  }

  function goExplorerBack() {
    setExplorer((current) => {
      const previous = current.history.at(-1);

      if (!previous) {
        return current;
      }

      return {
        path: previous,
        history: current.history.slice(0, -1),
        future: [current.path, ...current.future],
        selectedId: null,
      };
    });
  }

  function goExplorerForward() {
    setExplorer((current) => {
      const next = current.future[0];

      if (!next) {
        return current;
      }

      return {
        path: next,
        history: [...current.history, current.path],
        future: current.future.slice(1),
        selectedId: null,
      };
    });
  }

  function goExplorerUp() {
    const parts = explorer.path.split("/");

    if (parts.length > 1) {
      navigateExplorer(parts.slice(0, -1).join("/"));
    }
  }

  function selectExplorerItem(itemId: string | null) {
    setExplorer((current) => ({ ...current, selectedId: itemId }));
  }

  function selectDesktopIcon(iconId: string) {
    setSelectedIcon(iconId);
  }

  function openExplorerItem(item: ExplorerItem) {
    if (item.path) {
      navigateExplorer(item.path);
      return;
    }

    selectExplorerItem(item.id);
  }

  return {
    actionCenter,
    actionCenterOpen,
    activeWindow,
    clock: formatTime(clock),
    contextMenu,
    desktopStyle,
    explorer,
    icons,
    selectedIcon,
    settings,
    startOpen,
    visibleWindows,
    windows,
    closeWindow,
    dragIcon,
    dragWindow,
    focusWindow,
    goExplorerBack,
    goExplorerForward,
    goExplorerUp,
    minimizeWindow,
    openApp,
    openExplorerItem,
    selectExplorerItem,
    setActionCenter,
    setActionCenterOpen,
    setContextMenu,
    setSettings,
    setStartOpen,
    selectDesktopIcon,
    showDesktopMenu,
    showIconMenu,
    toggleMaximize,
    navigateExplorer,
  };
}
