-- ============================================================
-- SCHEMA DATABASE SUPABASE POSTGRESQL - BENGKEL MOTOR (CJM MOTOR)
-- ============================================================

-- 1. TABEL ADMINS (Pengguna Panel Admin Bengkel)
CREATE TABLE IF NOT EXISTS admins (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABEL CUSTOMERS (Data Pelanggan Bengkel)
CREATE TABLE IF NOT EXISTS customers (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk pencarian cepat nama & nomor HP
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);

-- 3. TABEL VEHICLES (Data Kendaraan Motor)
CREATE TABLE IF NOT EXISTS vehicles (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT,
    color VARCHAR(30),
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk pencarian cepat nomor polisi
CREATE INDEX IF NOT EXISTS idx_vehicles_plate_number ON vehicles(plate_number);
CREATE INDEX IF NOT EXISTS idx_vehicles_customer_id ON vehicles(customer_id);

-- 4. TABEL SERVICES (Transaksi Service Bengkel)
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
    attachment_url TEXT,
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
-- 6. ROW LEVEL SECURITY (RLS) POLICIES UNTUK REST API
-- ============================================================
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow All admins') THEN
        CREATE POLICY "Allow All admins" ON admins FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow All customers') THEN
        CREATE POLICY "Allow All customers" ON customers FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow All vehicles') THEN
        CREATE POLICY "Allow All vehicles" ON vehicles FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow All services') THEN
        CREATE POLICY "Allow All services" ON services FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow All service_items') THEN
        CREATE POLICY "Allow All service_items" ON service_items FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- ============================================================
-- 7. SUPABASE STORAGE BUCKET: cjm-motor-files
-- (Bucket publik untuk penyimpanan foto kendaraan & dokumen service)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('cjm-motor-files', 'cjm-motor-files', true)
ON CONFLICT (id) DO NOTHING;

-- Policy Akses Publik
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Public Read cjm-motor-files'
    ) THEN
        CREATE POLICY "Public Read cjm-motor-files" ON storage.objects FOR SELECT USING (bucket_id = 'cjm-motor-files');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Public Insert cjm-motor-files'
    ) THEN
        CREATE POLICY "Public Insert cjm-motor-files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cjm-motor-files');
    END IF;
END $$;

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
