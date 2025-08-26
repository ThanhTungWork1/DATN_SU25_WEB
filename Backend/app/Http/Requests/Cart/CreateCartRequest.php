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
            'cartItems'              => 'required|array',
            'cartItems.*.product_id' => 'required|exists:products,id', // Luôn yêu cầu product_id
            'cartItems.*.variant_id' => 'required|exists:product_variants,id', // Luôn yêu cầu variant_id
            'cartItems.*.quantity'   => 'required|integer|min:1|max:10', // Giới hạn tối đa 10 sản phẩm cho bán lẻ
            'cartItems.*.price'      => 'required|numeric|min:0',
        ];
    }
}
