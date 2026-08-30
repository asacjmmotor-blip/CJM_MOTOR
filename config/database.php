<?php
/**
 * Database Connection (Supabase PostgreSQL via PDO)
 * CJM Motor - Sistem Informasi Service Bengkel Motor
 */

require_once __DIR__ . '/environment.php';

function getEnvVar($key, $default = '') {
    $val = getenv($key);
    if ($val !== false && $val !== '') return $val;
    if (isset($_ENV[$key]) && $_ENV[$key] !== '') return $_ENV[$key];
    if (isset($_SERVER[$key]) && $_SERVER[$key] !== '') return $_SERVER[$key];
    return $default;
}

function getDbConnection() {
    static $pdo = null;
    if ($pdo === null) {
        $host = getEnvVar('DB_HOST', 'localhost');
        $port = getEnvVar('DB_PORT', '5432');
        $dbname = getEnvVar('DB_NAME', 'postgres');
        $user = getEnvVar('DB_USER', 'postgres');
        $password = getEnvVar('DB_PASSWORD', '');
        $sslmode = getEnvVar('DB_SSLMODE', 'require');

        $dsn = "pgsql:host={$host};port={$port};dbname={$dbname};sslmode={$sslmode}";
        
        try {
            $pdo = new PDO($dsn, $user, $password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            error_log("Database connection failure: " . $e->getMessage());
            header('Content-Type: application/json');
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Koneksi ke database gagal: ' . $e->getMessage()
            ]);
            exit;
        }
    }
    return $pdo;
}
