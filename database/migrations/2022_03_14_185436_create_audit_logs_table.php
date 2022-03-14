<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();

            $table->uuid('quote_uuid');
            $table->foreign('quote_uuid')->references('uuid')->on('quotes')->cascadeOnDelete();

            $table->unsignedBigInteger('user_cid')->nullable();
            $table->foreign('user_cid')->references('cid')->on('users')->nullOnDelete();

            $table->text('log');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('audit_logs');
    }
};
