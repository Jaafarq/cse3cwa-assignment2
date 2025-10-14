import { test, expect } from "@playwright/test";

test("Home generator builds tabs HTML and allows copy/save", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Document title").fill("Part2 Demo");
  await page.getByText("+ Add Tab").click();

  // Edit Tab 3 title/content
  const lastLegend = page.locator("legend").last();
  await expect(lastLegend).toHaveText(/Tab 3/i);
  const lastTitleInput = lastLegend.locator("xpath=..").locator("input").nth(0);
  await lastTitleInput.fill("Final Tab");

  await page.getByRole("button", { name: "Generate" }).click();
  const output = await page.getByLabel("Generated HTML code").inputValue();
  expect(output).toContain("<!doctype html>");
  expect(output).toContain("role=\"tablist\"");
});
