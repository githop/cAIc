import { tool } from "ai";
import { z } from "zod";
import {
  AvalancheApiClient,
  startOfAvalancheYear,
} from "@caic/caic-incidents";
import type { IncidentReport } from "@caic/caic-incidents";

/**
 * Type definition for the return value of mapReportData
 */
export interface FormattedAvalancheReport {
  id: string;
  type: string;
  observedAt: string;
  createdAt: string;
  updatedAt: string;
  location: string;
  description: string;
  zone: string;
  reportDetail: {
    weatherSummary: string;
    snowpackSummary: string;
    accidentSummary: string;
    rescueSummary: string;
    involvementSummary: string;
    activity: string | null;
    dangerRating: string;
    leadUpEvents: string;
    avalancheForecast: string;
    comments: string;
  } | null;
  invovlementSummary: {
    buried?: number;
    injured?: number;
    killed?: number;
    caught?: number;
  } | null;
}

/**
 * Maps API report to formatted report data
 */
function mapReportData(report: IncidentReport): FormattedAvalancheReport {
  return {
    id: report.id,
    type: report.type,
    observedAt: report.observed_at,
    createdAt: report.created_at,
    updatedAt: report.updated_at,
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
          leadUpEvents: report.public_report_detail.lead_up_events,
          avalancheForecast:
            report.public_report_detail.backcountry_avalanche_forecast,
          comments: report.public_report_detail.comments,
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
  };
}

/**
 * Converts a FormattedAvalancheReport to a markdown string
 */
export function formatReportToMarkdown(
  report: FormattedAvalancheReport,
): string {
  let markdown = `# Avalanche Report: ${report.location}\n\n`;

  markdown += `**Date:** ${new Date(report.observedAt).toLocaleDateString()}\n`;
  markdown += `**Type:** ${report.type}\n`;
  markdown += `**Zone:** ${report.zone}\n\n`;

  markdown += `## Description\n${report.description}\n\n`;

  if (report.invovlementSummary) {
    markdown += "## Involvement Summary\n";
    if (report.invovlementSummary.caught)
      markdown += `- Caught: ${report.invovlementSummary.caught}\n`;
    if (report.invovlementSummary.buried)
      markdown += `- Buried: ${report.invovlementSummary.buried}\n`;
    if (report.invovlementSummary.injured)
      markdown += `- Injured: ${report.invovlementSummary.injured}\n`;
    if (report.invovlementSummary.killed)
      markdown += `- Killed: ${report.invovlementSummary.killed}\n`;
    markdown += "\n";
  }

  if (report.reportDetail) {
    const detail = report.reportDetail;

    if (detail.activity) markdown += `**Activity:** ${detail.activity}\n`;
    if (detail.dangerRating)
      markdown += `**Danger Rating:** ${detail.dangerRating}\n\n`;

    if (detail.weatherSummary)
      markdown += `## Weather Summary\n${detail.weatherSummary}\n\n`;
    if (detail.snowpackSummary)
      markdown += `## Snowpack Summary\n${detail.snowpackSummary}\n\n`;
    if (detail.accidentSummary)
      markdown += `## Accident Summary\n${detail.accidentSummary}\n\n`;
    if (detail.rescueSummary)
      markdown += `## Rescue Summary\n${detail.rescueSummary}\n\n`;
    if (detail.involvementSummary)
      markdown += `## Involvement Details\n${detail.involvementSummary}\n\n`;
    if (detail.leadUpEvents)
      markdown += `## Lead-up Events\n${detail.leadUpEvents}\n\n`;
    if (detail.avalancheForecast)
      markdown += `## Avalanche Forecast\n${detail.avalancheForecast}\n\n`;
    if (detail.comments)
      markdown += `## Additional Comments\n${detail.comments}\n\n`;
  }

  markdown += `*Report ID: ${report.id} - Last updated: ${new Date(report.updatedAt).toLocaleString()}*`;

  return markdown;
}

// Create instance of the AvalancheApiClient
const avalancheApiClient = new AvalancheApiClient();

export const recentAvalancheAccidentsTool = tool({
  description:
    "Get recent avalanche accidents, incidents, and historical reports from Colorado. USE THIS TOOL WHEN ASKED ABOUT PAST INCIDENTS, ACCIDENTS, OR RECENT AVALANCHE HISTORY.",
  inputSchema: z.object({}),
  execute: async () => {
    console.log("retrieving recent avalanche incidents");
    const report = await fetchReport(avalancheApiClient);
    return report;
  },
});

export async function fetchReport(client: AvalancheApiClient) {
  const params = {
    page: 1,
    per: 250,
    observed_at_gteq: startOfAvalancheYear(),
    observed_at_lteq: new Date(),
    status_eq: "approved",
    type_in: ["incident_report", "accident_report"],
    state_eq: "CO",
    sorts: ["observed_at desc", "created_at desc"],
  };
  const reports = await client.getReports(params);
  const mapped = reports
    //.slice(0, 5)
    .map((raw) => mapReportData(raw))
    .map((formatted) => formatReportToMarkdown(formatted))
    .join("\n");
  //console.log("mapped response", mapped);
  return mapped;
}
