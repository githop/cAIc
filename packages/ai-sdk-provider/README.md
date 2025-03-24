# @ollama-ts/ai-sdk-provider

A simple provider factory for AI SDK that supports both local LLM providers (Ollama) and cloud providers (Gemini).

## Installation

```bash
npm install @ollama-ts/ai-sdk-provider
```

## Usage

### Basic usage

```typescript
import { createProvider, getModel } from '@ollama-ts/ai-sdk-provider';
import { streamText } from 'ai';

// Create Ollama provider
const ollamaConfig = {
  type: 'ollama',
  baseURL: 'http://localhost:11434/v1',
  name: 'your-app-name'
};

const ollamaProvider = createProvider(ollamaConfig);
const model = ollamaProvider('llama3.2:3b-instruct-fp16-num_ctx-32k');

// Use with streamText
const { textStream } = await streamText({
  model,
  prompt: 'Tell me about the weather',
  tools: {
    // your tools here
  }
});

// Or use the convenient helper
const model = getModel(
  { type: 'ollama' }, 
  'llama3.2:3b-instruct-fp16-num_ctx-32k'
);
```

### Using with Gemini

```typescript
import { getModel } from '@ollama-ts/ai-sdk-provider';
import { generateText } from 'ai';

// Create and use Gemini provider
const model = getModel(
  { 
    type: 'gemini',
    apiKey: process.env.API_KEY_GEMINI
  },
  'gemini-2.0-flash-001'
);

const { text } = await generateText({
  model,
  messages: [
    { role: 'user', content: 'Tell me about the weather' }
  ]
});
```