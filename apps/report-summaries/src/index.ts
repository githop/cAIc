import { findMissingReportIds } from "./db/repo.ts";
import { fetchReportUrls } from "./fetch-report-urls.ts";

async function check() {
  const urls = await fetchReportUrls();

  const ids = await findMissingReportIds(
    urls.map((u) => getReportIdFromUrl(u)),
  );
  console.log("missing", ids);
}

function getReportIdFromUrl(url: string) {
  return url.split("/").pop()!;
}

check().catch((e) => console.log(e));
