import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { streamText, tool } from "ai";
import { z } from "zod";
import { createInterface } from "node:readline/promises";
import { CaicClient, fetchAvalancheSummary } from "./clients/caic.ts";
import { WeatherGovClient } from "./clients/weather-gov-client.ts";

const MODEL = "llama3.2:3b-instruct-fp16" as const;

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

const forecastTool = tool({
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

const caicClient = new CaicClient();
const avalancheForecastTool = tool({
  description:
    "Get the avalanche forecast and regional discussion from CAIC for a given latitude and longitude",
  parameters: z.object({
    longitude: z.coerce.number().min(-180).max(180).describe("the longitude"),
    latitude: z.coerce.number().min(-90).max(90).describe("the latitude"),
  }),
  execute: async ({ longitude, latitude }) => {
    console.log("caic tool", { latitude, longitude });
    return await fetchAvalancheSummary(
      { lat: Number(latitude), lng: Number(longitude) },
      caicClient,
    );
  },
});

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const provider = createOpenAICompatible<typeof MODEL, any, any>({
  name: "gnarlybox-ai",
  baseURL: "http://localhost:11434/v1",
});

try {
  while (true) {
    const prompt = await rl.question(
      "> Ask for a weather or avalanche forecast\n> ",
    );

    if (prompt === "exit") {
      console.log("Bye");
      rl.close();
      break;
    }

    const { textStream } = streamText({
      model: provider("llama3.2:3b-instruct-fp16"),
      prompt,
      maxSteps: 10,
      tools: {
        weatherForecastTool: forecastTool,
        avalancheForecastTool,
      },
    });

    for await (const part of textStream) {
      process.stdout.write(part);
    }
    process.stdout.write("\n");
  }
} catch (error) {
  console.error(error);
}
