import { FC, MouseEvent } from "react";
import { DesktopApp } from "../types";
import { iconMap } from "../utils/iconMap";

type StartMenuProps = {
  apps: DesktopApp[];
  onOpenApp: (app: DesktopApp) => void;
  onAppContextMenu: (event: MouseEvent<HTMLButtonElement>, app: DesktopApp) => void;
};

const StartMenu: FC<StartMenuProps> = ({ apps, onOpenApp, onAppContextMenu }) => (
  <section
    id="start-menu"
    className="taskbar-flyout start-menu"
    aria-label="Start menu"
    tabIndex={-1}
  >
    <div onClick={(event) => event.stopPropagation()}>
      <div className="start-menu__header">
        <span>DesktopSim</span>
      </div>
      <div className="start-menu__grid">
        {apps.map((app) => {
          const Icon = iconMap[app.icon];

          return (
            <button
              key={app.id}
              onClick={() => onOpenApp(app)}
              onContextMenu={(event) => onAppContextMenu(event, app)}
            >
              <Icon size={22} />
              <span>{app.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  </section>
);

StartMenu.displayName = "StartMenu";

export default StartMenu;
