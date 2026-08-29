<?php
/**
 * API Customers (GET List, POST Create)
 * GET /api/customers/index.php
 * POST /api/customers/index.php
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

requireAdminAuth();
$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $search = trim($_GET['q'] ?? '');
    if ($search !== '') {
        $stmt = $pdo->prepare("SELECT * FROM customers WHERE name ILIKE :q OR phone ILIKE :q ORDER BY name ASC");
        $stmt->execute(['q' => "%{$search}%"]);
    } else {
        $stmt = $pdo->query("SELECT * FROM customers ORDER BY created_at DESC");
    }
    $customers = $stmt->fetchAll();
    sendJsonResponse($customers);
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $name = trim($input['name'] ?? '');
    $phone = trim($input['phone'] ?? '');
    $address = trim($input['address'] ?? '');

    if (empty($name) || empty($phone)) {
        sendErrorResponse('Nama dan Nomor HP wajib diisi.', 400);
    }

    $stmt = $pdo->prepare("INSERT INTO customers (name, phone, address, created_at, updated_at) VALUES (:name, :phone, :address, NOW(), NOW()) RETURNING id");
    $stmt->execute(['name' => $name, 'phone' => $phone, 'address' => $address]);
    $id = $stmt->fetchColumn();

    sendJsonResponse(['id' => $id, 'name' => $name, 'phone' => $phone, 'address' => $address], 201, 'Customer berhasil ditambahkan.');
} else {
    sendErrorResponse('Metode request tidak diizinkan.', 405);
}
