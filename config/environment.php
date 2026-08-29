<?php
/**
 * Environment Config Loader
 * CJM Motor - Sistem Informasi Service Bengkel Motor
 */

$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($key, $value) = explode('=', $line, 2) + [null, null];
        if ($key !== null && $value !== null) {
            $key = trim($key);
            $value = trim(trim($value), '"\'');
            if (!getenv($key)) {
                putenv("{$key}={$value}");
                $_ENV[$key] = $value;
                $_SERVER[$key] = $value;
            }
        }
    }
}
