<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Filesystem Disk
    |--------------------------------------------------------------------------
    */
    'default' => env('FILESYSTEM_DISK', 'local'),

    /*
    |--------------------------------------------------------------------------
    | Filesystem Disks
    |--------------------------------------------------------------------------
    */
    'disks' => [

        'local' => [
            'driver' => 'local',
            'root' => storage_path('app/private'),
            'serve' => true,
            'throw' => false,
            'report' => false,
        ],

        'public' => [
            'driver' => 'local',
            'root' => storage_path('app/public'),
            'url' => env('APP_URL') . '/storage',
            'visibility' => 'public',
            'throw' => false,
            'report' => false,
        ],

        's3' => [
            'driver' => 's3',
            'key' => env('AWS_ACCESS_KEY_ID', env('R2_ACCESS_KEY_ID')),
            'secret' => env('AWS_SECRET_ACCESS_KEY', env('R2_SECRET_ACCESS_KEY')),
            'region' => env('AWS_DEFAULT_REGION', env('R2_REGION', 'auto')),
            'bucket' => env('AWS_BUCKET', env('R2_BUCKET')),
            'url' => env('AWS_URL', env('R2_PUBLIC_BASE_URL')),
            'endpoint' => env('AWS_ENDPOINT', env('R2_ENDPOINT')),
            'use_path_style_endpoint' => env('AWS_USE_PATH_STYLE_ENDPOINT', env('R2_USE_PATH_STYLE_ENDPOINT', true)),
            'visibility' => 'public',
            'throw' => false,
            'report' => false,
        ],

        'r2' => [
            'driver' => 's3',
            'key' => env('AWS_ACCESS_KEY_ID', env('R2_ACCESS_KEY_ID')),
            'secret' => env('AWS_SECRET_ACCESS_KEY', env('R2_SECRET_ACCESS_KEY')),
            'region' => env('AWS_DEFAULT_REGION', env('R2_REGION', 'auto')),
            'bucket' => env('AWS_BUCKET', env('R2_BUCKET')),
            'url' => env('AWS_URL', env('R2_PUBLIC_BASE_URL')),
            'endpoint' => env('AWS_ENDPOINT', env('R2_ENDPOINT')),
            'use_path_style_endpoint' => env('AWS_USE_PATH_STYLE_ENDPOINT', env('R2_USE_PATH_STYLE_ENDPOINT', true)),
            'visibility' => 'public',
            'throw' => false,
            'report' => false,
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Symbolic Links
    |--------------------------------------------------------------------------
    */
    'links' => [
        public_path('storage') => storage_path('app/public'),
    ],

];