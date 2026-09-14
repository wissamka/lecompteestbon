import { solve, stepsOf } from './engine.js';
self.onmessage = ({ data }) => {
  try {
    const node = solve(data.tiles, data.target, data.cap);
    self.postMessage({ id: data.id, steps: node ? stepsOf(node) : null });
  } catch { self.postMessage({ id: data.id, error: true }); }
};
