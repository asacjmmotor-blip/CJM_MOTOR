# SISTEM INFORMASI SERVICE BENGKEL MOTOR

## 1. Informasi Project

**Nama sementara:** Sistem Informasi Riwayat Service Bengkel Motor\
**Jenis:** Web application / Sistem Informasi\
**Target penggunaan:** Bengkel motor tempat KKP\
**Platform utama:** Mobile Web\
**Metode pengembangan:** Agile Development\
**Frontend:** HTML5, CSS3, JavaScript, Bootstrap 5\
**Backend:** PHP REST API\
**Database:** Supabase PostgreSQL\
**Deployment:** Vercel\
**Target awal:** ±100 customer motor

> Catatan: Jika menggunakan Supabase, database yang digunakan adalah
> PostgreSQL, bukan MySQL. Jika ingin menggunakan MySQL, perlu
> menggunakan layanan database MySQL terpisah.

------------------------------------------------------------------------

# 2. Latar Belakang Sistem

Sistem dibuat untuk membantu bengkel dalam mengelola data customer,
kendaraan, dan riwayat service secara terstruktur.

Kebutuhan utama dari sisi operasional adalah tersedianya sistem
sederhana yang dapat digunakan melalui perangkat mobile.

Sistem memiliki dua jenis pengguna utama:

1.  **Admin**, yang bertanggung jawab mengelola data.
2.  **CS**, yang hanya membutuhkan akses baca untuk mencari riwayat
    service berdasarkan nomor polisi kendaraan.

CS tidak melakukan input, perubahan, maupun penghapusan data.

------------------------------------------------------------------------

# 3. Tujuan Sistem

Sistem bertujuan untuk:

-   menyimpan data customer secara terstruktur;
-   menyimpan data kendaraan customer;
-   menyimpan riwayat service kendaraan;
-   memudahkan admin mengelola data service;
-   memudahkan CS mencari riwayat service berdasarkan nomor polisi;
-   menampilkan riwayat service dalam tampilan mobile yang sederhana;
-   mengurangi ketergantungan terhadap pencatatan manual;
-   menyediakan data yang dapat digunakan sebagai dasar laporan
    operasional bengkel.

------------------------------------------------------------------------

# 4. Scope / Batasan Sistem

## 4.1 Fitur Admin

Admin memiliki akses:

-   Login dan logout.
-   Dashboard.
-   CRUD customer.
-   CRUD kendaraan.
-   CRUD service.
-   Melihat detail service.
-   Mengelola item pekerjaan/sparepart service.
-   Mengubah status service.
-   Melihat riwayat service.
-   Pencarian customer.
-   Pencarian nomor polisi.
-   Melihat laporan sederhana.

## 4.2 Fitur CS

CS bersifat **READ ONLY**.

CS hanya dapat:

1.  membuka halaman pencarian;
2.  memasukkan nomor polisi;
3.  melakukan pencarian;
4.  melihat data kendaraan yang ditemukan;
5.  melihat daftar tanggal service;
6.  melihat detail riwayat service yang diizinkan.

CS tidak dapat:

-   menambah customer;
-   mengedit customer;
-   menghapus customer;
-   menambah kendaraan;
-   mengedit kendaraan;
-   menghapus kendaraan;
-   menambah service;
-   mengedit service;
-   menghapus service;
-   mengubah status;
-   melihat halaman admin.

------------------------------------------------------------------------

# 5. Aktor Sistem

## Admin

Admin merupakan pengguna internal yang mengelola seluruh data sistem.

Input:

-   username;
-   password;
-   customer;
-   kendaraan;
-   service;
-   item service;
-   status service.

Output:

-   dashboard;
-   data customer;
-   data kendaraan;
-   data service;
-   laporan.

## CS

CS merupakan pengguna yang membutuhkan informasi riwayat service
kendaraan.

Input:

-   nomor polisi.

Output:

-   informasi kendaraan;
-   tanggal service;
-   jenis service;
-   status service;
-   detail service yang diizinkan.

------------------------------------------------------------------------

# 6. Arsitektur Sistem

``` text
                    WEB MOBILE
           HTML + CSS + Bootstrap
                  JavaScript
                       |
                       | HTTPS
                       v
                 PHP REST API
                       |
          +------------+------------+
          |                         |
     Authentication             Validation
          |                         |
          +------------+------------+
                       |
                       v
               Supabase PostgreSQL
                       |
          +------------+------------+
          |            |             |
      Customers    Vehicles      Services
                                      |
                                      v
                                Service Items
```

