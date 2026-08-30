<?php
/**
 * API Admin Login
 * POST /api/auth/login.php
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendErrorResponse('Metode request tidak diizinkan.', 405);
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$username = trim($input['username'] ?? '');
$password = trim($input['password'] ?? '');

if (empty($username) || empty($password)) {
    sendErrorResponse('Username dan password wajib diisi.', 400);
}

try {
    $pdo = getDbConnection();
    $stmt = $pdo->prepare("SELECT id, name, username, password_hash FROM admins WHERE username = :username LIMIT 1");
    $stmt->execute(['username' => $username]);
    $admin = $stmt->fetch();

    if (!$admin || !password_verify($password, $admin['password_hash'])) {
        sendErrorResponse('Username atau password salah.', 401);
    }

    startSafeSession();

    $_SESSION['admin_user'] = [
        'id' => $admin['id'],
        'name' => $admin['name'],
        'username' => $admin['username']
    ];
    $_SESSION['admin_id'] = $admin['id'];

    sendJsonResponse([
        'admin' => $_SESSION['admin_user']
    ], 200, 'Login berhasil.');
} catch (Exception $e) {
    sendErrorResponse('Gagal login: ' . $e->getMessage(), 500);
}
