<?php
/**
 * Validation & Sanitization Helper
 * CJM Motor - Sistem Informasi Service Bengkel Motor
 */

/**
 * Normalizes license plate input into clean standardized format (e.g. 'b 1234 abc' -> 'B 1234 ABC')
 */
function normalizePlateNumber(string $plate): string {
    $clean = strtoupper(trim($plate));
    // Remove all non-alphanumeric characters except spaces
    $clean = preg_replace('/[^A-Z0-9\s]/', '', $clean);
    // Collapse multiple spaces into single space
    $clean = preg_replace('/\s+/', ' ', $clean);
    return trim($clean);
}

/**
 * Formats plate number without spaces for raw database searches (e.g. 'B1234ABC')
 */
function rawPlateNumber(string $plate): string {
    return str_replace(' ', '', normalizePlateNumber($plate));
}

/**
 * Validates Indonesian License Plate format (e.g., B 1234 ABC, D 123 XY)
 */
function isValidPlateNumber(string $plate): bool {
    $normalized = normalizePlateNumber($plate);
    return preg_match('/^[A-Z]{1,2}\s[0-9]{1,4}\s[A-Z]{1,3}$/', $normalized) === 1;
}

/**
 * Basic XSS output sanitizer
 */
function escapeHtml(?string $text): string {
    return htmlspecialchars($text ?? '', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
