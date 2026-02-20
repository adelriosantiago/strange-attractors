const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

async function dragSlider(page, locator, ratio) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error("Slider not visible for drag interaction");
  }

  const y = box.y + box.height / 2;
  const startX = box.x + 2;
  const endX = box.x + box.width * ratio;

  await page.mouse.move(startX, y);
  await page.mouse.down();
  await page.mouse.move(endX, y, { steps: 15 });
  await page.mouse.up();
}

async function waitForNewSaveFile(previousFiles, timeoutMs = 7000) {
  const saveDir = path.join(process.cwd(), "savefiles");
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (fs.existsSync(saveDir)) {
      const files = fs.readdirSync(saveDir);
      const created = files.find(
        (name) => name.endsWith(".json") && !previousFiles.has(name)
      );
      if (created) {
        return path.join(saveDir, created);
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  throw new Error("Timed out waiting for saved attractor file.");
}

test("renders strange attractor scene and controls", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Strange Attractors/i);
  await expect(page.locator("#container")).toBeVisible();
  await expect(page.locator("#container canvas")).toHaveCount(1);

  const sliders = page.locator("input[type='range']");
  await expect(sliders).toHaveCount(3);
  await expect(page.locator("input[name='a']")).toBeVisible();
  await expect(page.locator("input[name='b']")).toBeVisible();
  await expect(page.locator("input[name='c']")).toBeVisible();
});

test("drags sliders A, B, C with 1 second intervals", async ({ page }) => {
  await page.goto("/");

  const sliderA = page.locator("input[name='a']");
  const sliderB = page.locator("input[name='b']");
  const sliderC = page.locator("input[name='c']");

  await expect(sliderA).toBeVisible();
  await expect(sliderB).toBeVisible();
  await expect(sliderC).toBeVisible();

  await page.waitForTimeout(1000);
  await dragSlider(page, sliderA, 0.2);

  await page.waitForTimeout(1000);
  await dragSlider(page, sliderB, 0.8);

  await page.waitForTimeout(1000);
  await dragSlider(page, sliderC, 0.5);
});

test("saves current attractor into savefiles", async ({ page }) => {
  await page.goto("/");

  const saveDir = path.join(process.cwd(), "savefiles");
  const previousFiles = new Set(
    fs.existsSync(saveDir) ? fs.readdirSync(saveDir) : []
  );

  const dialogPromise = page.waitForEvent("dialog");
  await page.locator("#save-attractor").click();
  const dialog = await dialogPromise;
  expect(dialog.message()).toContain("Saved:");
  await dialog.accept();

  const savedFilePath = await waitForNewSaveFile(previousFiles);
  const savedFileName = path.basename(savedFilePath);

  expect(savedFileName).toMatch(
    /^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}__.+__a-.+_b-.+_c-.+\.json$/
  );

  const data = JSON.parse(fs.readFileSync(savedFilePath, "utf8"));
  expect(data).toHaveProperty("savedAt");
  expect(data).toHaveProperty("attractorName");
  expect(data).toHaveProperty("sliders");
  expect(typeof data.attractorName).toBe("string");
  expect(data.attractorName.length).toBeGreaterThan(0);
  expect(typeof data.sliders.a).toBe("number");
  expect(typeof data.sliders.b).toBe("number");
  expect(typeof data.sliders.c).toBe("number");
});
