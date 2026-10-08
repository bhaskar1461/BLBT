import { readdirSync } from 'fs';
import { execSync } from 'child_process';
import { resolve, join } from 'path';

const scriptsDir = resolve('scripts');
const verifyFiles = readdirSync(scriptsDir).filter(f => f.startsWith('verify_') && f.endsWith('.ts'));

console.log(`Found ${verifyFiles.length} verification suites to run.\n`);

let passed = 0;
let failed = 0;

for (const file of verifyFiles) {
  const fullPath = join(scriptsDir, file);
  process.stdout.write(`▶ Running ${file}... `);
  try {
    execSync(`npx tsx "${fullPath}"`, { stdio: 'pipe' });
    console.log(`✅ PASSED`);
    passed++;
  } catch (err) {
    console.log(`❌ FAILED`);
    console.error(err.stdout ? err.stdout.toString() : err.message);
    failed++;
  }
}

console.log(`\n========================================`);
console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log(`========================================`);

if (failed > 0) {
  process.exit(1);
}
