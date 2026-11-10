const mongoose = require('mongoose');

const dapurSchema = new mongoose.Schema({
  kode: { type: String, required: true, unique: true, uppercase: true, trim: true },
  nama: { type: String, required: true, trim: true },
});

module.exports = mongoose.model('Dapur', dapurSchema);