<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->enum('status', ['PENDING', 'COMPLETED', 'FAILED'])
                ->default('PENDING')
                ->after('btc_price_brl');
        });

        // Transactions created before this migration were processed synchronously and are complete.
        DB::table('transactions')->update(['status' => 'COMPLETED']);
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
