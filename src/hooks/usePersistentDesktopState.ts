import { CSSProperties, useEffect, useState } from "react";
import { apps } from "../data";
import { ActionCenterState, DesktopSettings } from "../types";
import {
  initialActionCenter,
  initialSettings,
  readStoredActionCenter,
  readStoredPinnedApps,
  readStoredSettings,
  writeStorageValue,
} from "../utils/desktopStorage";

export function usePersistentDesktopState() {
  const [settings, setSettings] = useState<DesktopSettings>(readStoredSettings);
  const [pinnedTaskbarApps, setPinnedTaskbarApps] =
    useState<string[]>(readStoredPinnedApps);
  const [actionCenter, setActionCenter] =
    useState<ActionCenterState>(readStoredActionCenter);

  useEffect(() => {
    writeStorageValue("settings", settings);
  }, [settings]);

  useEffect(() => {
    writeStorageValue("pinnedTaskbarApps", pinnedTaskbarApps);
  }, [pinnedTaskbarApps]);

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
    setPinnedTaskbarApps(apps.map((app) => app.id));
    setSettings(initialSettings);
    setActionCenter(initialActionCenter);
  }

  return {
    actionCenter,
    desktopStyle,
    pinnedTaskbarApps,
    settings,
    resetPersistentSettings,
    setActionCenter,
    setPinnedTaskbarApps,
    setSettings,
  };
}
