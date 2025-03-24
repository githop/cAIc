# @caic/ai-sdk-provider

A simple provider factory for AI SDK that supports both local LLM providers (Ollama) and cloud providers (Gemini).

## Usage

### Basic usage with model constants

```typescript
import { getModel, Models } from "@caic/ai-sdk-provider";
import { streamText } from "ai";

// Get Ollama model using predefined constants
const model = getModel(Models.LLAMA);

// Use with streamText
const { textStream } = await streamText({
  model,
  prompt: "Tell me about the weather",
});

// Process the stream
for await (const chunk of textStream) {
  process.stdout.write(chunk);
}
```

### Creating custom providers

```typescript
import { createProvider } from "@caic/ai-sdk-provider";
import { streamText } from "ai";

// Create Ollama provider with custom configuration
const ollamaConfig = {
  type: "ollama",
  baseURL: "http://localhost:11434/v1",
  name: "your-app-name",
};

// Build provider and get model
const ollamaProvider = createProvider(ollamaConfig);
const model = ollamaProvider("llama3.2:3b-instruct-fp16-num_ctx-32k");

// Use with streamText
const { textStream } = await streamText({
  model,
  prompt: "Tell me about the weather",
});
```

### Using with Gemini

```typescript
import { getModel, Models } from "@caic/ai-sdk-provider";
import { generateText } from "ai";

// Get Gemini model (requires API_KEY_GEMINI environment variable)
const model = getModel(Models.GEMINI_FLASH);

const { text } = await generateText({
  model,
  messages: [{ role: "user", content: "Tell me about the weather" }],
});

console.log(text);
```

### Available Models

```typescript
// Import model constants
import { OLLAMA_MODELS, GOOGLE_MODELS, Models } from "@caic/ai-sdk-provider";

// Ollama models
console.log(OLLAMA_MODELS.LLAMA); // "llama3.2:3b-instruct-fp16-num_ctx-32k"
console.log(OLLAMA_MODELS.GEMMA); // "gemma3:4b-it-fp16-num_ctx-32k"

// Google models
console.log(GOOGLE_MODELS.GEMINI_FLASH); // "gemini-2.0-flash-001"

// Combined models object
console.log(Models.LLAMA); // "llama3.2:3b-instruct-fp16-num_ctx-32k"
console.log(Models.GEMINI_FLASH); // "gemini-2.0-flash-001"
```

