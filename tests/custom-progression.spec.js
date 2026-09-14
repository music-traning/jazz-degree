const { test, expect } = require('@playwright/test');

test.describe('Custom Progression & Single Chord Drill', () => {
  test('カスタム進行を入力するとactiveProgに反映される', async ({ page }) => {
    await page.goto('/');
    await page.click('#btnCustomProg');
    await page.evaluate(() => document.getElementById('customProgTxt').value = 'Dm7 G7 CM7 CM7');
    await page.click('#btnCustomApply');
    const prog = await page.evaluate(() => activeProg.map(c => c.label));
    expect(prog).toEqual(['Dm7', 'G7', 'CM7', 'CM7']);
  });

  test('認識できないコードを入力するとエラーになり進行が変わらない', async ({ page }) => {
    await page.goto('/');
    const before = await page.evaluate(() => activeProg.map(c => c.label));
    page.once('dialog', dialog => dialog.accept());
    await page.click('#btnCustomProg');
    await page.evaluate(() => document.getElementById('customProgTxt').value = 'Dm7 Xyz9 CM7');
    await page.click('#btnCustomApply');
    await page.waitForTimeout(200);
    const after = await page.evaluate(() => activeProg.map(c => c.label));
    expect(after).toEqual(before);
  });

  test('単一コード練習をONにすると進行が1コードだけになる', async ({ page }) => {
    await page.goto('/');
    await page.check('#chkSingleDrill');
    await page.selectOption('#selSingleRoot', '7');
    await page.selectOption('#selSingleQual', '7');
    await page.waitForTimeout(200);
    const prog = await page.evaluate(() => activeProg.map(c => c.label));
    expect(prog).toEqual(['G7']);
  });

  test('単一コード練習中もTestモードで採点が機能する', async ({ page }) => {
    await page.goto('/');
    await page.check('#chkSingleDrill');
    await page.click('#btnModeTest');
    await page.click('#btnRhStart');
    await page.waitForTimeout(5000);
    const histLen = await page.evaluate(() => ScoreTracker.history.length);
    expect(histLen).toBeGreaterThan(0);
  });
});

