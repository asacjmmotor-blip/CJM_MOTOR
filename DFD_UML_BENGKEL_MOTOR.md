# DFD & UML --- SISTEM INFORMASI SERVICE BENGKEL MOTOR

## 1. Identitas Dokumen

**Nama Sistem:** Sistem Informasi Service Bengkel Motor\
**Platform:** Web Mobile / Responsive Web\
**Frontend:** HTML, CSS, JavaScript, Bootstrap 5\
**Backend:** PHP REST API\
**Database:** Supabase PostgreSQL\
**Deployment:** Vercel\
**Aktor:** Admin dan CS

Dokumen ini menjadi acuan perancangan **Data Flow Diagram (DFD)** dan
**Unified Modeling Language (UML)** untuk sistem informasi service
bengkel motor.

------------------------------------------------------------------------

# BAGIAN A --- DATA FLOW DIAGRAM (DFD)

# 2. Konteks Sistem

Sistem memiliki dua entitas eksternal utama:

### Admin

Admin memiliki akses untuk mengelola data:

-   Customer.
-   Kendaraan.
-   Service.
-   Item service.
-   Laporan.
-   Akun admin.

### CS

CS memiliki akses **read only** untuk:

-   memasukkan nomor polisi;
-   mencari kendaraan;
-   melihat data kendaraan;
-   melihat riwayat service;
-   melihat detail service yang diizinkan.

CS tidak mempunyai akses CRUD.

------------------------------------------------------------------------

# 3. DFD Level 0 --- Context Diagram

``` text
                         ┌─────────────────┐
                         │      ADMIN      │
                         └────────┬────────┘
                                  │
                                  │
                 Data Customer    │
                 Data Kendaraan   │
                 Data Service     │
                 Data Item        │
                 Data Login       │
                                  │
                                  ▼
              ┌──────────────────────────────┐
              │                              │
              │ SISTEM INFORMASI SERVICE     │
              │        BENGKEL MOTOR         │
              │                              │
              └──────────────┬───────────────┘
                             │
                             │
                Dashboard    │
                Data         │
                Service      │
                Laporan      │
                             │
                             ▼
                         ┌─────────┐
                         │  ADMIN  │
                         └─────────┘


                         ┌─────────┐
                         │   CS    │
                         └────┬────┘
                              │
                              │ Nomor Polisi
                              ▼
              ┌──────────────────────────────┐
              │ SISTEM INFORMASI SERVICE     │
              │        BENGKEL MOTOR         │
              └──────────────┬───────────────┘
                             │
                             │ Data Kendaraan
                             │ Riwayat Service
                             │ Detail Service
                             ▼
                         ┌─────────┐
                         │   CS    │
                         └─────────┘
```

------------------------------------------------------------------------

# 4. DFD Level 1

Proses utama sistem terdiri dari:

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
D1 = Admin
D2 = Customers
D3 = Vehicles
D4 = Services
D5 = Service Items
```

Diagram:

``` text
                           ┌─────────┐
                           │  ADMIN  │
                           └────┬────┘
                                │
                                │ Username + Password
                                ▼
                         ┌───────────────┐
                         │ 1.0 LOGIN     │
                         │     ADMIN     │
                         └───────┬───────┘
                                 │
                                 ▼
                           ┌───────────┐
                           │ D1 ADMIN  │
                           └───────────┘


ADMIN
 │
 │ Data Customer
 ▼
┌─────────────────────┐
│ 2.0 KELOLA CUSTOMER │
└──────────┬──────────┘
           │
           ▼
     ┌────────────┐
     │ D2 CUSTOMER│
     └────────────┘


ADMIN
 │
 │ Data Kendaraan
 ▼
┌──────────────────────┐
│ 3.0 KELOLA KENDARAAN │
└──────────┬───────────┘
           │
           ▼
      ┌────────────┐
      │ D3 VEHICLE │
      └────────────┘


ADMIN
 │
 │ Data Service
 ▼
┌────────────────────┐
│ 4.0 KELOLA SERVICE │
└──────────┬─────────┘
           │
           ├──────────────► D4 SERVICES
           │
           └──────────────► D5 SERVICE_ITEMS


CS
 │
 │ Nomor Polisi
 ▼
┌──────────────────────────┐
│ 5.0 CARI RIWAYAT SERVICE │
└───────────┬──────────────┘
            │
            ├──────────────► D3 VEHICLES
            │
            └──────────────► D4 SERVICES
                              │
                              ▼
                       Riwayat Service
                              │
                              ▼
                             CS


ADMIN
 │
 │ Permintaan Laporan
 ▼
