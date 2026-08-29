# DESIGN SPECIFICATION --- SISTEM INFORMASI SERVICE BENGKEL MOTOR

## 1. Tujuan Desain

Dokumen ini menjadi acuan desain UI/UX untuk pengembangan Sistem
Informasi Service Bengkel Motor.

Prioritas desain:

-   Mobile-first.
-   Sederhana dan cepat digunakan.
-   Tampilan profesional tetapi tidak berlebihan.
-   Mudah dipahami pengguna non-teknis.
-   Fokus pada kebutuhan CS dan Admin.
-   Responsive pada smartphone, tablet, dan desktop.
-   Menggunakan Bootstrap 5 sebagai dasar komponen UI.
-   Custom CSS digunakan untuk identitas visual dan penyempurnaan
    tampilan.

------------------------------------------------------------------------

# 2. Konsep Visual

Konsep visual yang digunakan:

**Modern Workshop / Clean Professional**

Karakter desain:

-   Bersih.
-   Minimalis.
-   Tegas.
-   Profesional.
-   Banyak menggunakan whitespace.
-   Card dengan sudut sedikit rounded.
-   Tombol jelas.
-   Informasi penting memiliki hierarchy yang kuat.
-   Tidak menggunakan dekorasi yang mengganggu pekerjaan CS/Admin.

Desain tidak dibuat seperti marketplace atau aplikasi e-commerce.

Fokus utama adalah:

> Data kendaraan → Service → Riwayat Service

------------------------------------------------------------------------

# 3. Target Device

## CS

Prioritas:

``` text
Smartphone
   ↓
Tablet
```

CS menggunakan sistem terutama melalui smartphone.

## Admin

Prioritas:

``` text
Smartphone
   ↓
Tablet
   ↓
Desktop
```

Admin harus tetap dapat menggunakan sistem melalui desktop untuk
pengelolaan data yang lebih nyaman.

------------------------------------------------------------------------

# 4. Responsive Breakpoint

Gunakan breakpoint Bootstrap:

``` text
xs  : < 576px
sm  : ≥ 576px
md  : ≥ 768px
lg  : ≥ 992px
xl  : ≥ 1200px
xxl : ≥ 1400px
```

Prinsip:

``` text
Mobile
↓
Tablet
↓
Desktop
```

Jangan membuat desktop terlebih dahulu kemudian hanya mengecilkannya.

------------------------------------------------------------------------

# 5. Layout CS

CS memiliki interface yang sangat sederhana.

## Halaman Utama

``` text
┌─────────────────────────┐
│                         │
│      🔧 BENGKEL         │
│       MOTOR             │
│                         │
│  Cek Riwayat Service    │
│                         │
│  Nomor Polisi           │
│  ┌─────────────────────┐│
│  │ B 1234 ABC          ││
│  └─────────────────────┘│
│                         │
│       [ CARI ]          │
│                         │
│  Masukkan nomor polisi  │
│  kendaraan pelanggan.   │
│                         │
└─────────────────────────┘
```

### Komponen

-   Logo/nama bengkel.
-   Judul.
-   Input nomor polisi.
-   Tombol Cari.
-   Informasi bantuan singkat.

Tidak perlu:

-   Sidebar.
-   Dashboard.
-   Menu admin.
-   Form panjang.
-   Login CS, kecuali nantinya dibutuhkan oleh owner.

------------------------------------------------------------------------

# 6. Input Nomor Polisi

Input nomor polisi merupakan komponen utama CS.

Karakteristik:

-   Ukuran input besar.
-   Mudah ditekan.
-   Placeholder jelas.
-   Auto uppercase.
-   Spasi dapat dinormalisasi oleh JavaScript.
-   Validasi dilakukan sebelum request API.
-   Tombol pencarian mudah dijangkau.

Contoh:

``` text
Nomor Polisi

┌──────────────────────────┐
│ B 1234 ABC               │
└──────────────────────────┘

[ 🔍 CARI RIWAYAT ]
```

JavaScript dapat menormalisasi:

``` text
b 1234 abc
      ↓
B1234ABC
```

Database tetap dapat menyimpan format tampilan yang konsisten, misalnya:

