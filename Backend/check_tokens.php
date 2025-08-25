<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔍 Checking password_reset_tokens table:\n";
echo "=====================================\n";

try {
    $tokens = \DB::table('password_reset_tokens')->get();
    
    if ($tokens->count() > 0) {
        foreach ($tokens as $token) {
            echo "Email: {$token->email}\n";
            echo "Token: {$token->token}\n";
            echo "Created: {$token->created_at}\n";
            echo "---\n";
        }
    } else {
        echo "No tokens found in database.\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
