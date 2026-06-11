import { apps } from "../../../apps/appRegistry";
import { accentColors } from "../../../data";
import { ActionCenterState, DesktopSettings, ExplorerState } from "../../../types";
import { clamp } from "../window/windowGeometry";

const STORAGE_KEYS = {
  settings: "desktop-sim:settings",
  pinnedShellApps: "desktop-sim:pinned-shell-apps",
  actionCenter: "desktop-sim:action-center",
} as const;

const STORAGE_VERSION = 1;

type StoredValue<T> = {
  version: typeof STORAGE_VERSION;
  value: T;
};

export const initialSettings: DesktopSettings = {
  theme: "light",
  transparency: true,
  snapWindows: true,
  accentIntensity: 65,
  accentColor: accentColors[1],
};

export const initialExplorer: ExplorerState = {
  path: "Desktop",
  history: [],
  future: [],
  selectedId: null,
};

export const initialActionCenter: ActionCenterState = {
  wifi: true,
  bluetooth: false,
  batterySaver: false,
  focusAssist: false,
  volume: 62,
  brightness: 74,
};

function isStoredValue(value: unknown): value is StoredValue<unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    (value as Partial<StoredValue<unknown>>).version === STORAGE_VERSION &&
    "value" in value
  );
}

function readStorageValue<T>(key: string, fallback: T, validate: (value: unknown) => T) {
  try {
    const rawValue = globalThis.localStorage?.getItem(key);
    const parsedValue = rawValue ? JSON.parse(rawValue) : null;

    return parsedValue
      ? validate(isStoredValue(parsedValue) ? parsedValue.value : parsedValue)
      : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorageValue(key: keyof typeof STORAGE_KEYS, value: unknown) {
  try {
    globalThis.localStorage?.setItem(
      STORAGE_KEYS[key],
      JSON.stringify({ version: STORAGE_VERSION, value }),
    );
  } catch {
    // Storage can be unavailable in private sessions or restricted embeds.
  }
}

export function readStoredSettings() {
  return readStorageValue(STORAGE_KEYS.settings, initialSettings, (value) => {
    if (!value || typeof value !== "object") {
      return initialSettings;
    }

    const settings = value as Partial<DesktopSettings>;

    return {
      ...initialSettings,
      theme: settings.theme === "dark" || settings.theme === "light"
        ? settings.theme
        : initialSettings.theme,
      transparency:
        typeof settings.transparency === "boolean"
          ? settings.transparency
          : initialSettings.transparency,
      snapWindows:
        typeof settings.snapWindows === "boolean"
          ? settings.snapWindows
          : initialSettings.snapWindows,
      accentIntensity:
        typeof settings.accentIntensity === "number"
          ? clamp(settings.accentIntensity, 0, 100)
          : initialSettings.accentIntensity,
      accentColor:
        typeof settings.accentColor === "string" &&
        accentColors.includes(settings.accentColor)
          ? settings.accentColor
          : initialSettings.accentColor,
    };
  });
}

export function readStoredPinnedShellApps() {
  return readStorageValue(
    STORAGE_KEYS.pinnedShellApps,
    apps.map((app) => app.id),
    (value) => {
      if (!Array.isArray(value)) {
        return apps.map((app) => app.id);
      }

      const appIds = new Set(apps.map((app) => app.id));

      return value.filter(
        (appId): appId is string => typeof appId === "string" && appIds.has(appId),
      );
    },
  );
}

export function readStoredActionCenter() {
  return readStorageValue(STORAGE_KEYS.actionCenter, initialActionCenter, (value) => {
    if (!value || typeof value !== "object") {
      return initialActionCenter;
    }

    const actionCenter = value as Partial<ActionCenterState>;

    return {
      ...initialActionCenter,
      wifi:
        typeof actionCenter.wifi === "boolean"
          ? actionCenter.wifi
          : initialActionCenter.wifi,
      bluetooth:
        typeof actionCenter.bluetooth === "boolean"
          ? actionCenter.bluetooth
          : initialActionCenter.bluetooth,
      batterySaver:
        typeof actionCenter.batterySaver === "boolean"
          ? actionCenter.batterySaver
          : initialActionCenter.batterySaver,
      focusAssist:
        typeof actionCenter.focusAssist === "boolean"
          ? actionCenter.focusAssist
          : initialActionCenter.focusAssist,
      volume:
        typeof actionCenter.volume === "number"
          ? clamp(actionCenter.volume, 0, 100)
          : initialActionCenter.volume,
      brightness:
        typeof actionCenter.brightness === "number"
          ? clamp(actionCenter.brightness, 20, 100)
          : initialActionCenter.brightness,
    };
  });
}
