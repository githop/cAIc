import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";

const OLLAMA_MODEL = "gemma3:4b-it-fp16-num_ctx-32k" as const;
const ollamaProvider = createOpenAICompatible<typeof OLLAMA_MODEL, any, any>({
  name: "gnarlybox-ai",
  baseURL: "http://localhost:11434/v1",
});

export function buildSummarizer(
  model: typeof OLLAMA_MODEL,
  systemPrompt: string,
) {
  async function summarizeReport(screenshot: Buffer<ArrayBufferLike>) {
    try {
      const { text } = await generateText({
        model: ollamaProvider(model),
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
