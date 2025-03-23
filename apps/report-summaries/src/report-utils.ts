import { getPromptById, insertReport, insertReportContent } from "./db/repo.ts";
import { openScreenshot } from "@ollama-ts/caic-report-screenshot";
import { buildSummarizer } from "./summarize-report.ts";

export type SummarizeFunction = (screenshot: Buffer) => Promise<string>;

/**
 * Process a report to generate and save a summary
 */
export async function processReport(
  reportId: string,
  promptId: string,
  summarizeReport: SummarizeFunction,
) {
  try {
    // Load the screenshot from the file system
    console.log(`Loading screenshot for report ${reportId}`);
    const screenshot = await openScreenshot(reportId);

    // Generate the summary
    console.log(`Summarizing report ${reportId}`);
    const summary = await summarizeReport(screenshot);

    // Insert the new summary (without overwriting the report)
    console.log(`Saving new summary for report ${reportId}`);
    const content = await insertReportContent({
      markdownContent: summary,
      reportId,
      promptId,
    });

    console.log(`Summary ${content!.id} saved for report ${reportId}`);
    return content;
  } catch (error) {
    console.error(`Error processing report ${reportId}:`, error);
    throw error;
  }
}

/**
 * Setup a summarizer with the given prompt ID
 */
export async function setupSummarizer(promptId: string) {
  console.log(`Using prompt ID: ${promptId}`);

  // Get the prompt details
  const prompt = await getPromptById(promptId);
  console.log(`Using prompt: "${prompt.text.substring(0, 50)}..."`);

  // Build the summarizer with the specified model and prompt
  const summarizeReport = buildSummarizer(
    "gemma3:4b-it-fp16-num_ctx-32k",
    prompt.text,
  );

  return {
    promptData: prompt,
    summarizeReport,
  };
}

