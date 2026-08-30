<?php
/**
 * Auth Middleware
 * CJM Motor - Sistem Informasi Service Bengkel Motor
 */

require_once __DIR__ . '/../helpers/response.php';

function startSafeSession() {
    if (session_status() === PHP_SESSION_NONE) {
        if (is_dir('/tmp') && is_writable('/tmp')) {
            @session_save_path('/tmp');
        }
        @session_start();
    }
}

function requireAdminAuth(): array {
    startSafeSession();

    if (!isset($_SESSION['admin_user'])) {
        sendErrorResponse('Akses ditolak. Silakan login sebagai Admin.', 401);
    }

    return $_SESSION['admin_user'];
}
