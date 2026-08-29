<?php
/**
 * Service Code Generator Helper
 * CJM Motor - Sistem Informasi Service Bengkel Motor
 */

function generateServiceCode(PDO $pdo): string {
    $datePrefix = date('Ymd');
    $prefix = "SRV-{$datePrefix}-";

    $stmt = $pdo->prepare("SELECT service_code FROM services WHERE service_code LIKE :prefix ORDER BY id DESC LIMIT 1");
    $stmt->execute(['prefix' => "{$prefix}%"]);
    $lastCode = $stmt->fetchColumn();

    if ($lastCode) {
        $sequence = (int) substr($lastCode, -3);
        $nextSequence = str_pad($sequence + 1, 3, '0', STR_PAD_LEFT);
    } else {
        $nextSequence = '001';
    }

    return $prefix . $nextSequence;
}
