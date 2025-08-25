<?php

return [
    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'forgot-password',
        'reset-password/*',
        'login',
        'logout',
        'register',
        'user'
    ],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['*'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => [
        'Accept',
        'Authorization',
        'Content-Type',
        'X-Requested-With',
        'X-CSRF-TOKEN',
        'X-XSRF-TOKEN',
        'X-Socket-ID',
        'X-Socket-Id'
    ],
    'exposed_headers' => [
        'XSRF-TOKEN',
        'x-xsrf-token',
        'x-csrf-token',
        'Authorization'
    ],
    'max_age' => 60 * 60 * 24, // 24 hours
    'supports_credentials' => true,
];