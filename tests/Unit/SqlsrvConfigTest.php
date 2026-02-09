<?php

it('keeps sqlsrv connection pooling false in options', function () {
    putenv('DB_CONNECTION_POOLING=false');
    $_ENV['DB_CONNECTION_POOLING'] = 'false';

    $config = require base_path('config/database.php');
    $options = $config['connections']['sqlsrv']['options'];

    expect($options)->toHaveKey('ConnectionPooling')
        ->and($options['ConnectionPooling'])->toBeFalse();
});

it('uses sqlsrv login and connect timeouts from env', function () {
    putenv('DB_LOGIN_TIMEOUT=5');
    putenv('DB_CONNECT_TIMEOUT=5');
    putenv('DB_QUERY_TIMEOUT=12');
    $_ENV['DB_LOGIN_TIMEOUT'] = '5';
    $_ENV['DB_CONNECT_TIMEOUT'] = '5';
    $_ENV['DB_QUERY_TIMEOUT'] = '12';

    $config = require base_path('config/database.php');
    $options = $config['connections']['sqlsrv']['options'];

    expect((int) $options['LoginTimeout'])->toBe(5)
        ->and((int) $options['ConnectTimeout'])->toBe(5)
        ->and((int) $options['QueryTimeout'])->toBe(12);
});
