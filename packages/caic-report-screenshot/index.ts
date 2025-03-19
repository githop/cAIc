import { writeFile, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";

export async function takeScreenshot(url: string): Promise<Buffer> {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle" });
    const screenshotBuffer = await page.screenshot({ fullPage: true });
    await browser.close();
    return screenshotBuffer;
  } catch (error) {
    await browser.close();
    throw error;
  }
}

export async function saveScreenshot(
  reportId: string,
  buffer: Buffer<ArrayBufferLike>,
) {
  await writeFile(resolve(`screenshots/${reportId}.png`), buffer);
}

export async function openScreenshot(reportId: string) {
  const file = await readFile(resolve(`screenshots/${reportId}.png`));
  return file;
}
