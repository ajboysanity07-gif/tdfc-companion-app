<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wlnproducts', function (Blueprint $table) {
            $table->id();
            $table->string('typecode', 2)->unique();
            $table->string('lntype')->nullable();
            $table->decimal('int_rate', 8, 2)->nullable();
            $table->boolean('rate_isEditable')->default(false);
            $table->boolean('allow_multiple')->default(false);
            $table->string('installment_mode')->default('MONTHLY');
            $table->string('ln_scheme')->nullable();
            $table->integer('max_term')->nullable();
            $table->boolean('max_term_isEditable')->default(false);
            $table->integer('max_amortization')->nullable();
            $table->boolean('max_amortization_isEditable')->default(false);
            $table->decimal('service_fee', 8, 2)->nullable();
            $table->decimal('lrf', 8, 2)->nullable();
            $table->decimal('doc_stamp', 8, 2)->nullable();
            $table->decimal('mort_notarial', 8, 2)->nullable();
            $table->text('terms_and_info')->nullable();
            $table->boolean('ln_isActive')->default(false);
            $table->boolean('isDisplayed')->default(true);
            $table->timestamps();
        });

        // Backfill from the old wln_display / wln_settings / wlntype trio.
        $types = DB::table('wlntype')->get(['typecode', 'lntype', 'int_rate'])
            ->keyBy(fn ($t) => trim($t->typecode));
        $settings = DB::table('wln_settings')->get()->keyBy(fn ($s) => trim($s->typecode));

        foreach (DB::table('wln_display')->get() as $d) {
            $code = trim($d->typecode);
            $t = $types[$code] ?? null;
            $s = $settings[$code] ?? null;

            DB::table('wlnproducts')->insert([
                'typecode' => $code,
                'lntype' => $t ? trim($t->lntype) : null,
                'int_rate' => $t->int_rate ?? null,
                'rate_isEditable' => $s->rate_isEditable ?? false,
                'allow_multiple' => $s->allow_multiple ?? false,
                'installment_mode' => $s->installment_mode ?? 'MONTHLY',
                'ln_scheme' => $s->ln_scheme ?? null,
                'max_term' => $s->max_term ?? null,
                'max_term_isEditable' => $s->max_term_isEditable ?? false,
                'max_amortization' => $s->max_amortization ?? null,
                'max_amortization_isEditable' => $s->max_amortization_isEditable ?? false,
                'service_fee' => $s->service_fee ?? null,
                'lrf' => $s->lrf ?? null,
                'doc_stamp' => $s->doc_stamp ?? null,
                'mort_notarial' => $s->mort_notarial ?? null,
                'terms_and_info' => $s->terms_and_info ?? null,
                'ln_isActive' => $s->ln_isActive ?? false,
                'isDisplayed' => $d->isDisplayed,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('wlnproducts');
    }
};
