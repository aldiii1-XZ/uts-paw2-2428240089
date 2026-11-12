const { spawn } = require('node:child_process');
const { MongoMemoryServer } = require('mongodb-memory-server');

(async () => {
  const mongod = await MongoMemoryServer.create();
  const child = spawn(process.execPath, ['app.js'], {
    stdio: 'inherit',
    env: { ...process.env, MONGODB_URI: mongod.getUri('uts_paw2') },
  });

  let stopping = false;
  const stop = async (code = 0) => {
    if (stopping) return;
    stopping = true;
    child.kill();
    await mongod.stop();
    process.exit(code);
  };

  process.on('SIGINT', () => stop(0));
  process.on('SIGTERM', () => stop(0));
  child.on('exit', (code) => stop(code ?? 0));
})().catch((err) => {
  console.error('Gagal menjalankan MongoDB lokal:', err.message);
  process.exit(1);
});