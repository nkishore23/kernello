
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const URL = "https://kernello-alpha.vercel.app/";
const ROOT = path.join(__dirname, "KERNELLO-VIDEOS");

const devices = [
  {
    name: "laptop",
    width: 1366,
    height: 768
  },
  {
    name: "tablet",
    width: 1024,
    height: 768
  },
  {
    name: "mobile",
    width: 390,
    height: 844
  }
];

const styles = ["slow", "natural"];

const wait = ms =>
  new Promise(resolve => setTimeout(resolve, ms));

async function scrollSlow(page) {
  const height = await page.evaluate(
    () => document.documentElement.scrollHeight
  );

  const viewport = page.viewportSize().height;
  let current = 0;

  while (current < height - viewport) {
    current = Math.min(current + 120, height - viewport);

    await page.evaluate(y => {
      window.scrollTo({
        top: y,
        behavior: "smooth"
      });
    }, current);

    await wait(250);
  }

  await wait(2500);
}

async function scrollNatural(page) {
  const height = await page.evaluate(
    () => document.documentElement.scrollHeight
  );

  const viewport = page.viewportSize().height;
  let current = 0;
  const step = Math.round(viewport * 0.65);

  while (current < height - viewport) {
    current = Math.min(current + step, height - viewport);

    await page.evaluate(y => {
      window.scrollTo({
        top: y,
        behavior: "smooth"
      });
    }, current);

    await wait(1100);
  }

  await wait(2500);
}

async function hoverHeaderLinks(page) {
  try {
    const links = await page.locator("header a").all();

    for (const link of links.slice(0, 5)) {
      try {
        await link.hover({ timeout: 1500 });
        await wait(500);
      } catch (_) {}
    }
  } catch (_) {}
}

async function record(browser, device, style) {
  const folder = path.join(ROOT, device.name);

  fs.mkdirSync(folder, { recursive: true });

  const tempFolder = path.join(folder, "temp");
  fs.mkdirSync(tempFolder, { recursive: true });

  console.log(
    `\nStarting ${device.name} - ${style}`
  );

  const context = await browser.newContext({
    viewport: {
      width: device.width,
      height: device.height
    },
    screen: {
      width: device.width,
      height: device.height
    },
    deviceScaleFactor: 1,
    isMobile: device.name === "mobile",
    hasTouch: device.name !== "laptop",
    reducedMotion: "no-preference",
    recordVideo: {
      dir: tempFolder,
      size: {
        width: device.width,
        height: device.height
      }
    }
  });

  const page = await context.newPage();

  try {
    // Start recording before the website loads.
    await page.goto(URL, {
      waitUntil: "domcontentloaded",
      timeout: 90000
    });

    // Capture the initial loader and entrance animation.
    console.log("Capturing loader...");
    await wait(8000);

    // Give the page additional time to finish loading.
    try {
      await page.waitForLoadState("load", {
        timeout: 20000
      });
    } catch (_) {}

    await wait(3000);

    // Allow lazy-loaded images and fonts to settle.
    await page.evaluate(async () => {
      if (document.fonts) {
        await Promise.race([
          document.fonts.ready,
          new Promise(resolve => setTimeout(resolve, 5000))
        ]);
      }
    });

    await wait(1500);

    console.log("Capturing navigation hover effects...");
    await hoverHeaderLinks(page);

    // Return to the beginning.
    await page.evaluate(() => {
      window.scrollTo({
        top: 0,
        behavior: "instant"
      });
    });

    await wait(1500);

    console.log(`Starting ${style} scrolling...`);

    if (style === "slow") {
      await scrollSlow(page);
    } else {
      await scrollNatural(page);
    }

    // Keep the footer visible.
    await wait(3000);

    console.log("Recording completed.");

  } catch (error) {
    console.error("Recording error:", error.message);
  }

  const video = page.video();
  const webmPath = await video.path();

  // Close context to finalize the video.
  await context.close();

  const baseName = `${device.name}-${style}`;
  const mp4Path = path.join(folder, `${baseName}.mp4`);

  console.log("Converting video to MP4...");

  const conversion = spawnSync("ffmpeg", [
    "-y",
    "-i", webmPath,
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-crf", "25",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    mp4Path
  ], {
    stdio: "inherit"
  });

  if (conversion.status !== 0) {
    throw new Error("FFmpeg conversion failed.");
  }

  fs.rmSync(tempFolder, {
    recursive: true,
    force: true
  });

  console.log(`Saved: ${mp4Path}`);
}

(async () => {
  fs.mkdirSync(ROOT, { recursive: true });

  const browser = await chromium.launch({
    headless: true
  });

  try {
    for (const device of devices) {
      for (const style of styles) {
        await record(browser, device, style);
      }
    }
  } finally {
    await browser.close();
  }

  console.log("\nALL SIX VIDEOS COMPLETED!");
  console.log(`Output: ${ROOT}`);
})();
