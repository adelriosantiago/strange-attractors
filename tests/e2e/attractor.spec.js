const { test, expect } = require("@playwright/test");

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
