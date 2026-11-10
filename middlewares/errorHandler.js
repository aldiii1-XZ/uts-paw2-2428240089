exports.notFoundHandler = (req, res) => {
  res.status(404).json({ message: 'Rute tidak ditemukan' });
};
exports.errorHandler = (err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Format JSON tidak valid' });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'ID tidak valid' });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Data tidak valid',
      detail: Object.values(err.errors).map((e) => e.message),
    });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Data sudah digunakan' });
  }
  if (err.status) {
    return res.status(err.status).json({ message: err.message });
  }
  res.status(500).json({ message: 'Terjadi kesalahan pada server' });
};