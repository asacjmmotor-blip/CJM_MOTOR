<?php
/**
 * API Vehicles (Admin List, Create)
 * GET /api/vehicles/index.php
 * POST /api/vehicles/index.php
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/validation.php';
require_once __DIR__ . '/../../middleware/auth.php';

requireAdminAuth();
$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

function resolveCustomerId($pdo, $inputCustomerId, $customerName, $customerPhone = '') {
    $custName = trim($customerName ?? '');
    $custPhone = trim($customerPhone ?? '');

    if ($inputCustomerId) {
        return $inputCustomerId;
    }

    if ($custName !== '') {
        $stmt = $pdo->prepare("SELECT id FROM customers WHERE name ILIKE :name LIMIT 1");
        $stmt->execute(['name' => $custName]);
        $existingId = $stmt->fetchColumn();
        if ($existingId) {
            return $existingId;
        }

        $ins = $pdo->prepare("INSERT INTO customers (name, phone, created_at) VALUES (:name, :phone, NOW()) RETURNING id");
        $ins->execute(['name' => $custName, 'phone' => $custPhone]);
        return $ins->fetchColumn();
    }

    $stmt = $pdo->prepare("SELECT id FROM customers WHERE name = 'Umum / Non-Member' LIMIT 1");
    $stmt->execute();
    $defaultId = $stmt->fetchColumn();
    if ($defaultId) {
        return $defaultId;
    }

    $ins = $pdo->prepare("INSERT INTO customers (name, phone, created_at) VALUES ('Umum / Non-Member', '-', NOW()) RETURNING id");
    $ins->execute();
    return $ins->fetchColumn();
}

if ($method === 'GET') {
    $search = trim($_GET['q'] ?? '');
    if ($search !== '') {
        $rawSearch = rawPlateNumber($search);
        $stmt = $pdo->prepare("
            SELECT v.*, c.name as customer_name, c.phone as customer_phone
            FROM vehicles v
            LEFT JOIN customers c ON v.customer_id = c.id
            WHERE REPLACE(UPPER(v.plate_number), ' ', '') LIKE :q OR v.brand ILIKE :search OR v.model ILIKE :search OR c.name ILIKE :search
            ORDER BY v.id DESC
        ");
        $stmt->execute(['q' => "%{$rawSearch}%", 'search' => "%{$search}%"]);
    } else {
        $stmt = $pdo->query("
            SELECT v.*, c.name as customer_name, c.phone as customer_phone
            FROM vehicles v
            LEFT JOIN customers c ON v.customer_id = c.id
            ORDER BY v.id DESC
        ");
    }
    sendJsonResponse($stmt->fetchAll());
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $rawCustomerId = filter_var($input['customer_id'] ?? null, FILTER_VALIDATE_INT);
    $custName = trim($input['customer_name'] ?? '');
    $custPhone = trim($input['customer_phone'] ?? '');

    $customerId = resolveCustomerId($pdo, $rawCustomerId, $custName, $custPhone);

    $plateNumber = normalizePlateNumber($input['plate_number'] ?? '');
    $brand = trim($input['brand'] ?? '');
    $model = trim($input['model'] ?? '');
    $year = filter_var($input['year'] ?? null, FILTER_VALIDATE_INT);
    $color = trim($input['color'] ?? '');

    if (empty($plateNumber) || empty($brand) || empty($model)) {
        sendErrorResponse('Nomor Polisi, Merek, dan Tipe/Model wajib diisi.', 400);
    }

    // Check duplicate plate
    $chk = $pdo->prepare("SELECT id FROM vehicles WHERE REPLACE(UPPER(plate_number), ' ', '') = :raw_plate LIMIT 1");
    $chk->execute(['raw_plate' => rawPlateNumber($plateNumber)]);
    if ($chk->fetch()) {
        sendErrorResponse('Nomor Polisi sudah terdaftar dalam sistem.', 400);
    }

    $stmt = $pdo->prepare("
        INSERT INTO vehicles (customer_id, plate_number, brand, model, year, color, created_at)
        VALUES (:customer_id, :plate_number, :brand, :model, :year, :color, NOW())
        RETURNING id
    ");
    $stmt->execute([
        'customer_id'  => $customerId,
        'plate_number' => $plateNumber,
        'brand'        => $brand,
        'model'        => $model,
        'year'         => $year,
        'color'        => $color
    ]);
    $id = $stmt->fetchColumn();

    sendJsonResponse(['id' => $id, 'plate_number' => $plateNumber], 201, 'Kendaraan berhasil ditambahkan.');
} else {
    sendErrorResponse('Metode request tidak diizinkan.', 405);
}