Alur komunikasi:

``` text
User
  |
  v
HTML/CSS/Bootstrap
  |
  v
JavaScript
  |
  v
PHP API
  |
  v
Supabase PostgreSQL
  |
  v
PHP API
  |
  v
JavaScript
  |
  v
UI Mobile
```

Frontend tidak boleh menyimpan credential database yang bersifat
rahasia.

------------------------------------------------------------------------

# 7. Struktur Folder yang Direkomendasikan

``` text
bengkel-motor/
│
├── public/
│   ├── index.html
│   │
│   ├── admin/
│   │   ├── login.html
│   │   ├── dashboard.html
│   │   ├── customers.html
│   │   ├── vehicles.html
│   │   ├── services.html
│   │   ├── service-detail.html
│   │   └── reports.html
│   │
│   ├── cs/
│   │   ├── index.html
│   │   ├── result.html
│   │   └── detail.html
│   │
│   ├── assets/
│   │   ├── css/
│   │   │   ├── style.css
│   │   │   ├── mobile.css
│   │   │   └── admin.css
│   │   │
│   │   ├── js/
│   │   │   ├── api.js
│   │   │   ├── auth.js
│   │   │   ├── cs.js
│   │   │   ├── admin.js
│   │   │   ├── customer.js
│   │   │   ├── vehicle.js
│   │   │   └── service.js
│   │   │
│   │   └── img/
│   │
│   └── components/
│       ├── navbar.html
│       ├── sidebar.html
│       └── bottom-nav.html
│
├── api/
│   ├── auth/
│   │   ├── login.php
│   │   └── logout.php
│   │
│   ├── customers/
│   │   ├── index.php
│   │   └── detail.php
│   │
│   ├── vehicles/
│   │   ├── index.php
│   │   ├── search.php
│   │   └── detail.php
│   │
│   ├── services/
│   │   ├── index.php
│   │   ├── create.php
│   │   ├── update.php
│   │   └── detail.php
│   │
│   └── reports/
│       └── index.php
│
├── config/
│   ├── database.php
│   └── environment.php
│
├── middleware/
│   ├── auth.php
│   ├── admin.php
│   └── rate-limit.php
│
├── helpers/
│   ├── response.php
│   ├── validation.php
│   └── service-code.php
│
├── .env
├── .gitignore
├── vercel.json
└── README.md
```

------------------------------------------------------------------------

# 8. Konsep UI Mobile

## 8.1 Halaman CS

CS tidak menggunakan dashboard kompleks.

Halaman awal:

``` text
+-------------------------+
|      BENGKEL MOTOR      |
|                         |
|   Cek Riwayat Service   |
|                         |
| Nomor Polisi            |
| [ B 1234 ABC          ] |
|                         |
|       [ CARI ]          |
+-------------------------+
```

Setelah pencarian berhasil:

``` text
+-------------------------+
| B 1234 ABC              |
| Honda Beat              |
|                         |
| Riwayat Service         |
|                         |
| 25 AGU 2026             |
| Service Ringan          |
| Selesai                 |
|                         |
| 12 JUN 2026             |
| Ganti Oli               |
| Selesai                 |
|                         |
| 10 MAR 2026             |
| Service CVT             |
| Selesai                 |
+-------------------------+
```

Desain harus:

-   mobile-first;
-   tombol mudah ditekan;
-   input nomor polisi jelas;
-   menggunakan card/grid;
-   informasi tidak terlalu padat;
-   responsif;
-   tidak menampilkan data sensitif yang tidak diperlukan CS.

## 8.2 Halaman Admin

Admin menggunakan tampilan mobile-first tetapi tetap responsif untuk
desktop.

Menu utama:

``` text
Dashboard
Customer
Kendaraan
Service
Laporan
Pengaturan
Logout
```

Dashboard menampilkan informasi ringkas:

-   jumlah customer;
-   jumlah kendaraan;
-   service hari ini;
-   service aktif;
-   service selesai;
-   pendapatan jika memang diperlukan oleh bengkel.

------------------------------------------------------------------------

# 9. Alur Bisnis

