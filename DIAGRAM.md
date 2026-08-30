# DFD & UML Diagram - ASA UTAMA MOTOR

Dokumen ini berisi Diagram Alir Data (DFD) dan UML Diagram dari sistem informasi bengkel **ASA UTAMA MOTOR** yang saat ini berjalan.

---

## 1. Data Flow Diagram (DFD)

### Level 0: Context Diagram
Context diagram menunjukkan batas sistem dan entitas eksternal (Pelanggan/CS dan Admin) yang berinteraksi dengan sistem.

```mermaid
graph TD
    classDef entity fill:#f1f5f9,stroke:#94a3b8,stroke-width:2px;
    classDef system fill:#1e3a8a,stroke:#3b82f6,stroke-width:2px,color:#ffffff;

    CS["Pelanggan / CS (Portal CS)"]:::entity
    System["Sistem Bengkel ASA UTAMA MOTOR"]:::system
    Admin["Admin Bengkel (Panel Admin)"]:::entity

    %% Aliran Data
    CS -->|"1. Input Nomor Polisi"| System
    System -->|"2. Tampilkan Riwayat & Detail Service"| CS

    Admin -->|"1. Kredensial Login"| System
    Admin -->|"2. Tambah/Ubah Data (Customer, Motor, Service, Nota)"| System
    System -->|"3. Data Laporan, Status Login & Detail Transaksi"| Admin
```

---

### Level 1: DFD Diagram
DFD Level 1 merincikan proses utama di dalam sistem beserta penyimpanan datanya (*data store*).

```mermaid
graph TB
    classDef process fill:#eff6ff,stroke:#2563eb,stroke-width:2px;
    classDef store fill:#f0fdf4,stroke:#16a34a,stroke-width:2px;
    classDef entity fill:#f8fafc,stroke:#64748b,stroke-width:2px;

    %% Entitas
    CS["Pelanggan / CS"]:::entity
    Admin["Admin Bengkel"]:::entity

    %% Proses
    P1["1.0 Autentikasi Admin"]:::process
    P2["2.0 Pencarian Riwayat (CS)"]:::process
    P3["3.0 Kelola Data Bengkel (Admin)"]:::process
    P4["4.0 Pembuatan Laporan"]:::process

    %% Data Stores
    DB[("Supabase PostgreSQL Database")]:::store

    %% Aliran Proses 1.0 (Login)
    Admin -->|"Kredensial Login"| P1
    P1 -->|"Verifikasi Akun"| DB
    DB -->|"Data Sesi Login"| P1
    P1 -->|"Konfirmasi Login Sukses"| Admin

    %% Aliran Proses 2.0 (CS Cari Riwayat)
    CS -->|"Kirim Nomor Polisi"| P2
    P2 -->|"Cari Data Pelat Nomor"| DB
    DB -->|"Kirim Rincian Service & Pekerjaan"| P2
    P2 -->|"Tampilkan Daftar & Rincian Transaksi"| CS

    %% Aliran Proses 3.0 (Admin Kelola Data)
    Admin -->|"Input Data Baru / Edit (Customer, Motor, Status, Item, Nota)"| P3
    P3 -->|"Simpan & Perbarui Baris Data"| DB
    DB -->|"Konfirmasi Penyimpanan"| P3
    P3 -->|"Feedback Berhasil"| Admin

    %% Aliran Proses 4.0 (Laporan Pendapatan)
    Admin -->|"Pilih Range Tanggal Laporan"| P4
    P4 -->|"Query Agregasi Total & Transaksi"| DB
    DB -->|"Data Rekapan"| P4
    P4 -->|"Tampilkan Grafik & Ringkasan Laporan"| Admin
```

---

## 2. UML Diagram

### Class / Database Schema Diagram
Diagram kelas ini menggambarkan tabel database PostgreSQL Supabase serta relasi (*foreign key*) antar tabel.

```mermaid
classDiagram
    direction LR
    class admins {
        +bigint id (PK)
        +varchar name
        +varchar username
        +varchar password_hash
        +timestamp created_at
    }

    class customers {
        +bigint id (PK)
        +varchar name
        +varchar phone
        +text address
        +timestamp created_at
    }

    class vehicles {
        +bigint id (PK)
        +bigint customer_id (FK)
        +varchar plate_number (Unique)
        +varchar brand
        +varchar model
        +integer year
        +varchar color
        +timestamp created_at
    }

    class services {
        +bigint id (PK)
        +bigint vehicle_id (FK)
        +varchar service_code (Unique)
        +date service_date
        +varchar service_type
        +text complaint
        +varchar mechanic
        +varchar status
        +text notes
        +decimal total_cost
        +text attachment_url
        +timestamp created_at
    }

    class service_items {
        +bigint id (PK)
        +bigint service_id (FK)
        +varchar item_name
        +varchar item_type
        +integer quantity
        +decimal price
        +decimal subtotal
    }

    customers "1" -- "0..*" vehicles : memiliki
    vehicles "1" -- "0..*" services : melakukan
    services "1" -- "0..*" service_items : berisi rincian
```

---

### Sequence Diagram: Proses Pencarian Pelanggan (CS View)
Diagram urutan ini menunjukkan interaksi dari pencarian nomor polisi sampai data detail dimuat.

```mermaid
sequenceDiagram
    autonumber
    actor Pelanggan as Pelanggan / CS
    participant UI as Halaman CS (index.html/result.html)
    participant API as Vercel Serverless (api/services)
    participant DB as Supabase DB

    Pelanggan->>UI: Masukkan Nomor Polisi (misal: B 1234 ABC)
    UI->>API: GET /services?plate=B1234ABC
    API->>DB: Query tabel vehicles & services berdasarkan nopol
    DB-->>API: Data daftar riwayat service
    API-->>UI: Respons JSON Sukses (Array Riwayat)
    UI-->>Pelanggan: Tampilkan daftar riwayat service

    Pelanggan->>UI: Klik salah satu riwayat service
    UI->>API: GET /services/detail?id={id}
    API->>DB: Query tabel services, service_items, & customers
    DB-->>API: Detail data transaksi & item pekerjaan
    API-->>UI: Respons JSON Detail Service
    UI-->>Pelanggan: Tampilkan Rincian Detail Pekerjaan & Harga (Nota tersembunyi)
```

---

### Sequence Diagram: Proses Tambah/Edit Data & Unggah Nota (Admin Panel)
Diagram urutan ini menunjukkan proses ketika admin memperbarui status dan melampirkan foto nota terkompresi.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin Bengkel
    participant UI as Halaman Edit (service-detail.html)
    participant API as Vercel Serverless (api/services/update)
    participant DB as Supabase DB

    Admin->>UI: Pilih file Nota/Struk baru
    Note over UI: UI mengompres gambar menggunakan HTML5 Canvas<br/>menjadi Base64 JPEG ultra-ringan (~80KB)
    UI-->>Admin: Tampilkan Preview Foto Terkompresi

    Admin->>UI: Klik Simpan Perubahan
    UI->>API: PUT /services/update (data form + base64 foto nota)
    API->>DB: PATCH ke tabel services (termasuk kolom attachment_url)
    DB-->>API: Konfirmasi Sukses (ok: true)
    API-->>UI: Respons JSON Sukses (200 OK)
    UI->>UI: Muat ulang data (loadServiceDetail)
    UI-->>Admin: Perubahan & Foto Nota berhasil tersimpan
```
