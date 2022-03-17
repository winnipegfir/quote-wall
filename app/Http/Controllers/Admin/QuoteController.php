<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Quote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class QuoteController extends Controller
{
    public function getStatusNumbers(): JsonResponse
    {
        $totals = Quote::query()
            ->selectRaw('count(*) as total')
            ->selectRaw("count(case when status = 1 then 1 end) as pending")
            ->selectRaw("count(case when status = 2 then 1 end) as approved")
            ->selectRaw("count(case when status = 3 then 1 end) as refused")
            ->first();

        return response()->json([
            'all' => $totals->total,
            'pending' => $totals->pending,
            'approved' => $totals->approved,
            'rejected' => $totals->refused
        ]);
    }

    public function getQuotesByStatus(string $status): JsonResponse
    {
        $query = Quote::query()->orderByDesc('created_at')->get()->makeVisible(['updated_at', 'ip_address', 'status'])->append('audit_logs');

        $response = match ($status) {
            'all' => $query,
            'pending' => $query->where('status', Quote::PENDING_REVIEW)->flatten(),
            'approved' => $query->where('status', Quote::APPROVED)->flatten(),
            'rejected' => $query->where('status', Quote::REFUSED)->flatten(),
            default => new Quote()
        };

        return response()->json(['message' => 'Found successfully.', 'data' => $response]);
    }

    public function updateQuote(string $uuid, Request $request): JsonResponse
    {
        $quote = Quote::query()->findOrFail($uuid)->makeVisible(['status']);
        $quote_old = $quote->replicate();

        $request->validate([
            'content' => ['required', 'max:5000'],
            'name' => ['string', 'max:50'],
            'status' => ['int', 'min:2', 'max:3']
        ]);

        if (strip_tags($request->input('content'), ['img']) == "") {
            return response()->json(['error' => 'Content required.', 'message' => 'The content field is required.'], 422);
        }

        $quote->update([
            'content' => strip_tags($request->input('content'), ['b', 'img']),
            'name' => $request->input('name') ?? null,
            'status' => $request->input('status')
        ]);

        Log::info($quote_old);

        if ($quote_old->content != $quote->content) {
            AuditLog::query()->create([
                'quote_uuid' => $quote->uuid,
                'user_cid' => Auth::user()->cid,
                'log' => "Updated quote from <code>{$quote_old->content}</code> to <code>{$quote->content}</code>"
            ]);
        }

        if ($quote_old->name != $quote->name) {
            AuditLog::query()->create([
                'quote_uuid' => $quote->uuid,
                'user_cid' => Auth::user()->cid,
                'log' => "Updated name from <code>{$quote_old->name}</code> to <code>{$quote->name}</code>"
            ]);
        }

        if ($quote_old->status != $quote->status) {
            $status_old = self::statusIntToName($quote_old->status);
            $status_new = self::statusIntToName($quote->status);

            AuditLog::query()->create([
                'quote_uuid' => $quote->uuid,
                'user_cid' => Auth::user()->cid,
                'log' => "Updated status from <code>{$status_old}</code> to <code>{$status_new}</code>"
            ]);
        }

        return response()->json(['success' => 'Updated successfully.', 'data' => $quote->jsonSerialize()]);
    }

    private function statusIntToName(int $status): string
    {
        return match ($status) {
            1 => "Pending",
            2 => "Approved",
            3 => "Rejected"
        };
    }
}
