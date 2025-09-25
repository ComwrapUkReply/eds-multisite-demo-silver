// Minimal test file for universal editor using global Playwright functions

// Basic smoke test
test('Basic page load test', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
});

test('Navigation elements test', async ({ page }) => {
  await page.goto('/');
  const navElements = page.locator('nav, header, footer');
  await expect(navElements.first()).toBeVisible();
});

test('Content blocks test', async ({ page }) => {
  await page.goto('/');
  const contentBlocks = page.locator('main, article, section, .block');
  await expect(contentBlocks.first()).toBeVisible({ timeout: 5000 });
});
