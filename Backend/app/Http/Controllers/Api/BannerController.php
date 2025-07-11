<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Support\Facades\Cache;

class BannerController extends Controller
{
    public function index()
    {
        $banners = Cache::remember('banners_all', 3600, function () {
            return Banner::all();
        });
        return response()->json(['data' => $banners]);
    }
}

