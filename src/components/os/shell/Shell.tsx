import { Battery, Monitor, Search, Volume2, Wifi } from "lucide-react";
import { FC, MouseEvent, ReactNode } from "react";
import { AppDefinition, WindowInstance } from "../../../types";
import { iconMap } from "../../../utils/os/desktop/iconMap";

type ShellProps = {
  apps: AppDefinition[];
  windows: WindowInstance[];
  time: string;
  startPanelOpen: boolean;
  actionCenterOpen: boolean;
  clockPanelOpen: boolean;
  children: ReactNode;
  onOpenApp: (app: AppDefinition) => void;
  onAppContextMenu: (event: MouseEvent<HTMLButtonElement>, app: AppDefinition) => void;
  onStartToggle: (event: MouseEvent<HTMLButtonElement>) => void;
  onActionCenterToggle: (event: MouseEvent<HTMLButtonElement>) => void;
  onClockToggle: (event: MouseEvent<HTMLButtonElement>) => void;
};

const Shell: FC<ShellProps> = ({
  apps,
  windows,
  time,
  startPanelOpen,
  actionCenterOpen,
  clockPanelOpen,
  children,
  onOpenApp,
  onAppContextMenu,
  onStartToggle,
  onActionCenterToggle,
  onClockToggle,
}) => (
  <>
    <button
      className="shell__start-button"
      aria-label={startPanelOpen ? "Close Start" : "Open Start"}
      aria-controls="start-menu"
      aria-expanded={startPanelOpen}
      aria-haspopup="dialog"
      title="Start"
      onClick={onStartToggle}
    >
      <Monitor size={21} />
    </button>
    <div className="shell__search-box">
      <Search size={16} />
      <span>Search</span>
    </div>
    <div className="shell__apps">
      {apps.map((app) => {
        const Icon = iconMap[app.icon];
        const isRunning = windows.some((windowState) => windowState.appId === app.id);

        return (
          <button
            key={app.id}
            className={isRunning ? "shell__app--running" : ""}
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
    <div className="shell__system-tray">
      {children}
      <button
        className="shell__tray-status-button"
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
        className="shell__clock-button"
        aria-label={clockPanelOpen ? "Close calendar and clock" : "Open calendar and clock"}
        aria-controls="clock-panel"
        aria-expanded={clockPanelOpen}
        aria-haspopup="dialog"
        title="Calendar and clock"
        onClick={onClockToggle}
      >
        {time}
      </button>
    </div>
  </>
);

Shell.displayName = "Shell";

export default Shell;
