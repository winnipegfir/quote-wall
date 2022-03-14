<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return JsonResponse
     */
    public function handle(Request $request, Closure $next, string $input)
    {
        if (!Auth::check())
            return response()->json(['error' => 'Unauthenticated.'], 401);

        $input = str_replace('permission:', '', $input);
        switch ($input) {
            case 'is_admin':
                if (Auth::user()->is_admin || Auth::user()->is_super_admin)
                    return $next($request);

                break;
            case 'is_super_admin':
                if (Auth::user()->is_super_admin)
                    return $next($request);

                break;
            default:
                return $next($request);
        }

        return response()->json(['error' => 'Forbidden.'], 403);
    }
}
