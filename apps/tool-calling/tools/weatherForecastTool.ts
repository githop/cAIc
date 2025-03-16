import { tool } from 'ai';
import { z } from 'zod';
import { WeatherGovClient } from '@ollama-ts/weather-gov-client';

async function getForecast(
  latitude: number,
  longitude: number,
  client: WeatherGovClient,
) {
  const gridPos = await client.getGridPoints(latitude, longitude);
  const { gridId, gridX, gridY } = gridPos.properties;
  const forecast = await client.getForecast(gridId, gridX, gridY);
  return forecast.properties.periods[0];
}

const weatherClient = new WeatherGovClient();

export const weatherForecastTool = tool({
  description: "Get the weather forecast for a given longitude and latitude",
  parameters: z.object({
    longitude: z.coerce.number().min(-180).max(180).describe("the longitude"),
    latitude: z.coerce.number().min(-90).max(90).describe("the latitude"),
  }),
  execute: async ({ longitude, latitude }) => {
    console.log("weather tool", { latitude, longitude });
    return await getForecast(
      Number(latitude),
      Number(longitude),
      weatherClient,
    );
  },
});
