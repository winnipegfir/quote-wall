<?php

namespace App\Http\Controllers;

use App\Jobs\SendWebhook;
use App\Models\AuditLog;
use App\Models\Quote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Woeler\DiscordPhp\Exception\DiscordInvalidResponseException;
use Woeler\DiscordPhp\Message\DiscordEmbedMessage;
use Woeler\DiscordPhp\Webhook\DiscordWebhook;

class QuoteController extends Controller
{
    public function __construct()
    {
        $this->middleware('ip_ban');
    }

    /**
     * Display a listing of the resource.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $quotes = Quote::search($request->search)
            ->where('status', Quote::APPROVED)
            ->orderBy('created_at', 'desc')
            ->simplePaginate(100)
            ->appends(['search' => $request->search]);

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
            'content' => ['required', 'max:1000'],
            'name' => ['string', 'max:40']
        ]);

        if (strip_tags($request->input('content')) == "") {
            return response()->json(['error' => 'Content required.', 'message' => 'The content field is required.'], 422);
        }

        $quote = Quote::query()->create([
            'content' => strip_tags($request->input('content'), ['b']), // Let's safety store user input
            'name' => $request->input('name') ?? null,
            'ip_address' => $request->ip()
        ]);

        AuditLog::query()->create([
            'quote_uuid' => $quote->uuid,
            'log' => 'Quote created.'
        ]);

        SendWebhook::dispatch($quote);

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

        return response()->json(['success' => 'Found successfully.', 'data' => $quote->append('audit_logs')->jsonSerialize()]);
    }

    /**
     * Choose random quote
     *
     * @return JsonResponse
     */
    public function random(): JsonResponse
    {
        $quote = Quote::query()
            ->where('status', Quote::APPROVED)->inRandomOrder()
            ->first();

        return response()->json(['success' => 'Found successfully.', 'uuid' => $quote->uuid, 'data' => $quote]);
    }
}
