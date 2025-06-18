<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Flexy Free Bootstrap Admin Template by WrapPixel</title>
    <!-- Favicon -->
    <link rel="shortcut icon" type="image/png" href="{{ asset('build/assets/images/logos/favicon.png') }}" />

    <!-- Main Stylesheet -->
    <link rel="stylesheet" href="{{ asset('build/assets/css/styles.min.css') }}" />

</head>

<body>
    @include('layout.header')
    @include('layout.sidebar')
    @include('layout.main')


    @include('layout.footer')
    </div>
    </div>
    </div>
    </div>
    <!-- jQuery -->
    <script src="{{ asset('build/assets/libs/jquery/dist/jquery.min.js') }}"></script>

    <!-- Bootstrap Bundle -->
    <script src="{{ asset('build/assets/libs/bootstrap/dist/js/bootstrap.bundle.min.js') }}"></script>

    <!-- Sidebar Menu -->
    <script src="{{ asset('build/assets/js/sidebarmenu.js') }}"></script>

    <!-- App Core -->
    <script src="{{ asset('build/assets/js/app.min.js') }}"></script>

    <!-- ApexCharts -->
    <script src="{{ asset('build/assets/libs/apexcharts/dist/apexcharts.min.js') }}"></script>

    <!-- Simplebar -->
    <script src="{{ asset('build/assets/libs/simplebar/dist/simplebar.js') }}"></script>

    <!-- Dashboard Scripts -->
    <script src="{{ asset('build/assets/js/dashboard.js') }}"></script>

    <!-- Solar Icons (CDN) -->
    <script src="https://cdn.jsdelivr.net/npm/iconify-icon@1.0.8/dist/iconify-icon.min.js"></script>

</body>

</html>