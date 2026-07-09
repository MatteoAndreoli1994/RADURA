import { defineConfig } from "@playwright/test";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;
const useExternalServer = Boolean(process.env.PLAYWRIGHT_BASE_URL);

export default defineConfig({
  testDir: "./tests",
  timeout: 90_000,
  retries: 1,
  use: {
    baseURL,
    trace: "off",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  ...(useExternalServer
    ? {}
    : {
        webServer: {
          command: `npm run dev -- -p ${PORT}`,
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
      }),
});

