import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { streamText, tool } from "ai";
import { z } from "zod";
import { createInterface } from "node:readline/promises";
import { CaicClient, fetchAvalancheSummary } from "@ollama-ts/clients";
import { WeatherGovClient } from "@ollama-ts/clients";
import { AvalancheApiClient, startOfAvalancheYear } from "@ollama-ts/clients";

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
const getAreaForecastTool = tool({
  description:
    "Get the current avalanche danger and regional conditions forecast from CAIC for a specific location. THIS TOOL DOES NOT PROVIDE PAST INCIDENT REPORTS.",
  parameters: z.object({
    longitude: z.coerce.number().min(-180).max(180).describe("the longitude"),
    latitude: z.coerce.number().min(-90).max(90).describe("the latitude"),
  }),
  execute: async ({ longitude, latitude }) => {
    console.log("caic area forecast tool", { latitude, longitude });
    return await fetchAvalancheSummary(
      { lat: Number(latitude), lng: Number(longitude) },
      caicClient,
    );
  },
});

// Create instance of the AvalancheApiClient
const avalancheApiClient = new AvalancheApiClient();

// Create the avalanche incidents tool
const getRecentIncidentsTool = tool({
  description:
    "Get recent avalanche accidents, incidents, and historical reports from Colorado. USE THIS TOOL WHEN ASKED ABOUT PAST INCIDENTS, ACCIDENTS, OR RECENT AVALANCHE HISTORY.",
  parameters: z.object({}),
  execute: async () => {
    console.log("retrieving recent avalanche incidents");
    const params = {
      page: 1,
      per: 5,
      observed_at_gteq: startOfAvalancheYear(),
      observed_at_lteq: new Date(),
      status_eq: "approved",
      type_in: ["incident_report", "accident_report"],
      state_eq: "CO",
      sorts: ["observed_at desc"],
    };

    const reports = await avalancheApiClient.getReports(params);
    return reports.map((report: any) => ({
      id: report.id,
      type: report.type,
      observedAt: report.observed_at,
      location: `${report.area}, ${report.state}`,
      description: report.description || "No description available",
      zone: report.backcountry_zone?.title || "Unknown zone",
      reportDetail: report.public_report_detail
        ? {
            weatherSummary: report.public_report_detail.weather_summary,
            snowpackSummary: report.public_report_detail.snowpack_summary,
            accidentSummary: report.public_report_detail.accident_summary,
            rescueSummary: report.public_report_detail.rescue_summary,
            involvementSummary: report.public_report_detail.involvement_summary,
            activity: report.public_report_detail.activity,
            dangerRating: report.public_report_detail.danger_rating,
          }
        : null,
    }));
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
      "> Ask for: (1) weather forecast (2) avalanche danger forecast or (3) recent avalanche incidents/accidents\n> ",
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
        avalancheDangerForecastTool: getAreaForecastTool,
        recentAvalancheAccidentsTool: getRecentIncidentsTool,
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
