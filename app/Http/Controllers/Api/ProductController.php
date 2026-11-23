<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WlnProduct;
use App\Models\WlnTags;
use App\Models\WlnTagSummary;
use App\Models\WlnType;
use Illuminate\Http\Request;

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

    // Loan types from the master list that are not yet displayed (for "Add Loan")
    public function available()
    {
        $shown = WlnProduct::where('isDisplayed', true)->pluck('typecode')->all();

        return response()->json(
            WlnType::get(['typecode', 'lntype'])
                ->map(fn ($t) => ['typecode' => trim($t->typecode), 'lntype' => trim($t->lntype)])
                ->reject(fn ($t) => in_array($t['typecode'], $shown, true))
                ->values()
        );
    }

    // Start displaying a loan type (creates its product row from wlntype if missing)
    public function enable($typecode)
    {
        $type = $this->masterType($typecode);
        $product = WlnProduct::firstOrCreate(
            ['typecode' => $typecode],
            ['lntype' => trim($type->lntype), 'int_rate' => $type->int_rate]
        );
        $product->update(['isDisplayed' => true]);

        return response()->json($product->fresh(self::WITH));
    }

    public function show($typecode)
    {
        return response()->json(WlnProduct::with(self::WITH)->where('typecode', $typecode)->firstOrFail());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'typecode' => 'required|max:2|unique:wlnproducts,typecode',
            'lntype' => 'required',
            'int_rate' => 'nullable|numeric',
        ]);

        return response()->json(WlnProduct::create($data)->load(self::WITH), 201);
    }

    // Update rate + settings fields (all live on the same wlnproducts row)
    public function update(Request $request, $typecode)
    {
        $product = WlnProduct::where('typecode', $typecode)->firstOrFail();

        $data = $request->validate([
            'lntype' => 'nullable|string',
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
            'settings.ln_scheme' => 'nullable|string',
            'settings.installment_mode' => 'nullable|string',
            'settings.terms_and_info' => 'nullable|string',
        ]);

        $settings = array_intersect_key($data['settings'] ?? [], array_flip(WlnProduct::SETTINGS));
        unset($data['settings']);

        $product->update($data + $settings);

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
