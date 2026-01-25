<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'order_code')) {
                $table->string('order_code', 20)->nullable()->after('id');
            }
            if (!Schema::hasColumn('orders', 'customer_name')) {
                $table->string('customer_name')->nullable()->after('status');
            }
            if (!Schema::hasColumn('orders', 'customer_email')) {
                $table->string('customer_email')->nullable()->after('customer_name');
            }
            if (!Schema::hasColumn('orders', 'customer_phone')) {
                $table->string('customer_phone')->nullable()->after('customer_email');
            }
            if (!Schema::hasColumn('orders', 'final_amount')) {
                $table->decimal('final_amount', 10, 2)->nullable()->default(0.00)->after('discount_amount');
            }
            if (!Schema::hasColumn('orders', 'delivered_at')) {
                $table->timestamp('delivered_at')->nullable()->after('updated_at');
            }
            if (!Schema::hasColumn('orders', 'shipping_date')) {
                $table->timestamp('shipping_date')->nullable()->after('delivered_at');
            }
            if (!Schema::hasColumn('orders', 'estimated_delivery_date')) {
                $table->timestamp('estimated_delivery_date')->nullable()->after('shipping_date');
            }
            if (!Schema::hasColumn('orders', 'tracking_number')) {
                $table->string('tracking_number')->nullable()->after('estimated_delivery_date');
            }
            if (!Schema::hasColumn('orders', 'shipping_company')) {
                $table->string('shipping_company')->nullable()->after('tracking_number');
            }
            if (!Schema::hasColumn('orders', 'order_source')) {
                $table->string('order_source')->nullable()->default('website')->after('shipping_company');
            }
            if (!Schema::hasColumn('orders', 'priority')) {
                $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal')->after('order_source');
            }
            if (!Schema::hasColumn('orders', 'notes')) {
                $table->text('notes')->nullable()->after('payment_method');
            }
        });

        Schema::table('payments', function (Blueprint $table) {
            if (!Schema::hasColumn('payments', 'transaction_id')) {
                $table->string('transaction_id')->nullable()->after('amount');
            }
            if (!Schema::hasColumn('payments', 'bank_code')) {
                $table->string('bank_code')->nullable()->after('transaction_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $columns = [
                'order_code',
                'customer_name',
                'customer_email',
                'customer_phone',
                'final_amount',
                'delivered_at',
                'shipping_date',
                'estimated_delivery_date',
                'tracking_number',
                'shipping_company',
                'order_source',
                'priority',
                'notes'
            ];
            foreach ($columns as $col) {
                if (Schema::hasColumn('orders', $col)) {
                    $table->dropColumn($col);
                }
            }
        });

        Schema::table('payments', function (Blueprint $table) {
            foreach (['transaction_id', 'bank_code'] as $col) {
                if (Schema::hasColumn('payments', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
