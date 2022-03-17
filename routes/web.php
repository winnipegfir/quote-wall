<?php

use App\Http\Controllers\Admin\BanController;
use App\Http\Controllers\Admin\QuoteController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\LoginController;
use App\Models\Quote;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::prefix('auth')->group(function () {
    Route::get('login/redirect', [LoginController::class, 'redirect'])->name('redirect');

    Route::get('logout', function () {
        \Illuminate\Support\Facades\Auth::logout();

        return redirect("/");
    })->name('logout');
});

Route::prefix('api')->group(function () {
    Route::prefix('admin')->group(function () {
        Route::get('authenticated', function () {
            return response()->json(['auth' => \Illuminate\Support\Facades\Auth::check()]);
        });

        Route::get('user', [UserController::class, 'me']);

        Route::group(['prefix' => 'quotes', 'middleware' => 'permission:is_admin'], function () {
            Route::get('numbers', [QuoteController::class, 'getStatusNumbers']);
            Route::get('status/{status}', [QuoteController::class, 'getQuotesByStatus']);
            Route::post('{uuid}', [QuoteController::class, 'updateQuote']);
        });

        Route::group(['prefix' => 'bans', 'middleware' => 'permission:is_admin'], function () {
            Route::get('/', [BanController::class, 'index']);
            Route::post('/', [BanController::class, 'create']);
            Route::delete('/{id}', [BanController::class, 'destroy']);
        });

        Route::group(['prefix' => 'users', 'middleware' => 'permission:is_super_admin'], function () {
            Route::get('/', [UserController::class, 'getUsers']);
            Route::post('/', [UserController::class, 'createUser']);
            Route::get('/{cid}/toggle', [UserController::class, 'toggleUserAdmin']);
            Route::post('/{cid}/name', [UserController::class, 'updateName']);
        });
    });

    Route::prefix('auth')->group(function () {
        Route::get('callback', [LoginController::class, 'callback']);
    });
});



Route::get('{any}', function () {
    $quote = null;

    if (Request::segment(1) == "quote") {
        $quote = Quote::query()->find(Request::segment(2));

        if (!$quote || $quote->status !== Quote::APPROVED)
            $quote = null;
    }

    return view('app', compact('quote'));
})->where('any', '.*');
