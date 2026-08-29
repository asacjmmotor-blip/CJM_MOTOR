<?php
/**
 * API Create Service (Admin)
 * POST /api/services/create.php
 * Supports automatic vehicle lookup, duplicate plate notification, and auto-creation
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/validation.php';
require_once __DIR__ . '/../../helpers/service-code.php';
require_once __DIR__ . '/../../middleware/auth.php';

requireAdminAuth();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendErrorResponse('Metode request tidak diizinkan.', 405);
}

$pdo = getDbConnection();
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

function resolveVehicleId($pdo, $input) {
    $vehicleId = filter_var($input['vehicle_id'] ?? null, FILTER_VALIDATE_INT);
    if ($vehicleId) {
        return $vehicleId;
    }

    $plateNumber = normalizePlateNumber($input['plate_number'] ?? '');
    if (empty($plateNumber)) {
        return null;
    }

    // Check duplicate/existing plate
    $rawPlate = rawPlateNumber($plateNumber);
    $chk = $pdo->prepare("SELECT id FROM vehicles WHERE REPLACE(UPPER(plate_number), ' ', '') = :raw LIMIT 1");
    $chk->execute(['raw' => $rawPlate]);
    $existingVehId = $chk->fetchColumn();

    if ($existingVehId) {
        return $existingVehId;
    }

    // Vehicle not found, create new vehicle & customer
    $brand = trim($input['brand'] ?? '');
    $model = trim($input['model'] ?? '');
    if (empty($brand)) $brand = 'Motor';
    if (empty($model)) $model = 'Umum';

    $custName = trim($input['customer_name'] ?? '');
    $custPhone = trim($input['customer_phone'] ?? '');

    $customerId = null;
    if ($custName !== '') {
        $cStmt = $pdo->prepare("SELECT id FROM customers WHERE name ILIKE :name LIMIT 1");
        $cStmt->execute(['name' => $custName]);
        $customerId = $cStmt->fetchColumn();
        if (!$customerId) {
            $insC = $pdo->prepare("INSERT INTO customers (name, phone, created_at) VALUES (:name, :phone, NOW()) RETURNING id");
            $insC->execute(['name' => $custName, 'phone' => $custPhone]);
            $customerId = $insC->fetchColumn();
        }
    }

    if (!$customerId) {
        $defC = $pdo->prepare("SELECT id FROM customers WHERE name = 'Umum / Non-Member' LIMIT 1");
        $defC->execute();
        $customerId = $defC->fetchColumn();
        if (!$customerId) {
            $insDef = $pdo->prepare("INSERT INTO customers (name, phone, created_at) VALUES ('Umum / Non-Member', '-', NOW()) RETURNING id");
            $insDef->execute();
            $customerId = $insDef->fetchColumn();
        }
    }

    $insV = $pdo->prepare("
        INSERT INTO vehicles (customer_id, plate_number, brand, model, created_at)
        VALUES (:customer_id, :plate_number, :brand, :model, NOW())
        RETURNING id
    ");
    $insV->execute([
        'customer_id'  => $customerId,
        'plate_number' => $plateNumber,
        'brand'        => $brand,
        'model'        => $model
    ]);
    return $insV->fetchColumn();
}

$vehicleId = resolveVehicleId($pdo, $input);
$serviceDate = trim($input['service_date'] ?? date('Y-m-d'));
$serviceType = trim($input['service_type'] ?? 'Service Ringan');
$complaint = trim($input['complaint'] ?? '');
$mechanic = trim($input['mechanic'] ?? '');
$status = trim($input['status'] ?? 'Menunggu');
$notes = trim($input['notes'] ?? '');
$items = $input['items'] ?? [];

if (!$vehicleId || empty($serviceType)) {
    sendErrorResponse('Nomor Polisi Kendaraan dan Jenis Service wajib diisi.', 400);
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
    ], 201, 'Service baru berhasil ditambahkan.');
} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    sendErrorResponse('Gagal menyimpan service: ' . $e->getMessage(), 500);
}
