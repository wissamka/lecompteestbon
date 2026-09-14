import { mkdirSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
mkdirSync('dist/src', { recursive: true });
for (const file of ['app.js', 'engine.js', 'solver-worker.js', 'styles.css', 'puzzles.json']) copyFileSync(`src/${file}`, `dist/src/${file}`);
for (const file of ['favicon.svg', 'robots.txt']) copyFileSync(`public/${file}`, `dist/${file}`);
const hash = createHash('sha256').update(['app.js','styles.css','engine.js','puzzles.json'].map(f=>readFileSync(`src/${f}`)).join('')).digest('hex').slice(0, 12);
writeFileSync('dist/index.html', readFileSync('index.html','utf8').replaceAll('./src/styles.css', `./src/styles.css?v=${hash}`).replaceAll('./src/app.js', `./src/app.js?v=${hash}`).replace('./public/favicon.svg', './favicon.svg'));
console.log(`Built version ${hash}`);
