<?php
/**
 * API Customer Detail, Update, Delete
 * GET /api/customers/detail.php?id={id}
 * PUT /api/customers/detail.php?id={id}
 * DELETE /api/customers/detail.php?id={id}
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

requireAdminAuth();
$pdo = getDbConnection();
$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);

if (!$id) {
    sendErrorResponse('ID Customer tidak valid.', 400);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->prepare("SELECT * FROM customers WHERE id = :id LIMIT 1");
    $stmt->execute(['id' => $id]);
    $customer = $stmt->fetch();
    if (!$customer) sendErrorResponse('Customer tidak ditemukan.', 444);

    $vStmt = $pdo->prepare("SELECT * FROM vehicles WHERE customer_id = :id ORDER BY id DESC");
    $vStmt->execute(['id' => $id]);
    $customer['vehicles'] = $vStmt->fetchAll();

    sendJsonResponse($customer);
} elseif ($method === 'PUT' || $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $name = trim($input['name'] ?? '');
    $phone = trim($input['phone'] ?? '');
    $address = trim($input['address'] ?? '');

    if (empty($name) || empty($phone)) {
        sendErrorResponse('Nama dan Nomor HP wajib diisi.', 400);
    }

    $stmt = $pdo->prepare("UPDATE customers SET name = :name, phone = :phone, address = :address, updated_at = NOW() WHERE id = :id");
    $stmt->execute(['name' => $name, 'phone' => $phone, 'address' => $address, 'id' => $id]);

    sendJsonResponse(null, 200, 'Data customer berhasil diperbarui.');
} elseif ($method === 'DELETE') {
    $stmt = $pdo->prepare("DELETE FROM customers WHERE id = :id");
    $stmt->execute(['id' => $id]);
    sendJsonResponse(null, 200, 'Customer berhasil dihapus.');
} else {
    sendErrorResponse('Metode request tidak diizinkan.', 405);
}
