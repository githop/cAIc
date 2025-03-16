import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { createInterface } from "node:readline/promises";
import {
  weatherForecastTool,
  avalancheDangerForecastTool,
  recentAvalancheAccidentsTool,
} from "./tools/index.ts";

const OLLAMA_MODEL = "llama3.2:3b-instruct-fp16" as const;
const GEMINI_MODEL = "gemini-2.0-flash-001" as const;
const API_KEY_GEMINI = process.env.API_KEY_GEMINI;

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Configure Ollama provider (local LLM)
const ollamaProvider = createOpenAICompatible<typeof OLLAMA_MODEL, any, any>({
  name: "gnarlybox-ai",
  baseURL: "http://localhost:11434/v1",
});

// Configure Gemini provider
const geminiProvider = createGoogleGenerativeAI({
  apiKey: API_KEY_GEMINI,
});

const provider = true
  ? ollamaProvider(OLLAMA_MODEL)
  : geminiProvider(GEMINI_MODEL);

try {
  while (true) {
    const prompt = await rl.question(
      `> Ask for: 
      (1) weather forecast
      (2) avalanche danger forecast
      (3) recent avalanche incidents/accidents\n>`,
    );

    if (prompt === "exit") {
      console.log("Bye");
      rl.close();
      break;
    }

    // Use type assertion to allow the Gemini provider to work with streamText
    const { textStream } = streamText({
      model: provider as any,
      prompt,
      maxSteps: 10,
      tools: {
        weatherForecastTool,
        avalancheDangerForecastTool,
        recentAvalancheAccidentsTool,
      },
    });

    for await (const part of textStream) {
      process.stdout.write(part);
    }
    process.stdout.write("\n");
  }
} catch (error) {
  console.error(error);
}
