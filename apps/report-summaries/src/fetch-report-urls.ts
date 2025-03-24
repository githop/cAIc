import {
  AvalancheApiClient,
  startOfAvalancheYear,
} from "@ollama-ts/caic-incidents";
import type { ReportParams } from "@ollama-ts/caic-incidents";

/**
 * Fetches avalanche incident reports and returns their external canonical report URLs
 * @param limit Optional limit for the number of reports to return (default: 50)
 * @returns Array of external canonical report URLs
 */
export async function fetchReportUrls(): Promise<Map<string, string>> {
  // Create API client
  const client = new AvalancheApiClient();

  const params: ReportParams = {
    page: 1,
    per: 250,
    observed_at_gteq: startOfAvalancheYear(),
    observed_at_lteq: new Date(),
    is_locked_eq: false,
    status_eq: "approved",
    type_in: ["incident_report", "accident_report"],
    state_eq: "CO",
    sorts: ["observed_at desc", "created_at desc"],
  };

  try {
    const reports = await client.getReports(params);

    return new Map(
      reports.map((report) => [
        getReportIdFromUrl(
          report.related_report_links.external_canonical_report,
        ),
        report.related_report_links.external_canonical_report,
      ]),
    );
  } catch (error) {
    console.error("Error fetching reports:", error);
    return new Map();
  }
}

function getReportIdFromUrl(url: string) {
  return url.split("/").pop()!;
}
