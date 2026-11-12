require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const dapurRoutes = require('./routes/dapurRoutes');
const paketRoutes = require('./routes/paketRoutes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET belum diisi di .env');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: ['GET', 'POST'],
}));
app.use(express.json());

app.use('/dapur', dapurRoutes);
app.use('/paket-katering', paketRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
      console.log('Terhubung ke MongoDB:', mongoose.connection.name);
      app.listen(PORT, () => console.log(`Server jalan di http://localhost:${PORT}`));
    })
  .catch((err) => {
    console.error('Gagal konek MongoDB:', err.message);
    process.exit(1);
  });