<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Str;

class LoginController extends Controller
{
    private \Illuminate\Http\Client\PendingRequest $client;

    public function __construct()
    {
        $this->client = Http::withUserAgent("Quote Wall | Winnipeg FIR")->baseUrl(config('vatsim-connect.base'));
    }

    public function redirect(): \Illuminate\Routing\Redirector|\Illuminate\Contracts\Foundation\Application|\Illuminate\Http\RedirectResponse
    {
        if (Auth::check()) Auth::logout();
        if (Session::has('state')) Session::forget('state');
        if (Session::has('token')) Session::forget('token');

        $state = Str::random(20);
        Session::put('state', $state);

        $request = http_build_query([
            'client_id' => config('vatsim-connect.client_id'),
            'redirect_uri' => config('vatsim-connect.redirect_uri'),
            'response_type' => 'code',
            'scope' => config('vatsim-connect.scope'),
            'required_scopes' => config('vatsim-connect.required_scope'),
            'state' => $state
        ]);

        return redirect(config('vatsim-connect.base') . 'oauth/authorize?' . $request);
    }

    public function callback(Request $request): \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
    {
        if (!$request->has('code') && !$request->has('state'))
            return response()->json(['error' => 'Missing data.', 'hint' => 'Authorization code or state is missing.'], 400);

        if (Session::get('state') !== $request->get('state'))
            return response()->json(['error' => 'Client authentication failed.', 'hint' => 'State did not match.'], 400);

        // Get OAuth token
        $response = $this->client->post('/oauth/token', [
            'grant_type' => 'authorization_code',
            'client_id' => config('vatsim-connect.client_id'),
            'client_secret' => config('vatsim-connect.client_secret'),
            'redirect_uri' => config('vatsim-connect.redirect_uri'),
            'code' => $request->get('code'),
        ]);

        if ($response->failed()) {
            return response()->json(['error' => 'Failed to retrieve OAuth token from VATSIM.', 'hint' => json_decode($response->body())->hint ?? null], 400);
        }

        $oauth = json_decode($response->body());

        // Get VATSIM details
        $response = $this->client->withHeaders([
            'Accept' => 'application/json',
            'Authorization' => 'Bearer ' . $oauth->access_token
        ])->get('/api/user');

        if ($response->failed()) {
            return response()->json(['error' => 'Failed to retrieve OAuth token from VATSIM.', 'hint' => json_decode($response->body())->hint ?? null], 400);
        }

        $details = json_decode($response->body());

        // Check response from VATSIM
        if (isset($details->error)) {
            return response()->json(['error' => 'Failed to retrieve VATSIM details.', 'hint' => $details->error], 400);
        }

        if (!isset($details->data->cid)) {
            return response()->json(['error' => 'VATSIM details are missing.', 'hint' => 'We require the `vatsim_details` scope set in order to log into our website.'], 400);
        }

        $user = User::query()->find($details->data->cid);

        if (!$user) {
            return response()->json(['error' => 'Forbidden', 'hint' => 'You are not permitted to login to this website at this time. No user data has been saved.'], 403);
        }

        Auth::login($user, true);
        return response()->json(['success' => 'Logged in successfully.']);
    }

}
