const fs = require('node:fs');
const net = require('node:net');
const path = require('node:path');
const { once } = require('node:events');
const { spawn } = require('node:child_process');
const { MongoBinary } = require('mongodb-memory-server');

const dbPath = path.join(__dirname, '.mongo-data');
const mongoLog = path.join(__dirname, 'mongo.log');
const port = 27017;

function waitForPort(port, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;
    const tryConnect = () => {
      const socket = net.connect({ host: '127.0.0.1', port });
      socket.once('connect', () => { socket.destroy(); resolve(); });
      socket.once('error', () => {
        socket.destroy();
        if (Date.now() > deadline) reject(new Error(`Port ${port} tidak siap`));
        else setTimeout(tryConnect, 250);
      });
    };
    tryConnect();
  });
}

(async () => {
  fs.mkdirSync(dbPath, { recursive: true });
  const binary = await MongoBinary.getPath({});
  const mongod = spawn(binary, [
    '--dbpath', dbPath,
    '--port', String(port),
    '--bind_ip', '127.0.0.1',
    '--logpath', mongoLog,
    '--logappend',
  ], { stdio: 'inherit' });

  const mongoExit = once(mongod, 'exit').then(([code]) => {
    throw new Error(`mongod berhenti (kode ${code}); lihat mongo.log`);
  });

  await Promise.race([waitForPort(port), mongoExit]);
  console.log(`MongoDB lokal: mongodb://127.0.0.1:${port}/uts_paw2`);

  const child = spawn(process.execPath, ['app.js'], {
    stdio: 'inherit',
    env: { ...process.env, MONGODB_URI: `mongodb://127.0.0.1:${port}/uts_paw2` },
  });

  let stopping = false;
  const stop = async (code = 0) => {
    if (stopping) return;
    stopping = true;
    child.kill();
    mongod.kill();
    await Promise.race([once(mongod, 'exit'), new Promise((r) => setTimeout(r, 3000))]);
    process.exit(code);
  };

  process.on('SIGINT', () => stop(0));
  process.on('SIGTERM', () => stop(0));
  child.on('exit', (code) => stop(code ?? 0));
})().catch((err) => {
  console.error('Gagal menjalankan MongoDB lokal:', err.message);
  process.exit(1);
});