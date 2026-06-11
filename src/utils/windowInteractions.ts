import { Dispatch, PointerEvent, SetStateAction } from "react";
import { DesktopSettings, ResizeDirection, SimWindow } from "../types";
import {
  WindowBounds,
  getResizedBounds,
  getSnapBounds,
  getWorkArea,
} from "./windowGeometry";

type SetWindows = Dispatch<SetStateAction<SimWindow[]>>;
type SetSnapPreview = Dispatch<SetStateAction<WindowBounds | null>>;

type WindowInteractionOptions = {
  focusWindow: (windowId: string) => void;
  setSnapPreview: SetSnapPreview;
  setWindows: SetWindows;
  settings: DesktopSettings;
  windows: SimWindow[];
};

export function createDragWindowHandler({
  focusWindow,
  setSnapPreview,
  setWindows,
  settings,
  windows,
}: WindowInteractionOptions) {
  return function dragWindow(event: PointerEvent<HTMLDivElement>, windowId: string) {
    const target = event.currentTarget;
    const startX = event.clientX;
    const startY = event.clientY;
    const windowState = windows.find((item) => item.windowId === windowId);

    if (!windowState || (windowState.maximized && !windowState.previousBounds)) {
      return;
    }

    const baseBounds = {
      x: windowState.x,
      y: windowState.y,
      width: windowState.width,
      height: windowState.height,
    };
    const restoreBounds = windowState.previousBounds;
    const dragWidth = restoreBounds?.width ?? windowState.width;
    const dragHeight = restoreBounds?.height ?? windowState.height;
    const pointerRatioX = restoreBounds
      ? Math.min(Math.max((startX - baseBounds.x) / windowState.width, 0.12), 0.88)
      : 0;
    const pointerOffsetY = restoreBounds
      ? Math.min(Math.max(startY - baseBounds.y, 8), 32)
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
            : baseBounds.x + moveEvent.clientX - startX,
        ),
        window.innerWidth - 96,
      );
      const nextY = Math.min(
        Math.max(
          0,
          restoreBounds
            ? moveEvent.clientY - pointerOffsetY
            : baseBounds.y + moveEvent.clientY - startY,
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
                  previousBounds: restoreBounds ?? baseBounds,
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
  };
}

export function createResizeWindowHandler({
  focusWindow,
  setWindows,
  windows,
}: WindowInteractionOptions) {
  return function resizeWindow(
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

    const baseBounds = {
      x: windowState.x,
      y: windowState.y,
      width: windowState.width,
      height: windowState.height,
    };

    target.setPointerCapture(event.pointerId);
    focusWindow(windowId);

    function onPointerMove(moveEvent: globalThis.PointerEvent) {
      const nextBounds = getResizedBounds(
        baseBounds,
        direction,
        moveEvent.clientX - startX,
        moveEvent.clientY - startY,
      );

      setWindows((current) =>
        current.map((item) =>
          item.windowId === windowId
            ? {
                ...item,
                ...nextBounds,
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
  };
}