┌──────────────────┐
│ 6.0 KELOLA       │
│     LAPORAN      │
└────────┬─────────┘
         │
         ├──────────► D2 CUSTOMERS
         ├──────────► D3 VEHICLES
         ├──────────► D4 SERVICES
         └──────────► D5 SERVICE_ITEMS
                       │
                       ▼
                    Laporan
                       │
                       ▼
                     ADMIN
```

------------------------------------------------------------------------

# 5. DFD Level 2 --- Proses 1.0 Login Admin

``` text
ADMIN
  │
  │ Username + Password
  ▼
┌────────────────────────┐
│ 1.1 Input Credentials  │
└───────────┬────────────┘
            ▼
┌────────────────────────┐
│ 1.2 Validasi Login     │
└───────────┬────────────┘
            │
       ┌────┴────┐
       │         │
     Gagal     Berhasil
       │         │
       ▼         ▼
 Pesan Error   Session/Auth
                   │
                   ▼
                Dashboard
```

------------------------------------------------------------------------

# 6. DFD Level 2 --- Proses 2.0 Customer

``` text
ADMIN
  │
  ▼
2.1 Input Data Customer
  │
  ▼
2.2 Validasi Data
  │
  ├──────── Tidak Valid
  │              │
  │              ▼
  │         Pesan Error
  │
  └──────── Valid
                 │
                 ▼
          2.3 Simpan Customer
                 │
                 ▼
            D2 CUSTOMERS
                 │
                 ▼
          Data Customer
                 │
                 ▼
               ADMIN
```

Operasi customer:

``` text
Create
Read
Update
Delete
```

------------------------------------------------------------------------

# 7. DFD Level 2 --- Proses 3.0 Kendaraan

``` text
ADMIN
  │
  ▼
3.1 Pilih Customer
  │
  ▼
3.2 Input Kendaraan
  │
  ▼
3.3 Validasi Nomor Polisi
  │
  ├──────── Duplikat
  │             │
  │             ▼
  │        Pesan Error
  │
  └──────── Valid
                │
                ▼
        3.4 Simpan Kendaraan
                │
                ▼
           D3 VEHICLES
                │
                ▼
              ADMIN
```

Data kendaraan:

``` text
Nomor Polisi
Merek
Model
Tahun
Warna
Customer/Pemilik
```

------------------------------------------------------------------------

# 8. DFD Level 2 --- Proses 4.0 Service

``` text
ADMIN
  │
  ▼
4.1 Pilih Kendaraan
  │
  ▼
4.2 Input Data Service
  │
  ├── Tanggal
  ├── Jenis Service
  ├── Keluhan
  ├── Mekanik
  ├── Status
  └── Catatan
  │
  ▼
4.3 Input Service Item
  │
  ├── Nama Item
  ├── Jenis Item
  ├── Quantity
  └── Harga
  │
  ▼
4.4 Hitung Subtotal/Total
  │
  ▼
4.5 Validasi
  │
  ▼
4.6 Simpan Data
  │
  ├──────────────► D4 SERVICES
  │
  └──────────────► D5 SERVICE_ITEMS
```

------------------------------------------------------------------------

# 9. DFD Level 2 --- Proses 5.0 Cari Riwayat Service

Ini merupakan proses utama pada interface CS.

``` text
                         CS
                          │
                          │ Nomor Polisi
                          ▼
                ┌────────────────────┐
                │ 5.1 Input Plat     │
                └──────────┬─────────┘
                           ▼
                ┌────────────────────┐
                │ 5.2 Validasi Plat  │
                └──────────┬─────────┘
                           │
                      ┌────┴────┐
                      │         │
                  Tidak Valid   Valid
                      │         │
                      ▼         ▼
                  Error      5.3 Cari
                             Kendaraan
                                │
                         ┌──────┴──────┐
                         │             │
                     Tidak Ada       Ada
                         │             │
                         ▼             ▼
                    Empty State   5.4 Ambil
                                  Riwayat
                                     │
                                     ▼
                                D4 SERVICES
                                     │
                                     ▼
                              5.5 Urutkan
                              berdasarkan
                              tanggal
                                     │
                                     ▼
                              5.6 Tampilkan
                              Riwayat Service
                                     │
                                     ▼
                                    CS
```

------------------------------------------------------------------------

# 10. DFD Level 2 --- Proses 6.0 Laporan

``` text
ADMIN
  │
  ▼
6.1 Pilih Jenis Laporan
  │
  ├── Customer
  ├── Kendaraan
  ├── Service
  └── Pendapatan (opsional)
  │
  ▼
