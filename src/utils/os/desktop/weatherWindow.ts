import { AppDefinition } from "../../../types";

export function createWeatherWindowApp(apps: AppDefinition[], url: string): AppDefinition {
  const weatherApp = apps.find(
    (app) =>
      app.kind === "web" &&
      /weather|wetter/i.test(`${app.title} ${app.url ?? ""}`),
  );

  if (weatherApp) {
    return weatherApp;
  }

  return {
    id: "weather-page",
    title: "Weather",
    icon: "browser",
    kind: "web",
    url,
    defaultWindowSize: {
      width: 820,
      height: 560,
    },
  };
}
