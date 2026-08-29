# CJM Motor - Sistem Informasi Service Bengkel Motor

Sistem Informasi Riwayat Service Bengkel Motor berbasis **Web Mobile** yang efisien, responsif, dan ringan.

## 🛠️ Tech Stack
- **Frontend**: HTML5, CSS3, JavaScript Native, Bootstrap 5
- **Backend**: PHP REST API
- **Database**: Supabase PostgreSQL
- **Deployment**: Vercel

## 👥 Hak Akses
1. **CS (Customer Service)**: READ ONLY — Melakukan pencarian riwayat service berdasarkan Nomor Polisi.
2. **Admin**: FULL ACCESS — CRUD Customer, Kendaraan, Service, Status Service, dan Laporan.

## 📁 Struktur Folder
- `public/`: Interface web frontend (CS dan Admin)
- `api/`: Endpoint REST API PHP
- `config/`: Konfigurasi database & environment
- `helpers/`: Fungsi bantu (JSON response, sanitasi input, kode service)
- `middleware/`: Middleware otentikasi admin
