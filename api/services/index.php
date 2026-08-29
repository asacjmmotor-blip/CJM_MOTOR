<?php
/**
 * API Services List (Admin)
 * GET /api/services/index.php
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

requireAdminAuth();
$pdo = getDbConnection();

$status = trim($_GET['status'] ?? '');
$search = trim($_GET['q'] ?? '');

$sql = "
    SELECT s.*, v.plate_number, v.brand, v.model, c.name as customer_name
    FROM services s
    JOIN vehicles v ON s.vehicle_id = v.id
    JOIN customers c ON v.customer_id = c.id
    WHERE 1=1
";
$params = [];

if ($status !== '') {
    $sql .= " AND s.status = :status";
    $params['status'] = $status;
}

if ($search !== '') {
    $sql .= " AND (s.service_code ILIKE :q OR v.plate_number ILIKE :q OR c.name ILIKE :q OR s.mechanic ILIKE :q)";
    $params['q'] = "%{$search}%";
}

$sql .= " ORDER BY s.service_date DESC, s.id DESC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
sendJsonResponse($stmt->fetchAll());
