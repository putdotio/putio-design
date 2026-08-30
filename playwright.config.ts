import { defineConfig, devices } from "@playwright/test";

const portValue = process.env.PUTIO_DESIGN_PLAYWRIGHT_PORT ?? "4173";
const port = Number(portValue);
if (!/^\d+$/.test(portValue) || !Number.isSafeInteger(port) || port < 1 || port > 65_535) {
  throw new Error("PUTIO_DESIGN_PLAYWRIGHT_PORT must be an integer between 1 and 65535");
}
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "test-results/playwright",
  fullyParallel: true,
  // Keep the full-guide axe scans from competing with the icon catalog scans.
  workers: 2,
  retries: process.env.CI ? 1 : 0,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  reporter: [["list"], ["html", { outputFolder: "test-results/playwright-report", open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "pnpm dev",
    env: { PORT: String(port) },
    url: `${baseURL}/tokens.css`,
    reuseExistingServer: !process.env.CI,
    timeout: 15_000,
  },
  projects: [
    {
      name: "chromium-desktop",
      grep: /@desktop/,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "chromium-tv",
      grep: /@tv/,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1920, height: 1080 } },
    },
  ],
});
