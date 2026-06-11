import { CSSProperties, FC, useLayoutEffect, useRef, useState } from "react";
import { ContextMenuState } from "../../../types";
import { UI_CATEGORY } from "../../../utils/os/ui/uiCategories";

type ContextMenuProps = {
  menu: ContextMenuState;
  onDismiss: () => void;
};

const VIEWPORT_GAP = 8;

const ContextMenu: FC<ContextMenuProps> = ({ menu, onDismiss }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: menu.x, y: menu.y });

  useLayoutEffect(() => {
    const menuElement = menuRef.current;

    if (!menuElement) {
      return;
    }

    const rect = menuElement.getBoundingClientRect();
    const nextX = Math.min(
      Math.max(VIEWPORT_GAP, menu.x),
      window.innerWidth - rect.width - VIEWPORT_GAP,
    );
    const nextY = Math.min(
      Math.max(VIEWPORT_GAP, menu.y),
      window.innerHeight - rect.height - VIEWPORT_GAP,
    );

    setPosition({ x: nextX, y: nextY });
  }, [menu.x, menu.y, menu.items.length]);

  return (
    <div
      ref={menuRef}
      className="context-menu"
      data-ui-category={UI_CATEGORY.contextMenu}
      style={{ left: position.x, top: position.y } as CSSProperties}
      onClick={(event) => event.stopPropagation()}
      onContextMenu={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      {menu.items.map((item) => (
        <button
          key={item.label}
          onClick={() => {
            item.onSelect?.();
            onDismiss();
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

ContextMenu.displayName = "ContextMenu";

export default ContextMenu;
