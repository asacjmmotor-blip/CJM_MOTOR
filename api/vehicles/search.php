<?php
/**
 * API Vehicle & Service History Search for CS (READ ONLY)
 * GET /api/vehicles/search.php?nopol=B1234ABC
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/validation.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendErrorResponse('Metode request tidak diizinkan.', 405);
}

$rawNopol = trim($_GET['nopol'] ?? '');
if (empty($rawNopol)) {
    sendErrorResponse('Nomor Polisi wajib diisi.', 400);
}

$normalizedPlate = normalizePlateNumber($rawNopol);
$rawPlate = rawPlateNumber($rawNopol);

$pdo = getDbConnection();

// Search vehicle matching normalized plate or raw plate
$stmt = $pdo->prepare("
    SELECT v.id, v.plate_number, v.brand, v.model, v.year, v.color
    FROM vehicles v
    WHERE REPLACE(UPPER(v.plate_number), ' ', '') = :raw_plate
    LIMIT 1
");
$stmt->execute(['raw_plate' => $rawPlate]);
$vehicle = $stmt->fetch();

if (!$vehicle) {
    sendErrorResponse('Kendaraan dengan Nomor Polisi tersebut tidak ditemukan.', 404);
}

// Fetch service history for CS (excluding sensitive admin/financial fields if needed, but returning service history)
$hStmt = $pdo->prepare("
    SELECT s.id, s.service_code, s.service_date, s.service_type, s.complaint, s.mechanic, s.status, s.notes, s.total_cost
    FROM services s
    WHERE s.vehicle_id = :vehicle_id
    ORDER BY s.service_date DESC, s.id DESC
");
$hStmt->execute(['vehicle_id' => $vehicle['id']]);
$services = $hStmt->fetchAll();

// Fetch items for each service
foreach ($services as &$service) {
    $iStmt = $pdo->prepare("SELECT item_name, item_type, quantity, price, subtotal FROM service_items WHERE service_id = :service_id");
    $iStmt->execute(['service_id' => $service['id']]);
    $service['items'] = $iStmt->fetchAll();
}

sendJsonResponse([
    'vehicle' => $vehicle,
    'services' => $services
], 200, 'Data kendaraan dan riwayat service ditemukan.');
