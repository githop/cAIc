import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import {
  OLLAMA_MODELS,
  GOOGLE_MODELS,
} from "./models.ts";
import type {
  OllamaModelName,
  GoogleModelName,
  ModelName,
} from "./models.ts";

// Export model constants and types
export {
  OLLAMA_MODELS,
  GOOGLE_MODELS,
};
export type {
  OllamaModelName,
  GoogleModelName,
  ModelName,
};

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
export function createProvider(config: ProviderConfig) {
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

/**
 * Helper to get a configured model instance
 */
export function getModel<TModel extends string>(
  config: ProviderConfig,
  model: TModel,
) {
  const provider = createProvider(config);
  return provider(model);
}

// Export underlying libraries for advanced use cases
export { createOpenAICompatible, createGoogleGenerativeAI };

