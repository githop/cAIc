import { tool } from 'ai';
import { z } from 'zod';
import { AvalancheApiClient, startOfAvalancheYear } from '@ollama-ts/clients';

// Create instance of the AvalancheApiClient
const avalancheApiClient = new AvalancheApiClient();

export const recentAvalancheAccidentsTool = tool({
  description:
    "Get recent avalanche accidents, incidents, and historical reports from Colorado. USE THIS TOOL WHEN ASKED ABOUT PAST INCIDENTS, ACCIDENTS, OR RECENT AVALANCHE HISTORY.",
  parameters: z.object({}),
  execute: async () => {
    console.log("retrieving recent avalanche incidents");
    const params = {
      page: 1,
      per: 250,
      observed_at_gteq: startOfAvalancheYear(),
      observed_at_lteq: new Date(),
      status_eq: "approved",
      type_in: ["incident_report", "accident_report"],
      state_eq: "CO",
      sorts: ["observed_at desc"],
    };

    const reports = await avalancheApiClient.getReports(params);
    console.log(reports);
    return reports.map((report) => ({
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
      invovlementSummary: report.involvement_summary
        ? {
            buried: report.involvement_summary.buried,
            injured: report.involvement_summary.injured,
            killed: report.involvement_summary.killed,
            caught: report.involvement_summary.caught,
          }
        : null,
    }));
  },
});
