import { Power } from "lucide-react";
import { FC, MouseEvent } from "react";
import { DesktopApp } from "../types";
import { iconMap } from "../utils/iconMap";

type StartMenuProps = {
  apps: DesktopApp[];
  onOpenApp: (app: DesktopApp) => void;
  onAppContextMenu: (event: MouseEvent<HTMLButtonElement>, app: DesktopApp) => void;
};

const StartMenu: FC<StartMenuProps> = ({ apps, onOpenApp, onAppContextMenu }) => (
  <section className="start-menu" aria-label="Start menu">
    <div onClick={(event) => event.stopPropagation()}>
      <div className="start-menu__header">
        <span>DesktopSim</span>
        <button aria-label="Power options" title="Power options">
          <Power size={16} />
        </button>
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
