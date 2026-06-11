import { useState } from "react";

export type PanelId = "start" | "action-center" | "clock";

export function usePanels() {
  const [activePanel, setActivePanel] = useState<PanelId | null>(null);

  function closePanels() {
    setActivePanel(null);
  }

  function togglePanel(panelId: PanelId) {
    setActivePanel((current) => (current === panelId ? null : panelId));
  }

  return {
    activePanel,
    actionCenterOpen: activePanel === "action-center",
    clockPanelOpen: activePanel === "clock",
    startPanelOpen: activePanel === "start",
    closePanels,
    setActivePanel,
    togglePanel,
  };
}
