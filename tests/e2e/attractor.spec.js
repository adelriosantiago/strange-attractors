const { test, expect } = require("@playwright/test")
const fs = require("fs")
const path = require("path")

async function waitForNewSaveFile(previousFiles, timeoutMs = 7000) {
  const saveDir = path.join(process.cwd(), "savefiles")
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    if (fs.existsSync(saveDir)) {
      const files = fs.readdirSync(saveDir)
      const created = files.find(
        (name) => name.endsWith(".json") && !previousFiles.has(name)
      )
      if (created) {
        return path.join(saveDir, created)
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 200))
  }

  throw new Error("Timed out waiting for saved attractor file.")
}

test("renders strange attractor scene and controls", async ({ page }) => {
  await page.goto("/")

  await expect(page).toHaveTitle(/Strange Attractors/i)
  await expect(page.locator("#container")).toBeVisible()
  await expect(page.locator("#container canvas")).toHaveCount(1)

  await expect(page.locator("#param-controls .dg.main")).toBeVisible()
  await expect(page.locator("#param-controls .dg.main li.cr")).toHaveCount(6)
})

test("updates GUI controls A, B, C with 1 second intervals", async ({
  page,
}) => {
  await page.goto("/")

  await page.waitForTimeout(1000)
  await page.evaluate(() => {
    window.__attractorGui.__controllers[0].setValue(8.0)
  })

  await page.waitForTimeout(1000)
  await page.evaluate(() => {
    window.__attractorGui.__controllers[1].setValue(40.0)
  })

  await page.waitForTimeout(1000)
  await page.evaluate(() => {
    window.__attractorGui.__controllers[2].setValue(2.5)
  })

  const controllerValues = await page.evaluate(() => {
    return window.__attractorGui.__controllers
      .slice(0, 3)
      .map((controller) => controller.getValue())
  })
  expect(controllerValues[0]).toBe(8.0)
  expect(controllerValues[1]).toBe(40.0)
  expect(controllerValues[2]).toBe(2.5)
})

test("saves current attractor into savefiles", async ({ page }) => {
  await page.goto("/")

  const saveDir = path.join(process.cwd(), "savefiles")
  const previousFiles = new Set(
    fs.existsSync(saveDir) ? fs.readdirSync(saveDir) : []
  )

  const dialogPromise = page.waitForEvent("dialog")
  await page.locator("#save-attractor").click()
  const dialog = await dialogPromise
  expect(dialog.message()).toContain("Saved:")
  await dialog.accept()

  const savedFilePath = await waitForNewSaveFile(previousFiles)
  const savedFileName = path.basename(savedFilePath)

  expect(savedFileName).toMatch(
    /^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}__.+__a-.+_b-.+_c-.+\.json$/
  )

  const data = JSON.parse(fs.readFileSync(savedFilePath, "utf8"))
  expect(data).toHaveProperty("savedAt")
  expect(data).toHaveProperty("attractorName")
  expect(data).toHaveProperty("sliders")
  expect(typeof data.attractorName).toBe("string")
  expect(data.attractorName.length).toBeGreaterThan(0)
  expect(typeof data.sliders.a).toBe("number")
  expect(typeof data.sliders.b).toBe("number")
  expect(typeof data.sliders.c).toBe("number")
})
