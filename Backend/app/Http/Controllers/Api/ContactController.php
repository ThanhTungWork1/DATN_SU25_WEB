<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    // Gửi liên hệ (user)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email',
            'phone' => 'nullable|string|max:20',
            'message' => 'required|string',
        ]);

        $contact = Contact::create($validated);

        return response()->json([
            'status' => true,
            'message' => 'Liên hệ đã được gửi!',
            'data' => $contact,
        ], 201);
    }

    // Admin xem danh sách liên hệ
    public function index()
    {
        $contacts = Contact::latest()->get();

        return response()->json([
            'status' => true,
            'data' => $contacts
        ]);
    }
}
