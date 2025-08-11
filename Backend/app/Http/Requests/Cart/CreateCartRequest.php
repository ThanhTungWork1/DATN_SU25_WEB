<?php

namespace App\Http\Requests\Cart;

use Illuminate\Foundation\Http\FormRequest;

class CreateCartRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'cartItems' => 'required|array',
            // Cho phép gửi variant_id hoặc product_id; yêu cầu ít nhất một trong hai
            'cartItems.*.variant_id' => 'sometimes|required_without:cartItems.*.product_id|exists:product_variants,id',
            'cartItems.*.product_id' => 'sometimes|required_without:cartItems.*.variant_id|exists:products,id',
            'cartItems.*.quantity' => 'required|integer|min:1',
            'cartItems.*.price' => 'required|numeric',
        ];
    }
}
