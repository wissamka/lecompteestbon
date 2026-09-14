import { LEVELS, possibilities, tilesFor, bitCount, stepsOf } from '../src/engine.js';
import { writeFileSync } from 'node:fs';
let seed = 20260913;
const rand = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; };
const pools = {};
for (const level of LEVELS) {
  const pool = [], seen = new Set();
  for (let attempt = 0; pool.length < 48 && attempt < 1000; attempt++) {
    const numbers = Array.from({ length: level.count }, () => 2 + rand(level.id === 4 || level.id === 5 ? 11 : 9));
    if (level.id === 4) numbers[4] = 25;
    if (level.id === 5) { numbers[4] = 25; numbers[5] = 50; }
    if (level.id === 6) { numbers[4] = [25, 50, 75][rand(3)]; numbers[5] = 100; }
    const tables = possibilities(tilesFor(numbers), level.cap), best = new Map();
    for (const mask of tables.map((_, i) => i).sort((a,b) => bitCount(a) - bitCount(b))) {
      for (const [value, node] of tables[mask]) if (!best.has(value)) best.set(value, { length: bitCount(mask)-1, node });
    }
    const candidates = [...best].filter(([value, x]) => value >= level.min && value <= level.max && x.length >= level.steps[0] && x.length <= level.steps[1] && (level.id !== 3 || stepsOf(x.node).every(s => s.op !== '×' || (s.a <= 10 && s.b <= 10))));
    if (!candidates.length) continue;
    const [target, solution] = candidates[rand(candidates.length)];
    const key = numbers.slice().sort((a,b)=>a-b).join(',') + ':' + target;
    if (seen.has(key)) continue;
    seen.add(key);
    pool.push({ id: `${level.id}-${pool.length + 1}`, numbers, target, minimum: solution.length });
  }
  if (pool.length !== 48) throw new Error(`Incomplete level ${level.id}`);
  pools[level.id] = pool;
  console.log(`Grade ${level.id}: ${pool.length} verified puzzles`);
}
writeFileSync('src/puzzles.json', JSON.stringify(pools));
