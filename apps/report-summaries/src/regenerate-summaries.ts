import { getAllReports } from "./db/repo.ts";
import { processReport, setupSummarizer } from "./report-utils.ts";

async function regenerateSummaries() {
  // Get the prompt ID from command line arguments or use a default
  const promptId = process.argv[2] || "prmpt_gkeZ75BKG2iXoYnr";
  
  // Setup the summarizer
  const { promptData, summarizeReport } = await setupSummarizer(promptId);

  // Get all existing reports
  const reports = await getAllReports();
  console.log(`Found ${reports.length} reports to process`);

  // Process each report
  for (const report of reports) {
    try {
      await processReport(report.reportId, promptData.id, summarizeReport);
    } catch (error) {
      // Continue with the next report
    }
  }

  console.log("Regeneration complete");
}

regenerateSummaries().catch((e) => console.error("Fatal error:", e));