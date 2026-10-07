import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createDemoData, serialiseDemoData } from './generate-demo-data.mjs';

const scriptsDirectory = dirname(fileURLToPath(import.meta.url));

function withRepository(run) {
  const root = mkdtempSync(resolve(tmpdir(), 'finance-data-safety-'));
  try {
    mkdirSync(resolve(root, 'public/data'), { recursive: true });
    mkdirSync(resolve(root, 'scripts'));
    for (const script of ['check-data-safety.mjs', 'generate-demo-data.mjs']) cpSync(resolve(scriptsDirectory, script), resolve(root, 'scripts', script));
    writeFileSync(resolve(root, 'public/data/transactions.json'), serialiseDemoData());
    execFileSync('git', ['init', '--quiet', root]);
    const stage = () => execFileSync('git', ['-C', root, 'add', '--all']);
    const check = (staged = false, preview = false) => spawnSync(process.execPath, ['scripts/check-data-safety.mjs', ...(staged ? ['--staged'] : []), ...(preview ? ['--preview'] : [])], { cwd: root, encoding: 'utf8' });
    stage();
    run({ root, stage, check });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('fixture is deterministic, plainly synthetic and internally consistent', () => {
  const data = createDemoData();
  assert.equal(serialiseDemoData(), serialiseDemoData());
  assert.equal(data.metadata.synthetic, true);
  assert.equal(data.metadata.totalRecords, data.transactions.length);
  assert.ok(data.transactions.every(transaction => transaction.id.startsWith('demo-') && transaction.account.startsWith('DEMO-') && transaction.description.startsWith('SYNTHETIC DEMO:')));
  for (const [option, field] of [['categories', 'category'], ['banks', 'bankName'], ['payMonths', 'payMonth']]) assert.deepEqual(data.filterOptions[option], [...new Set(data.transactions.map(transaction => transaction[field]))].sort());
});

test('working tree and staged synthetic fixture pass', () => withRepository(({ check }) => {
  assert.equal(check().status, 0);
  assert.equal(check(true).status, 0);
}));

test('a modified transaction fails even when synthetic remains true', () => withRepository(({ root, stage, check }) => {
  const data = createDemoData();
  data.transactions[0].description = 'PRIVATE_SENTINEL';
  writeFileSync(resolve(root, 'public/data/transactions.json'), JSON.stringify(data));
  stage();
  for (const staged of [false, true]) {
    const result = check(staged);
    assert.equal(result.status, 1);
    assert.ok(!`${result.stdout}${result.stderr}`.includes('PRIVATE_SENTINEL'));
  }
}));

test('staged snapshot rejects unsafe content even when the working fixture is restored', () => withRepository(({ root, stage, check }) => {
  writeFileSync(resolve(root, 'public/data/transactions.json'), '{}');
  stage();
  writeFileSync(resolve(root, 'public/data/transactions.json'), serialiseDemoData());
  assert.equal(check().status, 0);
  assert.equal(check(true).status, 1);
}));

test('ignored and untracked exports fail before a build', () => withRepository(({ root, check }) => {
  writeFileSync(resolve(root, '.gitignore'), '*.csv\n');
  writeFileSync(resolve(root, 'public/PRIVATE_SENTINEL.csv'), 'private export');
  const result = check();
  assert.equal(result.status, 1);
  assert.ok(!`${result.stdout}${result.stderr}`.includes('PRIVATE_SENTINEL'));
}));

test('binary exports and export directories fail in the staged snapshot', () => withRepository(({ root, stage, check }) => {
  writeFileSync(resolve(root, 'public/report.xlsx'), Buffer.from([0x50, 0x4b, 0x03, 0x04]));
  stage();
  assert.equal(check(true).status, 1);
  rmSync(resolve(root, 'public/report.xlsx'));
  mkdirSync(resolve(root, 'exports'));
  writeFileSync(resolve(root, 'exports/renamed.txt'), 'opaque export');
  stage();
  assert.equal(check(true).status, 1);
}));

test('nested transaction JSON and JSONL fail outside the fixture', () => withRepository(({ root, stage, check }) => {
  const transaction = { date: '2000-01-01', amount: 10, description: 'PRIVATE_SENTINEL' };
  for (const [path, content] of [['public/other.json', JSON.stringify({ nested: [transaction] })], ['public/other.jsonl', `${JSON.stringify(transaction)}\n${JSON.stringify(transaction)}\n`]]) {
    writeFileSync(resolve(root, path), content);
    stage();
    const result = check(true);
    assert.equal(result.status, 1);
    assert.ok(!`${result.stdout}${result.stderr}`.includes('PRIVATE_SENTINEL'));
    rmSync(resolve(root, path));
  }
}));

test('staged safety scripts cannot silently differ from the working scripts', () => withRepository(({ root, check }) => {
  const path = resolve(root, 'scripts/generate-demo-data.mjs');
  writeFileSync(path, `${readFileSync(path, 'utf8')}\n`);
  assert.equal(check(true).status, 1);
}));

test('preview rejects stale output and copied raw exports', () => withRepository(({ root, check }) => {
  mkdirSync(resolve(root, 'dist/data'), { recursive: true });
  writeFileSync(resolve(root, 'dist/data/transactions.json'), '{}');
  assert.equal(check(false, true).status, 1);
  writeFileSync(resolve(root, 'dist/data/transactions.json'), serialiseDemoData());
  assert.equal(check(false, true).status, 0);
  writeFileSync(resolve(root, 'dist/report.pdf'), 'opaque export');
  assert.equal(check(false, true).status, 1);
}));

test('symlinked publication inputs fail without reading linked data', () => withRepository(({ root, stage, check }) => {
  symlinkSync('/unavailable-private-export', resolve(root, 'public/linked.txt'));
  assert.equal(check().status, 1);
  stage();
  assert.equal(check(true).status, 1);
}));