6.2 Ambil Data
  │
  ├──── D2 CUSTOMERS
  ├──── D3 VEHICLES
  ├──── D4 SERVICES
  └──── D5 SERVICE_ITEMS
  │
  ▼
6.3 Proses Data
  │
  ▼
6.4 Tampilkan Laporan
  │
  ▼
ADMIN
```

------------------------------------------------------------------------

# BAGIAN B --- UML

# 11. Use Case Diagram

## Aktor

``` text
Admin
CS
```

## Use Case Admin

``` text
Admin
 │
 ├── Login
 ├── Melihat Dashboard
 ├── Kelola Customer
 ├── Kelola Kendaraan
 ├── Kelola Service
 ├── Kelola Service Item
 ├── Melihat Laporan
 └── Logout
```

## Use Case CS

``` text
CS
 │
 ├── Input Nomor Polisi
 ├── Cari Kendaraan
 ├── Melihat Data Kendaraan
 ├── Melihat Riwayat Service
 └── Melihat Detail Service
```

## Representasi Use Case

``` text
                         SISTEM INFORMASI
                          BENGKEL MOTOR
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  (Login)                                                │
│     │                                                   │
│  (Dashboard)                                            │
│     │                                                   │
│  (Kelola Customer)                                      │
│     │                                                   │
│  (Kelola Kendaraan)                                     │
│     │                                                   │
│  (Kelola Service)                                       │
│     │                                                   │
│  (Kelola Service Item)                                  │
│     │                                                   │
│  (Lihat Laporan)                                        │
│     │                                                   │
│  (Logout)                                                │
│                                                         │
│                       (Input Nomor Polisi)              │
│                                  │                      │
│                           (Cari Kendaraan)              │
│                                  │                      │
│                        (Lihat Kendaraan)                │
│                                  │                      │
│                        (Lihat Riwayat)                  │
│                                  │                      │
│                        (Detail Service)                │
│                                                         │
└─────────────────────────────────────────────────────────┘
       ▲                                             ▲
       │                                             │
     ADMIN                                           CS
```

------------------------------------------------------------------------

# 12. Activity Diagram --- Login Admin

``` text
START
  │
  ▼
Buka Halaman Login
  │
  ▼
Input Username & Password
  │
  ▼
Klik Login
  │
  ▼
Validasi Credentials
  │
  ├────────── Gagal
  │             │
  │             ▼
  │       Tampilkan Error
  │             │
  │             └──────► Login Kembali
  │
  └────────── Berhasil
                │
                ▼
           Buat Session
                │
                ▼
             Dashboard
                │
                ▼
               END
```

------------------------------------------------------------------------

# 13. Activity Diagram --- Admin Mengelola Service

``` text
START
  │
  ▼
Login
  │
  ▼
Dashboard
  │
  ▼
Pilih Menu Service
  │
  ▼
Pilih Kendaraan
  │
  ▼
Input Service
  │
  ▼
Input Service Item
  │
  ▼
Validasi
  │
  ├──────── Tidak Valid
  │              │
  │              ▼
  │        Tampilkan Error
  │              │
  │              └──────► Perbaiki Data
  │
  └──────── Valid
                 │
                 ▼
           Simpan Service
                 │
                 ▼
          Tampilkan Success
                 │
                 ▼
            Service List
                 │
                 ▼
                END
```

------------------------------------------------------------------------

# 14. Activity Diagram --- CS Mencari Riwayat

``` text
START
  │
  ▼
Buka Halaman CS
  │
  ▼
Input Nomor Polisi
  │
  ▼
Klik Cari
  │
  ▼
Validasi Input
  │
  ├──────── Tidak Valid
  │              │
  │              ▼
  │           Error
  │              │
  │              └────► Input Ulang
  │
  └──────── Valid
                 │
                 ▼
           Cari Kendaraan
                 │
          ┌──────┴──────┐
          │             │
     Tidak Ditemukan   Ditemukan
          │             │
          ▼             ▼
      Empty State   Data Kendaraan
                        │
                        ▼
                  Riwayat Service
                        │
                        ▼
                  Pilih Service
                        │
                        ▼
                  Detail Service
                        │
                        ▼
                       END
```

------------------------------------------------------------------------

# 15. Class Diagram

Class utama:

``` text
Admin
Customer
Vehicle
Service
ServiceItem
```

Diagram:

``` text
┌─────────────────────────┐
│         Admin           │
├─────────────────────────┤
│ - id                    │
│ - name                  │
│ - username              │
│ - passwordHash          │
│ - createdAt             │
├─────────────────────────┤
│ + login()               │
│ + logout()              │
└─────────────────────────┘


