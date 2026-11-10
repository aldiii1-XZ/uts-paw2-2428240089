const mongoose = require('mongoose');
const menuSchema = new mongoose.Schema({
  utama:   { type: String, required: true, trim: true },
  penutup: { type: String, required: true, trim: true },
}, { _id: false });

const paketSchema = new mongoose.Schema({
  kodePaket:    { type: String, required: true, unique: true, trim: true },
  nama:         { type: String, required: true, trim: true },
  hargaPerPorsi:{ type: Number, required: true, min: 0 },
  jenis:        { type: String, required: true, trim: true, enum: ['prasmanan','nasi_kotak','tumpeng'] },
  menu:         { type: menuSchema, required: true },
  dapurId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Dapur', required: true },
  createdAt:    { type: Date, default: Date.now },
});
module.exports = mongoose.model('PaketKatering', paketSchema);