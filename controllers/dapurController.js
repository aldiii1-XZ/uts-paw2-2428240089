const Dapur = require('../models/dapur');

exports.createDapur = async (req, res, next) => {
  try {
    const { kode, nama } = req.body;
    const dapur = await Dapur.create({ kode, nama });
    res.status(201).json(dapur);
  } catch (err) { next(err); }
};

exports.getDapur = async (req, res, next) => {
  try {
    res.json(await Dapur.find());
  } catch (err) { next(err); }
};