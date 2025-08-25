<?php
require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    // Test database connection
    $pdo = DB::connection()->getPdo();
    echo "Database connection: OK\n";
    
    // Check if sessions table exists
    $tables = DB::select("SHOW TABLES LIKE 'sessions'");
    if (empty($tables)) {
        echo "Sessions table: NOT EXISTS\n";
        
        // Create sessions table
        DB::statement("
            CREATE TABLE sessions (
                id VARCHAR(255) PRIMARY KEY,
                user_id BIGINT UNSIGNED NULL,
                ip_address VARCHAR(45) NULL,
                user_agent TEXT NULL,
                payload LONGTEXT NOT NULL,
                last_activity INT NOT NULL,
                INDEX sessions_user_id_index (user_id),
                INDEX sessions_last_activity_index (last_activity)
            )
        ");
        echo "Sessions table: CREATED\n";
    } else {
        echo "Sessions table: EXISTS\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