``` text
B 1234 ABC
```

------------------------------------------------------------------------

# 7. Loading State CS

Saat pencarian berlangsung:

``` text
┌──────────────────────────┐
│                          │
│       ⟳ Mencari...       │
│                          │
│   Mohon tunggu sebentar  │
│                          │
└──────────────────────────┘
```

Jangan membuat pengguna menekan tombol berkali-kali.

Button dinonaktifkan sementara request berlangsung.

------------------------------------------------------------------------

# 8. Empty State

Jika nomor polisi tidak ditemukan:

``` text
┌──────────────────────────┐
│                          │
│          🔍              │
│                          │
│  Kendaraan tidak         │
│  ditemukan               │
│                          │
│  Periksa kembali nomor   │
│  polisi yang dimasukkan. │
│                          │
│     [ COBA LAGI ]        │
│                          │
└──────────────────────────┘
```

Pesan harus informatif tetapi tidak membocorkan informasi database.

------------------------------------------------------------------------

# 9. Hasil Pencarian CS

Jika ditemukan:

``` text
┌──────────────────────────┐
│ ← Kembali                │
│                          │
│ B 1234 ABC               │
│ Honda Beat               │
│                          │
│ Riwayat Service          │
│                          │
│ ┌──────────────────────┐ │
│ │ 25 AGU 2026          │ │
│ │ Service Ringan       │ │
│ │ ● Selesai            │ │
│ └──────────────────────┘ │
│                          │
│ ┌──────────────────────┐ │
│ │ 12 JUN 2026          │ │
│ │ Ganti Oli            │ │
│ │ ● Selesai            │ │
│ └──────────────────────┘ │
│                          │
│ ┌──────────────────────┐ │
│ │ 10 MAR 2026          │ │
│ │ Service CVT          │ │
│ │ ● Selesai            │ │
│ └──────────────────────┘ │
└──────────────────────────┘
```

Urutan riwayat:

``` text
Terbaru
↓
Terlama
```

------------------------------------------------------------------------

# 10. Service Card

Setiap riwayat service ditampilkan sebagai card.

Isi minimal:

``` text
Tanggal
Jenis Service
Status
```

Contoh:

``` text
25 AGU 2026
Service Ringan

● Selesai
```

Jika detail diperlukan, card dapat diklik:

``` text
[ LIHAT DETAIL ]
```

atau seluruh card dibuat clickable.

------------------------------------------------------------------------

# 11. Detail Service CS

Informasi yang ditampilkan harus sesuai kebutuhan bengkel.

Contoh:

``` text
┌──────────────────────────┐
│ Detail Service           │
│                          │
│ B 1234 ABC               │
│ Honda Beat               │
│                          │
│ Tanggal                  │
│ 25 Agustus 2026          │
│                          │
│ Jenis Service            │
│ Service Ringan           │
│                          │
│ Status                   │
│ ● Selesai                │
│                          │
│ Pekerjaan                │
│ • Pemeriksaan umum       │
│ • Ganti oli              │
│ • Pemeriksaan rem        │
│                          │
└──────────────────────────┘
```

Data sensitif tidak perlu ditampilkan kepada CS jika tidak dibutuhkan.

Contohnya:

-   password;
-   data internal admin;
-   informasi internal bengkel;
-   credential;
-   catatan internal yang bersifat rahasia.

Harga service hanya ditampilkan jika owner memang menghendakinya.

------------------------------------------------------------------------

# 12. Navigasi CS

CS tidak membutuhkan bottom navigation kompleks.

Struktur:

``` text
Cek Service
   ↓
Hasil
   ↓
Detail
   ↓
Kembali
```

Tombol kembali harus jelas.

------------------------------------------------------------------------

# 13. Layout Admin

Admin menggunakan layout yang lebih lengkap.

Desktop:

``` text
┌──────────────┬───────────────────────────────┐
│              │                               │
│   BENGKEL    │ Dashboard                     │
│              │                               │
│ Dashboard    │ ┌──────┐ ┌──────┐ ┌──────┐ │
│ Customer     │ │ 120  │ │ 180  │ │ 15   │ │
│ Kendaraan    │ │Cust. │ │Motor │ │Svc.  │ │
│ Service      │ └──────┘ └──────┘ └──────┘ │
│ Laporan      │                               │
│ Pengaturan   │ Service Terbaru              │
│              │                               │
│ Logout       │ [data service]                │
│              │                               │
└──────────────┴───────────────────────────────┘
```