┌─────────────────────────┐
│       Customer          │
├─────────────────────────┤
│ - id                    │
│ - name                  │
│ - phone                 │
│ - address               │
│ - createdAt             │
│ - updatedAt             │
├─────────────────────────┤
│ + create()              │
│ + update()              │
│ + delete()              │
│ + getDetail()           │
└────────────┬────────────┘
             │
             │ 1
             │
             │ *
             ▼
┌─────────────────────────┐
│        Vehicle          │
├─────────────────────────┤
│ - id                    │
│ - customerId             │
│ - plateNumber            │
│ - brand                 │
│ - model                 │
│ - year                  │
│ - color                 │
├─────────────────────────┤
│ + create()              │
│ + update()              │
│ + delete()              │
│ + searchByPlate()       │
└────────────┬────────────┘
             │
             │ 1
             │
             │ *
             ▼
┌─────────────────────────┐
│        Service          │
├─────────────────────────┤
│ - id                    │
│ - vehicleId             │
│ - serviceCode           │
│ - serviceDate           │
│ - serviceType           │
│ - complaint             │
│ - mechanic              │
│ - status                │
│ - notes                 │
│ - totalCost             │
├─────────────────────────┤
│ + create()              │
│ + update()              │
│ + delete()              │
│ + getHistory()          │
└────────────┬────────────┘
             │
             │ 1
             │
             │ *
             ▼
┌─────────────────────────┐
│      ServiceItem        │
├─────────────────────────┤
│ - id                    │
│ - serviceId             │
│ - itemName              │
│ - itemType              │
│ - quantity              │
│ - price                 │
│ - subtotal              │
├─────────────────────────┤
│ + create()              │
│ + update()              │
│ + delete()              │
│ + calculateSubtotal()   │
└─────────────────────────┘
```

------------------------------------------------------------------------

# 16. Sequence Diagram --- Login Admin

``` text
Admin       Browser       JavaScript       PHP API       Database
 │             │               │              │             │
 │ Open Login  │               │              │             │
 ├────────────►│               │              │             │
 │             │               │              │             │
 │ Input Data  │               │              │             │
 ├────────────►│               │              │             │
 │             │               │              │             │
 │ Click Login │               │              │             │
 ├────────────►│               │              │             │
 │             ├──────────────►│              │             │
 │             │               │ POST /login  │             │
 │             │               ├─────────────►│             │
 │             │               │              │ Query Admin │
 │             │               │              ├────────────►│
 │             │               │              │             │
 │             │               │              │ User Data   │
 │             │               │              │◄────────────┤
 │             │               │              │             │
 │             │               │              │ Verify Hash │
 │             │               │              │             │
 │             │               │ JSON Response│             │
 │             │               │◄─────────────┤             │
 │             │ Update UI     │              │             │
 │             │◄──────────────┤              │             │
 │ Dashboard   │               │              │             │
 │◄────────────┤               │              │             │
```

------------------------------------------------------------------------

# 17. Sequence Diagram --- Admin Input Service

``` text
Admin       Browser       JavaScript       PHP API       Database
 │             │               │              │             │
 │ Pilih Motor │               │              │             │
 ├────────────►│               │              │             │
 │             │               │              │             │
 │ Input Data  │               │              │             │
 ├────────────►│               │              │             │
 │             │               │              │             │
 │ Klik Simpan │               │              │             │
 ├────────────►│               │              │             │
 │             ├──────────────►│              │             │
 │             │               │ POST Service │             │
 │             │               ├─────────────►│             │
 │             │               │              │ Validate    │
 │             │               │              │             │
 │             │               │              │ INSERT      │
 │             │               │              ├────────────►│
 │             │               │              │             │
 │             │               │              │ Success     │
 │             │               │              │◄────────────┤
 │             │               │ JSON Success │             │
 │             │               │◄─────────────┤             │
 │             │ Update UI     │              │             │
 │             │◄──────────────┤              │             │
 │ Success     │               │              │             │
 │◄────────────┤               │              │             │
