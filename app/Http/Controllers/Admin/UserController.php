<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function me(): JsonResponse
    {
        if (!Auth::check())
            return response()->json(['error' => 'Unauthenticated.'], 401);

        return response()->json(['success' => 'Found successfully.', 'data' => Auth::user()]);
    }

    public function getUsers(): JsonResponse
    {
        return response()->json(['success' => 'Found successfully.', 'data' => User::all()]);
    }

    public function createUser(Request $request): JsonResponse
    {
        $request->validate([
            'cid' => ['required', 'integer', 'min:800000', 'max:1999999'],
            'name' => ['required', 'string', 'max:40']
        ]);

        $user = User::query()->create([
            'cid' => $request->input('cid'),
            'name' => $request->input('name')
        ]);

        return response()->json(['success' => 'Created successfully.', 'data' => $user]);
    }

    public function toggleUserAdmin(int $cid): JsonResponse
    {
        $user = User::query()->findOrFail($cid);

        $user->is_admin = !$user->is_admin;
        $user->save();

        return response()->json(['success' => 'Updated successfully.', 'data' => $user]);
    }

    public function updateName(int $cid, Request $request): JsonResponse
    {
        $user = User::query()->findOrFail($cid);

        $request->validate([
            'name' => ['required', 'string', 'max:40']
        ]);

        $user->name = $request->input('name');
        $user->save();

        return response()->json(['success' => 'Updated successfully.', 'data' => $user]);
    }
}
