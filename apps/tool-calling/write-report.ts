import { resolve } from "node:path";
import { fetchReport } from "./tools/recentAvalancheAccidentsTool.ts";
import { writeFile } from "node:fs/promises";
import { AvalancheApiClient } from "@ollama-ts/caic-incidents";

const avalancheApiClient = new AvalancheApiClient({ useMock: true });
async function writeReport() {
  const report = await fetchReport(avalancheApiClient);

  await writeFile(resolve(import.meta.dirname, "./report.md"), report);
}

writeReport()
  .catch((e) => console.log(e))
  .finally(() => console.log("all done"));
