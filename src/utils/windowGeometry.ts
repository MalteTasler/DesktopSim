import { ResizeDirection, SimWindow } from "../types";
import { DESKTOP_TASKBAR_HEIGHT } from "./layoutDesktopIcons";

export const MIN_WINDOW_WIDTH = 340;
export const MIN_WINDOW_HEIGHT = 230;

const SNAP_THRESHOLD = 24;

export type WindowBounds = Pick<SimWindow, "x" | "y" | "width" | "height">;
export type WorkArea = ReturnType<typeof getWorkArea>;

export function getWorkArea() {
  return {
    width: globalThis.window.innerWidth,
    height: globalThis.window.innerHeight - DESKTOP_TASKBAR_HEIGHT,
  };
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

export function getSnapBounds(pointerX: number, pointerY: number): WindowBounds | null {
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

export function fitBoundsToWorkArea(bounds: WindowBounds, workArea: WorkArea): WindowBounds {
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

export function fitWindowToWorkArea(windowState: SimWindow, workArea: WorkArea): SimWindow {
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

export function getResizedBounds(
  bounds: WindowBounds,
  direction: ResizeDirection,
  deltaX: number,
  deltaY: number,
  workArea = getWorkArea(),
): WindowBounds {
  let nextX = bounds.x;
  let nextY = bounds.y;
  let nextWidth = bounds.width;
  let nextHeight = bounds.height;

  if (direction.includes("e")) {
    nextWidth = Math.min(
      Math.max(MIN_WINDOW_WIDTH, bounds.width + deltaX),
      workArea.width - bounds.x,
    );
  }

  if (direction.includes("s")) {
    nextHeight = Math.min(
      Math.max(MIN_WINDOW_HEIGHT, bounds.height + deltaY),
      workArea.height - bounds.y,
    );
  }

  if (direction.includes("w")) {
    const maxLeftMove = bounds.width - MIN_WINDOW_WIDTH;
    const clampedDeltaX = Math.min(Math.max(deltaX, -bounds.x), maxLeftMove);
    nextX = bounds.x + clampedDeltaX;
    nextWidth = bounds.width - clampedDeltaX;
  }

  if (direction.includes("n")) {
    const maxUpMove = bounds.height - MIN_WINDOW_HEIGHT;
    const clampedDeltaY = Math.min(Math.max(deltaY, -bounds.y), maxUpMove);
    nextY = bounds.y + clampedDeltaY;
    nextHeight = bounds.height - clampedDeltaY;
  }

  return { x: nextX, y: nextY, width: nextWidth, height: nextHeight };
}
