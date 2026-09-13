const { test, expect } = require('@playwright/test');

test.describe('Reset behaviors', () => {
  test('Resetボタンは現在のプロファイルのスコア履歴だけを消す', async ({ page }) => {
    await page.goto('/');
    await page.click('#btnModeTest');
    await page.click('#btnRhStart');
    await page.waitForTimeout(5000);
    const before = await page.evaluate(() => ScoreTracker.history.length);
    expect(before).toBeGreaterThan(0);

    // 強制的にフルスクリーンを解除
    await page.evaluate(() => { if (document.fullscreenElement) document.exitFullscreen(); });
    await page.waitForTimeout(500);

    await page.click('#btnResetSettings');
    const after = await page.evaluate(() => ScoreTracker.history.length);
    expect(after).toBe(0);

    const bpm = await page.evaluate(() => App.bpm);
    expect(bpm).toBe(120);
  });

  test('Factory Resetは確認ダイアログを出し、承諾するとlocalStorageを消してリロードする', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => App.setBpm(200));
    await page.waitForTimeout(200);
    page.once('dialog', dialog => dialog.accept());
    await page.click('#btnFactoryReset');
    await page.waitForLoadState('load');
    await page.waitForTimeout(300);
    const bpm = await page.evaluate(() => App.bpm);
    expect(bpm).toBe(120);
  });

  test('Factory Resetのダイアログをキャンセルすると何も変わらない', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => App.setBpm(200));
    page.once('dialog', dialog => dialog.dismiss());
    await page.click('#btnFactoryReset');
    await page.waitForTimeout(300);
    const bpm = await page.evaluate(() => App.bpm);
    expect(bpm).toBe(200);
  });
});
