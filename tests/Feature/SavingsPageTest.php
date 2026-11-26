<?php

use App\Http\Controllers\SavingsController;
use App\Models\AppUser;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

uses(TestCase::class);

test('savings page lists Personal Savings rows only', function () {
    Schema::create('wsavled', function (Blueprint $table) {
        $table->string('acctno');
        $table->string('svnumber');
        $table->string('svtype');
        $table->string('typecode', 2);
        $table->string('date_in');
        $table->string('mreference');
        $table->decimal('deposit');
        $table->decimal('withdrawal');
        $table->decimal('balance');
        $table->integer('controlno');
    });

    foreach (['04' => 'PERSONAL SAVINGS', '07' => 'CISP-SAVINGS'] as $code => $type) {
        DB::table('wsavled')->insert([
            'acctno' => 'A1',
            'svnumber' => 'SV-'.$code,
            'svtype' => $type,
            'typecode' => $code,
            'date_in' => '2026-03-18',
            'mreference' => 'Deposit',
            'deposit' => 100,
            'withdrawal' => 0,
            'balance' => 100,
            'controlno' => 1,
        ]);
    }

    $user = new AppUser;
    $user->acctno = 'A1';
    $request = Request::create('/savings');
    $request->headers->set('X-Inertia', 'true');
    $request->setUserResolver(fn () => $user);

    $page = (new SavingsController)->index($request)->toResponse($request)->getData(true);

    expect(array_column($page['props']['transactions'], 'description'))->toBe(['PERSONAL SAVINGS']);
});
