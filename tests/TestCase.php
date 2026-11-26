<?php

namespace Tests;

use App\Models\AppUser;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use RuntimeException;

abstract class TestCase extends BaseTestCase
{
    /** Runs before RefreshDatabase, so a wrong connection is stopped before anything is wiped. */
    public function createApplication()
    {
        $app = parent::createApplication();
        $config = $app['config'];

        if ($config['database.default'] !== 'sqlite' || $config['database.connections.sqlite.database'] !== ':memory:') {
            throw new RuntimeException('Tests must run on in-memory SQLite. Run "php artisan config:clear" first.');
        }

        // Wmaster and VWeb_Account pin sqlsrv: remap it so no test can reach the remote server.
        $config->set('database.connections.sqlsrv', $config['database.connections.sqlite']);

        return $app;
    }

    protected function setUp(): void
    {
        parent::setUp();

        // both connection names see the same in-memory database
        DB::connection('sqlsrv')->setPdo(DB::connection()->getPdo());
        $this->withoutVite();
    }

    /** A row in the legacy member table, which no migration creates. */
    protected function wmaster(string $acctno = '000001'): void
    {
        if (! Schema::hasTable('wmaster')) {
            Schema::create('wmaster', function (Blueprint $table) {
                $table->string('acctno')->primary();
                $table->string('bname');
            });
        }

        DB::table('wmaster')->updateOrInsert(['acctno' => $acctno], ['bname' => 'Test Member']);
    }

    /** An approved client; the password is "password". Needs RefreshDatabase. */
    protected function member(array $attributes = []): AppUser
    {
        $attributes += [
            'acctno' => '000001',
            'phone_no' => '09170000001',
            'email' => 'member@example.com',
            'password' => 'password',
            'role' => 'client',
            'status' => 'approved',
        ];
        $this->wmaster($attributes['acctno']);

        return AppUser::create($attributes);
    }
}
