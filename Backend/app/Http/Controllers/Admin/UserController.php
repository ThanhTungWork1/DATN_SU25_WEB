<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{


    public function index(Request $request)
    {
        $query = User::query();

        // Tìm kiếm theo tên hoặc email
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%")
                  ->orWhere('phone', 'like', "%$search%")
                  ->orWhere('address', 'like', "%$search%")
                  ;
            });
        }

        // Lọc theo role
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        // Lọc theo status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Sắp xếp
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $allowedSortFields = ['name', 'email', 'created_at', 'updated_at', 'role', 'status'];
        if (!in_array($sortBy, $allowedSortFields)) {
            $sortBy = 'created_at';
        }
        if (!in_array($sortOrder, ['asc', 'desc'])) {
            $sortOrder = 'desc';
        }
        $query->orderBy($sortBy, $sortOrder);

        // Phân trang
        $perPage = $request->get('per_page', 10);
        $perPage = min(max($perPage, 1), 100);
        $users = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách user thành công',
            'data' => $users->items(),
            'pagination' => [
                'current_page' => $users->currentPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'total_pages' => $users->lastPage(),
                'has_next_page' => $users->hasMorePages(),
                'has_prev_page' => $users->currentPage() > 1,
            ],
            'filters' => [
                'search' => $request->search ?? null,
                'role' => $request->role ?? null,
                'status' => $request->status ?? null,
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ]
        ]);
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
                'role' => 'nullable|integer|in:0,1,2',
            ]);

            $data['password'] = Hash::make($data['password']);
            
            // Đảm bảo role là integer hợp lệ
            if (!isset($data['role'])) {
                $data['role'] = 0; // Default to user (0)
            }

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

        // Validate the request data
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'password' => 'sometimes|string|min:6',
            'phone' => 'sometimes|string|max:20',
            'address' => 'sometimes|string|max:255',
            'role' => 'sometimes|integer|in:0,1,2',
            'status' => 'sometimes|boolean',
        ]);

        $data = $request->only(['name', 'email', 'password', 'phone', 'address', 'role', 'status']);

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        // Đảm bảo role là integer hợp lệ nếu có
        if (isset($data['role']) && !in_array($data['role'], [0, 1, 2])) {
            $data['role'] = 0; // Default to user (0) if invalid
        }

        $user->update($data);

        return response()->json([
            'message' => 'Cập nhật thành công',
            'data' => $user
        ]);
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