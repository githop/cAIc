import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";

const OLLAMA_MODEL = "gemma3:4b-it-fp16-num_ctx-32k" as const;
const ollamaProvider = createOpenAICompatible<typeof OLLAMA_MODEL, any, any>({
  name: "gnarlybox-ai",
  baseURL: "http://localhost:11434/v1",
});

const url =
  "https://avalanche.state.co.us/report/2eb8eeaf-7d99-47eb-893f-ad1cd44f75f8";

const urlShortReport =
  "https://avalanche.state.co.us/report/e1ad97aa-8851-4d4e-8a8c-aa6c64df0d21";

const systemPrompt = `You are an expert at summarizing avalanche reports from images. Your goal is to provide a concise summary of the key details.

**Instructions:**

Extract the following information from the avalanche report image:

* Location and Date
* Number of people involved
* Avalanche type and trigger
* Avalanche classification (R/D)
* Weak layer
* Avalanche dimensions (depth, width, vertical run)
* Outcome (injuries, fatalities, burial depth)
* Any additional notes.

Present the summary in a clear and easy-to-understand format, and nothing else.
`;

export async function summarizeReport(screenshot: Buffer<ArrayBufferLike>) {
  try {
    const { text } = await generateText({
      model: ollamaProvider(OLLAMA_MODEL),
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
