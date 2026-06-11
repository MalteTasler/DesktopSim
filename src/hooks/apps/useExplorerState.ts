import { useState } from "react";
import { fileSystem } from "../../data";
import { ExplorerItem, ExplorerState } from "../../types";
import { initialExplorer } from "../../utils/os/desktop/desktopStorage";

export function useExplorerState() {
  const [explorer, setExplorer] = useState<ExplorerState>(initialExplorer);

  function navigateExplorer(path: string) {
    setExplorer((current) => {
      if (path === current.path || !fileSystem[path]) {
        return current;
      }

      return {
        path,
        history: [...current.history, current.path],
        future: [],
        selectedId: null,
      };
    });
  }

  function goExplorerBack() {
    setExplorer((current) => {
      const previous = current.history.at(-1);

      if (!previous) {
        return current;
      }

      return {
        path: previous,
        history: current.history.slice(0, -1),
        future: [current.path, ...current.future],
        selectedId: null,
      };
    });
  }

  function goExplorerForward() {
    setExplorer((current) => {
      const next = current.future[0];

      if (!next) {
        return current;
      }

      return {
        path: next,
        history: [...current.history, current.path],
        future: current.future.slice(1),
        selectedId: null,
      };
    });
  }

  function goExplorerUp() {
    const parts = explorer.path.split("/");

    if (parts.length > 1) {
      navigateExplorer(parts.slice(0, -1).join("/"));
    }
  }

  function selectExplorerItem(itemId: string | null) {
    setExplorer((current) => ({ ...current, selectedId: itemId }));
  }

  function openExplorerItem(item: ExplorerItem) {
    if (item.path) {
      navigateExplorer(item.path);
      return;
    }

    selectExplorerItem(item.id);
  }

  return {
    explorer,
    goExplorerBack,
    goExplorerForward,
    goExplorerUp,
    navigateExplorer,
    openExplorerItem,
    selectExplorerItem,
    setExplorer,
  };
}
