import { getPromptById, insertReportContent } from "./db/repo.ts";
import { openScreenshot } from "@caic/caic-report-screenshot";
import { generateText } from "ai";
import { getModel } from "@caic/ai-sdk-provider";
import type { VisionModels } from "./db/schema.ts";

export type SummarizeFunction = (screenshot: Buffer) => Promise<string>;
export type RateLimiterFunction = () => Promise<void>;

export interface ProcessResult {
  reportId: string;
  success: boolean;
  contentId?: string;
  error?: Error;
}

export interface ProgressInfo {
  total: number;
  completed: number;
  failed: number;
  percentComplete: number;
  currentBatch: number;
  totalBatches: number;
  startTime: number;
  estimatedTimeRemaining?: number;
}

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
 * Process reports in parallel batches with controlled concurrency
 */
export async function processBatch(
  reports: Array<{ reportId: string }>,
  promptId: string,
  summarizeReport: SummarizeFunction,
  options: {
    batchSize: number;
    concurrencyLimit: number;
    rateLimiter?: RateLimiterFunction;
    onProgress?: (progress: ProgressInfo) => void;
  },
) {
  const { batchSize, concurrencyLimit, rateLimiter, onProgress } = options;
  const results: ProcessResult[] = [];
  const startTime = Date.now();
  
  // Progress tracking
  const progress: ProgressInfo = {
    total: reports.length,
    completed: 0,
    failed: 0,
    percentComplete: 0,
    currentBatch: 0,
    totalBatches: Math.ceil(reports.length / batchSize),
    startTime,
  };
  
  // Process in batches
  for (let i = 0; i < reports.length; i += batchSize) {
    progress.currentBatch++;
    const batch = reports.slice(i, i + batchSize);
    console.log(
      `Processing batch ${progress.currentBatch}/${progress.totalBatches} (${batch.length} reports)`,
    );
    
    // Process reports in chunks to properly control concurrency
    for (let j = 0; j < batch.length; j += concurrencyLimit) {
      const chunk = batch.slice(j, j + concurrencyLimit);
      
      // Process each chunk with true parallelism
      const chunkResults = await Promise.all(
        chunk.map(async (report) => {
          // Apply rate limiting if provided
          if (rateLimiter) {
            await rateLimiter();
          }
          
          // Process the report
          try {
            const content = await processReport(
              report.reportId,
              promptId,
              summarizeReport,
            );
            progress.completed++;
            
            // Update progress stats
            const elapsedTime = Date.now() - startTime;
            const reportsPerMs = progress.completed / elapsedTime;
            const remainingReports = progress.total - progress.completed;
            progress.estimatedTimeRemaining =
              remainingReports > 0 ? remainingReports / reportsPerMs : 0;
            progress.percentComplete =
              (progress.completed / progress.total) * 100;
            
            if (onProgress) {
              onProgress(progress);
            }
            
            return {
              reportId: report.reportId,
              success: true,
              contentId: content!.id,
            };
          } catch (error) {
            progress.failed++;
            progress.percentComplete =
              ((progress.completed + progress.failed) / progress.total) * 100;
            
            if (onProgress) {
              onProgress(progress);
            }
            
            return {
              reportId: report.reportId,
              success: false,
              error: error instanceof Error ? error : new Error(String(error)),
            };
          }
        })
      );
      
      results.push(...chunkResults);
    }
  }
  
  return results;
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