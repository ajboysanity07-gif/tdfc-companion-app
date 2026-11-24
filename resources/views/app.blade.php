<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    {{-- Apply the saved theme before first paint (key shared with use-appearance.tsx) --}}
    <script>
        (function() {
            var v = null;
            try { v = localStorage.getItem('tdfc-theme') || localStorage.getItem('appearance'); } catch (e) {}
            if (v !== 'light' && v !== 'dark' && v !== 'system') v = 'dark';
            var dark = v === 'dark' || (v === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
            document.documentElement.classList.toggle('dark', dark);
            document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
        })();
    </script>

    <style>
        html {
            background-color: oklch(0.975 0 0);
        }

        html.dark {
            background-color: oklch(0.145 0 0);
        }
    </style>

    <title inertia>{{ config('app.name', 'Laravel') }}</title>

 <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
    <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('favicon-32x32.png') }}">
    <link rel="icon" type="image/png" sizes="16x16" href="{{ asset('favicon-16x16.png') }}">

    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

    @routes
    <!-- ZIGGY DEBUG MARKER -->
    @viteReactRefresh
    {{-- @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"]) --}}
    @vite('resources/js/app.tsx') {{-- ← keep only the app entry --}}
    @inertiaHead
</head>

<body class="m-0 font-sans antialiased">
    @inertia
</body>

</html>
