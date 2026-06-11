import { useState } from "react";

export function usePanels() {
  const [startOpen, setStartOpen] = useState(false);
  const [actionCenterOpen, setActionCenterOpen] = useState(false);
  const [clockFlyoutOpen, setClockFlyoutOpen] = useState(false);

  function closePanels() {
    setStartOpen(false);
    setActionCenterOpen(false);
    setClockFlyoutOpen(false);
  }

  return {
    actionCenterOpen,
    clockFlyoutOpen,
    startOpen,
    closePanels,
    setActionCenterOpen,
    setClockFlyoutOpen,
    setStartOpen,
  };
}
