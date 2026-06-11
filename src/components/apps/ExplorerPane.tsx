import { ChevronLeft, ChevronRight, ChevronUp, FileText, Folder, HardDrive, Home, Image } from "lucide-react";
import { FC } from "react";
import { fileSystem } from "../../data";
import { ExplorerItem, ExplorerState } from "../../types";
import { getExplorerIcon } from "../../utils/apps/getExplorerIcon";

type ExplorerPaneProps = {
  state: ExplorerState;
  onNavigate: (path: string) => void;
  onBack: () => void;
  onForward: () => void;
  onUp: () => void;
  onSelect: (itemId: string | null) => void;
  onOpen: (item: ExplorerItem) => void;
};

const ExplorerPane: FC<ExplorerPaneProps> = ({
  state,
  onNavigate,
  onBack,
  onForward,
  onUp,
  onSelect,
  onOpen,
}) => {
  const items = fileSystem[state.path] ?? [];
  const selectedItem = items.find((item) => item.id === state.selectedId) ?? null;
  const canGoUp = state.path.includes("/");

  return (
    <div className="explorer-pane">
      <div className="explorer-pane__toolbar">
        <button aria-label="Back" title="Back" disabled={state.history.length === 0} onClick={onBack}>
          <ChevronLeft size={16} />
        </button>
        <button aria-label="Forward" title="Forward" disabled={state.future.length === 0} onClick={onForward}>
          <ChevronRight size={16} />
        </button>
        <button aria-label="Up" title="Up" disabled={!canGoUp} onClick={onUp}>
          <ChevronUp size={16} />
        </button>
        <div className="explorer-pane__address-bar" aria-label="Current folder">
          <HardDrive size={15} />
          <span>{state.path.replaceAll("/", " / ")}</span>
        </div>
      </div>
      <aside className="explorer-pane__sidebar">
        {[
          { path: "Desktop", label: "Desktop", icon: Home },
          { path: "Desktop/Projects", label: "Projects", icon: Folder },
          { path: "Desktop/Pictures", label: "Pictures", icon: Image },
          { path: "Desktop/Invoices", label: "Invoices", icon: FileText },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              className={state.path === item.path ? "explorer-pane__sidebar-item--active" : ""}
              onClick={() => onNavigate(item.path)}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </aside>
      <section className="explorer-pane__file-grid" aria-label="Files" onClick={() => onSelect(null)}>
        {items.length === 0 && <p className="explorer-pane__empty-folder">This folder is empty.</p>}
        {items.map((item) => {
          const Icon = getExplorerIcon(item.type);

          return (
            <button
              key={item.id}
              className={state.selectedId === item.id ? "explorer-pane__file--selected" : ""}
              onClick={(event) => {
                event.stopPropagation();
                onSelect(item.id);
              }}
              onDoubleClick={(event) => {
                event.stopPropagation();
                onOpen(item);
              }}
            >
              <Icon size={30} />
              <span>{item.name}</span>
              <small>{item.size ?? "Folder"}</small>
            </button>
          );
        })}
      </section>
      <aside className="explorer-pane__preview" aria-label="Preview">
        {selectedItem ? (
          <>
            {(() => {
              const Icon = getExplorerIcon(selectedItem.type);

              return <Icon size={34} />;
            })()}
            <strong>{selectedItem.name}</strong>
            <dl>
              <div>
                <dt>Type</dt>
                <dd>{selectedItem.type}</dd>
              </div>
              <div>
                <dt>Modified</dt>
                <dd>{selectedItem.modified}</dd>
              </div>
              <div>
                <dt>Size</dt>
                <dd>{selectedItem.size ?? "-"}</dd>
              </div>
            </dl>
            {selectedItem.preview && <p>{selectedItem.preview}</p>}
          </>
        ) : (
          <>
            <Folder size={34} />
            <strong>{items.length} items</strong>
            <p>Select a file or double-click a folder.</p>
          </>
        )}
      </aside>
      <footer className="explorer-pane__status">
        <span>{items.length} items</span>
        <span>{selectedItem ? `Selected: ${selectedItem.name}` : state.path}</span>
      </footer>
    </div>
  );
};

ExplorerPane.displayName = "ExplorerPane";

export default ExplorerPane;
