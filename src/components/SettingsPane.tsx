import { Check, Grip, RotateCcw } from "lucide-react";
import { Dispatch, FC, SetStateAction } from "react";
import { accentColors } from "../data";
import { DesktopSettings } from "../types";

type SettingsPaneProps = {
  settings: DesktopSettings;
  onSettingsChange: Dispatch<SetStateAction<DesktopSettings>>;
  onResetPersistentSettings: () => void;
};

const SettingsPane: FC<SettingsPaneProps> = ({
  settings,
  onSettingsChange,
  onResetPersistentSettings,
}) => (
  <div className="settings-pane">
    <div className="settings-pane__row">
      <span>Theme</span>
      <div className="settings-pane__segmented-control" role="group" aria-label="Theme">
        <button
          className={settings.theme === "light" ? "settings-pane__segment--active" : ""}
          aria-pressed={settings.theme === "light"}
          onClick={() => onSettingsChange((current) => ({ ...current, theme: "light" }))}
        >
          Light
        </button>
        <button
          className={settings.theme === "dark" ? "settings-pane__segment--active" : ""}
          aria-pressed={settings.theme === "dark"}
          onClick={() => onSettingsChange((current) => ({ ...current, theme: "dark" }))}
        >
          Dark
        </button>
      </div>
    </div>
    <label>
      <span>Transparency effects</span>
      <input
        type="checkbox"
        checked={settings.transparency}
        onChange={(event) =>
          onSettingsChange((current) => ({
            ...current,
            transparency: event.target.checked,
          }))
        }
      />
    </label>
    <label>
      <span>Snap windows</span>
      <input
        type="checkbox"
        checked={settings.snapWindows}
        onChange={(event) =>
          onSettingsChange((current) => ({
            ...current,
            snapWindows: event.target.checked,
          }))
        }
      />
    </label>
    <label>
      <span>Accent intensity</span>
      <input
        type="range"
        min="20"
        max="100"
        value={settings.accentIntensity}
        onChange={(event) =>
          onSettingsChange((current) => ({
            ...current,
            accentIntensity: Number(event.target.value),
          }))
        }
      />
    </label>
    <div className="settings-pane__row">
      <span>Accent color</span>
      <div className="settings-pane__swatches" aria-label="Accent color">
        {accentColors.map((color, index) => (
          <button
            key={color}
            className={settings.accentColor === color ? "settings-pane__swatch--selected" : ""}
            style={{ background: color }}
            aria-label={`Accent ${index + 1}`}
            aria-pressed={settings.accentColor === color}
            title={`Accent ${index + 1}`}
            onClick={() => onSettingsChange((current) => ({ ...current, accentColor: color }))}
          >
            {settings.accentColor === color && <Check size={13} />}
          </button>
        ))}
      </div>
    </div>
    <div className="settings-pane__row">
      <span>Persistent settings</span>
      <button
        className="settings-pane__reset-button"
        type="button"
        onClick={onResetPersistentSettings}
      >
        <RotateCcw size={15} />
        <span>Reset</span>
      </button>
    </div>
    <div className="settings-pane__resize-hint">
      <Grip size={18} />
    </div>
  </div>
);

SettingsPane.displayName = "SettingsPane";

export default SettingsPane;
