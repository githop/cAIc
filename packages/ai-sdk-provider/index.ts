import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { OLLAMA_MODELS, GOOGLE_MODELS, Models } from "./models.ts";
import type { OllamaModelName, GoogleModelName, ModelName } from "./models.ts";
import { loadEnvFile } from "node:process";

loadEnvFile();
// Export model constants and types
export { OLLAMA_MODELS, GOOGLE_MODELS, Models };
export type { OllamaModelName, GoogleModelName, ModelName };

// Provider types
export type OllamaProvider = ReturnType<typeof createOpenAICompatible>;
export type GeminiProvider = ReturnType<typeof createGoogleGenerativeAI>;
export type Provider = OllamaProvider | GeminiProvider;

// Ollama-specific schema
const ollamaConfigSchema = z.object({
  type: z.literal("ollama"),
  name: z.string().default("gnarlybox-ai"),
  baseURL: z.string().default("http://localhost:11434/v1"),
});

// Gemini-specific schema
const geminiConfigSchema = z.object({
  type: z.literal("gemini"),
  apiKey: z.string(),
});

// Provider config union type
export type ProviderConfig =
  | z.infer<typeof ollamaConfigSchema>
  | z.infer<typeof geminiConfigSchema>;

/**
 * Creates an AI provider based on configuration
 */
function createProvider(config: ProviderConfig) {
  if (config.type === "ollama") {
    const { name, baseURL } = ollamaConfigSchema.parse(config);
    return createOpenAICompatible({
      name,
      baseURL,
    });
  } else if (config.type === "gemini") {
    const { apiKey } = geminiConfigSchema.parse(config);
    return createGoogleGenerativeAI({
      apiKey,
    });
  }

  // This should never be reached due to the type checking above
  // Adding this for exhaustiveness checking
  const _exhaustiveCheck: never = config;
  throw new Error(`Unsupported provider type`);
}

function buildProvider(config: ProviderConfig) {
  const provider = createProvider(config);

  function model<TModel extends ModelName>(modelName: TModel) {
    return provider(modelName);
  }

  return model;
}

function isOllamaModel(model: any): model is OllamaModelName {
  return Object.values(OLLAMA_MODELS).includes(model as any);
}

function isGoogleModel(model: any): model is GoogleModelName {
  return Object.values(GOOGLE_MODELS).includes(model as any);
}

export function getModel<TModel extends ModelName>(modelName: TModel) {
  if (isOllamaModel(modelName)) {
    const ollamaProvider = buildProvider({
      type: "ollama",
      name: "gnarlybox-ai",
      baseURL: "http://localhost:11434/v1",
    });
    return ollamaProvider(modelName);
  } else if (isGoogleModel(modelName)) {
    const API_KEY_GEMINI = process.env.API_KEY_GEMINI;
    const geminiProvider = buildProvider({
      type: "gemini",
      apiKey: API_KEY_GEMINI || "",
    });
    return geminiProvider(modelName);
  }

  // This should never be reached due to the type checking above
  // Adding this for exhaustiveness checking
  const _exhaustiveCheck: never = modelName;
  throw new Error(`Unsupported provider type`);
}
