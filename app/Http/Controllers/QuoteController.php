<?php

namespace App\Http\Controllers;

use App\Models\Quote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuoteController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $quotes = Quote::query()
            ->where('status', Quote::APPROVED)
            ->orderByDesc('created_at')
            ->cursorPaginate(30);

        return response()->json($quotes);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'content' => ['required', 'max:65535'],
            'name' => ['string', 'max:255']
        ]);

        $quote = Quote::query()->create([
            'content' => strip_tags($request->input('content'), ['b']), // Let's safety store user input
            'name' => $request->input('name') ?? null,
            'ip_address' => $request->ip()
        ]);

        return response()->json(['success' => 'Created successfully.', 'data' => $quote->jsonSerialize()]);
    }

    /**
     * Display the specified resource.
     *
     * @param string $id
     * @return JsonResponse
     */
    public function show(string $id): JsonResponse
    {
        $quote = Quote::query()->find($id);

        if (!$quote || $quote->status != Quote::APPROVED)
            return response()->json(['error' => 'Not found.'], 404);

        return response()->json(['success' => 'Found successfully.', 'data' => $quote->jsonSerialize()]);
    }

    /**
     * Choose random quote
     *
     * @return JsonResponse
     */
    public function random(): JsonResponse
    {
        $quote = Quote::query()
            ->select('uuid')
            ->where('status', Quote::APPROVED)->inRandomOrder()
            ->first();

        return response()->json(['success' => 'Found successfully.', 'uuid' => $quote->uuid]);
    }
}
