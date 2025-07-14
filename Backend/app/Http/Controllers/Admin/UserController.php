<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{


    public function index()
    {
        return User::all();
    }

    public function store(Request $request)
    {
        try {
            $data = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users',
                'password' => 'required|string|min:6',
                'phone' => 'nullable|string|max:20',
                'address' => 'required|string|max:255',
                'role' => 'nullable|integer',
            ]);

            $data['password'] = Hash::make($data['password']);
            $data['role'] = $data['role'] ?? 0;

            $user = User::create($data);

            return response()->json([
                'message' => 'User created successfully',
                'data' => $user
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        return User::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $data = $request->only(['name', 'email', 'password', 'phone', 'address', 'role']);

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return $user;
    }

    public function unlock($id)
    {
        $user = User::findOrFail($id);

        $user->status = 1;
        $user->save();

        return response()->json([
            'message' => 'Tài khoản đã được mở khoá',
            'user' => $user
        ]);
    }

    public function lock($id)
    {
        $user = User::findOrFail($id);

        if ($user->role == 1) {
            return response()->json(['message' => 'Không thể khoá tài khoản admin!'], 403);
        }

        $user->status = 0; // ⚠️ Khoá tài khoản
        $user->save();

        return response()->json([
            'message' => 'Tài khoản đã bị khoá thành công',
            'user' => $user
        ]);
    }

    public function listUsers()
    {
        return 'listUsers test';
    }
}