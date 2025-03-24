import { tool } from 'ai';
import { z } from 'zod';
import { CaicClient, fetchAvalancheSummary } from '@caic/caic';

const caicClient = new CaicClient();

export const avalancheDangerForecastTool = tool({
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