```

------------------------------------------------------------------------

# 18. Sequence Diagram --- CS Search Riwayat

``` text
CS          Browser       JavaScript       PHP API       Database
│              │               │              │             │
│ Input Plat   │               │              │             │
├─────────────►│               │              │             │
│              │               │              │             │
│ Klik Cari    │               │              │             │
├─────────────►│               │              │             │
│              ├──────────────►│              │             │
│              │               │ GET /search  │             │
│              │               ├─────────────►│             │
│              │               │              │             │
│              │               │              │ Search      │
│              │               │              ├────────────►│
│              │               │              │             │
│              │               │              │ Vehicle     │
│              │               │              │ + Service   │
│              │               │              │◄────────────┤
│              │               │              │             │
│              │               │ JSON Response│             │
│              │               │◄─────────────┤             │
│              │               │              │             │
│              │ Update UI     │              │             │
│              │◄──────────────┤              │             │
│ Hasil        │               │              │             │
│◄─────────────┤               │              │             │
```

------------------------------------------------------------------------

# 19. Component / Package Diagram

Struktur sistem berdasarkan layer:

``` text
┌─────────────────────────────────────────┐
│              PRESENTATION               │
├─────────────────────────────────────────┤
│ HTML                                    │
│ CSS                                     │
│ Bootstrap 5                             │
│ JavaScript                              │
│                                         │
│ CS Interface                            │
│ Admin Interface                         │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│                 API                     │
├─────────────────────────────────────────┤
│ PHP REST API                            │
│                                         │
│ Auth API                                │
│ Customer API                             │
│ Vehicle API                              │
│ Service API                              │
│ Report API                               │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│               DATA LAYER                │
├─────────────────────────────────────────┤
│ Supabase PostgreSQL                     │
│                                         │
│ admins                                  │
│ customers                               │
│ vehicles                                │
│ services                                │
│ service_items                           │
└─────────────────────────────────────────┘
```

------------------------------------------------------------------------

# 20. Relasi UML dan Database

Relasi utama:

``` text
Customer
    │
    │ 1
    │
    │ N
    ▼
Vehicle
    │
    │ 1
    │
    │ N
    ▼
Service
    │
    │ 1
    │
    │ N
    ▼
ServiceItem
```

Dalam database:

``` text
customers.id
      │
      │
      ▼
vehicles.customer_id

vehicles.id
      │
      │
      ▼
services.vehicle_id

services.id
      │
      │
      ▼
service_items.service_id
```

------------------------------------------------------------------------

# 21. Matriks Hak Akses

  Fitur                      Admin              CS
  ------------------- ------------ ---------------
  Login Admin           CRUD/Akses              ❌
  Dashboard                   Read              ❌
  Customer                    CRUD              ❌
  Kendaraan                   CRUD   Read terbatas
  Service                     CRUD            Read
  Service Item                CRUD   Read terbatas
  Cari Nomor Polisi           Read            Read
  Riwayat Service             Read            Read
  Laporan                     Read              ❌
  Logout                     Akses              \-

CS harus tetap **read only**.

------------------------------------------------------------------------

# 22. Konsistensi DFD, UML, dan Database

Dokumentasi harus menggunakan istilah yang sama.

  DFD            UML           Database
  -------------- ------------- ---------------
  Customer       Customer      customers
  Kendaraan      Vehicle       vehicles
  Service        Service       services
  Item Service   ServiceItem   service_items
  Admin          Admin         admins

Jangan menggunakan istilah berbeda untuk objek yang sama.

------------------------------------------------------------------------

# 23. Prinsip Perancangan

Sistem harus mengikuti prinsip:

``` text
Kebutuhan
    ↓
DFD
    ↓
Use Case
    ↓
Activity
    ↓
Sequence
    ↓
Class Diagram
    ↓
ERD
    ↓
Database
    ↓
Implementasi
```

Semua diagram harus menggambarkan sistem yang sama.

Perubahan requirement harus diikuti dengan pembaruan diagram terkait.

------------------------------------------------------------------------

# 24. Batasan Perancangan

Dokumen ini tidak memasukkan fitur berikut sebagai fitur wajib MVP:

-   Online payment.
-   Booking service online.
-   Chat customer.
-   WhatsApp automation.
-   Inventory kompleks.
-   Multi-cabang.
-   Loyalty point.
-   E-commerce sparepart.

Fitur tersebut hanya dapat ditambahkan setelah kebutuhan utama sistem
selesai dan disetujui.

------------------------------------------------------------------------

# 25. Kesimpulan

Sistem informasi service bengkel motor dirancang dengan dua aktor utama,
yaitu **Admin** dan **CS**.

Admin memiliki hak akses untuk mengelola data customer, kendaraan,
service, item service, dan laporan.

CS menggunakan interface mobile dengan fungsi utama memasukkan nomor
polisi dan membaca riwayat service kendaraan.

Arsitektur aplikasi:

``` text
HTML
CSS
Bootstrap
JavaScript
      ↓
PHP REST API
      ↓
Supabase PostgreSQL
      ↓
Vercel
```

DFD digunakan untuk menggambarkan aliran data, sedangkan UML digunakan
untuk menggambarkan fungsi, aktivitas, struktur, dan interaksi sistem.

Dokumen ini merupakan **source of truth untuk perancangan DFD dan UML**
sebelum proses implementasi dilakukan.
