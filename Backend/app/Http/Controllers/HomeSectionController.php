<?php
namespace App\Http\Controllers;

use App\Models\HomeSection;
use App\Models\Product;
use Illuminate\Http\Request;

class HomeSectionController extends Controller
{
    public function index()
    {
        $sections = HomeSection::with('products')->get();
        
        return response()->json([
            'sections' => $sections
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|unique:home_sections',
            'title' => 'required',
            'description' => 'nullable',
        ]);

        return HomeSection::create($data);
    }

    public function update(Request $request, $id)
    {
        $section = HomeSection::findOrFail($id);
        $data = $request->validate([
            'title' => 'required',
            'description' => 'nullable',
            'status' => 'boolean',
        ]);

        $section->update($data);
        return $section;
    }

    public function destroy($id)
    {
        HomeSection::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }

    public function updateProducts(Request $request, $id)
    {
        $section = HomeSection::findOrFail($id);
        $products = $request->validate([
            'products' => 'required|array',
            'products.*.id' => 'required|exists:products,id',
            'products.*.sort_order' => 'nullable|integer',
        ]);

        // Gán sản phẩm vào section
        $syncData = [];
        foreach ($products['products'] as $p) {
            $syncData[$p['id']] = ['sort_order' => $p['sort_order'] ?? 0];
        }

        $section->products()->sync($syncData);
        return $section->load('products');
    }
}

