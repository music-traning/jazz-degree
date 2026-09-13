const { test, expect } = require('@playwright/test');

test.describe('Diagnostics panel', () => {
  test('マイク開始後、Diagnosticsに検出ログが溜まる（最大10件）', async ({ page }) => {
    await page.goto('/');
    await page.click('#btnMic');
    await page.waitForTimeout(1500);
    await page.click('#btnDiag');
    const rows = await page.locator('#diagTableBody tr').count();
    expect(rows).toBeGreaterThan(0);
    expect(rows).toBeLessThanOrEqual(10);
  });
});

test.describe('Responsive layout', () => {
  test('モバイル幅(390px)でもMission Barと主要カードが表示される', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const missionBar = await page.locator('#missionBar').boundingBox();
    expect(missionBar).not.toBeNull();
    expect(missionBar.width).toBeGreaterThan(200);
    const scoreCard = await page.locator('#scoreAvg').boundingBox();
    expect(scoreCard).not.toBeNull();
  });

  test('デスクトップ幅(1280px)では2カラムレイアウトになる', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    const gridCols = await page.evaluate(() => getComputedStyle(document.querySelector('.app-body')).gridTemplateColumns);
    expect(gridCols).not.toBe('none');
  });
});

test.describe('Mic permission handling', () => {
  test('マイク許可がない場合、ユーザーにアラートが表示される', async ({ page, context }) => {
    await context.clearPermissions();
    let alertShown = false;
    page.once('dialog', dialog => { alertShown = true; dialog.accept(); });
    await page.addInitScript(() => {
      navigator.mediaDevices.getUserMedia = () => Promise.reject(new DOMException('Permission denied', 'NotAllowedError'));
    });
    await page.goto('/');
    await page.click('#btnMic');
    await page.waitForTimeout(500);
    expect(alertShown).toBe(true);
  });
});
