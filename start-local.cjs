const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { MongoMemoryServer } = require('mongodb-memory-server');

const dbPath = path.join(__dirname, '.mongo-data');

(async () => {
  fs.mkdirSync(dbPath, { recursive: true });
  const mongod = await MongoMemoryServer.create({
    instance: { port: 27017, dbPath, portGeneration: false },
  });
  console.log('MongoDB lokal:', mongod.getUri('uts_paw2'));

  const child = spawn(process.execPath, ['app.js'], {
    stdio: 'inherit',
    env: { ...process.env, MONGODB_URI: mongod.getUri('uts_paw2') },
  });

  let stopping = false;
  const stop = async (code = 0) => {
    if (stopping) return;
    stopping = true;
    child.kill();
    await mongod.stop({ doCleanup: false });
    process.exit(code);
  };

  process.on('SIGINT', () => stop(0));
  process.on('SIGTERM', () => stop(0));
  child.on('exit', (code) => stop(code ?? 0));
})().catch((err) => {
  console.error('Gagal menjalankan MongoDB lokal:', err.message);
  process.exit(1);
});