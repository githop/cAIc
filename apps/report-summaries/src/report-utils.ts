import { getPromptById, insertReportContent } from "./db/repo.ts";
import { openScreenshot } from "@caic/caic-report-screenshot";
import { generateText } from "ai";
import { getModel } from "@caic/ai-sdk-provider";
import type { VisionModels } from "./db/schema.ts";

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

function buildSummarizer(model: VisionModels, systemPrompt: string) {
  async function summarizeReport(screenshot: Buffer<ArrayBufferLike>) {
    try {
      const { text } = await generateText({
        model: getModel(model),
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: [
              {
                type: "image",
                image: screenshot,
              },
            ],
          },
        ],
      });

      return text;
    } catch (error) {
      console.error("Error taking screenshot:", error);
      throw error;
    }
  }

  return summarizeReport;
}

/**
 * Setup a summarizer with the given prompt ID
 */
export async function setupSummarizer(promptId: string) {
  console.log(`Using prompt ID: ${promptId}`);
  // Get the prompt details
  const prompt = await getPromptById(promptId);
  console.log("model: ", prompt.model);
  console.log(`prompt: "${prompt.text.substring(0, 50)}..."`);

  // Build the summarizer with the specified model and prompt
  const summarizeReport = buildSummarizer(prompt.model, prompt.text);

  return {
    promptData: prompt,
    summarizeReport,
  };
}
