import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const reports = sqliteTable("reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  reportId: text("report_id").notNull().unique(),
  reportTimestamp: integer("report_timestamp").notNull(),
  url: text("url").notNull(),
});

export const reportContents = sqliteTable("report_contents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  reportId: text("report_id").references(() => reports.reportId),
  markdownContent: text("markdown_content").notNull(),
});

// Insert Schemas
export const insertReportSchema = createInsertSchema(reports, {
  reportId: z.string().uuid(),
  url: z.string().url(),
});
export const insertReportContentSchema = createInsertSchema(reportContents, {
  reportId: z.string().uuid().optional(),
  markdownContent: z.string(),
});

// Export inferred types from schemas
export type InsertReport = z.infer<typeof insertReportSchema>;
export type InsertReportContent = z.infer<typeof insertReportContentSchema>;

// Select Schemas
export const selectReportSchema = createSelectSchema(reports);
export const selectReportContentSchema = createSelectSchema(reportContents);