Mobile:

``` text
┌─────────────────────────┐
│ ☰  Dashboard       👤  │
├─────────────────────────┤
│                         │
│ Selamat datang, Admin   │
│                         │
│ ┌──────────┐ ┌────────┐│
│ │ 120      │ │ 180    ││
│ │ Customer │ │ Motor  ││
│ └──────────┘ └────────┘│
│                         │
│ ┌──────────┐ ┌────────┐│
│ │ 15       │ │ Selesai││
│ │ Service  │ │ 10     ││
│ └──────────┘ └────────┘│
│                         │
│ Service Terbaru         │
│                         │
└─────────────────────────┘
```

------------------------------------------------------------------------

# 14. Admin Navigation

Desktop:

``` text
Sidebar
├── Dashboard
├── Customer
├── Kendaraan
├── Service
├── Laporan
├── Pengaturan
└── Logout
```

Mobile:

``` text
☰ Menu
```

Sidebar berubah menjadi offcanvas Bootstrap.

------------------------------------------------------------------------

# 15. Admin Dashboard

Dashboard menampilkan ringkasan:

``` text
Customer
Kendaraan
Service Hari Ini
Service Aktif
Service Selesai
Pendapatan
```

Pendapatan bersifat opsional dan hanya digunakan jika owner
menginginkannya.

Contoh:

``` text
┌──────────────┐
│ Customer     │
│ 120          │
└──────────────┘

┌──────────────┐
│ Kendaraan    │
│ 180          │
└──────────────┘

┌──────────────┐
│ Service Hari │
│ Ini          │
│ 15           │
└──────────────┘

┌──────────────┐
│ Service      │
│ Aktif        │
│ 5            │
└──────────────┘
```

------------------------------------------------------------------------

# 16. Halaman Customer Admin

Desktop:

``` text
Customer

[ + Tambah Customer ]

[ 🔍 Cari customer................ ]

┌─────────────────────────────────────┐
│ Nama          │ No. HP     │ Aksi   │
├─────────────────────────────────────┤
│ Budi Santoso  │ 0812...    │ Detail │
│ Andi          │ 0813...    │ Detail │
└─────────────────────────────────────┘
```

Mobile menggunakan card:

``` text
┌──────────────────────────┐
│ Budi Santoso             │
│ 081234567890             │
│                          │
│ [ DETAIL ] [ EDIT ]      │
└──────────────────────────┘
```

------------------------------------------------------------------------

# 17. Form Customer

``` text
Tambah Customer

Nama
[_____________________]

Nomor HP
[_____________________]

Alamat
[_____________________]

[ BATAL ]     [ SIMPAN ]
```

Validasi:

-   Nama wajib.
-   Nomor HP wajib.
-   Nomor HP memiliki format yang valid.
-   Field tidak boleh berisi input berbahaya.
-   Tampilkan pesan error di dekat field.

------------------------------------------------------------------------

# 18. Halaman Kendaraan

``` text
Kendaraan

[ + Tambah Kendaraan ]

[ 🔍 Cari nomor polisi ]

┌──────────────────────────┐
│ B 1234 ABC               │
│ Honda Beat               │
│ Pemilik: Budi Santoso    │
│                          │
│ [ DETAIL ] [ EDIT ]      │
└──────────────────────────┘
```

Informasi utama:

-   Nomor polisi.
-   Merek.
-   Model.
-   Pemilik.

------------------------------------------------------------------------

# 19. Form Kendaraan

``` text
Tambah Kendaraan

Customer
[ Pilih Customer ▼ ]

Nomor Polisi
[ B 1234 ABC ]

Merek
[ Honda ▼ ]

Model
[ Beat ]

Tahun
[ 2024 ]

Warna
[ Hitam ]

[ BATAL ]     [ SIMPAN ]
```

------------------------------------------------------------------------

# 20. Halaman Service

