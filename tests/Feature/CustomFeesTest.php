<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\AppUser;
use App\Models\WlnProduct;
use App\Models\WlnTags;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;
use function Pest\Laravel\putJson;
use function Pest\Laravel\withoutMiddleware;
use function Pest\Laravel\withoutVite;

uses(Tests\TestCase::class); // no tests/Pest.php binds it

beforeEach(function () {
    config(['database.default' => 'sqlite', 'database.connections.sqlite.database' => ':memory:']);
    withoutMiddleware([HandleInertiaRequests::class, \App\Http\Middleware\VerifyCsrfToken::class]);
    withoutVite();

    foreach (['wsalary_records', 'wln_tag_summary', (new WlnTags)->getTable(), 'wlnproducts'] as $table) {
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
