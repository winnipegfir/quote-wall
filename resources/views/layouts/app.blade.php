<!DOCTYPE html>
<html lang="en-US">
<head>
    <!-- Static Meta -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" value="{{ csrf_token() }}"/>
    <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png">
    <link rel="manifest" href="/icons/site.webmanifest">
    <link rel="mask-icon" href="/icons/safari-pinned-tab.svg " color="#4285f4">
    <meta name="msapplication-TileColor" content="#4285f4">
    <meta name="theme-color" content="#4285f4">

    <!-- Open Graph Tags -->
    <meta property="og:site_name" content="Winnipeg FIR Quote Wall">
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ url()->current() }}">

    <!-- Load CSS -->
    <link href="{{ mix('css/app.css') }}" type="text/css" rel="stylesheet"/>

    <title>Quote Management</title>
</head>
<body>

<div id="app">
    <nav class="justify-content-center navbar navbar-expand navbar-light">
        <a href="/" class="text-white p-0 navbar-brand">
            <img src="/images/logo-white.png" alt="Winnipeg FIR Logo" class="logo pe-2">
            <span class="text-logo">Winnipeg FIR </span>
            <span>Quote Management</span>
        </a>
        <div class="navbar-nav">
            @auth
                <li class="nav-item"></li>

                @if(\Illuminate\Support\Facades\Auth::user()->is_admin)

                @endif
            @endauth

            @guest
                <li class="nav-item">
                    <a class="nav-link text-white" href="{{ route('redirect') }}">Login</a>
                </li>
            @endguest

        </div>
    </nav>

    @yield('content')
</div>

</body>
</html>
