import { chromium } from "playwright";
import { seedScript } from "./seed.mjs";
const routes = process.argv[2].split(",");
const scenario = process.argv[3] || "none";
const sizes = (process.argv[4] || "desktop").split(",");
const VP = { desktop: [1440, 900], tablet: [820, 1180], mobile: [390, 844] };
const browser = await chromium.launch();
for (const size of sizes) {
  const [w, h] = VP[size];
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(seedScript(), scenario);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log("PAGEERROR", e.message));
  page.on("console", (m) => m.type() === "error" && console.log("CONSOLE", m.text().slice(0, 300)));
  for (const r of routes) {
    await page.goto("http://localhost:8889" + r, { waitUntil: "networkidle" });
    await page.waitForTimeout(700);
    const name = `${size}-${r.replace(/[^a-z]/gi, "_") || "root"}-${scenario}.png`;
    await page.screenshot({ path: name, fullPage: true });
    console.log("saved", name);
  }
  await ctx.close();
}
await browser.close();
