async page => {
  const assert=(v,m)=>{if(!v)throw new Error(m);};
  await page.route('**/src/puzzles.json',async route=>{const response=await route.fetch();const data=await response.json();data[3]=[{id:'test-42',numbers:[3,4,6,8],target:42,minimum:2}];await route.fulfill({json:data});});
  await page.clock.install();
  await page.reload();
  await page.locator('#lang-en').click();await page.locator('#level-3').click();
  await page.locator('#tile-n0').click();await page.locator('#op-3').click();await page.locator('#tile-n1').click();
  assert(await page.locator('[data-action="confirm"]').isDisabled(),'Remainder is blocked');
  assert((await page.locator('.error-message').innerText()).includes('remainder'),'Explained remainder');
  await page.locator('#op-1').click();assert(await page.locator('[data-action="confirm"]').isDisabled(),'Negative blocked');
  await page.locator('#swap').click();assert(await page.locator('[data-action="confirm"]').isEnabled(),'Swap restores legal subtraction');
  await page.locator('[data-action="clear"]').click();
  for(const [a,o,b] of [['n0','2','n1'],['r0','2','n2']]){await page.locator('#tile-'+a).click();await page.locator('#op-'+o).click();await page.locator('#tile-'+b).click();await page.locator('[data-action="confirm"]').click();}
  await page.locator('[data-action="hint"]').click();
  await page.waitForFunction(()=>document.querySelector('.hint-message')?.textContent.includes('no longer reachable'));
  await page.locator('[data-action="restart"]').click();
  await page.locator('#mode-timed').click();await page.clock.fastForward(181000);
  assert(await page.locator('[data-action="continue"]').isVisible(),'Timeout offers continued practice');
  await page.locator('[data-action="continue"]').click();assert(await page.locator('#mode-practice').getAttribute('aria-pressed')==='true','Timer-free continuation');
  for(const [a,o,b] of [['n0','0','n1'],['r0','2','n2']]){await page.locator('#tile-'+a).click();await page.locator('#op-'+o).click();await page.locator('#tile-'+b).click();await page.locator('[data-action="confirm"]').click();}
  assert(await page.locator('.win').isVisible(),'Assisted completion succeeds');
  const stats=await page.evaluate(()=>JSON.parse(localStorage.getItem('lceb:stats')));
  assert(stats[3].assisted>=1,'Assisted classification survives restart');
  await page.locator('#lang-fr').click();
  await page.reload();
  assert(await page.locator('#lang-fr').getAttribute('aria-pressed')==='true','Language persists');
  assert(JSON.stringify(await page.evaluate(()=>JSON.parse(localStorage.getItem('lceb:stats'))))===JSON.stringify(stats),'Progress persists');
  await page.unroute('**/src/puzzles.json');
  return {passed:['invalid division and subtraction','swap','dead-end hints','timeout continuation','assisted credit','language and progress reload']};
}
