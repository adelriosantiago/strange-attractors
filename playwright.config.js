const { defineConfig } = require("@playwright/test")

module.exports = defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:8844",
    headless: false,
  },
  webServer: {
    command: "node index.js",
    port: 8844,
    reuseExistingServer: true,
  },
})
