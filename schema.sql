-- ============================================================
-- DDL SCHEMA FOR CJM MOTOR (Supabase PostgreSQL)
-- Sistem Informasi Service Bengkel Motor
-- ============================================================

-- Enable UUID extension if needed in future
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABEL ADMINS
CREATE TABLE IF NOT EXISTS admins (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABEL CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABEL VEHICLES (KENDARAAN)
CREATE TABLE IF NOT EXISTS vehicles (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    plate_number VARCHAR(15) UNIQUE NOT NULL,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year SMALLINT,
    color VARCHAR(30),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk percepatan pencarian CS berdasarkan nomor polisi
CREATE INDEX IF NOT EXISTS idx_vehicles_plate_number ON vehicles(plate_number);
CREATE INDEX IF NOT EXISTS idx_vehicles_customer_id ON vehicles(customer_id);

-- 4. TABEL SERVICES
CREATE TABLE IF NOT EXISTS services (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    vehicle_id BIGINT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    service_code VARCHAR(30) UNIQUE NOT NULL,
    service_date DATE NOT NULL DEFAULT CURRENT_DATE,
    service_type VARCHAR(100) NOT NULL,
    complaint TEXT,
    mechanic VARCHAR(100),
    status VARCHAR(30) NOT NULL DEFAULT 'Menunggu',
    notes TEXT,
    total_cost DECIMAL(12,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk query riwayat service per kendaraan
CREATE INDEX IF NOT EXISTS idx_services_vehicle_id ON services(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_services_service_date ON services(service_date);

-- 5. TABEL SERVICE_ITEMS
CREATE TABLE IF NOT EXISTS service_items (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    service_id BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    item_name VARCHAR(150) NOT NULL,
    item_type VARCHAR(50) NOT NULL DEFAULT 'Jasa',
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(12,2) DEFAULT 0.00,
    subtotal DECIMAL(12,2) DEFAULT 0.00
);

CREATE INDEX IF NOT EXISTS idx_service_items_service_id ON service_items(service_id);

-- ============================================================
-- DATA INITIAL / SEED ADMIN DEFAULT
-- Username: admin
-- Password default: admin123
-- (Bcrypt hash: $2y$10$e0MYzXyjpJS7Pd0RVvHwHe1mN14nK82h1uU1H7s7P0rF/k2G.eQW2)
-- ============================================================

INSERT INTO admins (name, username, password_hash)
VALUES (
    'Admin Bengkel', 
    'admin', 
    '$2y$10$e0MYzXyjpJS7Pd0RVvHwHe1mN14nK82h1uU1H7s7P0rF/k2G.eQW2'
) ON CONFLICT (username) DO NOTHING;

-- Sample Data Dummy (Opsional untuk pengujian awal)
INSERT INTO customers (name, phone, address) VALUES
('Budi Santoso', '081234567890', 'Jl. Merdeka No. 12, Jakarta'),
('Andi Wijaya', '081987654321', 'Jl. Sudirman No. 45, Jakarta')
ON CONFLICT DO NOTHING;

INSERT INTO vehicles (customer_id, plate_number, brand, model, year, color) VALUES
(1, 'B 1234 ABC', 'Honda', 'Beat', 2024, 'Hitam'),
(2, 'B 5678 XYZ', 'Yamaha', 'NMAX', 2023, 'Putih')
ON CONFLICT (plate_number) DO NOTHING;
