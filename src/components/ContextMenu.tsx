import { FC } from "react";
import { ContextMenuState } from "../types";

type ContextMenuProps = {
  menu: ContextMenuState;
  onDismiss: () => void;
};

const ContextMenu: FC<ContextMenuProps> = ({ menu, onDismiss }) => (
  <div
    className="context-menu"
    style={{ left: menu.x, top: menu.y }}
    onClick={(event) => event.stopPropagation()}
  >
    {menu.items.map((item) => (
      <button key={item} onClick={onDismiss}>
        {item}
      </button>
    ))}
  </div>
);

ContextMenu.displayName = "ContextMenu";

export default ContextMenu;
