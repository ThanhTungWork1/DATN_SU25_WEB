<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('contacts', function (Blueprint $table) {
            $table->tinyInteger('status')->default(0)->after('message');
        });
    }

    public function down()
    {
        Schema::table('contacts', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
