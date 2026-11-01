const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');
for (const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) new vm.Script(match[1]);
function section(start, end) { return html.slice(html.indexOf(start), html.indexOf(end, html.indexOf(start))); }
async function check(failWrites) {
  const original = '[{"id":"local-only"}]';
  const cache = new Map([['sd_meetings', original]]);
  let requests = 0;
  const nodes = {};
  const ctx = vm.createContext({
    console: {warn(){}, error(){}},
    localStorage: {
      getItem: key => cache.get(key) || null,
      setItem(key, value) {
        if (failWrites) { const e = new Error('full'); e.name = 'QuotaExceededError'; throw e; }
        cache.set(key, value);
      }
    },
    document: {getElementById: id => nodes[id] ||= {style:{}}},
    pendingMutation: 0, dbLoadGeneration: 0, deletedFbIds: new Set(), individualFbIds: new Set(),
    meetings: [], residentNames: [], users: [], DEFAULT_USERS: [], residentDischargeSchemaReady: true,
    setDbDot(){}, setDbStatus(){}, updateSyncLabel(){}, friendlyDbError: e => e.message,
    sbFetchAll: async path => {
      requests++;
      if(path.startsWith('/meetings?')) return [{id:'server', date:'2026-11-01'}];
      return [];
    }
  });
  vm.runInContext(section('let recoveryInMemory', 'function exportLocalRecovery'), ctx);
  vm.runInContext(section('async function loadFromDBInternal()', 'async function syncFromDB'), ctx);
  assert.equal(await vm.runInContext('loadFromDBInternal()', ctx), true);
  assert.equal(requests, 6);
  assert.equal(ctx.meetings[0].id, 'server');
  assert.equal(vm.runInContext('recoveryInMemory', ctx), original);
  if(failWrites) {
    assert.equal(cache.get('sd_meetings'), original);
    assert.ok(nodes.dbRecoveryMessage.textContent.includes('저장공간'));
  } else assert.equal(cache.get('sd_recovery_original'), original);
  vm.runInContext(section('function save() {', '// 어르신 명단 비파괴적'), ctx);
  ctx.dbSaveQueue = Promise.resolve();
  let writes = 0;
  ctx.saveToDB = async () => { writes++; return true; };
  await vm.runInContext('save()', ctx);
  assert.equal(writes, 1);
  assert.equal(ctx.pendingMutation, 0);
}
(async () => {
  await check(true);
  await check(false);
  console.log('PASS: inline syntax; quota-full and normal DB load/save; recovery preserved');
})().catch(e => { console.error(e); process.exitCode=1; });
