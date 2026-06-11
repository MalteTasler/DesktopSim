import { Dispatch, SetStateAction, useRef, useState } from "react";
import { WindowInstance } from "../../../types";

type UseWindowStackingOptions = {
  setWindows: Dispatch<SetStateAction<WindowInstance[]>>;
};

export function useWindowStacking({ setWindows }: UseWindowStackingOptions) {
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const zCounter = useRef(10);

  function nextZIndex() {
    return ++zCounter.current;
  }

  function focusWindow(windowId: string) {
    const zIndex = nextZIndex();
    setActiveWindow(windowId);
    setWindows((current) =>
      current.map((windowState) =>
        windowState.windowId === windowId ? { ...windowState, zIndex } : windowState,
      ),
    );
  }

  function resetStacking() {
    setActiveWindow(null);
    zCounter.current = 10;
  }

  return {
    activeWindow,
    focusWindow,
    nextZIndex,
    resetStacking,
    setActiveWindow,
  };
}
