import { getAllReports } from "./db/repo.ts";
import {
  processBatch,
  setupSummarizer,
  type ProgressInfo,
} from "./report-utils.ts";
import { isGoogleModel } from "@caic/ai-sdk-provider";

// Default configuration
const DEFAULT_BATCH_SIZE = 30;
const DEFAULT_CONCURRENCY = 10;
const DEFAULT_REQUESTS_PER_MINUTE = 1999;

// Command line args parsing
function parseCliArgs() {
  const args = process.argv.slice(2);
  const options: {
    promptId?: string;
    batchSize?: number;
    concurrency?: number;
    requestsPerMinute?: number;
  } = {};

  // Parse named arguments (--key=value)
  args.forEach((arg) => {
    if (arg.startsWith("--")) {
      const [key, value] = arg.substring(2).split("=");
      if (key && value) {
        switch (key) {
          case "batch-size":
            options.batchSize = parseInt(value, 10);
            break;
          case "concurrency":
            options.concurrency = parseInt(value, 10);
            break;
          case "requests-per-minute":
            options.requestsPerMinute = parseInt(value, 10);
            break;
          default:
            break;
        }
      }
    } else if (!options.promptId) {
      // First positional argument is the promptId
      options.promptId = arg;
    }
  });

  return {
    promptId: options.promptId || process.env.DEFAULT_PROMPT_ID!,
    batchSize: options.batchSize || DEFAULT_BATCH_SIZE,
    concurrency: options.concurrency || DEFAULT_CONCURRENCY,
    requestsPerMinute: options.requestsPerMinute || DEFAULT_REQUESTS_PER_MINUTE,
  };
}

/**
 * Creates a rate limiter for Gemini API calls
 */
const createRateLimiter = (callsPerMinute: number) => {
  const intervalMs = 60000 / callsPerMinute;
  let lastCallTime = 0;
  let callCount = 0;

  return async function throttle(): Promise<void> {
    const now = Date.now();
    const timeElapsed = now - lastCallTime;

    // Use the fixed interval based on callsPerMinute
    if (timeElapsed < intervalMs) {
      // Wait for the remaining time until we can make the next call
      const delayMs = intervalMs - timeElapsed;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    lastCallTime = Date.now();

    // Track call count for monitoring purposes
    callCount++;
    setTimeout(() => {
      callCount--;
    }, 60000);
  };
};

/**
 * Format time in seconds to a human-readable format
 */
function formatTimeRemaining(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
}

/**
 * Display progress information
 */
function displayProgress(progress: ProgressInfo): void {
  const timeRemaining = progress.estimatedTimeRemaining
    ? formatTimeRemaining(progress.estimatedTimeRemaining)
    : "calculating...";

  process.stdout.write("\r\x1b[K"); // Clear the current line
  process.stdout.write(
    `Progress: ${progress.completed}/${progress.total} complete, ` +
      `${progress.failed} failed (${progress.percentComplete.toFixed(1)}%) - ` +
      `Batch ${progress.currentBatch}/${progress.totalBatches} - ` +
      `Est. remaining: ${timeRemaining}`,
  );
}

async function regenerateSummaries() {
  // Parse command line arguments
  const { promptId, batchSize, concurrency, requestsPerMinute } =
    parseCliArgs();

  console.log(`Configuration:
  - Prompt ID: ${promptId}
  - Batch size: ${batchSize}
  - Concurrency: ${concurrency}
  - Requests per minute: ${requestsPerMinute}
  `);

  // Setup the summarizer
  const { promptData, summarizeReport } = await setupSummarizer(promptId);

  // Get all existing reports
  const reports = await getAllReports();
  console.log(`Found ${reports.length} reports to process`);

  // Create a rate limiter if using Gemini
  const isGeminiModel = isGoogleModel(promptData.model);
  const rateLimiter = isGeminiModel
    ? createRateLimiter(requestsPerMinute)
    : undefined;

  if (isGeminiModel) {
    console.log(
      `Rate limiting enabled: ${requestsPerMinute} requests per minute for Gemini API`,
    );
  }

  // Process reports in parallel batches
  console.log("Starting parallel processing...");
  const startTime = Date.now();

  const results = await processBatch(reports, promptData.id, summarizeReport, {
    batchSize,
    concurrencyLimit: concurrency,
    rateLimiter,
    onProgress: displayProgress,
  });

  const endTime = Date.now();
  const totalTimeMs = endTime - startTime;
  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;

  console.log("\n\nSummary:");
  console.log(`- Total reports processed: ${reports.length}`);
  console.log(`- Successful: ${successCount}`);
  console.log(`- Failed: ${failureCount}`);
  console.log(`- Total processing time: ${formatTimeRemaining(totalTimeMs)}`);
  console.log(
    `- Average time per report: ${formatTimeRemaining(totalTimeMs / reports.length)}`,
  );

  if (failureCount > 0) {
    console.log("\nFailed reports:");
    results
      .filter((r) => !r.success)
      .forEach((r) =>
        console.log(`- Report ${r.reportId}: ${r.error?.message}`),
      );
  }

  console.log("\nRegeneration complete");
  process.exit(0);
}

regenerateSummaries().catch((e) => console.error("Fatal error:", e));