``` text
Customer datang
       |
       v
Kendaraan diperiksa
       |
       v
Cari nomor polisi
       |
       +---- Kendaraan sudah ada ----+
       |                             |
       |                             v
       |                       Data kendaraan
       |                             |
       +---- Belum ada --------------+
                                     |
                                     v
                              Tambah customer
                                     |
                                     v
                              Tambah kendaraan
                                     |
                                     v
                              Input service
                                     |
                                     v
                             Simpan database
                                     |
                                     v
                              Service selesai
                                     |
                                     v
                           Riwayat tersimpan
```

Untuk penggunaan CS:

``` text
CS
 |
 v
Masukkan nomor polisi
 |
 v
Validasi input
 |
 v
Cari kendaraan
 |
 +---- Tidak ditemukan
 |          |
 |          v
 |   Tampilkan pesan
 |
 +---- Ditemukan
            |
            v
     Ambil riwayat service
            |
            v
      Urutkan tanggal
            |
            v
       Tampilkan grid
```

------------------------------------------------------------------------

# 10. DFD Level 0

``` text
                         +-----------+
                         |   ADMIN   |
                         +-----+-----+
                               |
                Data Customer / Kendaraan
                     / Service / Admin
                               |
                               v
                +----------------------------+
                |                            |
                | SISTEM INFORMASI SERVICE   |
                |       BENGKEL MOTOR        |
                |                            |
                +-------------+--------------+
                              |
                              |
                     Informasi Service
                              |
                              v
                         +----+----+
                         |   CS    |
                         +---------+
                              ^
                              |
                         Nomor Polisi
```

------------------------------------------------------------------------

# 11. DFD Level 1

Proses utama:

``` text
1.0 Login Admin
2.0 Kelola Customer
3.0 Kelola Kendaraan
4.0 Kelola Service
5.0 Cari Riwayat Service
6.0 Kelola Laporan
```

Data store:

``` text
D1 Admin
D2 Customers
D3 Vehicles
D4 Services
D5 Service Items
```

Alur:

``` text
ADMIN
  |
  +--> 1.0 Login Admin --> D1 Admin
  |
  +--> 2.0 Kelola Customer --> D2 Customers
  |
  +--> 3.0 Kelola Kendaraan --> D3 Vehicles
  |
  +--> 4.0 Kelola Service --> D4 Services
  |                              |
  |                              +--> D5 Service Items
  |
  +--> 6.0 Laporan --> D2 + D3 + D4 + D5


CS
 |
 +--> 5.0 Cari Riwayat Service
              |
              +--> D3 Vehicles
              |
              +--> D4 Services
              |
              v
         Riwayat Service
              |
              v
             CS
```

------------------------------------------------------------------------

# 12. DFD Level 2 --- Pencarian CS

``` text
CS
 |
 | Nomor Polisi
 v
5.1 Input Nomor Polisi
 |
 v
5.2 Validasi Nomor Polisi
 |
 v
5.3 Cari Kendaraan
 |
 +---- Tidak ditemukan ---> Pesan "Data tidak ditemukan"
 |
 +---- Ditemukan
          |
          v
     5.4 Ambil Service
          |
          v
     5.5 Urutkan tanggal
          |
          v
     5.6 Tampilkan riwayat
          |
          v
          CS
```

------------------------------------------------------------------------

# 13. Perancangan Basis Data

Database menggunakan relasi:

``` text
CUSTOMERS
    |
    | 1:N
    v
VEHICLES
    |
    | 1:N
    v
SERVICES
    |
    | 1:N
    v
SERVICE_ITEMS
```

Tabel admin berdiri sendiri dan digunakan untuk autentikasi.

------------------------------------------------------------------------

# 14. Tabel ADMINS

  Field           Type           Key      Keterangan
  --------------- -------------- -------- ------------------------
  id              BIGINT         PK       ID admin
  name            VARCHAR(100)            Nama admin
  username        VARCHAR(50)    UNIQUE   Username
  password_hash   VARCHAR(255)            Password hasil hashing
  created_at      TIMESTAMP               Waktu pembuatan

Password wajib disimpan menggunakan password hashing. Jangan menyimpan
password plain text.

------------------------------------------------------------------------

# 15. Tabel CUSTOMERS

  Field        Type           Key   Keterangan
  ------------ -------------- ----- -----------------
  id           BIGINT         PK    ID customer
  name         VARCHAR(100)         Nama customer
  phone        VARCHAR(20)          Nomor HP
  address      TEXT                 Alamat
  created_at   TIMESTAMP            Waktu pembuatan
  updated_at   TIMESTAMP            Waktu perubahan

