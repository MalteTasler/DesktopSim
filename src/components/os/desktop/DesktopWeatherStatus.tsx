import { CloudSun } from "lucide-react";
import { FC, useEffect, useState } from "react";
import {
  CurrentWeather,
  WeatherCoordinates,
  createWeatherPageUrl,
  fetchCurrentWeather,
} from "../../../api/weather";
import { UI_CATEGORY } from "../../../utils/os/ui/uiCategories";

type DesktopWeatherStatusProps = {
  onOpenWeather: (url: string) => void;
};

const DEFAULT_TEMPERATURE = 18;

const DesktopWeatherStatus: FC<DesktopWeatherStatusProps> = ({ onOpenWeather }) => {
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [coordinates, setCoordinates] = useState<WeatherCoordinates | null>(null);

  useEffect(() => {
    let ignore = false;

    fetchCurrentWeather()
      .then((currentWeather) => {
        if (ignore) {
          return;
        }

        setWeather(currentWeather);
        setCoordinates(currentWeather.coordinates);
      })
      .catch(() => {
        if (!ignore) {
          setWeather(null);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const temperature = weather?.temperature ?? DEFAULT_TEMPERATURE;

  return (
    <button
      className="desktop__status"
      data-ui-category={UI_CATEGORY.shell}
      aria-label="Open weather"
      title="Open weather"
      onClick={(event) => {
        event.stopPropagation();
        onOpenWeather(createWeatherPageUrl(coordinates));
      }}
    >
      <CloudSun size={18} />
      <span>{Math.round(temperature)} deg</span>
    </button>
  );
};

DesktopWeatherStatus.displayName = "DesktopWeatherStatus";

export default DesktopWeatherStatus;
