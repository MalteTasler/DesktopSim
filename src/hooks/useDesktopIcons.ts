import { PointerEvent, useState } from "react";
import { apps } from "../data";
import { DesktopApp } from "../types";
import { getViewportSize, layoutDesktopIcons } from "../utils/layoutDesktopIcons";

export function useDesktopIcons() {
  const [icons, setIcons] = useState(() => layoutDesktopIcons(apps));
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

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

  function resetIcons() {
    setIcons(layoutDesktopIcons(apps));
    setSelectedIcon(null);
  }

  function selectDesktopIcon(iconId: DesktopApp["id"]) {
    setSelectedIcon(iconId);
  }

  return {
    icons,
    selectedIcon,
    dragIcon,
    resetIcons,
    selectDesktopIcon,
    setIcons,
    setSelectedIcon,
    sortDesktopIcons,
  };
}
