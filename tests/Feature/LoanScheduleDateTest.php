<?php

use App\Http\Controllers\LoanTransactionController;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

uses(TestCase::class);

// The VWeb_Amortsched view returns Date_pay as MM/DD/YYYY text.
test('schedule dates become ISO and are ordered by date, not as text', function () {
    Schema::create('VWeb_Amortsched', function (Blueprint $table) {
        $table->string('lnnumber');
        $table->string('Date_pay');
        $table->decimal('Principalpay');
        $table->decimal('Interest');
        $table->decimal('Amortization');
        $table->decimal('Balance');
    });

    foreach (['01/15/2027' => 0, '12/15/2026' => 100] as $date => $balance) {
        DB::table('VWeb_Amortsched')->insert([
            'lnnumber' => 'L1',
            'Date_pay' => $date,
            'Principalpay' => 100,
            'Interest' => 1,
            'Amortization' => 101,
            'Balance' => $balance,
        ]);
    }

    $rows = (new ReflectionMethod(LoanTransactionController::class, 'scheduleRows'))
        ->invoke(new LoanTransactionController, (object) ['lnnumber' => 'L1', 'balance' => 200]);

    expect($rows->pluck('date')->all())->toBe(['2026-12-15', '2027-01-15'])
        ->and($rows->pluck('status')->all())->toBe(['due', 'upcoming']);
});
