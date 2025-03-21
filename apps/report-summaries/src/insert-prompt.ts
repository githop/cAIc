import { insertPrompt } from "./db/repo.ts";
import { PromptKindsSchema, MODEL_TYPES } from "./db/schema.ts";
import type { ModelType } from "./db/schema.ts";
import { z } from "zod";

async function main() {
  try {
    // Get command line arguments
    const args = process.argv.slice(2);

    if (args.length !== 3) {
      console.error('Usage: node insert-prompt.ts <kind> <model> "<text>"');
      console.error('Note: The text must be enclosed in quotes');
      process.exit(1);
    }

    const kind = PromptKindsSchema.parse(args[0]);
    const model = z.enum(MODEL_TYPES).parse(args[1]);
    const text = args[2];

    if (!text) {
      console.error('Error: Text argument is required');
      process.exit(1);
    }

    // Model validation is now handled by zod

    console.log(`Inserting prompt of kind "${kind}" for model "${model}" with text: "${text}"`);

    const result = await insertPrompt({
      text,
      model,
      kind,
    });

    console.log("Prompt inserted successfully with ID:", result!.id);
  } catch (error) {
    console.error("Failed to insert prompt:", error);
    process.exit(1);
  }
}

main();
