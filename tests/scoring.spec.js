const { test, expect } = require('@playwright/test');

test('Test Mode Scoring and Timeout', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('#btnModeTest');
  await page.click('#btnRhStart');
  await page.waitForTimeout(6000);
  const histLen = await page.evaluate(() => ScoreTracker.history.length);
  expect(histLen).toBeGreaterThan(0);
});

test('Custom Progression UI', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('#btnCustomProg');
  await page.fill('#customProgTxt', 'Dm7 G7 CM7 CM7');
  await page.click('#btnCustomApply');
  const prog = await page.evaluate(() => activeProg.map(c => c.label));
  expect(prog).toEqual(['Dm7', 'G7', 'CM7', 'CM7']);
});

test('Mobile Responsiveness Viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:3000');
  const missionBar = await page.locator('#missionBar').boundingBox();
  expect(missionBar).not.toBeNull();
  expect(missionBar.width).toBeGreaterThan(200);
});
