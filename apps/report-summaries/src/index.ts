import { findMissingReportIds, insertReport } from "./db/repo.ts";
import {
  takeScreenshot,
  saveScreenshot,
} from "@ollama-ts/caic-report-screenshot";
import { fetchReportUrls } from "./fetch-report-urls.ts";
import { summarizeReport } from "./summarize-report.ts";

async function checkAndSaveNewReports() {
  console.log("fetching reports");
  const urls = await fetchReportUrls();
  console.log(urls.size, " total reports");
  const ids = await findMissingReportIds(Array.from(urls.keys()));
  console.log(ids.length, " new reports available");

  for (const id of ids) {
    const url = urls.get(id)!;
    console.log("screentshotting", url);
    //const screenshot = await takeScreenshot(url);
    //await saveScreenshot(id, screenshot);
    console.log("summarizing report");
    //const summary = await summarizeReport(screenshot);
    console.log("saving report");
    await insertReport(
      { reportId: id, url },
      { markdownContent: "# here we go" },
    );
    console.log("report saved");
  }
}

checkAndSaveNewReports().catch((e) => console.log(e));
