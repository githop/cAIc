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
