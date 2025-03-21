import { sqliteTable, text } from "drizzle-orm/sqlite-core";
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
  createdAt: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export const reportContents = sqliteTable("report_contents", {
  id: text("id")
    .$defaultFn(() => newId("reportContent"))
    .primaryKey(),
  reportId: text("report_id")
    .references(() => reports.reportId)
    .notNull(),
  promptId: text("prompt_id")
    .references(() => prompts.id)
    .notNull(),
  markdownContent: text("markdown_content").notNull(),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const PromptKinds = {
  SYSTEM: "system",
  USER: "user",
  ASSISTANT: "assistant",
} as const;

export const PromptKindsSchema = z.enum([
  PromptKinds.SYSTEM,
  PromptKinds.USER,
  PromptKinds.ASSISTANT,
]);

export const prompts = sqliteTable("prompts", {
  id: text("id")
    .$defaultFn(() => newId("prompt"))
    .primaryKey(),
  text: text("text").notNull(),
  model: text("model").notNull(),
  kind: text("kind", {
    enum: [PromptKinds.SYSTEM, PromptKinds.USER, PromptKinds.ASSISTANT],
  }).notNull(),
});

export const OLLAMA_MODEL = "gemma3:4b-it-fp16-num_ctx-32k" as const;
export const GEMINI_MODEL = "gemini-2.0-flash-001" as const;
export const MODEL_TYPES = [OLLAMA_MODEL, GEMINI_MODEL] as const;
export type ModelType = (typeof MODEL_TYPES)[number];

// Schemas
export const insertReportSchema = createInsertSchema(reports, {
  url: z.string().url(),
});
export const insertReportContentSchema = createInsertSchema(reportContents);
export const insertPromptSchema = createInsertSchema(prompts).extend({
  model: z.enum(MODEL_TYPES),
});
export const selectPromptSchema = createSelectSchema(prompts).extend({
  model: z.enum(MODEL_TYPES),
});

// Types
export type InsertReport = z.infer<typeof insertReportSchema>;
export type InsertReportContent = z.infer<typeof insertReportContentSchema>;
export type InsertPrompSchema = z.infer<typeof insertPromptSchema>;
export type SelectPromptSchema = z.infer<typeof selectPromptSchema>;

const nanoid = customAlphabet(
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
);

const prefixes = {
  report: "rep",
  reportContent: "rc",
  prompt: "prmpt",
} as const;

export function newId(prefix: keyof typeof prefixes): string {
  return [prefixes[prefix], nanoid(16)].join("_");
}
