async page => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const assert = (value, message) => { if (!value) throw new Error(message); };
  await page.setViewportSize({ width: 1365, height: 1000 });
  await page.locator('#lang-en').click();
  const reports = [];
  const values = () => page.locator('[data-tile]').evaluateAll(els => els.map(el => ({ id: el.dataset.tile, value: Number(el.querySelector('span').textContent) })));
  const move = async step => {
    const before = await values();
    const a = before.find(t => t.value === step.a);
    const b = before.find(t => t.value === step.b && t.id !== a.id);
    assert(a && b, 'Suggested move must use available tiles');
    await page.locator('#tile-' + a.id).click();
    await page.locator('[data-op]').filter({ hasText: step.op }).click();
    await page.locator('#tile-' + b.id).click();
    assert(await page.locator('[data-action="confirm"]').isEnabled(), 'Legal move should be enabled');
    await page.locator('[data-action="confirm"]').click();
  };
  for (const grade of [3, 4, 5, 6]) {
    await page.locator('#level-' + grade).click();
    assert(await page.locator('[data-op]:enabled').count() === 4, 'Four available operations');
    const original = await values();
    const solution = await page.evaluate(async g => {
      const { solve, stepsOf, LEVELS } = await import('/src/engine.js');
      const tiles = Array.from(document.querySelectorAll('[data-tile]')).map(el => ({ id: el.dataset.tile, value: Number(el.querySelector('span').textContent) }));
      const target = Number(document.querySelector('.target-number').childNodes[0].textContent);
      return stepsOf(solve(tiles, target, LEVELS.find(l=>l.id===g).cap));
    }, grade);
    await move(solution[0]);
    const progress = await page.locator('.history-list').innerText();
    await page.locator('#lang-fr').click();
    assert(await page.locator('.history-list').innerText() === progress, 'Language switch retains calculations');
    await page.locator('#lang-en').click();
    await page.locator('[data-action="undo"]').click();
    assert(JSON.stringify(await values()) === JSON.stringify(original), 'Undo restores distinct tiles');
    for (const step of solution) await move(step);
    assert(await page.locator('.win').isVisible(), 'Game recognizes exact success');
    assert((await page.locator('.history-list li').count()) === solution.length, 'Full solution history');
    reports.push({ grade, moves: solution.length, success: true });
  }
  await page.locator('.win [data-action="new"]').click();
  await page.locator('[data-action="hint"]').click();
  await page.waitForFunction(() => !!document.querySelector('.hint-message strong'));
  await page.locator('[data-action="hint"]').click();
  assert((await page.locator('.hint-message').innerText()).includes('next move'), 'Second hint gives a move');
  await page.locator('[data-action="hint"]').click();
  assert(await page.locator('.solution li').count() >= 4, 'Full hint solution visible');
  await page.locator('#help').click();
  assert(await page.locator('#rules').isVisible(), 'Rules dialog opens');
  await page.keyboard.press('Escape');
  assert(!(await page.locator('#rules').isVisible()), 'Escape closes rules');
  assert(await page.locator('#help').evaluate(el=>el===document.activeElement), 'Focus returns to help');
  await page.locator('#mode-timed').click();
  await page.locator('[data-action="pause"]').click();
  assert(await page.locator('[data-action="resume"].primary').isVisible(), 'Timer pause is visible');
  await page.locator('[data-action="resume"].primary').click();
  await page.locator('#mode-practice').click();
  for (const width of [390, 320, 768, 1365]) {
    await page.setViewportSize({ width, height: 1000 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No horizontal overflow at ' + width);
    assert(await page.locator('[data-op]:enabled').count() === 4, 'Operations retained at ' + width);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('#lang-fr').click();
  await page.locator('#level-3').click();
  await page.setViewportSize({ width: 1365, height: 1050 });
  await page.screenshot({ path: 'test-results/desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/mobile.png', fullPage: true });
  assert(errors.length === 0, 'No browser exceptions: ' + errors.join('; '));
  return { reports, tested: ['language persistence during play', 'undo identities', 'worker hints', 'dialog keyboard and focus', 'timer pause', '320/390/768/1365 layouts', 'reduced motion'], errors };
}
