<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\AppUser;
use App\Models\WlnProduct;
use App\Models\WlnTags;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;
use function Pest\Laravel\postJson;
use function Pest\Laravel\putJson;
use function Pest\Laravel\withoutMiddleware;
use function Pest\Laravel\withoutVite;

uses(Tests\TestCase::class); // no tests/Pest.php binds it

beforeEach(function () {
    config(['database.default' => 'sqlite', 'database.connections.sqlite.database' => ':memory:']);
    withoutMiddleware([HandleInertiaRequests::class, \App\Http\Middleware\VerifyCsrfToken::class]);
    withoutVite();

    foreach (['wlntype', 'wsalary_records', 'wln_tag_summary', (new WlnTags)->getTable(), 'wlnproducts'] as $table) {
        Schema::dropIfExists($table);
    }
    foreach ([
        '2026_11_23_000001_create_wlnproducts_table',
        '2026_11_24_000001_add_amortization_formula_to_wlnproducts',
        '2026_11_26_000001_add_custom_fees_to_wlnproducts',
    ] as $migration) {
        (require database_path("migrations/{$migration}.php"))->up();
    }
    Schema::create((new WlnTags)->getTable(), function (Blueprint $table) {
        $table->id();
        $table->string('typecode', 2);
        $table->string('tag_name');
        $table->timestamps();
    });
    Schema::create('wln_tag_summary', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('wlntag_id');
        $table->timestamps();
    });
    Schema::create('wlntype', function (Blueprint $table) {
        $table->string('typecode');
        $table->string('lntype');
    });
    Schema::create('wsalary_records', function (Blueprint $table) {
        $table->string('acctno');
        $table->decimal('salary_amount', 12, 2)->nullable();
        $table->timestamps();
    });

    WlnProduct::create(['typecode' => '09', 'lntype' => 'ATM LOAN', 'ln_isActive' => true, 'isDisplayed' => true]);
});

function actingAsRole(string $role): void
{
    actingAs(new AppUser(['role' => $role, 'status' => 'approved']));
}

it('saves custom fees, sends them to the calculator and clears them', function () {
    $fees = [
        ['label' => 'Insurance', 'type' => 'percent', 'value' => 2],
        ['label' => 'Processing', 'type' => 'fixed', 'value' => 100],
    ];

    actingAsRole('admin');
    putJson('/api/admin/products/09', ['settings' => ['custom_fees' => $fees]])->assertOk();
    expect(WlnProduct::first()->settings['custom_fees'])->toEqual($fees);

    // an unrelated save leaves them alone
    putJson('/api/admin/products/09', ['settings' => ['ln_isActive' => true]])->assertOk();
    expect(WlnProduct::first()->custom_fees)->toHaveCount(2);

    actingAsRole('client');
    get('/loans/calculator')->assertOk()->assertInertia(fn ($page) => $page
        ->where('products.0.custom_fees.0.label', 'Insurance')
        ->where('products.0.custom_fees.1.value', 100));

    actingAsRole('admin');
    putJson('/api/admin/products/09', ['settings' => ['custom_fees' => []]])->assertOk();
    expect(WlnProduct::first()->custom_fees)->toBe([]);
});

it('rejects bad custom fees', function (array $fee, string $key) {
    actingAsRole('admin');

    putJson('/api/admin/products/09', ['settings' => ['custom_fees' => [$fee]]])
        ->assertStatus(422)
        ->assertJsonValidationErrors("settings.custom_fees.0.{$key}");
})->with([
    'no name' => [['label' => '', 'type' => 'fixed', 'value' => 1], 'label'],
    'unknown type' => [['label' => 'X', 'type' => 'other', 'value' => 1], 'type'],
    'no value' => [['label' => 'X', 'type' => 'fixed', 'value' => null], 'value'],
    'negative' => [['label' => 'X', 'type' => 'fixed', 'value' => -1], 'value'],
    'percent over 100' => [['label' => 'X', 'type' => 'percent', 'value' => 101], 'value'],
]);

it('creates a product from its name, taking the master loan type code or a free one', function () {
    // the master list is CHAR-padded, and 99 belongs to a loan type that has no product yet
    DB::table('wlntype')->insert([
        ['typecode' => '04', 'lntype' => 'SALARY LOAN   '],
        ['typecode' => '99', 'lntype' => 'CALAMITY LOAN'],
    ]);
    actingAsRole('admin');

    postJson('/api/admin/products', ['lntype' => 'Salary Loan'])->assertCreated()->assertJsonPath('typecode', '04');
    postJson('/api/admin/products', ['lntype' => 'TRAVEL LOAN'])->assertCreated()->assertJsonPath('typecode', '98');
});

