<?php
/**
 * API Admin Profile & Change Password
 * GET /api/auth/profile.php - Get current admin info
 * POST /api/auth/profile.php - Change admin password & profile
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

requireAdminAuth();
$pdo = getDbConnection();
$adminId = $_SESSION['admin_id'] ?? null;

if (!$adminId) {
    sendErrorResponse('Sesi admin tidak ditemukan.', 401);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->prepare("SELECT id, username, name, created_at FROM admins WHERE id = :id LIMIT 1");
    $stmt->execute(['id' => $adminId]);
    $admin = $stmt->fetch();
    if (!$admin) {
        sendErrorResponse('Data admin tidak ditemukan.', 404);
    }
    sendJsonResponse($admin);
} elseif ($method === 'POST' || $method === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $action = trim($input['action'] ?? 'change_password');

    if ($action === 'change_password') {
        $currentPassword = trim($input['current_password'] ?? '');
        $newPassword = trim($input['new_password'] ?? '');
        $confirmPassword = trim($input['confirm_password'] ?? '');

        if (empty($currentPassword) || empty($newPassword)) {
            sendErrorResponse('Password saat ini dan password baru wajib diisi.', 400);
        }

        if (strlen($newPassword) < 6) {
            sendErrorResponse('Password baru minimal 6 karakter.', 400);
        }

        if ($newPassword !== $confirmPassword) {
            sendErrorResponse('Konfirmasi password baru tidak cocok.', 400);
        }

        // Verify current password
        $stmt = $pdo->prepare("SELECT password FROM admins WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $adminId]);
        $admin = $stmt->fetch();

        if (!$admin || !password_verify($currentPassword, $admin['password'])) {
            sendErrorResponse('Password saat ini tidak cocok.', 400);
        }

        // Update password with hash
        $newHash = password_hash($newPassword, PASSWORD_BCRYPT);
        $upd = $pdo->prepare("UPDATE admins SET password = :password WHERE id = :id");
        $upd->execute(['password' => $newHash, 'id' => $adminId]);

        sendJsonResponse(null, 200, 'Password admin berhasil diperbarui.');
    } else {
        sendErrorResponse('Aksi tidak valid.', 400);
    }
} else {
    sendErrorResponse('Metode request tidak diizinkan.', 405);
}
