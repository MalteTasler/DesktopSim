import { FC, PointerEvent } from "react";
import { DesktopIcon } from "../../../types";
import { iconMap } from "../../../utils/os/desktop/iconMap";
import { UI_CATEGORY } from "../../../utils/os/ui/uiCategories";

type DesktopIconButtonProps = {
  icon: DesktopIcon;
  isSelected: boolean;
  onSelect: () => void;
  onOpen: () => void;
  onContextMenu: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onDrag: (event: PointerEvent<HTMLButtonElement>) => void;
};

const DesktopIconButton: FC<DesktopIconButtonProps> = ({
  icon,
  isSelected,
  onSelect,
  onOpen,
  onContextMenu,
  onDrag,
}) => {
  const Icon = iconMap[icon.icon];

  return (
    <button
      className={`desktop-icon ${isSelected ? "desktop-icon--selected" : ""}`}
      data-ui-category={UI_CATEGORY.desktopIcon}
      style={{ transform: `translate(${icon.x}px, ${icon.y}px)` }}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      onDoubleClick={onOpen}
      onContextMenu={onContextMenu}
      onPointerDown={onDrag}
    >
      <Icon size={34} aria-hidden="true" />
      <span>{icon.title}</span>
    </button>
  );
};

DesktopIconButton.displayName = "DesktopIconButton";

export default DesktopIconButton;
