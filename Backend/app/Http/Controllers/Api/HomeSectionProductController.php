<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HomeSection;
use Illuminate\Http\Request;

class HomeSectionProductController extends Controller
{
    // GET /api/home-sections/{id}/products (public)
    public function index($sectionId)
    {
        $section = HomeSection::with([
            'products' => function ($query) {
                $query->orderBy('pivot_sort_order');
            }
        ])->findOrFail($sectionId);

        return response()->json($section->products);
    }

    // POST /api/admin/home-section-products (admin)
    public function store(Request $request)
    {
        $data = $request->validate([
            'home_section_id' => 'required|exists:home_sections,id',
            'product_id' => 'required|exists:products,id',
            'sort_order' => 'nullable|integer'
        ]);

        $section = HomeSection::findOrFail($data['home_section_id']);

        $section->products()->attach($data['product_id'], [
            'sort_order' => $data['sort_order'] ?? 0
        ]);

        return response()->json(['message' => 'Product added to section'], 201);
    }

    // DELETE /api/admin/home-section-products/{section_id}/product/{product_id} (admin)
    public function destroy($sectionId, $productId)
    {
        $section = HomeSection::findOrFail($sectionId);

        $section->products()->detach($productId);

        return response()->json(['message' => 'Product removed from section']);
    }
}
