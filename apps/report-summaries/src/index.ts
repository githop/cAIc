import { findMissingReportIds, insertReport } from "./db/repo.ts";
import {
  takeScreenshot,
  saveScreenshot,
} from "@ollama-ts/caic-report-screenshot";
import { fetchReportUrls } from "./fetch-report-urls.ts";
import { setupSummarizer } from "./report-utils.ts";
import { loadEnvFile } from "node:process";

loadEnvFile();

async function checkAndSaveNewReports() {
  const { promptData: prompt, summarizeReport } = await setupSummarizer(
    process.env.DEFAULT_PROMPT_ID!,
  );
  console.log("fetching reports");
  const urls = await fetchReportUrls();
  console.log(urls.size, " total reports");
  const ids = await findMissingReportIds(Array.from(urls.keys()));
  console.log(ids.length, " new reports available");

  for (const id of ids) {
    const url = urls.get(id)!;
    console.log("screentshotting", url);
    const screenshot = await takeScreenshot(url);
    await saveScreenshot(id, screenshot);
    console.log("summarizing report");
    const summary = await summarizeReport(screenshot);
    console.log("saving report");
    const { report } = await insertReport(
      { reportId: id, url },
      { markdownContent: summary, reportId: id, promptId: prompt.id },
    );
    console.log(`report ${report!.id} saved`);
  }
}

checkAndSaveNewReports().catch((e) => console.log(e));
