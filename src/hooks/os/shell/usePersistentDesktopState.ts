import { CSSProperties, useEffect, useState } from "react";
import { apps } from "../../../data";
import { ActionCenterState, DesktopSettings } from "../../../types";
import {
  initialActionCenter,
  initialSettings,
  readStoredActionCenter,
  readStoredPinnedShellApps,
  readStoredSettings,
  writeStorageValue,
} from "../../../utils/os/desktop/desktopStorage";

export function usePersistentDesktopState() {
  const [settings, setSettings] = useState<DesktopSettings>(readStoredSettings);
  const [pinnedShellApps, setPinnedShellApps] =
    useState<string[]>(readStoredPinnedShellApps);
  const [actionCenter, setActionCenter] =
    useState<ActionCenterState>(readStoredActionCenter);

  useEffect(() => {
    writeStorageValue("settings", settings);
  }, [settings]);

  useEffect(() => {
    writeStorageValue("pinnedShellApps", pinnedShellApps);
  }, [pinnedShellApps]);

  useEffect(() => {
    writeStorageValue("actionCenter", actionCenter);
  }, [actionCenter]);

  const desktopStyle = {
    "--accent-color": settings.accentColor,
    "--accent-soft": `${settings.accentColor}${Math.round(
      (settings.accentIntensity / 100) * 64 + 24,
    )
      .toString(16)
      .padStart(2, "0")}`,
    "--accent-strong": `${settings.accentColor}${Math.round(
      (settings.accentIntensity / 100) * 96 + 64,
    )
      .toString(16)
      .padStart(2, "0")}`,
  } as CSSProperties;

  function resetPersistentSettings() {
    setPinnedShellApps(apps.map((app) => app.id));
    setSettings(initialSettings);
    setActionCenter(initialActionCenter);
  }

  return {
    actionCenter,
    desktopStyle,
    pinnedShellApps,
    settings,
    resetPersistentSettings,
    setActionCenter,
    setPinnedShellApps,
    setSettings,
  };
}
