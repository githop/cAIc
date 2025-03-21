import {
  findMissingReportIds,
  getPromptById,
  insertReport,
} from "./db/repo.ts";
import {
  takeScreenshot,
  saveScreenshot,
} from "@ollama-ts/caic-report-screenshot";
import { fetchReportUrls } from "./fetch-report-urls.ts";
import { buildSummarizer } from "./summarize-report.ts";

async function checkAndSaveNewReports() {
  const prompt = await getPromptById("prmpt_gkeZ75BKG2iXoYnr");
  const summarizeReport = buildSummarizer(
    "gemma3:4b-it-fp16-num_ctx-32k",
    prompt.text,
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
