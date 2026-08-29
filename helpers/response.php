<?php
/**
 * JSON Response Helper
 * CJM Motor - Sistem Informasi Service Bengkel Motor
 */

function sendJsonResponse($data = null, int $statusCode = 200, string $message = '', bool $success = true): void {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code($statusCode);
    
    $response = [
        'success' => $success,
        'message' => $message,
        'data'    => $data
    ];

    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function sendErrorResponse(string $message, int $statusCode = 400, $errors = null): void {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code($statusCode);

    $response = [
        'success' => false,
        'message' => $message,
        'errors'  => $errors
    ];

    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