------------------------------------------------------------------------

# 16. Tabel VEHICLES

  Field          Type          Key      Keterangan
  -------------- ------------- -------- -------------------
  id             BIGINT        PK       ID kendaraan
  customer_id    BIGINT        FK       Pemilik kendaraan
  plate_number   VARCHAR(15)   UNIQUE   Nomor polisi
  brand          VARCHAR(50)            Merek
  model          VARCHAR(50)            Model/tipe
  year           SMALLINT               Tahun kendaraan
  color          VARCHAR(30)            Warna
  created_at     TIMESTAMP              Waktu pembuatan

Relasi:

``` text
customers.id
     |
     v
vehicles.customer_id
```

Satu customer dapat memiliki lebih dari satu kendaraan.

------------------------------------------------------------------------

# 17. Tabel SERVICES

  Field          Type            Key      Keterangan
  -------------- --------------- -------- -----------------
  id             BIGINT          PK       ID service
  vehicle_id     BIGINT          FK       ID kendaraan
  service_code   VARCHAR(30)     UNIQUE   Kode service
  service_date   DATE                     Tanggal service
  service_type   VARCHAR(100)             Jenis service
  complaint      TEXT                     Keluhan
  mechanic       VARCHAR(100)             Mekanik
  status         VARCHAR(30)              Status service
  notes          TEXT                     Catatan
  total_cost     DECIMAL(12,2)            Total biaya
  created_at     TIMESTAMP                Waktu pembuatan
  updated_at     TIMESTAMP                Waktu perubahan

Status awal yang direkomendasikan:

``` text
Menunggu
Dikerjakan
Selesai
Diambil
Dibatalkan
```

------------------------------------------------------------------------

# 18. Tabel SERVICE_ITEMS

  Field        Type            Key   Keterangan
  ------------ --------------- ----- --------------------------
  id           BIGINT          PK    ID item
  service_id   BIGINT          FK    ID service
  item_name    VARCHAR(150)          Nama pekerjaan/sparepart
  item_type    VARCHAR(50)           Jenis item
  quantity     INT                   Jumlah
  price        DECIMAL(12,2)         Harga
  subtotal     DECIMAL(12,2)         Subtotal

Relasi:

``` text
services.id
     |
     v
service_items.service_id
```

------------------------------------------------------------------------

# 19. ERD

``` text
+---------------------+
|      CUSTOMERS      |
+---------------------+
| PK id               |
|    name             |
|    phone            |
|    address          |
|    created_at       |
|    updated_at       |
+----------+----------+
           |
           | 1
           |
           | N
           v
+---------------------+
|      VEHICLES       |
+---------------------+
| PK id               |
| FK customer_id      |
|    plate_number     |
|    brand            |
|    model            |
|    year              |
|    color             |
|    created_at       |
+----------+----------+
           |
           | 1
           |
           | N
           v
+---------------------+
|      SERVICES       |
+---------------------+
| PK id               |
| FK vehicle_id       |
|    service_code     |
|    service_date     |
|    service_type     |
|    complaint        |
|    mechanic         |
|    status            |
|    notes             |
|    total_cost       |
|    created_at       |
|    updated_at       |
+----------+----------+
           |
           | 1
           |
           | N
           v
+---------------------+
|   SERVICE_ITEMS     |
+---------------------+
| PK id               |
| FK service_id       |
|    item_name        |
|    item_type        |
|    quantity          |
|    price             |
|    subtotal          |
+---------------------+


+---------------------+
|       ADMINS        |
+---------------------+
| PK id               |
|    name             |
|    username         |
|    password_hash    |
|    created_at       |
+---------------------+
```

------------------------------------------------------------------------

# 20. API Design

Backend PHP menggunakan pendekatan REST API.

## Authentication

``` text
POST /api/auth/login.php
POST /api/auth/logout.php
```

## Customer

``` text
GET    /api/customers/index.php
GET    /api/customers/detail.php?id={id}
POST   /api/customers/index.php
PUT    /api/customers/index.php?id={id}
DELETE /api/customers/index.php?id={id}
```

## Vehicle

