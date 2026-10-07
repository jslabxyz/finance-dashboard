import { execFileSync } from 'node:child_process';
import { chmodSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
chmodSync(resolve(root, '.githooks/pre-commit'), 0o755);
execFileSync('git', ['-C', root, 'config', '--local', 'core.hooksPath', '.githooks']);
console.log('Local staged-data safety hook enabled for this clone.');
