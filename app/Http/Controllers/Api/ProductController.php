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

    // wlntype is the read-only master list; its CHAR columns come back space-padded.
    private function masterType(string $typecode): WlnType
    {
        return WlnType::whereRaw('RTRIM(typecode) = ?', [$typecode])->firstOrFail();
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
            'int_rate' => 'nullable|numeric',
            'settings' => 'nullable|array',
            'settings.ln_isActive' => 'boolean',
            'settings.rate_isEditable' => 'boolean',
            'settings.allow_multiple' => 'boolean',
            'settings.max_term_isEditable' => 'boolean',
            'settings.max_amortization_isEditable' => 'boolean',
            'settings.max_term' => 'nullable|integer',
            'settings.max_amortization' => 'nullable|integer',
            'settings.service_fee' => 'nullable|numeric',
            'settings.lrf' => 'nullable|numeric',
            'settings.doc_stamp' => 'nullable|numeric',
            'settings.mort_notarial' => 'nullable|numeric',
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
            'settings.ln_scheme' => 'nullable|string',
            'settings.installment_mode' => 'nullable|string',
            'settings.terms_and_info' => 'nullable|string',
        ];
    }

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
            'typecode' => 'required|max:2|unique:wlnproducts,typecode',
            'lntype' => 'required|string',
        ] + $this->fieldRules($request));

        $product = DB::transaction(fn () => WlnProduct::create($this->columns($data) + ['isDisplayed' => true]));

        return response()->json($product->load(self::WITH), 201);
    }

    // Update rate + settings fields (all live on the same wlnproducts row)
    public function update(Request $request, $typecode)
    {
        $product = WlnProduct::where('typecode', $typecode)->firstOrFail();

        $data = $request->validate(['lntype' => 'nullable|string'] + $this->fieldRules($request));

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
