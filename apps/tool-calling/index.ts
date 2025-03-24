import { streamText } from "ai";
import { createInterface } from "node:readline/promises";
import {
  getModel,
  OLLAMA_MODELS,
  GOOGLE_MODELS,
} from "@caic/ai-sdk-provider";
import {
  weatherForecastTool,
  avalancheDangerForecastTool,
  recentAvalancheAccidentsTool,
} from "./tools/index.ts";

const args = process.argv.slice(2);

if (args[0] !== "ollama" && args[0] !== "gemini") {
  throw new Error("use compatible model");
}

const USE_OLLAMA = args[0] === "ollama"; // Toggle between Ollama and Gemini
const modelName = USE_OLLAMA ? OLLAMA_MODELS.LLAMA : GOOGLE_MODELS.GEMINI_FLASH;
console.log("Chat using ", modelName);

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Get the appropriate model using our provider package
const model = getModel(modelName);

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
