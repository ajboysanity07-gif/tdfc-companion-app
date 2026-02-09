<?php

it('returns ok for health check', function () {
    $this->get('/health')->assertNoContent();
});
