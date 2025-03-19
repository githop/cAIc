import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { customAlphabet } from "nanoid";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

export const reports = sqliteTable("reports", {
  id: text("id")
    .$defaultFn(() => newId("report"))
    .primaryKey(),
  reportId: text("report_id").notNull().unique(),
  url: text("url").notNull(),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const reportContents = sqliteTable("report_contents", {
  id: text("id")
    .$defaultFn(() => newId("reportContent"))
    .primaryKey(),
  reportId: text("report_id").references(() => reports.reportId),
  markdownContent: text("markdown_content").notNull(),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
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

export type InsertReport = z.infer<typeof insertReportSchema>;
export type InsertReportContent = z.infer<typeof insertReportContentSchema>;

export const selectReportSchema = createSelectSchema(reports);
export const selectReportContentSchema = createSelectSchema(reportContents);

const nanoid = customAlphabet(
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
);

const prefixes = {
  report: "rep",
  reportContent: "rc",
} as const;
//apps/report-summaries/src/db/schema.ts
export function newId(prefix: keyof typeof prefixes): string {
  return [prefixes[prefix], nanoid(16)].join("_");
}
