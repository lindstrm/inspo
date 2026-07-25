import { chromium } from "playwright";
import fs from "node:fs";

const BASE = "http://localhost:3000";
const OUT = ".impeccable/shots";
fs.mkdirSync(OUT, { recursive: true });

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(BASE);
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("Dev server never came up");
}

const [, , step] = process.argv;

await waitForServer();
const browser = await chromium.launch();

async function shoot(name, { width, height }, action) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto(BASE, { waitUntil: "networkidle" });
  if (action) await action(page);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  await page.close();
  console.log(`${OUT}/${name}.png`);
}

if (step === "empty") {
  await shoot("empty-desktop", { width: 1440, height: 900 });
  await shoot("empty-mobile", { width: 390, height: 844 });
}

if (step === "wall") {
  await shoot("wall-desktop", { width: 1440, height: 900 });
  await shoot("wall-mobile", { width: 390, height: 844 });
}

if (step === "projection") {
  await shoot("projection-desktop", { width: 1440, height: 900 }, async (page) => {
    await page.locator(".mount").first().click();
    await page.waitForTimeout(400);
  });
  await shoot("projection-mobile", { width: 390, height: 844 }, async (page) => {
    await page.locator(".mount").first().click();
    await page.waitForTimeout(400);
  });
}

await browser.close();
