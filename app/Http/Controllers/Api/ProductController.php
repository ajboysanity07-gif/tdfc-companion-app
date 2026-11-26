<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WlnProduct;
use App\Models\WlnTags;
use App\Models\WlnTagSummary;
use App\Models\WlnType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    private const WITH = ['tags.summaries'];

    // The product code is an internal key the admin never sees: reuse the master code of a
    // same-named loan type, else the highest code nobody uses (the master list grows from the low end).
    // wlntype is read-only and its CHAR columns come back space-padded.
    private function newTypecode(string $name): string
    {
        $used = WlnProduct::pluck('typecode')->map(fn ($c) => trim($c));
        $master = WlnType::get(['typecode', 'lntype']);
        $same = $master->first(fn ($t) => strcasecmp(trim($t->lntype), $name) === 0);

        if ($same && ! $used->contains(trim($same->typecode))) {
            return trim($same->typecode);
        }

        $taken = $used->merge($master->map(fn ($t) => trim($t->typecode)))->flip();
        $code = collect(range(99, 1))
            ->map(fn ($n) => sprintf('%02d', $n))
            ->first(fn ($c) => ! $taken->has($c));
        abort_if($code === null, 422, 'No product codes are left.');

        return $code;
    }

    // List displayed products
    public function index()
    {
        return response()->json(
            WlnProduct::with(self::WITH)->where('isDisplayed', true)->orderBy('lntype')->get()
        );
    }

    // All wlntype names, for the tag dropdown
    public function types()
    {
        return response()->json(
            WlnType::pluck('lntype')->map(fn ($t) => trim($t))->unique()->sort()->values()
        );
    }

    public function show($typecode)
    {
        return response()->json(WlnProduct::with(self::WITH)->where('typecode', $typecode)->firstOrFail());
    }

    // Rules for the editable fields, shared by store() and update().
    private function fieldRules(Request $request): array
    {
        return [
            'int_rate' => 'nullable|numeric|min:0|max:100',
            'settings' => 'nullable|array',
            'settings.ln_isActive' => 'boolean',
            'settings.rate_isEditable' => 'boolean',
            'settings.allow_multiple' => 'boolean',
            'settings.max_term_isEditable' => 'boolean',
            'settings.max_amortization_isEditable' => 'boolean',
            'settings.max_term' => 'nullable|integer',
            'settings.max_amortization' => 'nullable|integer',
            'settings.service_fee' => 'nullable|numeric|min:0|max:100',
            'settings.lrf' => 'nullable|numeric|min:0|max:100',
            'settings.doc_stamp' => 'nullable|numeric|min:0|max:100',
            'settings.mort_notarial' => 'nullable|numeric|min:0',
            'settings.custom_fees' => 'nullable|array|max:20',
            'settings.custom_fees.*.label' => 'required|string|max:60',
            'settings.custom_fees.*.type' => 'required|in:percent,fixed',
            'settings.custom_fees.*.value' => [
                'required', 'numeric', 'min:0', 'max:99999999',
                function ($attr, $v, $fail) use ($request) {
                    if ($v > 100 && $request->input(preg_replace('/value$/', 'type', $attr)) === 'percent') {
                        $fail('A percent custom fee cannot be more than 100.');
                    }
                },
            ],
            'settings.max_amortization_mode' => 'nullable|in:FIXED,BASIC,CUSTOM',
            'settings.max_amortization_formula' => [
                'nullable', 'string', 'max:255',
                Rule::requiredIf(fn () => $request->input('settings.max_amortization_mode') === 'CUSTOM'),
                function ($attr, $v, $fail) use ($request) {
                    if ($request->input('settings.max_amortization_mode') === 'CUSTOM'
                        && ! preg_match('~^[0-9+\-*/().\s]*\bbasic\b[0-9+\-*/().\s]*$~i', (string) $v)) {
                        $fail('Formula may only use numbers, + - * / ( ) and the word "basic".');
                    }
                },
            ],
            'settings.ln_scheme' => 'nullable|in:ADD-ON,PREPAID',
            'settings.installment_mode' => 'nullable|in:MONTHLY,SEMI-ANNUAL,DUE-DATE',
            'settings.terms_and_info' => 'nullable|string',
        ];
    }

    // Readable names for the errors the admin drawer shows in a toast.
    private const ATTRIBUTES = [
        'lntype' => 'loan name',
        'int_rate' => 'rate',
        'settings.ln_scheme' => 'scheme',
        'settings.installment_mode' => 'mode',
        'settings.service_fee' => 'service fee',
        'settings.lrf' => 'LRF',
        'settings.doc_stamp' => 'doc stamp',
        'settings.mort_notarial' => 'mortuary + notarial',
        'settings.custom_fees.*.label' => 'custom fee name',
        'settings.custom_fees.*.type' => 'custom fee type',
        'settings.custom_fees.*.value' => 'custom fee value',
    ];

    // Flatten validated `settings` into columns; BASIC/CUSTOM derive the max from salary, so the stored number is dropped.
    private function columns(array $data): array
    {
        $settings = array_intersect_key($data['settings'] ?? [], array_flip(WlnProduct::SETTINGS));
        unset($data['settings']);

        $mode = $settings['max_amortization_mode'] ?? null;
        if ($mode === 'FIXED') {
            $settings['max_amortization_formula'] = null;
        } elseif ($mode === 'BASIC') {
            $settings['max_amortization_formula'] = 'basic';
            $settings['max_amortization'] = null;
        } elseif ($mode === 'CUSTOM') {
            $settings['max_amortization'] = null;
        }

        return $data + $settings;
    }

    // Create a product with all its settings in one transaction (nothing is left behind on failure).
    public function store(Request $request)
    {
        $data = $request->validate([
            'lntype' => 'required|string|max:255|unique:wlnproducts,lntype',
        ] + $this->fieldRules($request), [], self::ATTRIBUTES);

        $product = DB::transaction(fn () => WlnProduct::create(
            $this->columns($data) + ['typecode' => $this->newTypecode($data['lntype']), 'isDisplayed' => true]
        ));

        return response()->json($product->load(self::WITH), 201);
    }

    // Update rate + settings fields (all live on the same wlnproducts row)
    public function update(Request $request, $typecode)
    {
        $product = WlnProduct::where('typecode', $typecode)->firstOrFail();

        $data = $request->validate([
            // `sometimes`: the table's active switch sends only `settings`
            'lntype' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('wlnproducts', 'lntype')->ignore($product->id)],
        ] + $this->fieldRules($request), [], self::ATTRIBUTES);

        $product->update($this->columns($data));

        return response()->json($product->fresh(self::WITH));
    }

    // Stop showing a product and drop its tags (wlntype is never touched)
    public function destroy($typecode)
    {
        $product = WlnProduct::where('typecode', $typecode)->firstOrFail();
        WlnTags::where('typecode', $typecode)->get()->each(function ($tag) {
            WlnTagSummary::where('wlntag_id', $tag->id)->delete();
            $tag->delete();
        });
        $product->delete();

        return response()->json(['deleted' => true]);
    }

    // Tags must be an existing wlntype.lntype
    public function addTag(Request $request, $typecode)
    {
        $data = $request->validate(['tag_name' => 'required|string|max:255']);

        abort_unless(
            WlnType::whereRaw('RTRIM(lntype) = ?', [$data['tag_name']])->exists(),
            422,
            'Tag must be an existing loan type.'
        );

        $tag = WlnTags::firstOrCreate(['typecode' => $typecode, 'tag_name' => $data['tag_name']]);
        WlnTagSummary::firstOrCreate(['wlntag_id' => $tag->id]);

        return response()->json($tag->load('summaries'));
    }

    public function removeTag($typecode, $tag)
    {
        WlnTags::where(['typecode' => $typecode, 'tag_name' => $tag])->delete();

        return response()->json(['deleted' => true]);
    }
}
