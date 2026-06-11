import { Minus, Square, X } from "lucide-react";
import { Dispatch, FC, PointerEvent, SetStateAction } from "react";
import {
  DesktopSettings,
  ExplorerItem,
  ExplorerState,
  ResizeDirection,
  SimWindow,
} from "../../../types";
import { iconMap } from "../../../utils/os/desktop/iconMap";
import { UI_CATEGORY } from "../../../utils/os/ui/uiCategories";
import WindowContent from "./WindowContent";

type DesktopWindowProps = {
  window: SimWindow;
  isActive: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  onDrag: (event: PointerEvent<HTMLDivElement>) => void;
  onResize: (
    event: PointerEvent<HTMLDivElement>,
    direction: ResizeDirection,
  ) => void;
  settings: DesktopSettings;
  onSettingsChange: Dispatch<SetStateAction<DesktopSettings>>;
  onResetPersistentSettings: () => void;
  explorer: ExplorerState;
  onExplorerNavigate: (path: string) => void;
  onExplorerBack: () => void;
  onExplorerForward: () => void;
  onExplorerUp: () => void;
  onExplorerSelect: (itemId: string | null) => void;
  onExplorerOpen: (item: ExplorerItem) => void;
};

const DesktopWindow: FC<DesktopWindowProps> = ({
  window,
  isActive,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onDrag,
  onResize,
  settings,
  onSettingsChange,
  onResetPersistentSettings,
  explorer,
  onExplorerNavigate,
  onExplorerBack,
  onExplorerForward,
  onExplorerUp,
  onExplorerSelect,
  onExplorerOpen,
}) => {
  const Icon = iconMap[window.icon];
  const resizeDirections: ResizeDirection[] = [
    "n",
    "e",
    "s",
    "w",
    "ne",
    "se",
    "sw",
    "nw",
  ];

  return (
    <section
      className={`window ${isActive ? "window--active" : ""}`}
      data-ui-category={UI_CATEGORY.window}
      style={{
        left: window.x,
        top: window.y,
        width: window.width,
        height: window.height,
        zIndex: window.zIndex,
      }}
      onPointerDown={onFocus}
      onContextMenu={(event) => event.stopPropagation()}
      aria-label={window.title}
    >
      <div className="window__titlebar" onPointerDown={onDrag} onDoubleClick={onMaximize}>
        <div className="window__title">
          <Icon size={16} />
          <span>{window.title}</span>
        </div>
        <div
          className="window__actions"
          onPointerDown={(event) => event.stopPropagation()}
          onDoubleClick={(event) => event.stopPropagation()}
        >
          <button aria-label="Minimize" title="Minimize" onClick={onMinimize}>
            <Minus size={15} />
          </button>
          <button
            aria-label={window.maximized ? "Restore" : "Maximize"}
            title={window.maximized ? "Restore" : "Maximize"}
            onClick={onMaximize}
          >
            <Square size={13} />
          </button>
          <button aria-label="Close" title="Close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="window__body">
        <WindowContent
          app={window}
          settings={settings}
          onSettingsChange={onSettingsChange}
          onResetPersistentSettings={onResetPersistentSettings}
          explorer={explorer}
          onExplorerNavigate={onExplorerNavigate}
          onExplorerBack={onExplorerBack}
          onExplorerForward={onExplorerForward}
          onExplorerUp={onExplorerUp}
          onExplorerSelect={onExplorerSelect}
          onExplorerOpen={onExplorerOpen}
        />
      </div>
      {!window.maximized &&
        resizeDirections.map((direction) => (
          <div
            key={direction}
            className={`window__resize-handle window__resize-handle--${direction}`}
            onPointerDown={(event) => onResize(event, direction)}
            aria-hidden="true"
          />
        ))}
    </section>
  );
};

DesktopWindow.displayName = "DesktopWindow";

export default DesktopWindow;
