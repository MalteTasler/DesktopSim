import {
  CSSProperties,
  MouseEvent,
  PointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { accentColors, apps, fileSystem } from "../data";
import {
  ActionCenterState,
  ContextMenuState,
  DesktopApp,
  DesktopIcon,
  DesktopSettings,
  ExplorerItem,
  ExplorerState,
  ResizeDirection,
  SimWindow,
} from "../types";
import { formatTime } from "../utils/formatTime";
import {
  DESKTOP_TASKBAR_HEIGHT,
  getViewportSize,
  layoutDesktopIcons,
} from "../utils/layoutDesktopIcons";

const MIN_WINDOW_WIDTH = 340;
const MIN_WINDOW_HEIGHT = 230;
const SNAP_THRESHOLD = 24;

type WindowBounds = Pick<SimWindow, "x" | "y" | "width" | "height">;

type WorkArea = ReturnType<typeof getWorkArea>;

const initialSettings: DesktopSettings = {
  theme: "light",
  transparency: true,
  snapWindows: true,
  accentIntensity: 65,
  accentColor: accentColors[1],
};

const initialExplorer: ExplorerState = {
  path: "Desktop",
  history: [],
  future: [],
  selectedId: null,
};

const initialActionCenter: ActionCenterState = {
  wifi: true,
  bluetooth: false,
  batterySaver: false,
  focusAssist: false,
  volume: 62,
  brightness: 74,
};

function getWorkArea() {
  return {
    width: globalThis.window.innerWidth,
    height: globalThis.window.innerHeight - DESKTOP_TASKBAR_HEIGHT,
  };
}

function getSnapBounds(pointerX: number, pointerY: number): WindowBounds | null {
  const { width, height } = getWorkArea();
  const nearLeft = pointerX <= SNAP_THRESHOLD;
  const nearRight = width - pointerX <= SNAP_THRESHOLD;
  const nearTop = pointerY <= SNAP_THRESHOLD;
  const nearBottom = height - pointerY <= SNAP_THRESHOLD;
  const halfWidth = Math.max(MIN_WINDOW_WIDTH, width / 2);
  const halfHeight = Math.max(MIN_WINDOW_HEIGHT, height / 2);

  if (nearLeft && nearTop) {
    return { x: 0, y: 0, width: halfWidth, height: halfHeight };
  }

  if (nearRight && nearTop) {
    return { x: width - halfWidth, y: 0, width: halfWidth, height: halfHeight };
  }

  if (nearRight && nearBottom) {
    return {
      x: width - halfWidth,
      y: height - halfHeight,
      width: halfWidth,
      height: halfHeight,
    };
  }

  if (nearLeft && nearBottom) {
    return { x: 0, y: height - halfHeight, width: halfWidth, height: halfHeight };
  }

  if (nearLeft) {
    return { x: 0, y: 0, width: halfWidth, height };
  }

  if (nearRight) {
    return { x: width - halfWidth, y: 0, width: halfWidth, height };
  }

  if (nearTop) {
    return { x: 0, y: 0, width, height: halfHeight };
  }

  if (nearBottom) {
    return { x: 0, y: height - halfHeight, width, height: halfHeight };
  }

  return null;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function fitBoundsToWorkArea(bounds: WindowBounds, workArea: WorkArea): WindowBounds {
  const maxWidth = Math.max(MIN_WINDOW_WIDTH, workArea.width - 16);
  const maxHeight = Math.max(MIN_WINDOW_HEIGHT, workArea.height - 16);
  const width = Math.min(Math.max(MIN_WINDOW_WIDTH, bounds.width), maxWidth);
  const height = Math.min(Math.max(MIN_WINDOW_HEIGHT, bounds.height), maxHeight);

  return {
    x: clamp(bounds.x, 0, workArea.width - width),
    y: clamp(bounds.y, 0, workArea.height - height),
    width,
    height,
  };
}

function fitWindowToWorkArea(windowState: SimWindow, workArea: WorkArea): SimWindow {
  if (windowState.maximized) {
    return {
      ...windowState,
      x: 8,
      y: 8,
      width: Math.max(MIN_WINDOW_WIDTH, workArea.width - 16),
      height: Math.max(MIN_WINDOW_HEIGHT, workArea.height - 16),
    };
  }

  return {
    ...windowState,
    ...fitBoundsToWorkArea(windowState, workArea),
    previousBounds: windowState.previousBounds
      ? fitBoundsToWorkArea(windowState.previousBounds, workArea)
      : undefined,
  };
}

function fitContextMenuToViewport(menu: ContextMenuState, viewport = getViewportSize()) {
  return {
    ...menu,
    x: clamp(menu.x, 0, viewport.width - 200),
    y: clamp(menu.y, 0, viewport.height - 220),
  };
}

export function useDesktopController() {
  const [icons, setIcons] = useState(() => layoutDesktopIcons(apps));
  const [windows, setWindows] = useState<SimWindow[]>([]);
  const [pinnedTaskbarApps, setPinnedTaskbarApps] = useState<string[]>(() =>
    apps.map((app) => app.id),
  );
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [snapPreview, setSnapPreview] = useState<WindowBounds | null>(null);
  const [startOpen, setStartOpen] = useState(false);
  const [actionCenterOpen, setActionCenterOpen] = useState(false);
  const [clockFlyoutOpen, setClockFlyoutOpen] = useState(false);
  const [clock, setClock] = useState(() => new Date());
  const [settings, setSettings] = useState<DesktopSettings>(initialSettings);
  const [explorer, setExplorer] = useState<ExplorerState>(initialExplorer);
  const [actionCenter, setActionCenter] =
    useState<ActionCenterState>(initialActionCenter);
  const zCounter = useRef(10);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let animationFrame = 0;

    function onResize() {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        const viewport = getViewportSize();
        const workArea = getWorkArea();

        setIcons((current) => layoutDesktopIcons(current, viewport));
        setWindows((current) =>
          current.map((windowState) => fitWindowToWorkArea(windowState, workArea)),
        );
        setSnapPreview((current) =>
          current ? fitBoundsToWorkArea(current, workArea) : current,
        );
        setContextMenu((current) =>
          current ? fitContextMenuToViewport(current, viewport) : current,
        );
      });
    }

    window.addEventListener("resize", onResize);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const visibleWindows = useMemo(
    () => windows.filter((windowState) => !windowState.minimized),
    [windows],
  );
  const taskbarApps = useMemo(
    () =>
      apps.filter(
        (app) =>
          pinnedTaskbarApps.includes(app.id) ||
          windows.some((windowState) => windowState.id === app.id),
      ),
    [pinnedTaskbarApps, windows],
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
    setContextMenu(null);
    setStartOpen(false);
    setActionCenterOpen(false);
    setClockFlyoutOpen(false);
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

  function sortDesktopIcons(sortBy: "name" | "type") {
    setIcons((current) => {
      const sorted = [...current].sort((left, right) => {
        if (sortBy === "type") {
          const typeComparison = left.icon.localeCompare(right.icon);

          if (typeComparison !== 0) {
            return typeComparison;
          }
        }

        return left.title.localeCompare(right.title);
      });

      return layoutDesktopIcons(sorted, getViewportSize());
    });
    setSelectedIcon(null);
  }

  function openDisplaySettings() {
    const settingsApp = apps.find((app) => app.id === "settings");

    if (settingsApp) {
      openApp(settingsApp);
    }
  }

  function toggleTaskbarPin(appId: string) {
    setPinnedTaskbarApps((current) =>
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
    const isPinned = pinnedTaskbarApps.includes(app.id);

    setSelectedIcon(app.id);
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      items: [
        { label: "Open", onSelect: () => openApp(app) },
        {
          label: isPinned ? "Unpin from taskbar" : "Pin to taskbar",
          onSelect: () => toggleTaskbarPin(app.id),
        },
        ...(options.includeWindowActions && appWindow
          ? [
              {
                label: "Minimize",
                onSelect: () => minimizeWindow(appWindow.windowId),
              },
              {
                label: appWindow.maximized ? "Restore" : "Maximize",
                onSelect: () => toggleMaximize(appWindow.windowId),
              },
              {
                label: "Close",
                onSelect: () => closeWindow(appWindow.windowId),
              },
            ]
          : []),
      ],
    });
  }

  function showDesktopMenu(event: MouseEvent) {
    event.preventDefault();
    const target = event.target;

    if (
      !(target instanceof Element) ||
      target.closest(
        ".window, .desktop-icon, .desktop__taskbar, .start-menu, .action-center, .context-menu",
      )
    ) {
      return;
    }

    event.stopPropagation();
    setSelectedIcon(null);
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      items: [
        { label: "Sort by name", onSelect: () => sortDesktopIcons("name") },
        { label: "Sort by type", onSelect: () => sortDesktopIcons("type") },
        { label: "Display settings", onSelect: openDisplaySettings },
      ],
    });
  }

  function showIconMenu(event: MouseEvent, icon: DesktopApp) {
    showAppMenu(event, icon);
  }

  function showTaskbarAppMenu(event: MouseEvent, app: DesktopApp) {
    showAppMenu(event, app, { includeWindowActions: true });
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

    if (!windowState || (windowState.maximized && !windowState.previousBounds)) {
      return;
    }

    const baseX = windowState.x;
    const baseY = windowState.y;
    const restoreBounds = windowState.previousBounds;
    const dragWidth = restoreBounds?.width ?? windowState.width;
    const dragHeight = restoreBounds?.height ?? windowState.height;
    const pointerRatioX = restoreBounds
      ? Math.min(Math.max((startX - baseX) / windowState.width, 0.12), 0.88)
      : 0;
    const pointerOffsetY = restoreBounds
      ? Math.min(Math.max(startY - baseY, 8), 32)
      : 0;

    target.setPointerCapture(event.pointerId);
    focusWindow(windowId);

    function onPointerMove(moveEvent: globalThis.PointerEvent) {
      const previewBounds = settings.snapWindows
        ? getSnapBounds(moveEvent.clientX, moveEvent.clientY)
        : null;
      const nextX = Math.min(
        Math.max(
          0,
          restoreBounds
            ? moveEvent.clientX - dragWidth * pointerRatioX
            : baseX + moveEvent.clientX - startX,
        ),
        window.innerWidth - 96,
      );
      const nextY = Math.min(
        Math.max(
          0,
          restoreBounds
            ? moveEvent.clientY - pointerOffsetY
            : baseY + moveEvent.clientY - startY,
        ),
        getWorkArea().height - 38,
      );

      setSnapPreview(previewBounds);

      setWindows((current) =>
        current.map((item) =>
          item.windowId === windowId
            ? {
                ...item,
                x: nextX,
                y: nextY,
                width: dragWidth,
                height: dragHeight,
                previousBounds: undefined,
                maximized: false,
              }
            : item,
        ),
      );
    }

    function onPointerUp(upEvent: globalThis.PointerEvent) {
      const snapBounds = settings.snapWindows
        ? getSnapBounds(upEvent.clientX, upEvent.clientY)
        : null;

      if (snapBounds) {
        setWindows((current) =>
          current.map((item) =>
            item.windowId === windowId
              ? {
                  ...item,
                  ...snapBounds,
                  previousBounds: restoreBounds ?? {
                    x: baseX,
                    y: baseY,
                    width: dragWidth,
                    height: dragHeight,
                  },
                  maximized: false,
                }
              : item,
          ),
        );
      }

      setSnapPreview(null);
      target.removeEventListener("pointermove", onPointerMove);
      target.removeEventListener("pointerup", onPointerUp);
      target.removeEventListener("pointercancel", onPointerUp);
    }

    target.addEventListener("pointermove", onPointerMove);
    target.addEventListener("pointerup", onPointerUp);
    target.addEventListener("pointercancel", onPointerUp);
  }

  function resizeWindow(
    event: PointerEvent<HTMLDivElement>,
    windowId: string,
    direction: ResizeDirection,
  ) {
    event.stopPropagation();

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
    const baseHeight = windowState.height;

    target.setPointerCapture(event.pointerId);
    focusWindow(windowId);

    function onPointerMove(moveEvent: globalThis.PointerEvent) {
      const workArea = getWorkArea();
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      let nextX = baseX;
      let nextY = baseY;
      let nextWidth = baseWidth;
      let nextHeight = baseHeight;

      if (direction.includes("e")) {
        nextWidth = Math.min(
          Math.max(MIN_WINDOW_WIDTH, baseWidth + deltaX),
          workArea.width - baseX,
        );
      }

      if (direction.includes("s")) {
        nextHeight = Math.min(
          Math.max(MIN_WINDOW_HEIGHT, baseHeight + deltaY),
          workArea.height - baseY,
        );
      }

      if (direction.includes("w")) {
        const maxLeftMove = baseWidth - MIN_WINDOW_WIDTH;
        const clampedDeltaX = Math.min(Math.max(deltaX, -baseX), maxLeftMove);
        nextX = baseX + clampedDeltaX;
        nextWidth = baseWidth - clampedDeltaX;
      }

      if (direction.includes("n")) {
        const maxUpMove = baseHeight - MIN_WINDOW_HEIGHT;
        const clampedDeltaY = Math.min(Math.max(deltaY, -baseY), maxUpMove);
        nextY = baseY + clampedDeltaY;
        nextHeight = baseHeight - clampedDeltaY;
      }

      setWindows((current) =>
        current.map((item) =>
          item.windowId === windowId
            ? {
                ...item,
                x: nextX,
                y: nextY,
                width: nextWidth,
                height: nextHeight,
                previousBounds: undefined,
                maximized: false,
              }
            : item,
        ),
      );
    }

    function onPointerUp() {
      target.removeEventListener("pointermove", onPointerMove);
      target.removeEventListener("pointerup", onPointerUp);
      target.removeEventListener("pointercancel", onPointerUp);
    }

    target.addEventListener("pointermove", onPointerMove);
    target.addEventListener("pointerup", onPointerUp);
    target.addEventListener("pointercancel", onPointerUp);
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

  function resetDesktop() {
    setIcons(layoutDesktopIcons(apps));
    setWindows([]);
    setPinnedTaskbarApps(apps.map((app) => app.id));
    setContextMenu(null);
    setSelectedIcon(null);
    setActiveWindow(null);
    setSnapPreview(null);
    setStartOpen(false);
    setActionCenterOpen(false);
    setClockFlyoutOpen(false);
    setSettings(initialSettings);
    setExplorer(initialExplorer);
    setActionCenter(initialActionCenter);
    zCounter.current = 10;
  }

  return {
    actionCenter,
    actionCenterOpen,
    activeWindow,
    clock: formatTime(clock),
    clockDate: clock,
    clockFlyoutOpen,
    contextMenu,
    desktopStyle,
    explorer,
    icons,
    selectedIcon,
    settings,
    snapPreview,
    startOpen,
    taskbarApps,
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
    setClockFlyoutOpen,
    setContextMenu,
    setSettings,
    setSelectedIcon,
    setStartOpen,
    selectDesktopIcon,
    showDesktopMenu,
    showIconMenu,
    showTaskbarAppMenu,
    toggleMaximize,
    navigateExplorer,
    resizeWindow,
    resetDesktop,
  };
}
