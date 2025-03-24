import { getReportById } from "./db/repo.ts";
import { processReport, setupSummarizer } from "./report-utils.ts";

async function regenerateSummary() {
  // Get the report ID from command line arguments
  const reportId = process.argv[2];
  if (!reportId) {
    console.error("Please provide a report ID as the first argument");
    process.exit(1);
  }

  // Get the prompt ID from command line arguments or use a default
  const promptId = process.argv[3] || process.env.DEFAULT_PROMPT_ID!;

  // Get the report
  const report = await getReportById(reportId);
  if (!report) {
    console.error(`Report with ID ${reportId} not found`);
    process.exit(1);
  }
  console.log(`Found report: ${report.reportId} (${report.url})`);

  // Setup the summarizer
  const { promptData, summarizeReport } = await setupSummarizer(promptId);

  // Process the report
  try {
    await processReport(report.reportId, promptData.id, summarizeReport);
  } catch (error) {
    console.error("Failed to process report:", error);
    process.exit(1);
  }

  console.log("Summary regeneration complete");
}

regenerateSummary().catch((e) => console.error("Fatal error:", e));
