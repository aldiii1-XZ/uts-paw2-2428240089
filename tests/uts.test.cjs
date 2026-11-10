// Jalankan: npm test  (butuh unduhan binary mongod sekali, ~90 MB)
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { MongoMemoryServer } = require('mongodb-memory-server');

const PORT = 3011;
const BASE = `http://127.0.0.1:${PORT}`;
let mongod, server;

const json = (method, path, body) =>
  fetch(BASE + path, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });

before(async () => {
  mongod = await MongoMemoryServer.create();
  server = spawn(process.execPath, ['app.js'], {
    env: { ...process.env, PORT: String(PORT), MONGODB_URI: mongod.getUri('uts_paw2') },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  server.stderr.on('data', (d) => process.stderr.write(d));
  for (let i = 0; i < 80; i++) {
    try { if ((await fetch(BASE + '/dapur')).ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('server tidak siap');
}, { timeout: 180000 });

after(async () => {
  server?.kill();
  await mongod?.stop();
});

test('alur UTS: dapur, paket, filter+sort, populate, galat', async () => {
  const d1 = await json('POST', '/dapur', { kode: 'DP01', nama: 'Dapur Pusat' });
  assert.equal(d1.status, 201);
  const dapur = await d1.json();
  assert.equal(dapur.kode, 'DP01');

  assert.equal((await json('POST', '/dapur', { kode: 'DP01', nama: 'Dobel' })).status, 409, 'kode unik → 409');

  const paket = (kodePaket, nama, hargaPerPorsi, jenis) => ({ kodePaket, nama, hargaPerPorsi, jenis, menu: { utama: 'Nasi', penutup: 'Puding' }, dapurId: dapur._id });
  assert.equal((await json('POST', '/paket-katering', paket('KTR-01', 'Prasmanan A', 10, 'prasmanan'))).status, 201);
  assert.equal((await json('POST', '/paket-katering', paket('KTR-02', 'Kotak B', 15, 'nasi_kotak'))).status, 201);
  assert.equal((await json('POST', '/paket-katering', paket('KTR-03', 'Kotak C', 12, 'nasi_kotak'))).status, 201);

  const invalid = await json('POST', '/paket-katering', { ...paket('KTR-04', 'X', -1, 'tumpeng'), menu: {} });
  assert.equal(invalid.status, 400, 'validasi → 400');
  const body = await invalid.json();
  assert.equal(body.message, 'Data tidak valid');
  assert.ok(Array.isArray(body.detail) && body.detail.length >= 2, 'detail berisi pesan per field');

  const filtered = await json('GET', '/paket-katering?jenis=nasi_kotak&sort=hargaPerPorsi');
  assert.equal(filtered.status, 200);
  const list = await filtered.json();
  assert.deepEqual(list.map((p) => p.kodePaket), ['KTR-03', 'KTR-02'], 'hanya nasi_kotak, urut harga naik');
  assert.equal(typeof list[0].dapurId, 'object', 'ref ter-populate');
  assert.equal(list[0].dapurId.kode, 'DP01');

  const detail = await json('GET', `/paket-katering/${list[0]._id}`);
  assert.equal(detail.status, 200);
  const satu = await detail.json();
  assert.equal(satu.dapurId.nama, 'Dapur Pusat', 'populate memuat kode + nama');

  assert.equal((await json('GET', '/paket-katering/123')).status, 400, 'CastError → 400');
  assert.equal((await json('GET', '/paket-katering/aaaaaaaaaaaaaaaaaaaaaaaa')).status, 404, 'tidak ada → 404');
  assert.equal((await json('GET', '/tidak-ada')).status, 404, 'rute tak dikenal → 404');

  const badJson = await json('POST', '/paket-katering', '{"kodePaket":');
  assert.equal(badJson.status, 400);
  assert.equal((await badJson.json()).message, 'Format JSON tidak valid');
});