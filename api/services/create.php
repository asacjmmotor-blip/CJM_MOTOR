<?php
/**
 * API Create Service (Admin)
 * POST /api/services/create.php
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/service-code.php';
require_once __DIR__ . '/../../middleware/auth.php';

requireAdminAuth();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendErrorResponse('Metode request tidak diizinkan.', 405);
}

$pdo = getDbConnection();
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$vehicleId = filter_var($input['vehicle_id'] ?? null, FILTER_VALIDATE_INT);
$serviceDate = trim($input['service_date'] ?? date('Y-m-d'));
$serviceType = trim($input['service_type'] ?? 'Service Ringan');
$complaint = trim($input['complaint'] ?? '');
$mechanic = trim($input['mechanic'] ?? '');
$status = trim($input['status'] ?? 'Menunggu');
$notes = trim($input['notes'] ?? '');
$items = $input['items'] ?? [];

if (!$vehicleId || empty($serviceType)) {
    sendErrorResponse('Kendaraan dan Jenis Service wajib diisi.', 400);
}

try {
    $pdo->beginTransaction();

    $serviceCode = generateServiceCode($pdo);

    $totalCost = 0;
    foreach ($items as $item) {
        $qty = (int)($item['quantity'] ?? 1);
        $price = (float)($item['price'] ?? 0);
        $totalCost += ($qty * $price);
    }

    $stmt = $pdo->prepare("
        INSERT INTO services (vehicle_id, service_code, service_date, service_type, complaint, mechanic, status, notes, total_cost, created_at, updated_at)
        VALUES (:vehicle_id, :service_code, :service_date, :service_type, :complaint, :mechanic, :status, :notes, :total_cost, NOW(), NOW())
        RETURNING id
    ");
    $stmt->execute([
        'vehicle_id'   => $vehicleId,
        'service_code' => $serviceCode,
        'service_date' => $serviceDate,
        'service_type' => $serviceType,
        'complaint'    => $complaint,
        'mechanic'     => $mechanic,
        'status'       => $status,
        'notes'        => $notes,
        'total_cost'   => $totalCost
    ]);
    $serviceId = $stmt->fetchColumn();

    if (!empty($items) && is_array($items)) {
        $iStmt = $pdo->prepare("
            INSERT INTO service_items (service_id, item_name, item_type, quantity, price, subtotal)
            VALUES (:service_id, :item_name, :item_type, :quantity, :price, :subtotal)
        ");
        foreach ($items as $item) {
            $itemName = trim($item['item_name'] ?? '');
            if (empty($itemName)) continue;
            $itemType = trim($item['item_type'] ?? 'Jasa');
            $quantity = (int)($item['quantity'] ?? 1);
            $price = (float)($item['price'] ?? 0);
            $subtotal = $quantity * $price;

            $iStmt->execute([
                'service_id' => $serviceId,
                'item_name'  => $itemName,
                'item_type'  => $itemType,
                'quantity'   => $quantity,
                'price'      => $price,
                'subtotal'   => $subtotal
            ]);
        }
    }

    $pdo->commit();

    sendJsonResponse([
        'id' => $serviceId,
        'service_code' => $serviceCode
    ], 201, 'Service berhasil dibuat.');
} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    sendErrorResponse('Gagal menyimpan service: ' . $e->getMessage(), 500);
}
