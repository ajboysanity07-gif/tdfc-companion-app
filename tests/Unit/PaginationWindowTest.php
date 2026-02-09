<?php

use Symfony\Component\Process\Process;

test('buildPaginationWindow returns a compact page window', function () {
    $script = <<<'JS'
import { buildPaginationWindow } from './resources/js/lib/pagination.js';

const cases = [
  { current: 1, total: 26, max: 5 },
  { current: 13, total: 26, max: 5 },
  { current: 26, total: 26, max: 5 },
  { current: 2, total: 3, max: 5 },
  { current: 0, total: 0, max: 5 },
];

const output = cases.map(({ current, total, max }) => buildPaginationWindow(current, total, max));
console.log(JSON.stringify(output));
JS;

    $process = new Process(['node', '--input-type=module', '-e', $script], base_path());
    $process->mustRun();

    $output = trim($process->getOutput());
    $result = json_decode($output, true);

    expect($result)->toBe([
        [1, 2, 3, 4, 5],
        [11, 12, 13, 14, 15],
        [22, 23, 24, 25, 26],
        [1, 2, 3],
        [],
    ]);
});
