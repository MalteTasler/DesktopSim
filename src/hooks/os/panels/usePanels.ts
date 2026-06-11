import { useState } from "react";

export function usePanels() {
  const [startPanelOpen, setStartPanelOpen] = useState(false);
  const [actionCenterOpen, setActionCenterOpen] = useState(false);
  const [clockPanelOpen, setClockPanelOpen] = useState(false);

  function closePanels() {
    setStartPanelOpen(false);
    setActionCenterOpen(false);
    setClockPanelOpen(false);
  }

  return {
    actionCenterOpen,
    clockPanelOpen,
    startPanelOpen,
    closePanels,
    setActionCenterOpen,
    setClockPanelOpen,
    setStartPanelOpen,
  };
}
