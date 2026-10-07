import { execFileSync } from 'node:child_process';
import { lstatSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serialiseDemoData } from './generate-demo-data.mjs';

const fixturePath = 'public/data/transactions.json';
const guardPaths = ['scripts/check-data-safety.mjs', 'scripts/generate-demo-data.mjs'];
const excludedDirectories = new Set(['.git', 'node_modules', 'dist', 'build']);
const exportExtensions = new Set(['.csv', '.tsv', '.xlsx', '.xls', '.ods', '.ofx', '.qfx', '.qif', '.pdf', '.zip', '.7z', '.rar', '.sqlite', '.sqlite3', '.db', '.parquet', '.feather']);
const sourceExtensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.css', '.md']);
const maxScanBytes = 5 * 1024 * 1024;

function git(root, args) {
  return execFileSync('git', ['-C', root, ...args], { maxBuffer: 16 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
}

function structuredTransactions(value) {
  if (!value || typeof value !== 'object') return false;
  if (Array.isArray(value)) return value.some(structuredTransactions);
  const keys = Object.keys(value).map(key => key.toLowerCase().replace(/[^a-z]/g, ''));
  const has = candidates => candidates.some(candidate => keys.includes(candidate));
  if (has(['transactions', 'banktransactions', 'accounttransactions']) && Object.values(value).some(Array.isArray)) return true;
  if (has(['amount', 'debit', 'credit', 'balance']) && has(['date', 'transactiondate', 'posteddate', 'valuedate']) && has(['description', 'merchant', 'account', 'accountnumber', 'bankname', 'transactiontype'])) return true;
  return Object.values(value).some(structuredTransactions);
}

function containsTransactions(bytes, path) {
  const extension = extname(path).toLowerCase();
  const content = bytes.toString('utf8').replace(/^\uFEFF/, '').trim();
  if (!['.json', '.jsonl', '.ndjson'].includes(extension) && !/^(?:\{|\[)/.test(content)) return false;
  try {
    return structuredTransactions(JSON.parse(content));
  } catch {
    if (['.json', '.jsonl', '.ndjson'].includes(extension)) {
      if (!content) return false;
      const lines = content.split(/\r?\n/).filter(line => line.trim());
      let allValid = true;
      for (const line of lines) {
        try {
          if (structuredTransactions(JSON.parse(line))) return true;
        } catch {
          allValid = false;
        }
      }
      if (!allValid) throw new Error('Malformed structured data cannot be cleared for publication.');
    }
    return false;
  }
}

function prohibitedPath(path) {
  const extension = extname(path).toLowerCase();
  if (exportExtensions.has(extension)) return true;
  if (path.split('/').slice(0, -1).some(part => /^(?:exports?|raw[-_ ]?data|private[-_ ]?data|bank[-_ ]?statements?)$/i.test(part))) return true;
  return !sourceExtensions.has(extension) && /(?:transactions?|bank[-_ ]?(?:statements?|exports?)|financial[-_ ]?data)/i.test(path.split('/').at(-1));
}

function workingPaths(root, tracked, preview) {
  const paths = new Set(tracked);
  function walk(directory, prefix = '') {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = `${prefix}${entry.name}`;
      if (entry.isDirectory()) {
        if (!excludedDirectories.has(entry.name) || (preview && !prefix && entry.name === 'dist')) walk(resolve(directory, entry.name), `${path}/`);
      } else {
        paths.add(path);
      }
    }
  }
  walk(root);
  return paths;
}

export function checkDataSafety(root, { staged = false, preview = false } = {}) {
  if (staged && preview) throw new Error('Preview checks require the working publication output.');
  const entries = git(root, ['ls-files', '--stage', '-z']).toString('utf8').split('\0').filter(Boolean);
  const index = new Map();
  for (const entry of entries) {
    const separator = entry.indexOf('\t');
    const [mode, objectId, stage] = entry.slice(0, separator).split(' ');
    if (stage !== '0') throw new Error('Resolve the Git index before checking data safety.');
    index.set(entry.slice(separator + 1), { mode, objectId });
  }
  const paths = staged ? new Set(index.keys()) : workingPaths(root, index.keys(), preview);
  const read = path => staged ? git(root, ['cat-file', 'blob', index.get(path).objectId]) : readFileSync(resolve(root, path));

  for (const path of paths) {
    const entry = index.get(path);
    if (staged ? !['100644', '100755'].includes(entry.mode) : !lstatSync(resolve(root, path)).isFile()) throw new Error('Linked or external files cannot be cleared for publication.');
  }

  if (staged) {
    for (const path of guardPaths) {
      if (!index.has(path) || !read(path).equals(readFileSync(resolve(root, path)))) throw new Error('Stage the current data safety scripts before committing.');
    }
  }
  const fixturePaths = new Set([fixturePath, ...(preview ? ['dist/data/transactions.json'] : [])]);
  for (const path of fixturePaths) {
    if (!paths.has(path) || !read(path).equals(Buffer.from(serialiseDemoData()))) throw new Error('The public dataset must exactly match the generated synthetic fixture.');
  }

  for (const path of paths) {
    if (fixturePaths.has(path)) continue;
    if (prohibitedPath(path)) throw new Error('An unauthorised raw export or financial-data path was detected.');
    const bytes = read(path);
    if (bytes.length > maxScanBytes) throw new Error('An oversized input cannot be cleared for publication.');
    if (containsTransactions(bytes, path)) throw new Error('An unauthorised structured transaction dataset was detected.');
  }
  return paths.size;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
    const count = checkDataSafety(root, { staged: process.argv.includes('--staged'), preview: process.argv.includes('--preview') });
    console.log(`Data safety check passed (${count} files checked).`);
  } catch (error) {
    const safeReasons = [
      'Resolve the Git index before checking data safety.',
      'Preview checks require the working publication output.',
      'Stage the current data safety scripts before committing.',
      'The public dataset must exactly match the generated synthetic fixture.',
      'Linked or external files cannot be cleared for publication.',
      'An unauthorised raw export or financial-data path was detected.',
      'An oversized input cannot be cleared for publication.',
      'An unauthorised structured transaction dataset was detected.',
      'Malformed structured data cannot be cleared for publication.',
    ];
    console.error(`Data safety check failed: ${safeReasons.includes(error.message) ? error.message : 'Unable to verify all publication inputs.'} No file contents or private paths are shown.`);
    process.exitCode = 1;
  }
}