``` text
GET    /api/vehicles/index.php
GET    /api/vehicles/detail.php?id={id}
GET    /api/vehicles/search.php?plate={plate}
POST   /api/vehicles/index.php
PUT    /api/vehicles/index.php?id={id}
DELETE /api/vehicles/index.php?id={id}
```

## Service

``` text
GET    /api/services/index.php
GET    /api/services/detail.php?id={id}
POST   /api/services/create.php
PUT    /api/services/update.php?id={id}
DELETE /api/services/delete.php?id={id}
```

## Laporan

``` text
GET /api/reports/index.php
```

------------------------------------------------------------------------

# 21. Contoh Response API CS

Request:

``` text
GET /api/vehicles/search.php?plate=B1234ABC
```

Response:

``` json
{
  "success": true,
  "data": {
    "vehicle": {
      "plate_number": "B 1234 ABC",
      "brand": "Honda",
      "model": "Beat"
    },
    "services": [
      {
        "service_date": "2026-08-25",
        "service_type": "Service Ringan",
        "status": "Selesai"
      },
      {
        "service_date": "2026-06-12",
        "service_type": "Ganti Oli",
        "status": "Selesai"
      }
    ]
  }
}
```

Data yang dikembalikan kepada CS harus dibatasi sesuai kebutuhan.

------------------------------------------------------------------------

# 22. Keamanan

Minimum security requirement:

-   HTTPS.
-   Password hashing.
-   Validasi seluruh input.
-   Sanitasi input.
-   Prepared query / parameterized query.
-   Authentication untuk endpoint admin.
-   Authorization untuk endpoint admin.
-   CS tidak memiliki akses CRUD.
-   Rate limiting pada pencarian nomor polisi.
-   Jangan mengirim credential database ke frontend.
-   Environment variable untuk credential.
-   Jangan menyimpan secret di repository GitHub.
-   Jangan menampilkan error database mentah kepada pengguna.
-   Batasi data customer yang ditampilkan kepada CS.

## Perlindungan pencarian nomor polisi

Karena CS menggunakan nomor polisi tanpa login, endpoint pencarian perlu
diberikan perlindungan terhadap brute-force atau scraping.

Minimal:

``` text
Rate Limit
+
Input Validation
+
Logging
+
Minimal Response Data
```

Jika diperlukan oleh bengkel, tambahkan PIN akses CS.

------------------------------------------------------------------------

# 23. Responsive Design

Pendekatan yang digunakan adalah **Mobile First**.

Prioritas:

``` text
Mobile
  ↓
Tablet
  ↓
Desktop
```

CS:

``` text
Mobile First
```

Admin:

``` text
Mobile First
+
Desktop Responsive
```

Bootstrap digunakan untuk:

-   grid;
-   form;
-   button;
-   card;
-   navbar;
-   modal;
-   badge;
-   table;
-   responsive utilities.

Custom CSS hanya digunakan untuk identitas visual dan kebutuhan UI yang
tidak tersedia secara default dari Bootstrap.

------------------------------------------------------------------------

# 24. MVP / Tahap Development

Development jangan langsung membuat seluruh fitur.

## Sprint 1 --- Project Foundation

-   Setup repository.
-   Setup frontend.
-   Setup Bootstrap.
-   Setup PHP.
-   Setup environment.
-   Setup Supabase.
-   Setup database.
-   Setup deployment.

## Sprint 2 --- Authentication

-   Admin login.
-   Logout.
-   Middleware authentication.
-   Authorization admin.

## Sprint 3 --- Customer

-   Customer list.
-   Tambah customer.
-   Edit customer.
-   Detail customer.
-   Hapus customer.

## Sprint 4 --- Vehicle

-   Kendaraan list.
-   Tambah kendaraan.
-   Edit kendaraan.
-   Detail kendaraan.
-   Relasi customer-kendaraan.

## Sprint 5 --- Service

-   Tambah service.
-   Edit service.
-   Detail service.
-   Status service.
-   Service items.
-   Riwayat service.

## Sprint 6 --- CS Read Only

-   Input nomor polisi.
-   Search vehicle.
-   Tampilkan kendaraan.
-   Tampilkan riwayat.
-   Tampilkan detail service.
-   Empty state jika data tidak ditemukan.

## Sprint 7 --- Dashboard & Report

-   Statistik customer.
-   Statistik kendaraan.
-   Service hari ini.
-   Service berdasarkan status.
-   Laporan sederhana.

