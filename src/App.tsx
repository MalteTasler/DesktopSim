import { CloudSun } from "lucide-react";
import { FC, useEffect } from "react";
import ActionCenterPanel from "./components/os/panels/ActionCenterPanel";
import ClockPanel from "./components/os/panels/ClockPanel";
import ContextMenu from "./components/os/context-menu/ContextMenu";
import DesktopIconButton from "./components/os/desktop/DesktopIconButton";
import DesktopWindow from "./components/os/window/DesktopWindow";
import Shell from "./components/os/shell/Shell";
import StartPanel from "./components/os/panels/StartPanel";
import { apps } from "./data";
import { useDesktopController } from "./hooks/os/desktop/useDesktopController";
import { UI_CATEGORY } from "./utils/os/ui/uiCategories";

const App: FC = () => {
  const desktop = useDesktopController();

  useEffect(() => {
    const panelId = desktop.startPanelOpen
      ? "start-menu"
      : desktop.actionCenterOpen
        ? "action-center"
        : desktop.clockPanelOpen
          ? "clock-panel"
          : null;

    if (!panelId) {
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      document.getElementById(panelId)?.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [desktop.actionCenterOpen, desktop.clockPanelOpen, desktop.startPanelOpen]);

  return (
    <main
      className={`desktop desktop--${desktop.settings.theme} ${
        desktop.settings.transparency
          ? "desktop--transparency-on"
          : "desktop--transparency-off"
      }`}
      data-ui-category={UI_CATEGORY.space}
      style={desktop.desktopStyle}
      onClick={() => {
        desktop.setSelectedIcon(null);
        desktop.setContextMenu(null);
        desktop.setStartPanelOpen(false);
        desktop.setActionCenterOpen(false);
        desktop.setClockPanelOpen(false);
      }}
      onContextMenu={desktop.showDesktopMenu}
    >
      <div className="desktop__wallpaper" data-ui-category={UI_CATEGORY.background} />
      <div
        className="desktop__status"
        data-ui-category={UI_CATEGORY.shell}
        aria-hidden="true"
      >
        <CloudSun size={18} />
        <span>18 deg</span>
      </div>
      {desktop.snapPreview && (
        <div
          className="desktop__snap-preview"
          data-ui-category={UI_CATEGORY.window}
          style={{
            left: desktop.snapPreview.x,
            top: desktop.snapPreview.y,
            width: desktop.snapPreview.width,
            height: desktop.snapPreview.height,
          }}
          aria-hidden="true"
        />
      )}

      <section
        className="desktop__icon-layer"
        data-ui-category={UI_CATEGORY.space}
        aria-label="Desktop icons"
      >
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
          onResetPersistentSettings={desktop.resetPersistentSettings}
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

      <footer className="desktop__shell" data-ui-category={UI_CATEGORY.shell}>
        {desktop.startPanelOpen && (
          <StartPanel
            apps={apps}
            onOpenApp={desktop.openApp}
            onAppContextMenu={desktop.showIconMenu}
          />
        )}
        <Shell
          apps={desktop.shellApps}
          windows={desktop.windows}
          time={desktop.clock}
          startPanelOpen={desktop.startPanelOpen}
          clockPanelOpen={desktop.clockPanelOpen}
          actionCenterOpen={desktop.actionCenterOpen}
          onOpenApp={desktop.openApp}
          onAppContextMenu={desktop.showShellAppMenu}
          onStartToggle={(event) => {
            event.stopPropagation();
            desktop.setStartPanelOpen((current) => !current);
            desktop.setActionCenterOpen(false);
            desktop.setClockPanelOpen(false);
            desktop.setContextMenu(null);
          }}
          onActionCenterToggle={(event) => {
            event.stopPropagation();
            desktop.setStartPanelOpen(false);
            desktop.setClockPanelOpen(false);
            desktop.setActionCenterOpen((current) => !current);
          }}
          onClockToggle={(event) => {
            event.stopPropagation();
            desktop.setStartPanelOpen(false);
            desktop.setActionCenterOpen(false);
            desktop.setClockPanelOpen((current) => !current);
          }}
        >
          {desktop.actionCenterOpen && (
            <ActionCenterPanel
              state={desktop.actionCenter}
              onChange={desktop.setActionCenter}
              onClose={() => desktop.setActionCenterOpen(false)}
              onPower={desktop.resetDesktop}
            />
          )}
          {desktop.clockPanelOpen && <ClockPanel date={desktop.clockDate} />}
        </Shell>
      </footer>
    </main>
  );
};

App.displayName = "App";

export default App;
