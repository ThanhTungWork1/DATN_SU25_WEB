@extends('layout.main')

@section('content')
    <div class="container mt-4">
        <h2>Giỏ hàng của bạn</h2>
        @if (session('success'))
            <div class="alert alert-success">{{ session('success') }}</div>
        @endif

        @if (count($cart) > 0)
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th>Tên sản phẩm</th>
                        <th>Giá</th>
                        <th>Số lượng</th>
                        <th>Thành tiền</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($cart as $id => $item)
                        <tr>
                            <td>{{ $item['name'] }}</td>
                            <td>{{ number_format($item['price']) }} đ</td>
                            <td>
                                <form action="{{ route('cart.update') }}" method="POST" class="d-inline">
                                    @csrf
                                    <input type="hidden" name="product_id" value="{{ $id }}">
                                    <input type="number" name="quantity" value="{{ $item['quantity'] }}" min="1"
                                        style="width:60px;">
                                    <button type="submit" class="btn btn-sm btn-primary">Cập nhật</button>
                                </form>
                            </td>
                            <td>{{ number_format($item['price'] * $item['quantity']) }} đ</td>
                            <td>
                                <form action="{{ route('cart.remove') }}" method="POST" class="d-inline">
                                    @csrf
                                    <input type="hidden" name="product_id" value="{{ $id }}">
                                    <button type="submit" class="btn btn-sm btn-danger">Xóa</button>
                                </form>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
            <div class="text-end">
                <strong>Tổng tiền:
                    {{ number_format(collect($cart)->reduce(fn($carry, $item) => $carry + $item['price'] * $item['quantity'], 0)) }}
                    đ
                </strong>
            </div>
        @else
            <p>Giỏ hàng trống.</p>
        @endif
    </div>
@endsection
