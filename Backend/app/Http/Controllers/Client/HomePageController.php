<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\HomeSection;

class HomePageController extends Controller
{
    public function index()
    {
        $sections = HomeSection::with('products')->get();

        return response()->json([
            'sections' => $sections
        ]);
    }
}

