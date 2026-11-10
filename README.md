# uts-paw2-2428240089 — Jasa Katering

REST API UTS Praktikum Pengembangan Aplikasi Web II (SI5B), Topik 23: Jasa Katering.
Express 5, Mongoose, MongoDB, `dotenv`, `cors`.

## Cara Menjalankan

1. `npm install`
2. Salin `.env.example` menjadi `.env`, sesuaikan `MONGODB_URI` (lokal atau Atlas).
3. `npm start` → server di `http://localhost:3000`
4. `npm test` → uji otomatis seluruh endpoint (memakai MongoDB in-memory, tanpa perlu MongoDB terpasang).

## Endpoint

| Method | Path | Keterangan |
| --- | --- | --- |
| POST | `/dapur` | Tambah dapur (model pendukung) |
| GET | `/dapur` | Daftar dapur |
| POST | `/paket-katering` | Tambah paket katering |
| GET | `/paket-katering` | Daftar paket; mendukung `?jenis=` dan `?sort=` |
| GET | `/paket-katering/:id` | Detail paket dengan `dapurId` ter-populate |

Contoh: `GET /paket-katering?jenis=nasi_kotak&sort=hargaPerPorsi`

## Alasan Desain Data Model

- **`menu` di-embed** ke dalam `PaketKatering` karena menu selalu dibaca bersama paketnya
  (satu paket = satu menu tetap), tidak pernah dipakai sendiri, dan jumlahnya tepat dua
  sub-field (`utama`, `penutup`). Pola aksesnya selalu "ambil paket beserta menunya",
  sehingga embedding menghindari query tambahan.
- **`dapurId` memakai referencing** karena satu dapur dipakai banyak paket (relasi
  satu-ke-banyak) dan data dapur dipakai ulang oleh endpoint lain. Referencing mencegah
  duplikasi nama/kode dapur saat berubah, dan `.populate('dapurId', 'kode nama')`
  menampilkan kode serta nama dapur pada respons.

## Struktur

```
app.js                  # setup express, cors, koneksi MongoDB
routes/                 # definisi endpoint
controllers/            # logika request/response
models/                 # skema Mongoose (Dapur, PaketKatering)
middlewares/            # 404 + error handler terpusat
tests/                  # uji otomatis endpoint
```