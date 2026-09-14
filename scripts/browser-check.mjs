import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
console.log(execFileSync('playwright-cli',['-s=lecompteestbon','run-code',readFileSync(process.argv[2] || 'test/browser.js','utf8')],{encoding:'utf8',maxBuffer:2e6}));