it('rejects a loan name that is already taken', function () {
    actingAsRole('admin');

    postJson('/api/admin/products', ['lntype' => 'ATM LOAN'])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['lntype' => 'The loan name has already been taken.']);
});

it('renames a product without changing its code', function () {
    actingAsRole('admin');

    // saving its own name again is not a duplicate
    putJson('/api/admin/products/09', ['lntype' => 'ATM LOAN'])->assertOk();
    putJson('/api/admin/products/09', ['lntype' => 'PAYROLL LOAN'])
        ->assertOk()
        ->assertJsonPath('lntype', 'PAYROLL LOAN')
        ->assertJsonPath('typecode', '09');
});

it('rejects renaming to a blank or taken name', function (string $name, string $message) {
    WlnProduct::create(['typecode' => '10', 'lntype' => 'SALARY LOAN']);
    actingAsRole('admin');

    putJson('/api/admin/products/09', ['lntype' => $name])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['lntype' => $message]);
    expect(WlnProduct::where('typecode', '09')->value('lntype'))->toBe('ATM LOAN');
})->with([
    'blank' => ['', 'The loan name field is required.'],
    'taken' => ['SALARY LOAN', 'The loan name has already been taken.'],
]);

it('sends the calculator the computation settings and hides products with an unsupported mode', function () {
    WlnProduct::create(['typecode' => '10', 'lntype' => 'WEEKLY LOAN', 'installment_mode' => 'WEEKLY', 'ln_isActive' => true]);
    WlnProduct::create([
        'typecode' => '11', 'lntype' => 'BONUS LOAN', 'ln_scheme' => 'PREPAID', 'installment_mode' => 'SEMI-ANNUAL',
        'max_term' => 365, 'ln_isActive' => true,
    ]);
    config(['loans.cutoff_day' => 7]);
    actingAsRole('client');

    get('/loans/calculator')->assertOk()->assertInertia(fn ($page) => $page
        ->has('products', 2)
        ->where('products.0.scheme', 'ADD-ON')
        ->where('products.0.mode', 'MONTHLY')
        ->where('products.0.cutoff_day', 7)
        ->where('products.1.scheme', 'PREPAID')
        ->where('products.1.mode', 'SEMI-ANNUAL')
        ->where('products.1.max_term_days', 365));
});

it('rejects computation settings the calculator cannot use', function (array $body, string $key) {
    actingAsRole('admin');

    putJson('/api/admin/products/09', $body)->assertStatus(422)->assertJsonValidationErrors($key);
})->with([
    'weekly mode' => [['settings' => ['installment_mode' => 'WEEKLY']], 'settings.installment_mode'],
    'unknown scheme' => [['settings' => ['ln_scheme' => 'OTHER']], 'settings.ln_scheme'],
    'rate over 100' => [['int_rate' => 101], 'int_rate'],
    'negative service fee' => [['settings' => ['service_fee' => -1]], 'settings.service_fee'],
    'lrf over 100' => [['settings' => ['lrf' => 101]], 'settings.lrf'],
    'flat doc stamp' => [['settings' => ['doc_stamp' => 150]], 'settings.doc_stamp'],
    'negative mortuary' => [['settings' => ['mort_notarial' => -1]], 'settings.mort_notarial'],
]);

it('accepts the three modes and both schemes', function () {
    actingAsRole('admin');

    foreach (['MONTHLY', 'SEMI-ANNUAL', 'DUE-DATE'] as $mode) {
        putJson('/api/admin/products/09', ['settings' => ['installment_mode' => $mode, 'ln_scheme' => 'PREPAID']])->assertOk();
    }
    putJson('/api/admin/products/09', ['int_rate' => 7.5, 'settings' => ['ln_scheme' => 'ADD-ON', 'doc_stamp' => 0.75, 'mort_notarial' => 850]])->assertOk();
});

it('tells the calculator whether the client may change the max amortization', function (bool $editable) {
    WlnProduct::where('typecode', '09')->update(['max_amortization_isEditable' => $editable]);
    actingAsRole('client');

    get('/loans/calculator')->assertOk()->assertInertia(fn ($page) => $page
        ->where('products.0.amortization_editable', $editable));
})->with([true, false]);
