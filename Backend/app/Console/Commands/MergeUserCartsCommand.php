<?php

namespace App\Console\Commands;

use App\Models\Cart;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class MergeUserCartsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'carts:merge';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Find users with multiple active carts, merge them into one, and delete the redundant ones.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting to merge duplicate user carts...');

        // Tìm những user_id có nhiều hơn 1 giỏ hàng đang hoạt động (status = 1)
        $userIdsWithMultipleCarts = DB::table('carts')
            ->where('status', 1)
            ->select('user_id')
            ->groupBy('user_id')
            ->havingRaw('COUNT(id) > 1')
            ->pluck('user_id');

        if ($userIdsWithMultipleCarts->isEmpty()) {
            $this->info('No users with multiple active carts found. Nothing to do.');
            return 0;
        }

        $this->info('Found ' . $userIdsWithMultipleCarts->count() . ' user(s) with multiple carts.');

        foreach ($userIdsWithMultipleCarts as $userId) {
            $this->line("\nProcessing user ID: {$userId}");

            // Lấy tất cả giỏ hàng đang hoạt động của user
            $carts = Cart::where('user_id', $userId)->where('status', 1)->orderBy('created_at')->get();

            // Giỏ hàng đầu tiên sẽ là giỏ hàng chính
            $primaryCart = $carts->shift();
            $this->line("Primary cart ID: {$primaryCart->id}");

            // Gộp các giỏ hàng còn lại vào giỏ hàng chính
            foreach ($carts as $duplicateCart) {
                $this->line("Merging cart ID: {$duplicateCart->id} into {$primaryCart->id}");

                foreach ($duplicateCart->cartItems as $itemToMove) {
                    // Kiểm tra xem sản phẩm đã có trong giỏ hàng chính chưa
                    $existingItem = $primaryCart->cartItems()
                        ->where('product_id', $itemToMove->product_id)
                        ->where('variant_id', $itemToMove->variant_id)
                        ->first();

                    if ($existingItem) {
                        // Nếu có, cộng dồn số lượng
                        $existingItem->quantity += $itemToMove->quantity;
                        $existingItem->save();
                        $this->comment("  - Updated quantity for product_id: {$itemToMove->product_id}");
                        $itemToMove->delete(); // Xóa item cũ
                    } else {
                        // Nếu không, chuyển item sang giỏ hàng chính
                        $itemToMove->cart_id = $primaryCart->id;
                        $itemToMove->save();
                        $this->comment("  - Moved product_id: {$itemToMove->product_id}");
                    }
                }

                // Sau khi chuyển hết item, xóa giỏ hàng thừa
                $duplicateCart->delete();
                $this->line("Deleted duplicate cart ID: {$duplicateCart->id}");
            }
        }

        $this->info('\nCart merging process completed successfully!');
        return 0;
    }
}
