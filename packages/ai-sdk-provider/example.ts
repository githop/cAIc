import { getModel, OLLAMA_MODELS, GOOGLE_MODELS } from "./index.js";
import { streamText, generateText } from "ai";

async function exampleWithOllama() {
  // Get model with Ollama config - only needs type, other values have defaults
  const model = getModel(
    {
      type: "ollama",
      // Optional: override defaults if needed
      name: "my-app",
      baseURL: "http://localhost:11434/v1",
    },
    OLLAMA_MODELS.LLAMA,
  );

  // Use with streamText
  const { textStream } = await streamText({
    model,
    prompt: "What is the weather like today?",
    maxSteps: 10,
    tools: {
      // your tools here
    },
  });

  for await (const part of textStream) {
    process.stdout.write(part);
  }
}

async function exampleWithGemini() {
  const API_KEY = process.env.API_KEY_GEMINI;

  if (!API_KEY) {
    throw new Error("Missing Gemini API key");
  }

  // Get model with Gemini config - only needs type and apiKey
  const model = getModel(
    {
      type: "gemini",
      apiKey: API_KEY,
    },
    GOOGLE_MODELS.GEMINI_FLASH,
  );

  // Use with generateText
  const { text } = await generateText({
    model,
    messages: [{ role: "user", content: "What is the weather like today?" }],
  });

  console.log(text);
}

// Choose which example to run
exampleWithOllama().catch(console.error);
// exampleWithGemini().catch(console.error);

