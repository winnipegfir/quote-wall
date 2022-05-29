<?php

namespace App\Http\Middleware;

use App\Models\IpBan;
use Closure;
use Illuminate\Http\Request;
use Response;

class CheckIpBan
{
    /**
     * Handle an incoming request.
     *
     * @param Request $request
     * @param Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return Response
     */
    public function handle(Request $request, Closure $next): mixed
    {
        $ipBan = IpBan::query()->where('ip_address', $request->ip())->first();

        if ($ipBan)
            return response()->json(['error' => 'Banned.', 'message' => 'You are not allowed to use our service due to past activity. Appeal via email, k.dunning@vatcan.ca'], 403);

        return $next($request);
    }
}
