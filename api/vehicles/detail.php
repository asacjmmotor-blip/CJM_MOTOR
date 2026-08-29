<?php
/**
 * API Vehicle Detail, Update, Delete
 * GET /api/vehicles/detail.php?id={id}
 * PUT /api/vehicles/detail.php?id={id}
 * DELETE /api/vehicles/detail.php?id={id}
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/validation.php';
require_once __DIR__ . '/../../middleware/auth.php';

requireAdminAuth();
$pdo = getDbConnection();
$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);

if (!$id) {
    sendErrorResponse('ID Kendaraan tidak valid.', 400);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->prepare("
        SELECT v.*, c.name as customer_name, c.phone as customer_phone, c.address as customer_address
        FROM vehicles v
        LEFT JOIN customers c ON v.customer_id = c.id
        WHERE v.id = :id LIMIT 1
    ");
    $stmt->execute(['id' => $id]);
    $vehicle = $stmt->fetch();
    if (!$vehicle) sendErrorResponse('Kendaraan tidak ditemukan.', 404);

    $sStmt = $pdo->prepare("SELECT * FROM services WHERE vehicle_id = :id ORDER BY service_date DESC, id DESC");
    $sStmt->execute(['id' => $id]);
    $vehicle['services'] = $sStmt->fetchAll();

    sendJsonResponse($vehicle);
} elseif ($method === 'PUT' || $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $customerId = filter_var($input['customer_id'] ?? null, FILTER_VALIDATE_INT);
    $plateNumber = normalizePlateNumber($input['plate_number'] ?? '');
    $brand = trim($input['brand'] ?? '');
    $model = trim($input['model'] ?? '');
    $year = filter_var($input['year'] ?? null, FILTER_VALIDATE_INT);
    $color = trim($input['color'] ?? '');

    if (!$customerId || empty($plateNumber) || empty($brand) || empty($model)) {
        sendErrorResponse('Customer, Nomor Polisi, Merek, dan Tipe/Model wajib diisi.', 400);
    }

    $stmt = $pdo->prepare("
        UPDATE vehicles SET customer_id = :customer_id, plate_number = :plate_number, brand = :brand, model = :model, year = :year, color = :color
        WHERE id = :id
    ");
    $stmt->execute([
        'customer_id'  => $customerId,
        'plate_number' => $plateNumber,
        'brand'        => $brand,
        'model'        => $model,
        'year'         => $year,
        'color'        => $color,
        'id'           => $id
    ]);

    sendJsonResponse(null, 200, 'Data kendaraan berhasil diperbarui.');
} elseif ($method === 'DELETE') {
    $stmt = $pdo->prepare("DELETE FROM vehicles WHERE id = :id");
    $stmt->execute(['id' => $id]);
    sendJsonResponse(null, 200, 'Kendaraan berhasil dihapus.');
} else {
    sendErrorResponse('Metode request tidak diizinkan.', 405);
}
