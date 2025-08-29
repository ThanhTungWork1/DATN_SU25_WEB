<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class CacheService
{
    /**
     * Cache product search results
     */
    public static function cacheProductSearch($params, $result, $ttl = 300)
    {
        $cacheKey = 'product_search_' . md5(json_encode($params));
        Cache::put($cacheKey, $result, $ttl);
        Log::info('---[CACHE] Cached product search result', ['key' => $cacheKey]);
    }

    /**
     * Get cached product search results
     */
    public static function getCachedProductSearch($params)
    {
        $cacheKey = 'product_search_' . md5(json_encode($params));
        $cached = Cache::get($cacheKey);
        
        if ($cached) {
            Log::info('---[CACHE] Cache hit for product search', ['key' => $cacheKey]);
        }
        
        return $cached;
    }

    /**
     * Clear product search cache
     */
    public static function clearProductSearchCache()
    {
        // Clear all product search cache
        $keys = Cache::get('product_search_keys', []);
        foreach ($keys as $key) {
            Cache::forget($key);
        }
        Cache::forget('product_search_keys');
        Log::info('---[CACHE] Cleared all product search cache');
    }

    /**
     * Cache categories
     */
    public static function cacheCategories($categories, $ttl = 3600)
    {
        Cache::put('categories_with_count', $categories, $ttl);
        Log::info('---[CACHE] Cached categories');
    }

    /**
     * Get cached categories
     */
    public static function getCachedCategories()
    {
        return Cache::get('categories_with_count');
    }

    /**
     * Cache popular searches
     */
    public static function cachePopularSearches($searches, $ttl = 1800)
    {
        Cache::put('popular_searches', $searches, $ttl);
    }

    /**
     * Get cached popular searches
     */
    public static function getCachedPopularSearches()
    {
        return Cache::get('popular_searches', []);
    }

    /**
     * Increment search count for analytics
     */
    public static function incrementSearchCount($query)
    {
        $key = 'search_count_' . md5($query);
        Cache::increment($key);
        
        // Store in daily stats
        $today = date('Y-m-d');
        $dailyKey = 'daily_searches_' . $today;
        $dailySearches = Cache::get($dailyKey, []);
        $dailySearches[$query] = ($dailySearches[$query] ?? 0) + 1;
        Cache::put($dailyKey, $dailySearches, 86400); // 24 hours
    }

    /**
     * Get search analytics
     */
    public static function getSearchAnalytics()
    {
        $today = date('Y-m-d');
        $dailySearches = Cache::get('daily_searches_' . $today, []);
        
        arsort($dailySearches);
        return array_slice($dailySearches, 0, 10, true); // Top 10 searches
    }
}
