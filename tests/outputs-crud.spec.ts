import { test, expect } from "@playwright/test";

test("Save generated HTML and open shared page", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Generate" }).click();
  await page.getByRole("button", { name: "Save to DB" }).click();

  await expect(page.getByText(/Saved ✔ \(id:/)).toBeVisible();

  const status = await page.locator("output").innerText();
  const match = status.match(/\/share\/([a-z0-9]+)$/i);
  expect(match).not.toBeNull();
  const id = match![1];

  await page.goto(`/share/${id}`);
  await expect(page.getByText(/Shared Output:/)).toBeVisible();
  const iframe = page.locator("iframe");
  await expect(iframe).toBeVisible();
});
