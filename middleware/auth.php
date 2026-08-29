<?php
/**
 * Auth Middleware
 * CJM Motor - Sistem Informasi Service Bengkel Motor
 */

require_once __DIR__ . '/../helpers/response.php';

function requireAdminAuth(): array {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    if (!isset($_SESSION['admin_user'])) {
        sendErrorResponse('Akses ditolak. Silakan login sebagai Admin.', 401);
    }

    return $_SESSION['admin_user'];
}
