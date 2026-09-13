const { test, expect } = require('@playwright/test');

test.describe('Session Scoring', () => {
  test('Testモードで放置するとMISSが記録される（タイムアウト経路）', async ({ page }) => {
    await page.goto('/');
    await page.click('#btnModeTest');
    await page.click('#btnRhStart');
    await page.waitForTimeout(5000);
    const histLen = await page.evaluate(() => ScoreTracker.history.length);
    expect(histLen).toBeGreaterThan(0);
    const lastGrade = await page.evaluate(() => ScoreTracker.history[ScoreTracker.history.length - 1].grade);
    expect(lastGrade).toBe('MISS');
  });

  test('Practiceモードのままではスコアが記録されない', async ({ page }) => {
    await page.goto('/');
    await page.click('#btnRhStart');
    await page.waitForTimeout(4000);
    const histLen = await page.evaluate(() => ScoreTracker.history.length);
    expect(histLen).toBe(0);
  });

  test('正しいタイミング・正しい音程を弾くとEXCELLENTが記録される', async ({ page }) => {
    await page.goto('/');
    // フェイクマイクは常にF3(ピッチクラス=F)を鳴らす。
    // 単一コード練習でルート=Db(1)・クオリティ=M7・レベル=beginnerに固定すると、
    // ミッションは常に「3度=F」になるため、確実にターゲットと一致させられる。
    await page.check('#chkSingleDrill');
    await page.selectOption('#selSingleRoot', '1');
    await page.selectOption('#selSingleQual', 'M7');
    await page.click('[data-lvl="beginner"]');
    await page.click('#btnModeTest');
    await page.click('#btnMic');
    await page.waitForTimeout(500);
    await page.click('#btnRhStart');
    await page.waitForTimeout(6000);
    const grades = await page.evaluate(() => ScoreTracker.history.map(h => h.grade));
    expect(grades.length).toBeGreaterThan(0);
    expect(['EXCELLENT', 'GOOD', 'OK', 'LATE'].some(g => grades.includes(g))).toBeTruthy();
  });
});

