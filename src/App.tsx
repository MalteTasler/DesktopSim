import { CloudSun } from "lucide-react";
import { FC } from "react";
import ActionCenter from "./components/ActionCenter";
import ContextMenu from "./components/ContextMenu";
import DesktopIconButton from "./components/DesktopIconButton";
import DesktopWindow from "./components/DesktopWindow";
import StartMenu from "./components/StartMenu";
import Taskbar from "./components/Taskbar";
import { apps } from "./data";
import { useDesktopController } from "./hooks/useDesktopController";

const App: FC = () => {
  const desktop = useDesktopController();

  return (
    <main
      className={`desktop desktop--${desktop.settings.theme} ${
        desktop.settings.transparency
          ? "desktop--transparency-on"
          : "desktop--transparency-off"
      }`}
      style={desktop.desktopStyle}
      onClick={() => {
        desktop.setSelectedIcon(null);
        desktop.setContextMenu(null);
        desktop.setStartOpen(false);
        desktop.setActionCenterOpen(false);
      }}
      onContextMenu={desktop.showDesktopMenu}
    >
      <div className="desktop__wallpaper" />
      <div className="desktop__status" aria-hidden="true">
        <CloudSun size={18} />
        <span>18 deg</span>
      </div>
      {desktop.snapPreview && (
        <div
          className="desktop__snap-preview"
          style={{
            left: desktop.snapPreview.x,
            top: desktop.snapPreview.y,
            width: desktop.snapPreview.width,
            height: desktop.snapPreview.height,
          }}
          aria-hidden="true"
        />
      )}

      <section className="desktop__icon-layer" aria-label="Desktop icons">
        {desktop.icons.map((icon) => (
          <DesktopIconButton
            key={icon.id}
            icon={icon}
            isSelected={desktop.selectedIcon === icon.id}
            onSelect={() => desktop.selectDesktopIcon(icon.id)}
            onOpen={() => desktop.openApp(icon)}
            onContextMenu={(event) => desktop.showIconMenu(event, icon)}
            onDrag={(event) => desktop.dragIcon(event, icon.id)}
          />
        ))}
      </section>

      {desktop.visibleWindows.map((windowState) => (
        <DesktopWindow
          key={windowState.windowId}
          window={windowState}
          isActive={desktop.activeWindow === windowState.windowId}
          onClose={() => desktop.closeWindow(windowState.windowId)}
          onMinimize={() => desktop.minimizeWindow(windowState.windowId)}
          onMaximize={() => desktop.toggleMaximize(windowState.windowId)}
          onFocus={() => desktop.focusWindow(windowState.windowId)}
          onDrag={(event) => desktop.dragWindow(event, windowState.windowId)}
          onResize={(event, direction) =>
            desktop.resizeWindow(event, windowState.windowId, direction)
          }
          settings={desktop.settings}
          onSettingsChange={desktop.setSettings}
          explorer={desktop.explorer}
          onExplorerNavigate={desktop.navigateExplorer}
          onExplorerBack={desktop.goExplorerBack}
          onExplorerForward={desktop.goExplorerForward}
          onExplorerUp={desktop.goExplorerUp}
          onExplorerSelect={desktop.selectExplorerItem}
          onExplorerOpen={desktop.openExplorerItem}
        />
      ))}

      {desktop.contextMenu && (
        <ContextMenu
          menu={desktop.contextMenu}
          onDismiss={() => desktop.setContextMenu(null)}
        />
      )}

      <footer className="desktop__taskbar">
        {desktop.startOpen && (
          <StartMenu
            apps={apps}
            onOpenApp={desktop.openApp}
            onAppContextMenu={desktop.showIconMenu}
          />
        )}
        <Taskbar
          apps={desktop.taskbarApps}
          windows={desktop.windows}
          time={desktop.clock}
          actionCenterOpen={desktop.actionCenterOpen}
          onOpenApp={desktop.openApp}
          onAppContextMenu={desktop.showTaskbarAppMenu}
          onStartToggle={(event) => {
            event.stopPropagation();
            desktop.setStartOpen((current) => !current);
            desktop.setActionCenterOpen(false);
            desktop.setContextMenu(null);
          }}
          onActionCenterToggle={(event) => {
            event.stopPropagation();
            desktop.setStartOpen(false);
            desktop.setActionCenterOpen((current) => !current);
          }}
        >
          {desktop.actionCenterOpen && (
            <ActionCenter
              state={desktop.actionCenter}
              onChange={desktop.setActionCenter}
              onClose={() => desktop.setActionCenterOpen(false)}
              onPower={desktop.resetDesktop}
            />
          )}
        </Taskbar>
      </footer>
    </main>
  );
};

App.displayName = "App";

export default App;
