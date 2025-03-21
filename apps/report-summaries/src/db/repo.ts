import { db } from "./index.ts";
import { inArray, eq } from "drizzle-orm";
import {
  reports,
  reportContents,
  prompts,
  insertReportSchema,
  insertReportContentSchema,
  insertPromptSchema,
  selectPromptSchema,
} from "./schema.ts";

import type {
  InsertReport,
  InsertReportContent,
  InsertPrompSchema,
} from "./schema.ts";

/**
 * Insert a new report and its associated content
 */
export async function insertReport(
  report: InsertReport,
  content: InsertReportContent,
) {
  try {
    // Validate inputs using schemas
    const validReport = insertReportSchema.parse(report);

    const [reportResult] = await db
      .insert(reports)
      .values(validReport)
      .returning({ id: reports.id, reportId: reports.reportId });

    // Ensure the reportId in content matches the one in report
    const reportContent = {
      ...content,
      reportId: reportResult!.reportId,
    };

    // Validate content data
    const validContent = insertReportContentSchema.parse(reportContent);

    const [contentResult] = await db
      .insert(reportContents)
      .values(validContent)
      .returning({ id: reportContents.id });

    return {
      report: reportResult,
      content: contentResult,
    };
  } catch (error) {
    console.error("Failed to insert report:", error);
    throw error;
  }
}

/**
 * Checks which reportIds from a list don't exist in the database
 * @param reportIds List of report IDs to check
 * @returns Array of reportIds that don't exist in the database
 */
export async function findMissingReportIds(
  reportIds: string[],
): Promise<string[]> {
  try {
    // Find all reports with IDs in the provided list
    const existingReports = await db
      .select({ reportId: reports.reportId })
      .from(reports)
      .where(inArray(reports.reportId, reportIds));

    // Use Set.difference to find missing IDs
    const existingIdsSet = new Set(
      existingReports.map((report) => report.reportId),
    );
    const inputIdsSet = new Set(reportIds);
    const missingIdsSet = inputIdsSet.difference(existingIdsSet);

    return Array.from(missingIdsSet);
  } catch (error) {
    console.error("Failed to check for missing report IDs:", error);
    throw error;
  }
}

/**
 * Insert a prompt into the database
 */
export async function insertPrompt(prompt: InsertPrompSchema) {
  try {
    // Validate input using schema
    const validPrompt = insertPromptSchema.parse(prompt);

    const [result] = await db
      .insert(prompts)
      .values(validPrompt)
      .returning({ id: prompts.id });

    return result;
  } catch (error) {
    console.error("Failed to insert prompt:", error);
    throw error;
  }
}

/**
 * Get a prompt by ID
 */
export async function getPromptById(id: string) {
  try {
    const [result] = await db.select().from(prompts).where(eq(prompts.id, id));

    return selectPromptSchema.parse(result);
  } catch (error) {
    console.error(`Failed to get prompt with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Get all reports from the database
 */
export async function getAllReports() {
  try {
    return await db.select().from(reports);
  } catch (error) {
    console.error("Failed to get all reports:", error);
    throw error;
  }
}
