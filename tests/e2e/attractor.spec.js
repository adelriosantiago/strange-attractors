const { test, expect } = require("@playwright/test");

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