## Sprint 8 --- Testing & Deployment

-   Functional testing.
-   Responsive testing.
-   Security testing.
-   API testing.
-   Database testing.
-   Deployment.
-   Dokumentasi.

------------------------------------------------------------------------

# 25. Acceptance Criteria MVP

Project dianggap memenuhi MVP apabila:

### Admin

-   Admin dapat login.
-   Admin dapat menambah customer.
-   Admin dapat mengubah customer.
-   Admin dapat menghapus customer.
-   Admin dapat menambah kendaraan.
-   Admin dapat mengubah kendaraan.
-   Admin dapat menambah service.
-   Admin dapat mengubah service.
-   Admin dapat melihat riwayat service.

### CS

-   CS dapat membuka halaman mobile.
-   CS dapat memasukkan nomor polisi.
-   Sistem dapat mencari kendaraan.
-   Sistem dapat menampilkan data kendaraan.
-   Sistem dapat menampilkan daftar tanggal service.
-   Sistem dapat menampilkan jenis service.
-   CS tidak dapat melakukan CRUD.

### Database

-   Relasi customer-kendaraan berjalan.
-   Relasi kendaraan-service berjalan.
-   Relasi service-service_items berjalan.
-   Data tersimpan secara konsisten.

------------------------------------------------------------------------

# 26. Prinsip Development

1.  Jangan membuat fitur yang belum dibutuhkan.
2.  Utamakan mobile-first.
3.  Pisahkan frontend dan backend.
4.  Gunakan API sebagai penghubung frontend dengan database.
5.  Jangan menyimpan secret di frontend.
6.  Gunakan validasi pada frontend dan backend.
7.  Gunakan database relational dengan foreign key.
8.  Jangan menghapus data penting tanpa pertimbangan.
9.  Buat UI sederhana agar mudah digunakan CS.
10. Setiap fitur harus diuji sebelum berpindah ke fitur berikutnya.
11. Jangan melakukan perubahan besar pada struktur database tanpa
    memperbarui dokumentasi.
12. Semua perubahan project harus dicatat dalam Git.

------------------------------------------------------------------------

# 27. Catatan Deployment

Target deployment:

``` text
GitHub
   |
   v
Vercel
   |
   v
Frontend + PHP API
   |
   v
Supabase PostgreSQL
```

Konfigurasi deployment PHP harus diuji pada environment Vercel yang
digunakan.

Environment variable tidak boleh ditulis langsung pada source code.

Contoh konsep:

``` text
SUPABASE_URL
SUPABASE_KEY
APP_ENV
APP_SECRET
```

Nilai sebenarnya disimpan pada environment configuration, bukan
repository.

------------------------------------------------------------------------

# 28. Rencana Pengembangan Berikutnya

Setelah MVP berhasil, fitur berikut dapat dipertimbangkan:

-   PWA / installable web app.
-   QR code kendaraan.
-   Cetak nota service.
-   Export laporan.
-   Filter tanggal.
-   Dashboard grafik.
-   Reminder service.
-   WhatsApp notification jika dibutuhkan.
-   Foto kondisi kendaraan.
-   Manajemen sparepart.
-   Multi-admin.
-   Audit log.
-   Backup dan recovery.

Fitur tambahan tidak boleh mengganggu kebutuhan inti sistem.

------------------------------------------------------------------------

# 29. Kesimpulan Arsitektur

``` text
                     BENGKEL MOTOR
                           |
             +-------------+-------------+
             |                           |
             v                           v
            CS                         ADMIN
             |                           |
        READ ONLY                     CRUD
             |                           |
     Input nomor plat             Kelola data
             |                           |
             +-------------+-------------+
                           |
                           v
                    JavaScript
                           |
                           v
                      PHP REST API
                           |
                           v
                 Supabase PostgreSQL
                           |
                           v
                    Data Service
```

**Stack final:**

``` text
Frontend : HTML + CSS + JavaScript + Bootstrap 5
Backend  : PHP REST API
Database : Supabase PostgreSQL
Hosting  : Vercel
Design   : Mobile First
Method   : Agile Development
```

Dokumen ini menjadi **baseline spesifikasi development**. Implementasi
di Antigravity harus mengikuti dokumen ini terlebih dahulu. Perubahan
kebutuhan selama development harus memperbarui dokumen dan struktur
sistem sebelum coding dilanjutkan.
