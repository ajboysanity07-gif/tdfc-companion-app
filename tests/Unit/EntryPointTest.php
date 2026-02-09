<?php

it('includes db proxy safety guards in the entrypoint script', function () {
    $contents = file_get_contents(base_path('docker/entrypoint.sh'));

    expect($contents)->not->toBeFalse();
    expect($contents)->toContain('ensure_tailscale_auth');
    expect($contents)->toContain('db_proxy_port_is_listening');
});
