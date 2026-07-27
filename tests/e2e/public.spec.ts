import { expect, test } from "@playwright/test";

test.describe("public acquisition journey", () => {
  test("homepage communicates value and routes to the report offer", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        name: "What will buyers challenge before they believe your story?"
      })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /Buyer Objection Report/i }).first()).toBeVisible();
    await page.getByRole("link", { name: /Buyer Objection Report/i }).first().click();
    await expect(page).toHaveURL(/buyer-objection-report/);
  });

  test("sample report exposes the finding structure without fabricated data", async ({ page }) => {
    await page.goto("/sample-report");
    await expect(page.getByRole("heading", { name: /Illustrativer Sample Report/i })).toBeVisible();
    await expect(page.getByText("Buyer interpretation", { exact: true })).toBeVisible();
    await expect(page.getByText(/illustrativ/i).first()).toBeVisible();
  });

  test("security and legal pages are reachable", async ({ page }) => {
    for (const route of ["/security", "/privacy", "/nda", "/imprint"]) {
      const response = await page.goto(route);
      expect(response?.ok()).toBeTruthy();
      await expect(page.locator("main")).toBeVisible();
    }
  });

  test("login provides account recovery and registration", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel("E-Mail")).toBeVisible();
    await expect(page.getByRole("link", { name: /Passwort vergessen/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Account anlegen/i })).toBeVisible();
  });
});
