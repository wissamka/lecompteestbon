import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS, calculate, tilesFor, applyMove, solve, stepsOf } from '../src/engine.js';
const pools = JSON.parse(readFileSync(new URL('../src/puzzles.json',import.meta.url)));
test('all arithmetic boundaries and exact division', () => {
  assert.equal(calculate(8,'÷',2).value,4);
  assert.equal(calculate(8,'÷',3).error,'remainder');
  assert.equal(calculate(8,'÷',0).error,'invalid');
  assert.equal(calculate(2,'−',8).error,'positive');
  assert.equal(calculate(2,'−',2).error,'positive');
  assert.equal(calculate(11,'×',10,100).error,'limit');
  assert.equal(calculate(10,'×',10,100).value,100);
  assert.equal(calculate(50,'+',50,100).value,100);
});
test('duplicate tiles stay distinct, cannot reuse consumed tile, and snapshots undo exactly', () => {
  const before=tilesFor([3,3,4,8]);
  assert.equal(applyMove(before,'n0','+','n0',100,'r0').error,'invalid');
  const result=applyMove(before,'n0','+','n1',100,'r0');
  assert.deepEqual(result.tiles.map(t=>t.value),[4,8,6]);
  assert.equal(applyMove(result.tiles,'n0','×','n2',100,'r1').error,'invalid');
  assert.deepEqual(before,tilesFor([3,3,4,8]));
  assert.equal(new Set(result.tiles.map(t=>t.id)).size,3);
});
test('worked example accepts unused numbers and intermediate results',()=>{
  const r1=applyMove(tilesFor([3,4,6,8]),'n0','+','n1',100,'r0');
  const r2=applyMove(r1.tiles,'r0','×','n2',100,'r1');
  assert.deepEqual(r2.tiles.map(t=>t.value),[8,42]);
  assert.equal(stepsOf(solve(tilesFor([3,4,6,8]),42,100)).length,2);
});
test('hints solve the current board and detect dead ends',()=>{
  assert.equal(solve(tilesFor([2,3]),17,100),null);
  assert.deepEqual(stepsOf(solve(tilesFor([7,6,8]),42,100)),[{a:7,op:'×',b:6,value:42}]);
});
function evaluateTree(node,numbers,seen=new Set()) {
  if(!node.op){const id=Number(node.id.slice(1));assert(!seen.has(id));seen.add(id);assert.equal(node.value,numbers[id]);return node.value;}
  const a=evaluateTree(node.left,numbers,seen),b=evaluateTree(node.right,numbers,seen);
  const v=node.op==='+'?a+b:node.op==='−'?a-b:node.op==='×'?a*b:a/b;
  assert(Number.isInteger(v)&&v>0);assert.equal(v,node.value);return v;
}
for(const level of LEVELS)test(`all 48 grade ${level.id} puzzles have correct shortest solutions and valid independent tree evaluations`,()=>{
  assert.equal(pools[level.id].length,48);
  assert.equal(new Set(pools[level.id].map(p=>p.id)).size,48);
  for(const puzzle of pools[level.id]){
    assert.equal(puzzle.numbers.length,level.count);
    assert(puzzle.target>=level.min&&puzzle.target<=level.max);
    const node=solve(tilesFor(puzzle.numbers),puzzle.target,level.cap);
    assert(node,`Unsolvable ${puzzle.id}`);
    assert.equal(evaluateTree(node,puzzle.numbers),puzzle.target);
    const steps=stepsOf(node);assert.equal(steps.length,puzzle.minimum);
    assert(steps.length>=level.steps[0]&&steps.length<=level.steps[1]);
    assert(steps.every(s=>s.value<=level.cap));
  }
});
