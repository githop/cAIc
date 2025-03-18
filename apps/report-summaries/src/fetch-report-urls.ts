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
export async function fetchReportUrls(): Promise<string[]> {
  // Create API client
  const client = new AvalancheApiClient({
    useMock: true, // Use mock data in dev environment
  });

  // Define query parameters
  const params: ReportParams = {
    page: 1,
    per: 250,
    observed_at_gteq: startOfAvalancheYear(),
    observed_at_lteq: new Date(),
    is_locked_eq: true,
    status_eq: "approved",
    type_in: ["incident_report", "accident_report"],
    state_eq: "CO",
    sorts: ["observed_at desc", "created_at desc"],
  };

  try {
    // Fetch reports
    const reports = await client.getReports(params);

    // Map to external canonical report URLs
    return reports.map(
      (report) => report.related_report_links.external_canonical_report,
    );
  } catch (error) {
    console.error("Error fetching reports:", error);
    return [];
  }
}
