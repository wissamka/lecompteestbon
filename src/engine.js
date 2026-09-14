export const LEVELS = [
  { id: 3, count: 4, min: 10, max: 100, cap: 100, steps: [2, 2], seconds: 180 },
  { id: 4, count: 5, min: 20, max: 200, cap: 500, steps: [2, 3], seconds: 180 },
  { id: 5, count: 6, min: 50, max: 500, cap: 2000, steps: [3, 4], seconds: 240 },
  { id: 6, count: 6, min: 100, max: 999, cap: 10000, steps: [4, 5], seconds: 300 },
];
export const OPS = ['+', '−', '×', '÷'];
export function calculate(a, op, b, cap = 10000) {
  if (![a, b].every(v => Number.isSafeInteger(v) && v > 0)) return { error: 'invalid' };
  let value;
  if (op === '+') value = a + b;
  else if (op === '−') value = a - b;
  else if (op === '×') value = a * b;
  else if (op === '÷') {
    if (a % b) return { error: 'remainder' };
    value = a / b;
  } else return { error: 'invalid' };
  if (value <= 0) return { error: 'positive' };
  if (!Number.isSafeInteger(value) || value > cap) return { error: 'limit' };
  return { value };
}
export function tilesFor(numbers) { return numbers.map((value, i) => ({ id: `n${i}`, value })); }
export function applyMove(tiles, aId, op, bId, cap, nextId) {
  if (aId === bId || tiles.some(t => t.id === nextId)) return { error: 'invalid' };
  const a = tiles.find(t => t.id === aId), b = tiles.find(t => t.id === bId);
  if (!a || !b) return { error: 'invalid' };
  const result = calculate(a.value, op, b.value, cap);
  if (result.error) return result;
  const tile = { id: nextId, value: result.value };
  return { tiles: [...tiles.filter(t => t.id !== aId && t.id !== bId), tile], step: { a: a.value, b: b.value, op, value: tile.value } };
}
export const bitCount = mask => mask.toString(2).replaceAll('0', '').length;

// Exact subset dynamic programming: each mask represents distinct starting tiles.
// Every reachable value per subset is retained, so shortest solutions are proven.
export function possibilities(tiles, cap) {
  if (tiles.length > 6) throw new Error('At most six tiles');
  const tables = Array.from({ length: 1 << tiles.length }, () => new Map());
  for (let i = 0; i < tiles.length; i++) tables[1 << i].set(tiles[i].value, { ...tiles[i] });
  for (let mask = 1; mask < tables.length; mask++) {
    if ((mask & (mask - 1)) === 0) continue;
    const out = tables[mask];
    for (let left = (mask - 1) & mask; left; left = (left - 1) & mask) {
      const right = mask ^ left;
      if (!right || left > right) continue;
      for (const a of tables[left].values()) for (const b of tables[right].values()) {
        for (const [x, op, y] of [[a, '+', b], [a, '×', b], [a, '−', b], [b, '−', a], [a, '÷', b], [b, '÷', a]]) {
          const result = calculate(x.value, op, y.value, cap);
          if (!result.error && !out.has(result.value)) out.set(result.value, { value: result.value, op, left: x, right: y });
        }
      }
    }
  }
  return tables;
}
export function solve(tiles, target, cap) {
  const tables = possibilities(tiles, cap);
  const masks = tables.map((_, i) => i).sort((a, b) => bitCount(a) - bitCount(b));
  for (const mask of masks) if (tables[mask].has(target)) return tables[mask].get(target);
  return null;
}
export function stepsOf(node) {
  if (!node?.op) return [];
  return [...stepsOf(node.left), ...stepsOf(node.right), { a: node.left.value, op: node.op, b: node.right.value, value: node.value }];
}
