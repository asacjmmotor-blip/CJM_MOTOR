<?php
/**
 * API Service Detail & Delete (Admin / CS)
 * GET /api/services/detail.php?id={id}
 * DELETE /api/services/detail.php?id={id}
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';

$pdo = getDbConnection();
$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);

if (!$id) {
    sendErrorResponse('ID Service tidak valid.', 400);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->prepare("
        SELECT s.*, v.plate_number, v.brand, v.model, v.year, v.color, c.name as customer_name, c.phone as customer_phone
        FROM services s
        JOIN vehicles v ON s.vehicle_id = v.id
        JOIN customers c ON v.customer_id = c.id
        WHERE s.id = :id LIMIT 1
    ");
    $stmt->execute(['id' => $id]);
    $service = $stmt->fetch();

    if (!$service) {
        sendErrorResponse('Data service tidak ditemukan.', 404);
    }

    $iStmt = $pdo->prepare("SELECT * FROM service_items WHERE service_id = :id");
    $iStmt->execute(['id' => $id]);
    $service['items'] = $iStmt->fetchAll();

    sendJsonResponse($service);
} elseif ($method === 'DELETE') {
    require_once __DIR__ . '/../../middleware/auth.php';
    requireAdminAuth();

    $stmt = $pdo->prepare("DELETE FROM services WHERE id = :id");
    $stmt->execute(['id' => $id]);
    sendJsonResponse(null, 200, 'Data service berhasil dihapus.');
} else {
    sendErrorResponse('Metode request tidak diizinkan.', 405);
}
