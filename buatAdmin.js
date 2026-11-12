// Membuat akun admin, atau menaikkan akun yang sudah ada menjadi admin.
// Pakai: npm run buat-admin -- <username> <password>
require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/userModel');

async function main() {
  const [username, password] = process.argv.slice(2);
  if (!username || !password || password.length < 8) {
    throw new Error('Pakai: npm run buat-admin -- <username> <password minimal 8 karakter>');
  }
  await mongoose.connect(process.env.MONGODB_URI);

  const hashed = await bcrypt.hash(password, 10);
  const nama = username.trim().toLowerCase();
  let user = await User.findOne({ username: nama });
  if (user) {
    user.password = hashed;   // akun sudah ada: dinaikkan menjadi admin
    user.role = 'admin';
    await user.save();
  } else {
    user = await User.create({ username: nama, password: hashed, role: 'admin' });
  }
  console.log(`Admin siap: ${user.username} (role: ${user.role})`);
  await mongoose.disconnect();
}

main().catch((err) => { console.error(err.message); process.exit(1); });