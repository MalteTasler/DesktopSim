export type WeatherCoordinates = {
  latitude: number;
  longitude: number;
};

export type CurrentWeather = {
  coordinates: WeatherCoordinates;
  temperature: number;
};

type OpenMeteoCurrentWeatherResponse = {
  current?: {
    temperature_2m?: number;
  };
};

function getBrowserLocation() {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      maximumAge: 15 * 60 * 1000,
      timeout: 10000,
    });
  });
}

export async function fetchCurrentWeather(): Promise<CurrentWeather> {
  const position = await getBrowserLocation();
  const coordinates = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
  const params = new URLSearchParams({
    latitude: coordinates.latitude.toString(),
    longitude: coordinates.longitude.toString(),
    current: "temperature_2m",
    timezone: "auto",
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);

  if (!response.ok) {
    throw new Error("Weather request failed.");
  }

  const data = (await response.json()) as OpenMeteoCurrentWeatherResponse;
  const temperature = data.current?.temperature_2m;

  if (typeof temperature !== "number") {
    throw new Error("Weather response is missing the current temperature.");
  }

  return {
    coordinates,
    temperature,
  };
}

export function createWeatherPageUrl(coordinates?: WeatherCoordinates | null) {
  if (!coordinates) {
    return "https://weather.com/weather/today";
  }

  return `https://weather.com/weather/today/l/${coordinates.latitude},${coordinates.longitude}`;
}
