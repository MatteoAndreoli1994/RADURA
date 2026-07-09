import { test, expect } from "@playwright/test";

async function runNavbarHomeCoverRegression(
  page: import("@playwright/test").Page,
  viewport: "desktop" | "mobile",
) {
  await page.goto("/");
  await page.waitForSelector("#home", { timeout: 60_000 });

  if (viewport === "mobile") {
    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("button", { name: "Music" }).click();
  } else {
    const musicNavButton = page.locator('button[data-nav-view="music"]').first();
    await expect(musicNavButton).toBeVisible({ timeout: 15_000 });
    await musicNavButton.click();
  }
  await page.waitForURL(/\/music/);

  const acqueOpenButton = page.getByRole("button", { name: /Apri\s+Acque/i });
  await expect(acqueOpenButton).toBeVisible({ timeout: 30_000 });
  await acqueOpenButton.click();

  await expect(page.getByRole("heading", { name: "Acque" })).toBeVisible({
    timeout: 45_000,
  });

  const ravenLogoButton = page
    .locator("button.about-radura-logo")
    .filter({ visible: true })
    .first();
  await expect(ravenLogoButton).toBeVisible();
  await ravenLogoButton.click();

  await page.waitForURL((url) => url.pathname === "/" || url.pathname === "", { timeout: 60_000 });
  await page.waitForSelector("#home", { timeout: 60_000 });

  const home = page.locator("#home");
  await home.evaluate((el) => {
    const node = el as HTMLElement;
    const cover = node.querySelector("[data-home-cover]");
    const coverHeight = cover instanceof HTMLElement ? cover.offsetHeight : 0;
    const maxTop = Math.max(0, node.scrollHeight - node.clientHeight);
    node.scrollTop = Math.min(Math.max(coverHeight, 800), maxTop);
    node.dispatchEvent(new Event("scroll", { bubbles: true }));
  });

  await page.waitForTimeout(300);

  const lightNavCount = await page.locator("button.about-nav-link--light").count();
  const mobileCoverClass = await page
    .locator("header")
    .first()
    .evaluate((el) => el.className.includes("mobileBlendHeaderCover"));

  if (viewport === "desktop") {
    expect(lightNavCount).toBe(0);
  } else {
    expect(mobileCoverClass).toBe(false);
  }
}

test("desktop navbar updates after Home -> Music -> Album -> Raven -> Home", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await runNavbarHomeCoverRegression(page, "desktop");
});

test("mobile navbar updates after Home -> Music -> Album -> Raven -> Home", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await runNavbarHomeCoverRegression(page, "mobile");
});

