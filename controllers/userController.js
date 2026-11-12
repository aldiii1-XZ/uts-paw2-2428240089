const User = require('../models/userModel');
const { errorHttp } = require('../middlewares/errorHandler');

const ROLE_VALID = ['user', 'admin'];

// GET /users (admin): daftar pengguna, tanpa hash password
exports.getAll = async (req, res) => {
  const data = await User.find().sort({ createdAt: 1 });
  res.json(data);
};

// PATCH /users/:id/role (admin): mengubah peran pengguna lain
exports.updateRole = async (req, res) => {
  if (req.params.id === req.user.id) {
    throw errorHttp(400, 'Tidak dapat mengubah peran akun sendiri');
  }
  // Wajib diperiksa: body kosong {} akan menghapus field role bila langsung dipakai
  if (!ROLE_VALID.includes(req.body.role)) {
    throw errorHttp(400, `role hanya boleh: ${ROLE_VALID.join(', ')}`);
  }
  const user = await User.findById(req.params.id);
  if (!user) throw errorHttp(404, 'Pengguna tidak ditemukan');
  user.role = req.body.role;
  await user.save(); // save() menjalankan validasi enum role
  res.json(user);
};