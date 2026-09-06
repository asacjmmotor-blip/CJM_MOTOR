-- ============================================================
-- SCHEMA DATABASE LARAGON (MYSQL / MARIADB) - CJM MOTOR
-- Disiapkan untuk Mode Offline (Laragon/XAMPP) & Pengumpulan Tugas
-- ============================================================

CREATE DATABASE IF NOT EXISTS cjm_motor;
USE cjm_motor;

-- 1. TABEL ADMINS (Pengguna Panel Admin Bengkel)
CREATE TABLE IF NOT EXISTS admins (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. TABEL CUSTOMERS (Data Pelanggan Bengkel)
CREATE TABLE IF NOT EXISTS customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_customers_phone (phone),
    INDEX idx_customers_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. TABEL VEHICLES (Data Kendaraan Motor)
CREATE TABLE IF NOT EXISTS vehicles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT,
    color VARCHAR(30),
    photo_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_vehicles_plate_number (plate_number),
    INDEX idx_vehicles_customer_id (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. TABEL SERVICES (Transaksi Service Bengkel)
CREATE TABLE IF NOT EXISTS services (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id BIGINT NOT NULL,
    service_code VARCHAR(30) UNIQUE NOT NULL,
    service_date DATE NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    complaint TEXT,
    mechanic VARCHAR(100),
    status VARCHAR(30) NOT NULL DEFAULT 'Menunggu',
    notes TEXT,
    total_cost DECIMAL(12,2) DEFAULT 0.00,
    attachment_url TEXT,
    pin_code VARCHAR(10) DEFAULT '1234',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_services_vehicle_id (vehicle_id),
    INDEX idx_services_service_date (service_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. TABEL SERVICE_ITEMS (Detail Rincian Jasa & Sparepart)
CREATE TABLE IF NOT EXISTS service_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    service_id BIGINT NOT NULL,
    item_name VARCHAR(150) NOT NULL,
    item_type VARCHAR(50) NOT NULL DEFAULT 'Jasa',
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(12,2) DEFAULT 0.00,
    subtotal DECIMAL(12,2) DEFAULT 0.00,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    INDEX idx_service_items_service_id (service_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- DATA INITIAL / SEED DUMMY
-- ============================================================

-- Data Admin Default (Username: admin, Password: admin123)
INSERT INTO admins (id, name, username, password_hash)
VALUES (1, 'Admin Bengkel', 'admin', '$2y$10$e0MYzXyjpJS7Pd0RVvHwHe1mN14nK82h1uU1H7s7P0rF/k2G.eQW2')
ON DUPLICATE KEY UPDATE id=id;

-- Data Dummy Pelanggan
INSERT INTO customers (id, name, phone, address) VALUES
(1, 'Budi Santoso', '081234567890', 'Jl. Merdeka No. 12, Jakarta'),
(2, 'Andi Wijaya', '081987654321', 'Jl. Sudirman No. 45, Jakarta')
ON DUPLICATE KEY UPDATE id=id;

-- Data Dummy Kendaraan
INSERT INTO vehicles (id, customer_id, plate_number, brand, model, year, color) VALUES
(1, 1, 'B 1234 ABC', 'Honda', 'Beat', 2024, 'Hitam'),
(2, 2, 'B 5678 XYZ', 'Yamaha', 'NMAX', 2023, 'Putih')
ON DUPLICATE KEY UPDATE id=id;

-- Data Dummy Transaksi Service
INSERT INTO services (id, vehicle_id, service_code, service_date, service_type, complaint, mechanic, status, notes, total_cost, pin_code) VALUES
(1, 1, 'SRV-20260906-0001', CURRENT_DATE(), 'Service Rutin + Ganti Oli', 'Mesin terasa kasar dan tarikan kurang bertenaga', 'Mas Rio', 'Selesai', 'Oli Mesin MPX2 & Busi diganti baru. Performa mesin kembali optimal.', 125000.00, '1234'),
(2, 2, 'SRV-20260906-0002', CURRENT_DATE(), 'Service CVT Lengkap', 'Bunyi decit saat awal gas', 'Budi', 'Proses', 'Pembersihan mangkok CVT dan penggantian roller set.', 180000.00, '5678')
ON DUPLICATE KEY UPDATE id=id;

-- Data Dummy Detail Items Service
INSERT INTO service_items (id, service_id, item_name, item_type, quantity, price, subtotal) VALUES
(1, 1, 'Jasa Service Servis Berkala', 'Jasa', 1, 50000.00, 50000.00),
(2, 1, 'Oli Mesin Honda MPX2 0.8L', 'Sparepart', 1, 55000.00, 55000.00),
(3, 1, 'Busi Honda CPR9EA-9', 'Sparepart', 1, 20000.00, 20000.00),
(4, 2, 'Jasa Service CVT', 'Jasa', 1, 60000.00, 60000.00),
(5, 2, 'Roller Set NMAX Genuine', 'Sparepart', 1, 120000.00, 120000.00)
ON DUPLICATE KEY UPDATE id=id;
