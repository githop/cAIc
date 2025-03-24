// Model constants for Ollama
export const OLLAMA_MODELS = {
  LLAMA: "llama3.2:3b-instruct-fp16-num_ctx-32k",
  GEMMA: "gemma3:4b-it-fp16-num_ctx-32k",
} as const;

// Model constants for Google
export const GOOGLE_MODELS = {
  GEMINI_FLASH: "gemini-2.0-flash-001",
} as const;

// Types
export type OllamaModelName = typeof OLLAMA_MODELS[keyof typeof OLLAMA_MODELS];
export type GoogleModelName = typeof GOOGLE_MODELS[keyof typeof GOOGLE_MODELS];
export type ModelName = OllamaModelName | GoogleModelName;