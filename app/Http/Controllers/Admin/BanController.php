<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\IpBan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BanController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['success' => 'Retrieved successfully.', 'data' => IpBan::all()->append('quotes')]);
    }

    public function create(Request $request): JsonResponse
    {
        $request->validate([
            'ip_address' => ['required', 'ip'],
            'comment' => ['required', 'max:1000']
        ]);

        $ban = IpBan::query()->create([
            'ip_address' => $request->input('ip_address'),
            'comment' => $request->input('comment')
        ]);

        return response()->json(['success' => 'Created successfully.', 'data' => $ban]);
    }

    public function destroy(int $id): JsonResponse
    {
        $ban = IpBan::query()->findOrFail($id);
        $ban->delete();

        return response()->json(['success' => 'Deleted successfully.']);
    }
}
