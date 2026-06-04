import { Battery, Bell, Bluetooth, Moon, Sun, Volume2, Wifi, X } from "lucide-react";
import { Dispatch, FC, SetStateAction } from "react";
import { ActionCenterState } from "../types";

type ActionCenterProps = {
  state: ActionCenterState;
  onChange: Dispatch<SetStateAction<ActionCenterState>>;
  onClose: () => void;
};

const ActionCenter: FC<ActionCenterProps> = ({ state, onChange, onClose }) => {
  function toggle(
    key: keyof Pick<
      ActionCenterState,
      "wifi" | "bluetooth" | "batterySaver" | "focusAssist"
    >,
  ) {
    onChange((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <section
      className="action-center"
      aria-label="Action center"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="action-center__header">
        <div>
          <strong>Action Center</strong>
          <span>{state.wifi ? "Connected" : "Offline"}</span>
        </div>
        <button aria-label="Close action center" title="Close" onClick={onClose}>
          <X size={16} />
        </button>
      </div>
      <div className="action-center__quick-actions">
        <button
          className={state.wifi ? "action-center__quick-action--active" : ""}
          aria-pressed={state.wifi}
          onClick={() => toggle("wifi")}
        >
          <Wifi size={18} />
          <span>Wi-Fi</span>
        </button>
        <button
          className={state.bluetooth ? "action-center__quick-action--active" : ""}
          aria-pressed={state.bluetooth}
          onClick={() => toggle("bluetooth")}
        >
          <Bluetooth size={18} />
          <span>Bluetooth</span>
        </button>
        <button
          className={state.batterySaver ? "action-center__quick-action--active" : ""}
          aria-pressed={state.batterySaver}
          onClick={() => toggle("batterySaver")}
        >
          <Battery size={18} />
          <span>Battery</span>
        </button>
        <button
          className={state.focusAssist ? "action-center__quick-action--active" : ""}
          aria-pressed={state.focusAssist}
          onClick={() => toggle("focusAssist")}
        >
          <Moon size={18} />
          <span>Focus</span>
        </button>
      </div>
      <label className="action-center__slider">
        <Volume2 size={17} />
        <input
          type="range"
          min="0"
          max="100"
          value={state.volume}
          onChange={(event) =>
            onChange((current) => ({
              ...current,
              volume: Number(event.target.value),
            }))
          }
        />
        <span>{state.volume}%</span>
      </label>
      <label className="action-center__slider">
        <Sun size={17} />
        <input
          type="range"
          min="20"
          max="100"
          value={state.brightness}
          onChange={(event) =>
            onChange((current) => ({
              ...current,
              brightness: Number(event.target.value),
            }))
          }
        />
        <span>{state.brightness}%</span>
      </label>
      <div className="action-center__footer">
        <span>Battery 83%</span>
        <span>{state.bluetooth ? "Bluetooth on" : "Bluetooth off"}</span>
      </div>
      {state.focusAssist && (
        <div className="action-center__notification">
          <Bell size={16} />
          <span>Focus assist is filtering notifications.</span>
        </div>
      )}
    </section>
  );
};

ActionCenter.displayName = "ActionCenter";

export default ActionCenter;