``` text
Service

[ + Service Baru ]

[ 🔍 Cari service ]

Filter:
[ Status ▼ ] [ Tanggal ▼ ]

┌──────────────────────────┐
│ SRV-2026-00125           │
│ B 1234 ABC               │
│ Honda Beat               │
│ 25 Agustus 2026          │
│ Service Ringan           │
│ ● Selesai                │
│                          │
│ [ DETAIL ]               │
└──────────────────────────┘
```

------------------------------------------------------------------------

# 21. Form Service

Form service dibuat bertahap agar nyaman pada mobile.

## Step 1 --- Kendaraan

``` text
Nomor Polisi
[ B 1234 ABC ]

[ CARI KENDARAAN ]
```

## Step 2 --- Service

``` text
Jenis Service
[ Service Ringan ▼ ]

Keluhan
[_____________________]

Mekanik
[ Pilih Mekanik ▼ ]

Status
[ Menunggu ▼ ]

Catatan
[_____________________]
```

## Step 3 --- Item

``` text
Item Service

Oli
Qty: 1
Harga: Rp60.000

Busi
Qty: 1
Harga: Rp40.000

[ + Tambah Item ]
```

## Step 4 --- Simpan

``` text
Total
Rp100.000

[ SIMPAN SERVICE ]
```

------------------------------------------------------------------------

# 22. Status Service

Gunakan status yang konsisten:

``` text
Menunggu
Dikerjakan
Selesai
Diambil
Dibatalkan
```

Visual status menggunakan Bootstrap Badge.

Contoh:

``` text
● Menunggu
● Dikerjakan
● Selesai
● Diambil
● Dibatalkan
```

Warna badge mengikuti semantic Bootstrap, bukan warna acak.

------------------------------------------------------------------------

# 23. Modal Konfirmasi

Operasi yang berisiko seperti delete harus menggunakan konfirmasi.

Contoh:

``` text
Hapus Customer?

Data customer dan hubungan datanya
perlu diperiksa sebelum dihapus.

[ BATAL ]     [ HAPUS ]
```

Jangan menghapus data hanya karena tombol tidak sengaja ditekan.

------------------------------------------------------------------------

# 24. Toast / Notification

Setelah operasi berhasil:

``` text
✓ Customer berhasil disimpan
```

atau:

``` text
✓ Service berhasil diperbarui
```

Untuk error:

``` text
⚠ Data gagal disimpan.
Periksa kembali input Anda.
```

Gunakan Bootstrap Toast/Alert.

------------------------------------------------------------------------

# 25. Form Validation UI

Validasi harus jelas.

Contoh:

``` text
Nomor Polisi
┌──────────────────────────┐
│                          │
└──────────────────────────┘
⚠ Nomor polisi wajib diisi
```

Validasi dilakukan:

``` text
Frontend JavaScript
+
Backend PHP
```

Frontend untuk UX.

Backend untuk keamanan dan integritas data.

------------------------------------------------------------------------

# 26. Typography

Gunakan font sans-serif yang mudah dibaca.

Prioritas:

``` text
System UI / Inter
```

Jika menggunakan Google Fonts, pastikan penggunaan font tidak mengganggu
performa mobile.

Hierarchy:

``` text
H1
24–32px

H2
20–24px

H3
18–20px

Body
14–16px

Caption
12–14px
```

Jangan menggunakan terlalu banyak ukuran font.

------------------------------------------------------------------------

# 27. Spacing

Gunakan spacing Bootstrap sebagai standar:

``` text
4px
8px
12px
16px
24px
32px
48px
```

Hindari margin/padding acak.

------------------------------------------------------------------------

# 28. Border Radius

Gunakan radius moderat:

``` text
Card       : 12px
Input      : 8px
Button     : 8px
Modal      : 12px
Badge      : Bootstrap default
```

Jangan membuat semua elemen terlalu bulat seperti aplikasi sosial media.

------------------------------------------------------------------------

# 29. Button

Button utama harus konsisten.

Contoh:

``` text
[ SIMPAN ]
[ CARI ]
[ TAMBAH SERVICE ]
```

Button destructive:

``` text
[ HAPUS ]
```

Button secondary:

``` text
[ BATAL ]
```

