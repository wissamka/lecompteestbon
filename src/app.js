import { LEVELS, OPS, tilesFor, calculate, applyMove } from './engine.js';

const words = {
  fr: {
    subtitle: 'Un peu de logique. Beaucoup de possibilités.', play: 'À vous de jouer.', lead: 'Combinez les nombres pour atteindre la cible.',
    level: 'Choisissez votre niveau', grades: ['CE2', 'CM1', 'CM2', '6e et +'], subgrades: ['3rd grade', '4th grade', '5th grade', '6th grade +'], levels: ['Les premiers défis', 'On prend confiance', 'Place à la stratégie', 'Pour les esprits affûtés'],
    target: 'LE NOMBRE À TROUVER', exact: 'Une solution existe. À vous de la découvrir.', numbers: 'Vos nombres', choose: 'Choisissez deux nombres et une opération.',
    operations: ['Addition', 'Soustraction', 'Multiplication', 'Division'], confirm: 'Valider', swap: 'Inverser les nombres', clear: 'Effacer la sélection', select: 'Votre calcul apparaît ici',
    undo: 'Annuler', restart: 'Recommencer', new: 'Nouveau tirage', next: 'Prochain défi', hint: 'Un petit indice', hints: ['Un petit indice', 'Voir le premier calcul', 'Voir la solution'],
    path: 'Votre chemin', pathSub: 'Chaque calcul vous rapproche de la cible.', empty: 'Tout commence par une idée.', emptySub: 'Sélectionnez un nombre pour écrire votre premier calcul.', step: 'Étape', result: 'Résultat',
    practice: 'À votre rythme', timed: 'Contre la montre', time: 'Temps restant', pause: 'Pause', resume: 'Reprendre', paused: 'Une petite pause.', pausedSub: 'Le chronomètre vous attend.',
    timeout: 'Le temps est écoulé.', timeoutSub: 'La réflexion continue ! Reprenez tranquillement, sans chronomètre.', continue: 'Continuer sans chrono',
    success: 'Le compte est bon !', successSub: 'Bien joué. Vous avez trouvé votre chemin jusqu’à la cible.', assistedWin: 'Un indice, un déclic, une solution. Bien joué !', solved: 'défis réussis', independent: 'sans indice', assisted: 'avec aide',
    help: 'Comment jouer', soundOn: 'Couper le son', soundOff: 'Activer le son', close: 'Fermer', gotIt: 'C’est parti !', rulesTitle: 'Une cible. Vos idées.',
    rulesIntro: 'Combinez les nombres avec +, −, × et ÷. Réutilisez vos résultats jusqu’à atteindre la cible.',
    rules: ['Chaque tuile ne peut être utilisée qu’une fois. Vous pouvez laisser des nombres de côté.', 'Les résultats doivent être des nombres entiers strictement positifs. Les divisions doivent tomber juste.', 'Vous pouvez annuler un calcul, recommencer ou demander un indice à tout moment.'],
    limit: 'À ce niveau, chaque résultat doit être inférieur ou égal à', example: 'Par exemple, avec 3, 4, 6 et 8, pour trouver 42 :', unused: 'Le 8 peut rester de côté.',
    positive: 'Essayez d’inverser les nombres : le résultat doit être supérieur à zéro.', remainder: 'Cette division ne tombe pas juste. Essayez un autre nombre ou inversez les nombres.', invalid: 'Choisissez deux tuiles différentes.',
    limitError: 'Ce résultat dépasse la limite de ce niveau :', thinking: 'Je cherche une piste…', noPath: 'Avec ces choix, la cible n’est plus accessible. Annulez un calcul ou recommencez pour explorer une autre piste.', workerError: 'La recherche a pris trop de temps. Réessayez, ou annulez un calcul pour explorer une autre piste.',
    strategy: 'Pour la dernière étape, essayez de construire ces deux nombres :', firstMove: 'Une piste pour votre prochain calcul :', solution: 'Un chemin possible', reveal: 'Voir une solution', solutionFromStart: 'Depuis les nombres du départ :',
    noTiles: 'Il reste un nombre. Annulez un calcul pour essayer un autre chemin.', distance: 'Écart avec la cible :',
    footer: 'Les grandes idées commencent par de petits calculs.', local: 'Gratuit · Sans compte · Progression sur cet appareil', privacy: 'Votre progression reste dans ce navigateur. Cloudflare mesure les visites sans cookies de suivi.',
    loadError: 'Le jeu n’a pas pu charger. Vérifiez votre connexion, puis réessayez.', retry: 'Réessayer', selected: 'sélectionné', tile: 'Nombre', mode: 'Mode de jeu', moves: 'calculs', finished: 'Défi terminé',
  },
  en: {
    subtitle: 'A little logic. A world of possibilities.', play: 'Your move.', lead: 'Combine the numbers to reach the target.',
    level: 'Choose your level', grades: ['3rd grade', '4th grade', '5th grade', '6th grade +'], subgrades: ['CE2', 'CM1', 'CM2', '6e et +'], levels: ['Small steps, big ideas', 'Build your confidence', 'Think a few moves ahead', 'A challenge for sharp minds'],
    target: 'THE NUMBER TO FIND', exact: 'There is a solution. Find your own way there.', numbers: 'Your numbers', choose: 'Choose two numbers and an operation.',
    operations: ['Addition', 'Subtraction', 'Multiplication', 'Division'], confirm: 'Confirm', swap: 'Swap the numbers', clear: 'Clear selection', select: 'Your calculation will appear here',
    undo: 'Undo', restart: 'Start over', new: 'New numbers', next: 'Next challenge', hint: 'A little hint', hints: ['A little hint', 'Show the first move', 'Show the solution'],
    path: 'Your path', pathSub: 'Every calculation is a step toward the target.', empty: 'It all starts with an idea.', emptySub: 'Pick a number to begin your first calculation.', step: 'Step', result: 'Result',
    practice: 'At your own pace', timed: 'Against the clock', time: 'Time remaining', pause: 'Pause', resume: 'Resume', paused: 'Take a little break.', pausedSub: 'The clock can wait.',
    timeout: 'Time’s up.', timeoutSub: 'Keep the ideas coming! Carry on at your own pace, without the clock.', continue: 'Continue without a timer',
    success: 'The numbers add up!', successSub: 'Nicely done. You found your own way to the target.', assistedWin: 'A hint, an idea, a solution. Nicely done!', solved: 'challenges solved', independent: 'without hints', assisted: 'with help',
    help: 'How to play', soundOn: 'Turn sound off', soundOff: 'Turn sound on', close: 'Close', gotIt: 'Let’s play!', rulesTitle: 'One target. Your ideas.',
    rulesIntro: 'Combine the numbers using +, −, × and ÷. Reuse your results until you reach the target.',
    rules: ['Each tile can be used once. You don’t have to use every number.', 'Results must be positive whole numbers. Division must have no remainder.', 'Undo a calculation, start over or ask for a hint whenever you like.'],
    limit: 'At this level, each result must be at most', example: 'For example, with 3, 4, 6 and 8, to reach 42:', unused: 'You can leave the 8 unused.',
    positive: 'Try swapping the numbers: the result must be greater than zero.', remainder: 'This division has a remainder. Try another number or swap the numbers.', invalid: 'Choose two different tiles.',
    limitError: 'That result exceeds this level’s limit:', thinking: 'Looking for a way forward…', noPath: 'The target is no longer reachable with these choices. Undo a calculation or start over to try another path.', workerError: 'The search took too long. Try again, or undo a calculation to explore another path.',
    strategy: 'For your final move, try building these two numbers:', firstMove: 'One idea for your next move:', solution: 'One possible path', reveal: 'See a solution', solutionFromStart: 'From the starting numbers:',
    noTiles: 'One number left. Undo a calculation to try another path.', distance: 'Distance from the target:',
    footer: 'Big ideas start with small calculations.', local: 'Free · No account · Progress on this device', privacy: 'Your progress stays in this browser. Cloudflare measures visits without tracking cookies.',
    loadError: 'The game couldn’t load. Check your connection and try again.', retry: 'Try again', selected: 'selected', tile: 'Number', mode: 'Game mode', moves: 'moves', finished: 'Challenge complete',
  },
};
const icons = {
 check: '<path d="m5 12 4 4L19 6"/>', arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>', undo: '<path d="m8 5-5 5 5 5M3 10h10a6 6 0 0 1 0 12"/>',
 restart: '<path d="M4 9a8 8 0 1 1 0 6m0-12v6h6"/>', bulb: '<path d="M9 18h6m-5 3h4M8 14a6 6 0 1 1 8 0l-1 2H9z"/>', help: '<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4m0 3v.1"/>',
 sound: '<path d="m3 9 4 0 5-5v16l-5-5H3zM16 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>', mute: '<path d="m3 9 4 0 5-5v16l-5-5H3zM16 9l6 6m0-6-6 6"/>',
 swap: '<path d="M4 7h16m-4-4 4 4-4 4M20 17H4m4-4-4 4 4 4"/>', x: '<path d="m6 6 12 12M6 18 18 6"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>', star: '<path d="m12 3 2.8 5.6L21 9.5 16.5 14l1 6.2-5.5-3-5.5 3 1-6.2L3 9.5l6.2-.9z"/>',
};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${icons[name] || icons.check}</svg>`;
const app = document.querySelector('#app');
const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(`lceb:${key}`)) ?? fallback; } catch { return fallback; } };
const save = (key, value) => { try { localStorage.setItem(`lceb:${key}`, JSON.stringify(value)); } catch {} };
let lang = read('lang', 'fr') === 'en' ? 'en' : 'fr';
let levelId = [3,4,5,6].includes(read('level', 3)) ? read('level', 3) : 3;
let sound = read('sound', false) === true;
let stats = read('stats', {}); if (!stats || typeof stats !== 'object' || Array.isArray(stats)) stats = {};
let recent = read('recent', {}); if (!recent || typeof recent !== 'object' || Array.isArray(recent)) recent = {};
let pools, puzzle, tiles = [], history = [], chosen = [], op = null, serial = 0, won = false, recorded = false, helped = false;
let hintStage = 0, hintInfo = null, searching = false, solver, requestId = 0, requestTimer;
let timed = false, remaining = 180, paused = false, expired = false, lastTick = performance.now();
const text = () => words[lang], level = () => LEVELS.find(l => l.id === levelId);
const actionButton = (action, label, cls = '', symbol = '', disabled = false) => `<button type="button" data-action="${action}" class="${cls}" ${disabled ? 'disabled' : ''}>${symbol ? icon(symbol) : ''}${label}</button>`;
const equation = s => `${s.a} ${s.op} ${s.b} = ${s.value}`;
const count = name => { const n = stats[levelId]?.[name]; return Number.isSafeInteger(n) && n >= 0 && n < 1000000 ? n : 0; };
function cancelSearch() { requestId++; clearTimeout(requestTimer); solver?.terminate(); solver = null; searching = false; }
function startRound() {
  cancelSearch();
  const last = Array.isArray(recent[levelId]) ? recent[levelId].filter(x => typeof x === 'string').slice(-24) : [];
  let available = pools[levelId].filter(p => !last.includes(p.id));
  if (!available.length) available = pools[levelId];
  puzzle = available[Math.floor(Math.random() * available.length)];
  recent[levelId] = [...last, puzzle.id].slice(-24); save('recent', recent);
  tiles = tilesFor(puzzle.numbers); history = []; chosen = []; op = null; serial = 0; won = false; recorded = false; helped = false;
  hintStage = 0; hintInfo = null; remaining = level().seconds; paused = false; expired = false; lastTick = performance.now(); render();
}
function errorText(error) { const t = text(); return error === 'limit' ? `${t.limitError} ${level().cap}.` : t[error] || t.invalid; }
function preview() {
  const a = tiles.find(t => t.id === chosen[0]), b = tiles.find(t => t.id === chosen[1]);
  if (!a || !b || !op) return null;
  return { a: a.value, b: b.value, op, ...calculate(a.value, op, b.value, level().cap) };
}
function hintMarkup() {
  const t = text();
  if (searching) return `<div class="hint-message" role="status">${icon('bulb')}<p>${t.thinking}</p></div>`;
  if (!hintInfo) return '';
  if (hintInfo.error) return `<div class="hint-message" role="status"><p>${t.workerError}</p></div>`;
  if (!hintInfo.steps) return `<div class="hint-message" role="status"><p>${t.noPath}</p></div>`;
  const steps = hintInfo.steps;
  if (!steps.length) return '';
  if (hintInfo.full || hintStage >= 3) return `<div class="hint-message solution" role="status"><strong>${t.solution}</strong>${hintInfo.full ? `<p>${t.solutionFromStart}</p>` : ''}<ol>${steps.map(s=>`<li>${equation(s)}</li>`).join('')}</ol></div>`;
  if (hintStage === 1) { const last = steps.at(-1); return `<div class="hint-message" role="status"><p>${t.strategy}<br><strong>${last.a} <span class="hint-and">&</span> ${last.b}</strong></p></div>`; }
  return `<div class="hint-message" role="status"><p>${t.firstMove}<br><strong>${equation(steps[0])}</strong></p></div>`;
}
function render(focusId) {
  const t = text(), p = preview(), locked = won || paused || expired;
  document.documentElement.lang = lang;
  document.title = `Le Compte est Bon — ${t.play}`;
  const a = tiles.find(v=>v.id===chosen[0]), b = tiles.find(v=>v.id===chosen[1]);
  app.innerHTML = `
    <header class="site-header"><a href="./" class="brand" aria-label="Le Compte est Bon"><span class="brand-mark">${icon('check')}</span><span>le compte<span class="brand-bottom">est bon<span class="brand-dot">.</span></span></span></a>
      <div class="header-actions"><div class="language" aria-label="Language / Langue"><button id="lang-fr" data-lang="fr" aria-label="Français" aria-pressed="${lang==='fr'}">FR<span class="sr-only">ançais</span></button><button id="lang-en" data-lang="en" aria-label="English" aria-pressed="${lang==='en'}">EN<span class="sr-only">glish</span></button></div>
      <button id="sound" data-action="sound" class="icon-button" aria-label="${sound?t.soundOn:t.soundOff}" title="${sound?t.soundOn:t.soundOff}">${icon(sound?'sound':'mute')}</button>
      <button id="help" data-action="help" class="help-button">${icon('help')}<span>${t.help}</span></button></div></header>
    <main><section class="intro"><div><p class="eyebrow">+ &nbsp; − &nbsp; × &nbsp; ÷ <span>${t.subtitle}</span></p><h1>${t.play}</h1><p class="lead">${t.lead}</p></div><div class="intro-decoration" aria-hidden="true"><span>+</span><span>×</span><span>=</span></div></section>
    <section class="level-section" aria-labelledby="level-heading"><div class="section-line"><h2 id="level-heading">${t.level}</h2><span>01 — 04</span></div><div class="levels">${LEVELS.map((l,i)=>`<button id="level-${l.id}" class="level-card ${l.id===levelId?'active':''}" data-level="${l.id}" aria-pressed="${l.id===levelId}"><div class="level-card-top"><span class="level-dots" aria-hidden="true">${[0,1,2,3].map(n=>`<i class="${n<=i?'filled':''}"></i>`).join('')}</span>${l.id===levelId?icon('check'):''}</div><strong>${t.grades[i]}</strong><span>${t.levels[i]}</span></button>`).join('')}</div></section>
    <div class="game-layout"><section class="game-board" aria-label="${t.numbers}"><div class="board-top"><span class="small-label">${t.grades[levelId-3]} <span class="dot">·</span> ${puzzle.numbers.length} ${lang==='fr'?'nombres':'numbers'}</span><div class="mode-switch" aria-label="${t.mode}"><button id="mode-practice" data-mode="practice" aria-pressed="${!timed}">${t.practice}</button><button id="mode-timed" data-mode="timed" aria-pressed="${timed}">${icon('clock')}<span>${t.timed}</span></button></div></div>
      <div class="target"><p>${t.target}</p><div class="target-number">${puzzle.target}<span class="target-orbit" aria-hidden="true">✦</span></div><span>${t.exact}</span></div>
      ${timed?`<div class="timer-row"><span id="timer" role="timer" aria-label="${t.time}">${formatTime()}</span>${actionButton(paused?'resume':'pause',paused?t.resume:t.pause,'text-button','',won||expired)}</div>`:''}
      <div class="number-heading"><h2>${t.numbers}</h2><span>${t.choose}</span></div>
      <div class="number-tiles" aria-label="${t.numbers}">${tiles.map(tile=>`<button id="tile-${tile.id}" data-tile="${tile.id}" class="number-tile ${tile.id.startsWith('r')?'result-tile':''} ${chosen.includes(tile.id)?'selected':''}" aria-label="${t.tile} ${tile.value}${tile.id.startsWith('r')?`, ${t.result}`:''}" aria-pressed="${chosen.includes(tile.id)}" ${locked?'disabled':''}><span>${tile.value}</span>${chosen.includes(tile.id)?`<i aria-hidden="true">${chosen.indexOf(tile.id)+1}</i>`:''}</button>`).join('')}</div>
      <div class="operations">${OPS.map((o,i)=>`<button id="op-${i}" data-op="${o}" aria-label="${t.operations[i]}" aria-pressed="${op===o}" class="operation ${op===o?'selected':''}">${o}</button>`).join('')}</div>
      <div class="calculation ${p?.error?'has-error':''}"><div class="equation" aria-live="polite">${a||b||op?`<span>${a?.value??'?'}</span><span class="equation-op">${op??'?'}</span><span>${b?.value??'?'}</span><span class="equation-equal">=</span><strong>${p&&!p.error?p.value:'?'}</strong>`:`<span class="equation-placeholder">${t.select}</span>`}</div><div class="calc-actions"><button id="swap" data-action="swap" class="icon-button" title="${t.swap}" aria-label="${t.swap}" ${chosen.length<2||locked?'disabled':''}>${icon('swap')}</button>${actionButton('confirm',t.confirm,'confirm-button','check',!p||!!p.error||locked)}</div></div>
      ${p?.error?`<p class="error-message" role="status">${errorText(p.error)}</p>`:''}
      <div class="board-actions">${actionButton('undo',t.undo,'text-button','undo',!history.length||paused||expired)}${actionButton('restart',t.restart,'text-button','restart',!history.length||paused)}${chosen.length||op?actionButton('clear',t.clear,'text-button clear-button'):''}</div>
      <div class="board-bottom"><span>${icon('check')}${lang==='fr'?'Les quatre opérations, à chaque niveau.':'All four operations, at every level.'}</span>${actionButton('new',won?t.next:t.new,'new-button','arrow')}</div>
      ${won?`<div class="game-overlay win" role="status"><div class="win-badge">${icon('check')}</div><span class="eyebrow">${t.finished}</span><h2>${t.success}</h2><p>${helped?t.assistedWin:t.successSub}</p><div class="win-equation">${history.length} ${t.moves} <span>→</span> ${puzzle.target}</div>${actionButton('new',t.next,'primary','arrow')}${actionButton('reveal',t.reveal,'text-button')}</div>`:''}
      ${paused||expired?`<div class="game-overlay"><div class="win-badge">${icon('clock')}</div><h2>${expired?t.timeout:t.paused}</h2><p>${expired?t.timeoutSub:t.pausedSub}</p>${actionButton(expired?'continue':'resume',expired?t.continue:t.resume,'primary','arrow')}</div>`:''}
    </section>
    <aside class="sidebar"><section class="history-card"><div class="history-title"><div><h2>${t.path}</h2><p>${t.pathSub}</p></div><span class="history-count">${history.length.toString().padStart(2,'0')}</span></div>${history.length?`<ol class="history-list">${history.map((h,i)=>`<li><span class="step-index">${i+1}</span><span>${h.step.a} <i>${h.step.op}</i> ${h.step.b} <i>=</i> <strong>${h.step.value}</strong></span></li>`).join('')}</ol>`:`<div class="history-empty"><div class="empty-art" aria-hidden="true"><span>3</span><span>+</span><span>7</span><svg viewBox="0 0 140 50"><path d="M20 10 Q70 70 120 10"/><path d="m107 14 13-4-2 13"/></svg></div><strong>${t.empty}</strong><p>${t.emptySub}</p></div>`}
    ${tiles.length===1&&!won?`<p class="no-path">${t.noTiles} ${t.distance} ${Math.abs(tiles[0].value-puzzle.target)}.</p>`:''}
    <div class="hint-area">${actionButton('hint',t.hints[Math.min(hintStage,2)],'hint-button','bulb',searching||won||paused||expired)}${hintMarkup()}</div></section>
    <section class="progress-card"><span class="progress-star">${icon('star')}</span><div><strong>${count('independent')+count('assisted')}</strong><span>${t.solved}</span><small>${count('independent')} ${t.independent} <span>·</span> ${count('assisted')} ${t.assisted}</small></div></section><p class="privacy-note">${t.privacy}</p></aside></div>
    <footer><span>${t.footer}</span><span>${t.local}</span></footer></main>
    <dialog id="rules"><div class="dialog-top"><span class="brand-mark">${icon('check')}</span><button data-action="close" class="icon-button" aria-label="${t.close}">${icon('x')}</button></div><p class="eyebrow">LE COMPTE EST BON</p><h2>${t.rulesTitle}</h2><p>${t.rulesIntro}</p><ol class="rules-list">${t.rules.map(r=>`<li>${r}</li>`).join('')}</ol><p class="rule-limit">${t.limit} <strong>${level().cap}</strong>.</p><div class="example"><p>${t.example}</p><strong>3 + 4 = 7<br>7 × 6 = 42</strong><small>${t.unused}</small></div>${actionButton('close',t.gotIt,'primary','arrow')}</dialog>
    <div id="announcement" class="sr-only" role="status" aria-live="polite"></div>`;
  if (focusId) document.getElementById(focusId)?.focus({ preventScroll: true });
}
function announce(message) { const el = document.querySelector('#announcement'); if (el) el.textContent = message; }
function chime() {
  if (!sound) return;
  try { const ctx = new AudioContext(); [523.25,659.25,783.99].forEach((f,i)=>{ const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=f;g.gain.setValueAtTime(0,ctx.currentTime);g.gain.linearRampToValueAtTime(.07,ctx.currentTime+i*.12+.01);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+i*.12+.35);o.connect(g).connect(ctx.destination);o.start(ctx.currentTime+i*.12);o.stop(ctx.currentTime+i*.12+.4);});setTimeout(()=>ctx.close(),1000); } catch {}
}
function confirm() {
  if (won||paused||expired) return;
  const result = applyMove(tiles,chosen[0],op,chosen[1],level().cap,`r${serial++}`);
  if (result.error) return;
  cancelSearch(); history.push({ before: tiles, step: result.step }); tiles=result.tiles; chosen=[];op=null;hintStage=0;hintInfo=null;
  won=tiles.some(t=>t.value===puzzle.target);
  if(won&&!recorded) { const name=helped?'assisted':'independent';stats[levelId]={independent:count('independent'),assisted:count('assisted'),[name]:count(name)+1};save('stats',stats);recorded=true;chime(); }
  render(); announce(`${equation(result.step)}. ${won?text().success:''}`);
  document.querySelector(won?'[data-action="new"].primary':'.number-tile')?.focus({preventScroll:true});
}
function requestHint(full=false) {
  if(searching||paused||expired) return;
  helped=true;
  if(!full&&hintInfo?.steps) {hintStage=Math.min(3,hintStage+1);render();return;}
  cancelSearch();searching=true;hintStage=full?3:1;hintInfo=null;
  const id=++requestId; render();
  try {
    solver=new Worker(new URL('./solver-worker.js',import.meta.url),{type:'module'});
    const fail=()=>{ if(id!==requestId)return;cancelSearch();hintInfo={error:true};render(); };
    solver.onerror=fail;
    solver.onmessage=({data})=>{if(data.id!==requestId)return;clearTimeout(requestTimer);solver.terminate();solver=null;searching=false;hintInfo={steps:data.steps,error:data.error,full};render();};
    solver.postMessage({id,tiles:full?tilesFor(puzzle.numbers):tiles,target:puzzle.target,cap:level().cap});
    requestTimer=setTimeout(fail,8000);
  } catch {searching=false;hintInfo={error:true};render();}
}
function formatTime(){const n=Math.max(0,Math.ceil(remaining));return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`;}
app.addEventListener('click', event=>{
  const button=event.target.closest('button');if(!button||button.disabled||!pools)return;
  if(button.dataset.lang){lang=button.dataset.lang;save('lang',lang);render(`lang-${lang}`);return;}
  if(button.dataset.level){levelId=Number(button.dataset.level);save('level',levelId);startRound();document.getElementById(`level-${levelId}`).focus();return;}
  if(button.dataset.mode){timed=button.dataset.mode==='timed';remaining=level().seconds;paused=false;expired=false;lastTick=performance.now();render(button.id);return;}
  if(button.dataset.tile&&!won&&!paused&&!expired){const id=button.dataset.tile;if(chosen.includes(id))chosen=chosen.filter(x=>x!==id);else if(chosen.length<2)chosen.push(id);else chosen=[chosen[0],id];render(button.id);return;}
  if(button.dataset.op){op=button.dataset.op;render(button.id);return;}
  const action=button.dataset.action;
  if(action==='confirm')confirm();
  if(action==='swap'){chosen.reverse();render('swap');}
  if(action==='clear'){chosen=[];op=null;render();}
  if(action==='undo'&&history.length){cancelSearch();tiles=history.pop().before;chosen=[];op=null;won=false;hintInfo=null;hintStage=0;render();}
  if(action==='restart'){cancelSearch();serial=0;tiles=tilesFor(puzzle.numbers);history=[];chosen=[];op=null;won=false;hintInfo=null;hintStage=0;remaining=level().seconds;expired=false;lastTick=performance.now();render();}
  if(action==='new')startRound();
  if(action==='hint')requestHint();
  if(action==='reveal')requestHint(true);
  if(action==='sound'){sound=!sound;save('sound',sound);if(sound)chime();render('sound');}
  if(action==='pause'){paused=true;render();}
  if(action==='resume'){paused=false;lastTick=performance.now();render();}
  if(action==='continue'){timed=false;expired=false;paused=false;render();}
  if(action==='help'){document.querySelector('#rules').showModal();}
  if(action==='close'){document.querySelector('#rules').close();document.querySelector('#help').focus();lastTick=performance.now();}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&timed&&!won&&!expired){paused=true;render();}lastTick=performance.now();});
setInterval(()=>{const now=performance.now(),delta=(now-lastTick)/1000;lastTick=now;if(!puzzle||!timed||paused||expired||won||document.hidden||document.querySelector('#rules')?.open)return;remaining=Math.max(0,remaining-delta);const timer=document.querySelector('#timer');if(timer)timer.textContent=formatTime();if(remaining<=0){expired=true;render();}},200);
async function boot(){
  try {const response=await fetch(new URL('./puzzles.json',import.meta.url));if(!response.ok)throw new Error();pools=await response.json();startRound();}
  catch {app.innerHTML=`<div class="load-error"><h1>Le Compte est Bon</h1><p>${text().loadError}</p><button class="primary" id="retry">${text().retry}</button></div>`;document.querySelector('#retry').onclick=boot;}
}
boot();
