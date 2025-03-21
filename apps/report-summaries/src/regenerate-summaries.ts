import { getAllReports, getPromptById, insertReport } from "./db/repo.ts";
import { openScreenshot } from "@ollama-ts/caic-report-screenshot";
import { buildSummarizer } from "./summarize-report.ts";

async function regenerateSummaries() {
  // Get the prompt ID from command line arguments or use a default
  const promptId = process.argv[2] || "prmpt_gkeZ75BKG2iXoYnr";
  console.log(`Using prompt ID: ${promptId}`);

  // Get the prompt details
  const prompt = await getPromptById(promptId);
  console.log(`Using prompt: "${prompt.text.substring(0, 50)}..."`);

  // Build the summarizer with the specified model and prompt
  const summarizeReport = buildSummarizer(
    "gemma3:4b-it-fp16-num_ctx-32k",
    prompt.text,
  );

  // Get all existing reports
  const reports = await getAllReports();
  console.log(`Found ${reports.length} reports to process`);

  // Process each report
  for (const report of reports) {
    try {
      // Load the screenshot from the file system
      console.log(`Loading screenshot for report ${report.reportId}`);
      const screenshot = await openScreenshot(report.reportId);

      // Generate the summary
      console.log(`Summarizing report ${report.reportId}`);
      const summary = await summarizeReport(screenshot);

      // Insert the new summary (without overwriting the report)
      console.log(`Saving new summary for report ${report.reportId}`);
      const { content } = await insertReport(
        { reportId: report.reportId, url: report.url },
        {
          markdownContent: summary,
          reportId: report.reportId,
          promptId: prompt.id,
        },
      );

      console.log(`Summary ${content!.id} saved for report ${report.reportId}`);
    } catch (error) {
      console.error(`Error processing report ${report.reportId}:`, error);
      // Continue with the next report
    }
  }

  console.log("Regeneration complete");
}

regenerateSummaries().catch((e) => console.error("Fatal error:", e));

