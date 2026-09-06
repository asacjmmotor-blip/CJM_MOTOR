-- ============================================================
-- SCHEMA DATABASE LARAGON (MYSQL / MARIADB) - CJM MOTOR
-- Disiapkan untuk Mode Offline & Pengumpulan Tugas
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
    pin_code VARCHAR(10),
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

-- Data Seed Initial / Default Admin Bengkel
-- Username: admin
-- Password default: admin123
INSERT INTO admins (name, username, password_hash)
VALUES ('Admin Bengkel', 'admin', '$2y$10$e0MYzXyjpJS7Pd0RVvHwHe1mN14nK82h1uU1H7s7P0rF/k2G.eQW2')
ON DUPLICATE KEY UPDATE id=id;

-- Sample Data Dummy Pelanggan & Kendaraan
INSERT INTO customers (id, name, phone, address) VALUES
(1, 'Budi Santoso', '081234567890', 'Jl. Merdeka No. 12, Jakarta'),
(2, 'Andi Wijaya', '081987654321', 'Jl. Sudirman No. 45, Jakarta')
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO vehicles (id, customer_id, plate_number, brand, model, year, color) VALUES
(1, 1, 'B 1234 ABC', 'Honda', 'Beat', 2024, 'Hitam'),
(2, 2, 'B 5678 XYZ', 'Yamaha', 'NMAX', 2023, 'Putih')
ON DUPLICATE KEY UPDATE id=id;
