import { generateText } from "ai";
import { getModel } from "@ollama-ts/ai-sdk-provider";
import type { OllamaModelName } from "@ollama-ts/ai-sdk-provider";

const ollamaConfig = {
  type: "ollama" as const,
  name: "gnarlybox-ai",
  baseURL: "http://localhost:11434/v1",
};

export function buildSummarizer(model: OllamaModelName, systemPrompt: string) {
  async function summarizeReport(screenshot: Buffer<ArrayBufferLike>) {
    try {
      const { text } = await generateText({
        model: getModel(ollamaConfig, model),
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
