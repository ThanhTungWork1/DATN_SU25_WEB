<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Complaint;
use Illuminate\Support\Facades\Auth;

class ComplaintController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'description' => 'required|string'
        ]);

        $complaint = Complaint::create([
            'user_id' => Auth::id(),
            'order_id' => $request->order_id,
            'description' => $request->description,
            'status' => 'pending',
        ]);

        return response()->json($complaint, 201);
    }
}