Ukuran button mobile harus nyaman disentuh.

Target area sentuh minimal sekitar 44px.

------------------------------------------------------------------------

# 30. Card

Gunakan card untuk:

-   riwayat service;
-   customer;
-   kendaraan;
-   dashboard statistic;
-   service.

Card jangan terlalu penuh.

Contoh:

``` text
┌─────────────────────────┐
│ B 1234 ABC              │
│ Honda Beat              │
│                         │
│ Service Ringan          │
│ 25 Agustus 2026         │
│ ● Selesai               │
│                         │
│ [ DETAIL ]              │
└─────────────────────────┘
```

------------------------------------------------------------------------

# 31. Table

Table digunakan terutama pada desktop.

Pada mobile, table dapat:

-   berubah menjadi card;
-   menggunakan horizontal scroll jika data memang harus berbentuk
    tabel.

Jangan memaksakan table lebar ke layar smartphone.

------------------------------------------------------------------------

# 32. Search UX

Search customer:

``` text
Nama / Nomor HP
```

Search kendaraan:

``` text
Nomor Polisi
```

Search service:

``` text
Kode Service / Nomor Polisi
```

CS:

``` text
Nomor Polisi
```

Search harus memiliki loading state dan empty state.

------------------------------------------------------------------------

# 33. Accessibility

UI harus memperhatikan:

-   label form yang jelas;
-   kontras teks memadai;
-   tombol memiliki teks yang jelas;
-   jangan hanya mengandalkan warna untuk status;
-   input dapat digunakan dengan keyboard;
-   ukuran touch target nyaman;
-   alt text untuk gambar yang memiliki informasi;
-   focus state tetap terlihat.

------------------------------------------------------------------------

# 34. Performance Mobile

Prioritas:

-   HTML sederhana.
-   CSS tidak berlebihan.
-   JavaScript modular.
-   Bootstrap digunakan secara efisien.
-   Hindari library tambahan yang tidak diperlukan.
-   Optimalkan gambar.
-   Gunakan lazy loading untuk gambar jika diperlukan.
-   API mengembalikan data secukupnya.
-   Hindari request API berulang.

CS harus dapat melakukan:

``` text
Buka
↓
Input plat
↓
Cari
↓
Hasil
```

dengan sesedikit mungkin interaksi.

------------------------------------------------------------------------

# 35. Error State

Minimal terdapat:

## 404

``` text
Halaman tidak ditemukan
[ KEMBALI ]
```

## 500

``` text
Terjadi kesalahan pada server.
Silakan coba kembali.
```

## Network Error

``` text
Tidak dapat terhubung ke server.
Periksa koneksi internet Anda.
[ COBA LAGI ]
```

Jangan menampilkan error PHP/database mentah kepada pengguna.

------------------------------------------------------------------------

# 36. Empty State Admin

Jika belum ada data:

``` text
Belum ada customer

Tambahkan customer pertama
untuk mulai menggunakan sistem.

[ + TAMBAH CUSTOMER ]
```

Untuk service:

``` text
Belum ada service

[ + SERVICE BARU ]
```

------------------------------------------------------------------------

# 37. Login Admin

Tampilan:

``` text
┌─────────────────────────┐
│                         │
│      🔧 BENGKEL         │
│                         │
│     Admin Login         │
│                         │
│ Username                │
│ [____________________]  │
│                         │
│ Password                │
│ [____________________]  │
│                         │
│      [ LOGIN ]          │
│                         │
└─────────────────────────┘
```

Login hanya untuk Admin.

CS tidak perlu menggunakan halaman login Admin.

------------------------------------------------------------------------

# 38. Responsive Admin Navigation

Desktop:

``` text
Sidebar tetap
```

Mobile:

``` text
Hamburger
    ↓
Bootstrap Offcanvas
```

Contoh:

``` text
☰ Menu

Dashboard
Customer
Kendaraan
Service
Laporan
Pengaturan
Logout
```

------------------------------------------------------------------------

# 39. Warna

Gunakan palet yang profesional dan konsisten.

Konsep:

``` text
Primary
Warna identitas bengkel

Background
Netral / terang

Surface
Putih

Text
Gelap

Muted
Abu-abu

Success
Bootstrap success

Warning
Bootstrap warning

Danger
Bootstrap danger
```

