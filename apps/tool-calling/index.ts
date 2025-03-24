import { streamText } from "ai";
import { createInterface } from "node:readline/promises";
import { getModel, OLLAMA_MODELS, GOOGLE_MODELS } from "@ollama-ts/ai-sdk-provider";
import {
  weatherForecastTool,
  avalancheDangerForecastTool,
  recentAvalancheAccidentsTool,
} from "./tools/index.ts";

// Model configuration
const API_KEY_GEMINI = process.env.API_KEY_GEMINI;
const USE_OLLAMA = true; // Toggle between Ollama and Gemini

// Provider configuration
const providerConfig = USE_OLLAMA
  ? {
      type: "ollama" as const,
      name: "gnarlybox-ai",
      baseURL: "http://localhost:11434/v1",
    }
  : {
      type: "gemini" as const,
      apiKey: API_KEY_GEMINI || "",
    };

const modelName = USE_OLLAMA ? OLLAMA_MODELS.LLAMA : GOOGLE_MODELS.GEMINI_FLASH;

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Get the appropriate model using our provider package
const model = getModel(providerConfig, modelName);

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

    // No type assertion needed anymore!
    const { textStream } = streamText({
      model,
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
