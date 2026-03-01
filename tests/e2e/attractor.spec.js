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

  await expect(page.locator("#param-controls")).toContainText("Parameters")
  await expect(page.locator("#param-controls input[type='text']")).toHaveCount(
    6
  )
  const paneCount = await page.evaluate(() => window.__attractorPane.count())
  expect(paneCount).toBe(6)
})

test("updates GUI controls A, B, C with 1 second intervals", async ({
  page,
}) => {
  await page.goto("/")

  await page.waitForTimeout(1000)
  await page.evaluate(() => {
    window.__attractorPane.setValue("a", 8.0)
  })

  await page.waitForTimeout(1000)
  await page.evaluate(() => {
    window.__attractorPane.setValue("b", 40.0)
  })

  await page.waitForTimeout(1000)
  await page.evaluate(() => {
    window.__attractorPane.setValue("c", 2.5)
  })

  const paneValues = await page.evaluate(() =>
    window.__attractorPane.getValues()
  )
  expect(paneValues.a).toBe(8.0)
  expect(paneValues.b).toBe(40.0)
  expect(paneValues.c).toBeCloseTo(2.5, 6)
})

test("saves current attractor into savefiles", async ({ page }) => {
  await page.goto("/")

  const saveDir = path.join(process.cwd(), "savefiles")
  const previousFiles = new Set(
    fs.existsSync(saveDir) ? fs.readdirSync(saveDir) : []
  )

  const dialogPromise = page.waitForEvent("dialog")
  await page.locator('#param-controls button', { hasText: 'SAVE' }).click()
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
