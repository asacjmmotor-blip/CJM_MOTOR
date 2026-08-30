<?php
/**
 * Database Connection (Supabase PostgreSQL via PDO)
 * CJM Motor - Sistem Informasi Service Bengkel Motor
 * Supports Vercel Supabase Integration variables (POSTGRES_*) & DB_*
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
        // Support Vercel Supabase Integration variables (POSTGRES_*) alongside DB_*
        $host = getEnvVar('DB_HOST') ?: (getEnvVar('POSTGRES_HOST') ?: 'localhost');
        $port = getEnvVar('DB_PORT') ?: (getEnvVar('POSTGRES_PORT') ?: '5432');
        $dbname = getEnvVar('DB_NAME') ?: (getEnvVar('POSTGRES_DATABASE') ?: 'postgres');
        $user = getEnvVar('DB_USER') ?: (getEnvVar('POSTGRES_USER') ?: 'postgres');
        $password = getEnvVar('DB_PASSWORD') ?: getEnvVar('POSTGRES_PASSWORD', '');
        $sslmode = getEnvVar('DB_SSLMODE', 'require');

        // Parse full Postgres URL if provided by Vercel Integration
        $postgresUrl = getEnvVar('POSTGRES_URL_NON_POOLING') ?: getEnvVar('POSTGRES_URL');
        if ($postgresUrl && (strpos($postgresUrl, 'postgres://') === 0 || strpos($postgresUrl, 'postgresql://') === 0)) {
            $parsed = parse_url($postgresUrl);
            if (isset($parsed['host'])) $host = $parsed['host'];
            if (isset($parsed['port'])) $port = $parsed['port'];
            if (isset($parsed['user'])) $user = rawurldecode($parsed['user']);
            if (isset($parsed['pass'])) $password = rawurldecode($parsed['pass']);
            if (isset($parsed['path'])) $dbname = ltrim($parsed['path'], '/');
        }

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
                'message' => 'Koneksi ke database Supabase gagal: ' . $e->getMessage()
            ]);
            exit;
        }
    }
    return $pdo;
}
