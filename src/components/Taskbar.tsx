import { Battery, Monitor, Search, Volume2, Wifi } from "lucide-react";
import { FC, MouseEvent, ReactNode } from "react";
import { DesktopApp, SimWindow } from "../types";
import { iconMap } from "../utils/iconMap";

type TaskbarProps = {
  apps: DesktopApp[];
  windows: SimWindow[];
  time: string;
  startOpen: boolean;
  actionCenterOpen: boolean;
  clockFlyoutOpen: boolean;
  children: ReactNode;
  onOpenApp: (app: DesktopApp) => void;
  onAppContextMenu: (event: MouseEvent<HTMLButtonElement>, app: DesktopApp) => void;
  onStartToggle: (event: MouseEvent<HTMLButtonElement>) => void;
  onActionCenterToggle: (event: MouseEvent<HTMLButtonElement>) => void;
  onClockToggle: (event: MouseEvent<HTMLButtonElement>) => void;
};

const Taskbar: FC<TaskbarProps> = ({
  apps,
  windows,
  time,
  startOpen,
  actionCenterOpen,
  clockFlyoutOpen,
  children,
  onOpenApp,
  onAppContextMenu,
  onStartToggle,
  onActionCenterToggle,
  onClockToggle,
}) => (
  <>
    <button
      className="taskbar__start-button"
      aria-label={startOpen ? "Close Start" : "Open Start"}
      aria-controls="start-menu"
      aria-expanded={startOpen}
      aria-haspopup="dialog"
      title="Start"
      onClick={onStartToggle}
    >
      <Monitor size={21} />
    </button>
    <div className="taskbar__search-box">
      <Search size={16} />
      <span>Search</span>
    </div>
    <div className="taskbar__apps">
      {apps.map((app) => {
        const Icon = iconMap[app.icon];
        const isRunning = windows.some((windowState) => windowState.id === app.id);

        return (
          <button
            key={app.id}
            className={isRunning ? "taskbar__app--running" : ""}
            aria-label={app.title}
            title={app.title}
            onClick={() => onOpenApp(app)}
            onContextMenu={(event) => onAppContextMenu(event, app)}
          >
            <Icon size={20} />
          </button>
        );
      })}
    </div>
    <div className="taskbar__system-tray">
      {children}
      <button
        className="taskbar__tray-status-button"
        aria-label={actionCenterOpen ? "Close quick settings" : "Open quick settings"}
        aria-controls="action-center"
        aria-expanded={actionCenterOpen}
        aria-haspopup="dialog"
        title="Quick settings"
        onClick={onActionCenterToggle}
      >
        <Wifi size={14} />
        <Volume2 size={14} />
        <Battery size={15} />
      </button>
      <button
        className="taskbar__clock-button"
        aria-label={clockFlyoutOpen ? "Close calendar and clock" : "Open calendar and clock"}
        aria-controls="clock-flyout"
        aria-expanded={clockFlyoutOpen}
        aria-haspopup="dialog"
        title="Calendar and clock"
        onClick={onClockToggle}
      >
        {time}
      </button>
    </div>
  </>
);

Taskbar.displayName = "Taskbar";

export default Taskbar;
