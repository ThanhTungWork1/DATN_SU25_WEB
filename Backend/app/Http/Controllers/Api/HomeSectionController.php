<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HomeSection;
use Illuminate\Http\Request;

class HomeSectionController extends Controller
{
    // GET /api/home-sections (public)
    public function index()
    {
        return HomeSection::where('status', true)->get();
    }

    // POST /api/admin/home-sections (admin)
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|unique:home_sections,name',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'boolean'
        ]);

        $section = HomeSection::create($data);

        return response()->json($section, 201);
    }

    // PUT /api/admin/home-sections/{id} (admin)
    public function update(Request $request, $id)
    {
        $section = HomeSection::findOrFail($id);

        $data = $request->validate([
            'name' => 'required|unique:home_sections,name,' . $id,
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'boolean'
        ]);

        $section->update($data);

        return response()->json($section);
    }

    // DELETE /api/admin/home-sections/{id} (admin)
    public function destroy($id)
    {
        $section = HomeSection::findOrFail($id);
        $section->delete();

        return response()->json(['message' => 'Section deleted']);
    }
}
