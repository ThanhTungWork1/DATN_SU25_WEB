<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Log all SQL queries when APP_DEBUG is true to help diagnose 500 errors
        if (config('app.debug')) {
            DB::listen(function ($query) {
                try {
                    Log::debug('SQL', [
                        'sql' => $query->sql,
                        'bindings' => $query->bindings,
                        'time_ms' => $query->time,
                    ]);
                } catch (\Throwable $e) {
                    // Avoid breaking app if logging has issues
                }
            });
        }
    }
}