Warna brand final harus ditentukan berdasarkan identitas/logo bengkel.

Jangan membuat banyak warna tanpa fungsi.

------------------------------------------------------------------------

# 40. Design Token

Simpan nilai visual utama dalam CSS variables agar mudah diubah.

Contoh:

``` css
:root {
    --brand-primary: ...;
    --brand-secondary: ...;
    --surface: ...;
    --background: ...;
    --text-primary: ...;
    --text-secondary: ...;
    --border-radius: 12px;
}
```

Nilai warna final ditentukan ketika identitas visual bengkel sudah
diketahui.

------------------------------------------------------------------------

# 41. Prinsip UI yang Wajib Dipertahankan

``` text
SIMPLE
   ↓
CLEAR
   ↓
FAST
   ↓
MOBILE FIRST
   ↓
CONSISTENT
```

Jangan menambahkan komponen hanya karena terlihat menarik.

Setiap komponen harus mempunyai fungsi.

------------------------------------------------------------------------

# 42. Design Flow

## CS

``` text
Open Website
     ↓
Input Plat
     ↓
Search
     ↓
Loading
     ↓
Vehicle Found?
   /       \
 No         Yes
 |           |
Error      Vehicle
             ↓
       Service History
             ↓
        Detail Service
```

## Admin

``` text
Login
  ↓
Dashboard
  ↓
Customer
  ↓
Vehicle
  ↓
Service
  ↓
Service Detail
  ↓
Update Status
  ↓
History / Report
```

------------------------------------------------------------------------

# 43. Prioritas UI Development

Development UI dilakukan dalam urutan:

``` text
1. Global Layout
2. Mobile CSS
3. CS Search
4. CS Result
5. CS Detail
6. Admin Login
7. Admin Dashboard
8. Customer
9. Vehicle
10. Service
11. Reports
12. Error / Empty / Loading States
13. Responsive Refinement
14. Accessibility
15. Performance
```

------------------------------------------------------------------------

# 44. Larangan Design

Jangan:

-   menggunakan terlalu banyak animasi;
-   menggunakan carousel yang tidak diperlukan;
-   menggunakan popup berlebihan;
-   membuat form terlalu panjang dalam satu layar;
-   membuat tabel desktop dipaksakan ke mobile;
-   menggunakan warna berbeda untuk setiap komponen;
-   menampilkan informasi sensitif kepada CS;
-   membuat CS masuk ke dashboard admin;
-   menambahkan fitur yang belum disepakati;
-   menggunakan icon tanpa arti yang jelas.

------------------------------------------------------------------------

# 45. Definition of Done UI

Sebuah halaman dianggap selesai apabila:

-   responsive pada mobile;
-   responsive pada desktop jika halaman admin;
-   loading state tersedia;
-   empty state tersedia;
-   error state tersedia;
-   form memiliki validation;
-   button memiliki feedback;
-   tidak ada overflow horizontal yang tidak diperlukan;
-   teks mudah dibaca;
-   touch target nyaman;
-   konsisten dengan design system;
-   tidak ada console error JavaScript yang diketahui;
-   API error ditangani dengan baik.

------------------------------------------------------------------------

# 46. Design Source of Truth

Dokumen ini menjadi acuan utama untuk:

-   layout;
-   UI/UX;
-   warna;
-   typography;
-   spacing;
-   component;
-   responsive behavior;
-   CS interface;
-   Admin interface.

Jika terjadi perubahan desain, dokumentasi harus diperbarui terlebih
dahulu sebelum implementasi.

------------------------------------------------------------------------

# 47. Target Akhir

Hasil akhir harus terasa seperti:

``` text
Aplikasi Bengkel Modern
          +
Web Mobile
          +
Simple UI
          +
Fast Search
          +
Professional Admin Panel
```

Bukan seperti:

``` text
Website CRUD sederhana
```

Fokus utama sistem:

> **CS dapat menemukan riwayat kendaraan dengan cepat hanya menggunakan
> nomor polisi, sedangkan Admin memiliki kontrol penuh untuk mengelola
> data service.**



