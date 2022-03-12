<?php

use App\Http\Controllers\QuoteController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::prefix('quotes')->name('quotes.')->group(function () {
    Route::get('/', [QuoteController::class, 'index'])->name('index');
    Route::post('/', [QuoteController::class, 'store'])->name('store'); // ->middleware('throttle:3,5')
    Route::get('random', [QuoteController::class, 'random'])->name('random');
    Route::get('/{id}', [QuoteController::class, 'show'])->name('show');

});

