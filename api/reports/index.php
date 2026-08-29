<?php
/**
 * API Summary / Reports for Admin Dashboard
 * GET /api/reports/index.php
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

requireAdminAuth();
$pdo = getDbConnection();

$totalCustomers = $pdo->query("SELECT COUNT(*) FROM customers")->fetchColumn();
$totalVehicles  = $pdo->query("SELECT COUNT(*) FROM vehicles")->fetchColumn();

$today = date('Y-m-d');
$todayServices  = $pdo->prepare("SELECT COUNT(*) FROM services WHERE service_date = :today");
$todayServices->execute(['today' => $today]);
$countToday = $todayServices->fetchColumn();

$activeServices = $pdo->query("SELECT COUNT(*) FROM services WHERE status IN ('Menunggu', 'Dikerjakan')")->fetchColumn();
$completedServices = $pdo->query("SELECT COUNT(*) FROM services WHERE status = 'Selesai'")->fetchColumn();
$revenue = $pdo->query("SELECT COALESCE(SUM(total_cost), 0) FROM services WHERE status IN ('Selesai', 'Diambil')")->fetchColumn();

// Latest 5 services
$recentStmt = $pdo->query("
    SELECT s.id, s.service_code, s.service_date, s.service_type, s.mechanic, s.status, v.plate_number, v.brand, v.model, c.name as customer_name
    FROM services s
    JOIN vehicles v ON s.vehicle_id = v.id
    JOIN customers c ON v.customer_id = c.id
    ORDER BY s.id DESC LIMIT 5
");
$recentServices = $recentStmt->fetchAll();

sendJsonResponse([
    'total_customers'    => (int)$totalCustomers,
    'total_vehicles'     => (int)$totalVehicles,
    'today_services'     => (int)$countToday,
    'active_services'    => (int)$activeServices,
    'completed_services' => (int)$completedServices,
    'total_revenue'      => (float)$revenue,
    'recent_services'    => $recentServices
]);
