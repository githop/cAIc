import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const reports = sqliteTable("reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  reportId: text("report_id"),
  reportTimestamp: integer("report_timestamp"),
  region: text("region"),
  url: text("url"),
});

export const reportContents = sqliteTable("report_contents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  reportId: text("report_id").references(() => reports.reportId),
  markdownContent: text("markdown_content"),
});
