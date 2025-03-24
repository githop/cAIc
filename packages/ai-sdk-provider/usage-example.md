# Usage Examples for @caic/ai-sdk-provider

## Before Refactoring

Current implementation in app:

```typescript
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
```

## After Refactoring

After implementing the package, the code simplifies to:

```typescript
import { getModel } from '@caic/ai-sdk-provider';
import { streamText } from 'ai';

// Environment variables or config 
const USE_OLLAMA = true;
const OLLAMA_MODEL = 'llama3.2:3b-instruct-fp16-num_ctx-32k';
const GEMINI_MODEL = 'gemini-2.0-flash-001';
const API_KEY_GEMINI = process.env.API_KEY_GEMINI;

// Get model based on configuration (provider-specific schema)
const model = getModel(
  USE_OLLAMA 
    ? { type: 'ollama' } // Minimal config - defaults will be applied
    : { 
        type: 'gemini', 
        apiKey: API_KEY_GEMINI // Required for Gemini
      },
  USE_OLLAMA ? OLLAMA_MODEL : GEMINI_MODEL
);

// Use with streamText - no type assertions needed
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
```

## In Image Processing App

```typescript
import { getModel } from '@caic/ai-sdk-provider';
import { generateText } from 'ai';

// Get configured model
const model = getModel(
  { type: 'ollama' }, // Defaults will be applied (gnarlybox-ai name and localhost URL)
  'gemma3:4b-it-fp16-num_ctx-32k'
);

// Use with generateText for image processing
const { text } = await generateText({
  model,
  messages: [
    {
      role: 'system',
      content: systemPrompt,
    },
    {
      role: 'user',
      content: [
        {
          type: 'image',
          image: screenshot,
        },
      ],
    },
  ],
});
```