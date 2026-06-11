import { FC, MouseEvent } from "react";
import { AppDefinition } from "../../../types";
import { iconMap } from "../../../utils/os/desktop/iconMap";
import { UI_CATEGORY } from "../../../utils/os/ui/uiCategories";

type StartPanelProps = {
  apps: AppDefinition[];
  onOpenApp: (app: AppDefinition) => void;
  onAppContextMenu: (event: MouseEvent<HTMLButtonElement>, app: AppDefinition) => void;
};

const StartPanel: FC<StartPanelProps> = ({ apps, onOpenApp, onAppContextMenu }) => (
  <section
    id="start-menu"
    className="panel start-menu"
    data-ui-category={UI_CATEGORY.panel}
    aria-label="Start menu"
    tabIndex={-1}
    onClick={(event) => event.stopPropagation()}
  >
    <div>
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

StartPanel.displayName = "StartPanel";

export default StartPanel;
