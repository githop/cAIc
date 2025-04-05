import { getAllReports } from "./db/repo.ts";
import { processReport, setupSummarizer } from "./report-utils.ts";
import { isGoogleModel } from "@caic/ai-sdk-provider";

async function regenerateSummaries() {
  // Get the prompt ID from command line arguments or use a default
  const promptId = process.argv[2] || process.env.DEFAULT_PROMPT_ID!;

  // Setup the summarizer
  const { promptData, summarizeReport } = await setupSummarizer(promptId);

  // Get all existing reports
  const reports = await getAllReports();
  console.log(`Found ${reports.length} reports to process`);

  // Create a rate limiter if using Gemini
  const isGeminiModel = isGoogleModel(promptData.model);
  const requestsPerMiniute = 1999;
  const rateLimiter = isGeminiModel
    ? createGeminiRateLimiter(requestsPerMiniute)
    : null;

  if (isGeminiModel) {
    console.log(
      `Rate limiting enabled: ${requestsPerMiniute} requests per minute for Gemini API`,
    );
  }

  // Process each report
  for (const report of reports) {
    try {
      if (rateLimiter) {
        await rateLimiter();
      }
      await processReport(report.reportId, promptData.id, summarizeReport);
    } catch (error) {
      console.error(`Error processing report ${report.reportId}:`, error);
      // Continue with the next report
    }
  }

  console.log("Regeneration complete");
}

/**
 * Creates a rate limiter for Gemini API calls
 * @param callsPerMinute Maximum number of calls per minute
 */
function createGeminiRateLimiter(callsPerMinute: number) {
  const intervalMs = 60000 / callsPerMinute;
  let lastCallTime = 0;

  return async () => {
    const now = Date.now();
    const timeElapsed = now - lastCallTime;

    if (timeElapsed < intervalMs) {
      // Wait for the remaining time until we can make the next call
      const delayMs = intervalMs - timeElapsed;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    lastCallTime = Date.now();
  };
}

regenerateSummaries().catch((e) => console.error("Fatal error:", e));
