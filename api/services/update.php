<?php
/**
 * API Update Service & Status (Admin)
 * POST /api/services/update.php?id={id}
 * PUT /api/services/update.php?id={id}
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

requireAdminAuth();
$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if (!$id) {
    sendErrorResponse('ID Service tidak valid.', 400);
}

$pdo = getDbConnection();
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$serviceDate = trim($input['service_date'] ?? '');
$serviceType = trim($input['service_type'] ?? '');
$complaint = trim($input['complaint'] ?? '');
$mechanic = trim($input['mechanic'] ?? '');
$status = trim($input['status'] ?? '');
$notes = trim($input['notes'] ?? '');
$items = $input['items'] ?? null;

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("
        UPDATE services SET
            service_date = COALESCE(NULLIF(:service_date, ''), service_date),
            service_type = COALESCE(NULLIF(:service_type, ''), service_type),
            complaint    = COALESCE(NULLIF(:complaint, ''), complaint),
            mechanic     = COALESCE(NULLIF(:mechanic, ''), mechanic),
            status       = COALESCE(NULLIF(:status, ''), status),
            notes        = COALESCE(NULLIF(:notes, ''), notes),
            updated_at   = NOW()
        WHERE id = :id
    ");
    $stmt->execute([
        'service_date' => $serviceDate,
        'service_type' => $serviceType,
        'complaint'    => $complaint,
        'mechanic'     => $mechanic,
        'status'       => $status,
        'notes'        => $notes,
        'id'           => $id
    ]);

    if ($items !== null && is_array($items)) {
        // Replace items
        $pdo->prepare("DELETE FROM service_items WHERE service_id = :id")->execute(['id' => $id]);

        $totalCost = 0;
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
            $totalCost += $subtotal;

            $iStmt->execute([
                'service_id' => $id,
                'item_name'  => $itemName,
                'item_type'  => $itemType,
                'quantity'   => $quantity,
                'price'      => $price,
                'subtotal'   => $subtotal
            ]);
        }

        $pdo->prepare("UPDATE services SET total_cost = :total_cost WHERE id = :id")->execute([
            'total_cost' => $totalCost,
            'id' => $id
        ]);
    }

    $pdo->commit();
    sendJsonResponse(null, 200, 'Data service berhasil diperbarui.');
} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    sendErrorResponse('Gagal memperbarui service: ' . $e->getMessage(), 500);
}
