<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use App\Mail\SendReplyMail;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    /**
     * Gửi liên hệ (user)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email',
            'phone' => 'nullable|string|max:20',
            'message' => 'required|string',
        ]);

        // mặc định: chưa xử lý
        $validated['status'] = 0;

        $contact = Contact::create($validated);

        return response()->json([
            'status' => true,
            'message' => 'Liên hệ đã được gửi!',
            'data' => $contact,
        ], 201);
    }

    /**
     * Admin xem danh sách liên hệ + lọc
     * Query params: status, email, name, from_date, to_date
     */
    public function index(Request $request)
    {
        $query = Contact::query();

        // status = 0|1|2
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // email chứa chuỗi
        if ($request->filled('email')) {
            $query->where('email', 'like', '%' . $request->email . '%');
        }

        // name chứa chuỗi
        if ($request->filled('name')) {
            $query->where('name', 'like', '%' . $request->name . '%');
        }

        // lọc khoảng ngày (YYYY-MM-DD)
        if ($request->filled('from_date') || $request->filled('to_date')) {
            $from = $request->from_date
                ? Carbon::parse($request->from_date)->startOfDay()
                : Carbon::minValue();
            $to = $request->to_date
                ? Carbon::parse($request->to_date)->endOfDay()
                : Carbon::now()->endOfDay();
            $query->whereBetween('created_at', [$from, $to]);
        }

        $contacts = $query->orderByDesc('created_at')->get();

        return response()->json([
            'status' => true,
            'data' => $contacts,
        ]);
    }

    /**
     * Admin cập nhật trạng thái phản hồi
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:0,1,2',
        ]);

        $contact = Contact::find($id);

        if (!$contact) {
            return response()->json([
                'status' => false,
                'message' => 'Phản hồi không tồn tại',
            ], 404);
        }

        $contact->status = $request->status;
        $contact->save();

        return response()->json([
            'status' => true,
            'message' => 'Cập nhật trạng thái thành công',
            'data' => $contact,
        ]);
    }

    public function reply(Request $request, $id)
    {
        $request->validate([
            'reply_message' => 'required|string',
        ]);

        $contact = Contact::find($id);
        if (!$contact) {
            return response()->json(['status' => false, 'message' => 'Liên hệ không tồn tại'], 404);
        }

        // Gửi email cho user
        Mail::to($contact->email)->send(new SendReplyMail($contact, $request->reply_message));

        // Cập nhật trạng thái đã phản hồi
        $contact->status = 1;
        $contact->save();

        return response()->json(['status' => true, 'message' => 'Đã gửi phản hồi cho khách hàng!']);
    }
}
