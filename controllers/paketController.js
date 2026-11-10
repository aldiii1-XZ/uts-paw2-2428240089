const PaketKatering = require('../models/paketKatering');

exports.createPaket = async (req, res, next) => {
  try {
    const { kodePaket, nama, hargaPerPorsi, jenis, menu, dapurId } = req.body;
    const paket = await PaketKatering.create({
      kodePaket, nama, hargaPerPorsi, jenis, menu, dapurId,
    });
    res.status(201).json(paket);
  } catch (err) { next(err); }
};

exports.getPaket = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.jenis) filter.jenis = req.query.jenis;

    const bolehSort = ['kodePaket', 'nama', 'hargaPerPorsi', 'jenis', 'createdAt'];
    const sort = bolehSort.includes(req.query.sort) ? { [req.query.sort]: 1 } : {};

    const data = await PaketKatering.find(filter)
      .populate('dapurId', 'kode nama')
      .sort(sort);
    res.json(data);
  } catch (err) { next(err); }
};

exports.getPaketById = async (req, res, next) => {
  try {
    const data = await PaketKatering.findById(req.params.id)
      .populate('dapurId', 'kode nama');
    if (!data) {
      const err = new Error('Data tidak ditemukan');
      err.status = 404;
      return next(err);
    }
    res.json(data);
  } catch (err) { next(err); }
};