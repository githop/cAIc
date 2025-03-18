import { takeScreenshot } from "@ollama-ts/caic-report-screenshot";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";

const OLLAMA_MODEL = "gemma3:4b-it-fp16-num_ctx-32k" as const;
const ollamaProvider = createOpenAICompatible<typeof OLLAMA_MODEL, any, any>({
  name: "gnarlybox-ai",
  baseURL: "http://localhost:11434/v1",
});

const url =
  "https://avalanche.state.co.us/report/2eb8eeaf-7d99-47eb-893f-ad1cd44f75f8";

const urlShortReport =
  "https://avalanche.state.co.us/report/e1ad97aa-8851-4d4e-8a8c-aa6c64df0d21";

const systemPrompt = `You are an expert at summarizing avalanche reports from images. Your goal is to provide a concise summary of the key details.

**Instructions:**

Extract the following information from the avalanche report image:

* Location and Date
* Number of people involved
* Avalanche type and trigger
* Avalanche classification (R/D)
* Weak layer
* Avalanche dimensions (depth, width, vertical run)
* Outcome (injuries, fatalities, burial depth)
* Any additional notes.

Present the summary in a clear and easy-to-understand format, and nothing else.
`;

const working = `
You are an expert at summarizing avalanche reports. Your goal is to provide a concise yet informative summary of the key details of each report. Please extract and synthesize the following information:

* **Location and Date:** Where and when did the avalanche occur?
* **Involved Parties:** How many people were caught or involved in the avalanche?
* **Avalanche Type and Trigger:** What type of avalanche was it (e.g., Persistent Slab, Wind Slab), and what triggered it (e.g., snowmobiler, skier, natural)?
* **Avalanche Classification:** What was the size and destructive potential of the avalanche (R/D scale)?
* **Weak Layer:** What was the weak layer that contributed to the avalanche?
* **Avalanche Dimensions:** What were the approximate depth, width, and vertical run of the avalanche?
* **Outcome:** Were there any injuries or fatalities? What was the burial depth, if applicable?
* **Additional Notes:** Include any other significant details or observations mentioned in the report.

Present the summary in a clear and easy-to-understand format, and nothing else.
`;

async function main(url: string) {
  try {
    const screenshot = await takeScreenshot(url);
    const { text } = await generateText({
      model: ollamaProvider(OLLAMA_MODEL),
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: [
            {
              type: "image",
              image: screenshot,
            },
          ],
        },
      ],
    });

    return text;
  } catch (error) {
    console.error("Error taking screenshot:", error);
  }
}

main(urlShortReport)
  .then((text) => console.log(text))
  .catch((e) => console.error(e))
  .finally(() => console.log("Done"));
