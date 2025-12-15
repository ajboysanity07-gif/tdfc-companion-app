<?php

namespace App\Http\Controllers\Api;

use App\Models\WlnType;
use App\Models\WlnProducts;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Validation\Rule;

class ProductManagementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = (int) $request->query('per_page', 15);

        $products = WlnProducts::with('types')->paginate($perPage);

        return response()->json($products);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $basicFormulaRule = function ($attribute, $value, $fail) use ($request) {
            if ($request->input('max_amortization_mode') !== 'CUSTOM') {
                return;
            }

            if (!preg_match('/\bbasic\b/i', $value ?? '')) {
                return $fail('Custom formula must include the variable "basic".');
            }

            // only numbers, whitespace, operators, parentheses, and the word basic
            if (!preg_match('~^[0-9+\-*\/().\s]*\bbasic\b[0-9+\-*\/().\s]*$~i', $value)) {
                return $fail('Allowed: numbers, + - * / ( ), and the variable "basic".');
            }
        };
        $data = $request->validate([
            'product_name' => 'required|string|max:255',
            'is_active' => 'required|boolean',
            'is_multiple' => 'required|boolean',
            'schemes' => 'nullable|string',
            'mode' => 'nullable|string',
            'interest_rate' => 'required|numeric',
            'max_term_days' => 'required|integer',
            'is_max_term_editable' => 'nullable|boolean',
            'max_amortization_mode' => 'required|string|in:FIXED,BASIC,CUSTOM',
            'max_amortization_formula' => [
                'nullable',
                Rule::requiredIf(fn() => $request->input('max_amortization_mode') === 'CUSTOM'),
                'string',
                'max:255',
                $basicFormulaRule,
            ],
            'max_amortization' => 'nullable|integer',
            'is_max_amortization_editable' => 'nullable|boolean',
            'service_fee' => 'nullable|numeric',
            'lrf' => 'nullable|numeric',
            'document_stamp' => 'nullable|numeric',
            'mort_plus_notarial' => 'nullable|numeric',
            'terms' => 'nullable|string',
            'typecodes' => 'required|array|min:1',
            'typecodes.*' => 'string|size:2|exists:wlntype,typecode'
        ]);


        switch ($data['max_amortization_mode']) {
            case 'FIXED':
                if (!isset($data['max_amortization'])) {
                    return response()->json([
                        'message' => 'Max amortization is required for FIXED mode.',
                    ], 422);
                }
                $data['max_amortization_formula'] = null;
                break;

            case 'BASIC':
                $data['max_amortization'] = null;
                $data['max_amortization_formula'] = 'basic';
                break;

            case 'CUSTOM':
                $data['max_amortization'] = null;
                // $data['max_amortization_formula'] is provided by user
                break;
        }


        return DB::transaction(function () use ($data) {
            $typecodes = $data['typecodes'] ?? [];
            unset($data['typecodes']);

            $product = WlnProducts::create($data);

            if (!empty($typecodes)) {
                $product->types()->sync($typecodes);
            }

            return response()->json($product->load('types'), 201);
        });
    }

    /**
     * Display the specified resource.
     */
    public function show(WlnProducts $product)
    {
        return response()->json($product->load('types'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     * 
     * @param \Illuminate\Http\Request $request
     * @return \App\Models\WlnProducts  $product
     */
    public function update(Request $request, WlnProducts $product)
    {
        $basicFormulaRule = function ($attribute, $value, $fail) use ($request) {
            if ($request->input('max_amortization_mode') !== 'CUSTOM') {
                return;
            }

            if (!preg_match('/\bbasic\b/i', $value ?? '')) {
                return $fail('Custom formula must include the variable "basic".');
            }

            // only numbers, whitespace, operators, parentheses, and the word basic
            if (!preg_match('~^[0-9+\-*\/().\s]*\bbasic\b[0-9+\-*\/().\s]*$~i', $value)) {
                return $fail('Allowed: numbers, + - * / ( ), and the variable "basic".');
            }
        };
        return DB::transaction(function () use ($request, $product, $basicFormulaRule) {
            $data = $request->validate([
                'product_name' => 'sometimes|required|string|max:255',
                'is_active' => 'sometimes|required|boolean',
                'is_multiple' => 'sometimes|required|boolean',
                'schemes' => 'sometimes|nullable|string',
                'mode' => 'sometimes|nullable|string',
                'interest_rate' => 'sometimes|required|numeric',
                'max_term_days' => 'sometimes|required|integer',
                'is_max_term_editable' => 'sometimes|nullable|boolean',
                'max_amortization_mode' => 'required|string|in:FIXED,BASIC,CUSTOM',
                'max_amortization_formula' => [
                    'nullable',
                    Rule::requiredIf(fn() => $request->input('max_amortization_mode') === 'CUSTOM'),
                    'string',
                    'max:255',
                    $basicFormulaRule,
                ],
                'max_amortization' => 'nullable|integer',
                'is_max_amortization_editable' => 'sometimes|nullable|boolean',
                'service_fee' => 'sometimes|nullable|numeric',
                'lrf' => 'sometimes|nullable|numeric',
                'document_stamp' => 'sometimes|nullable|numeric',
                'mort_plus_notarial' => 'sometimes|nullable|numeric',
                'terms' => 'sometimes|nullable|string',
                'typecodes' => 'sometimes|required|array|min:1',
                'typecodes.*' => 'string|size:2|exists:wlntype,typecode'
            ]);

            // Only normalize the decimals that were provided; keep others untouched.
            foreach (['service_fee', 'lrf', 'document_stamp', 'mort_plus_notarial'] as $decimalField) {
                if (array_key_exists($decimalField, $data)) {
                    $data[$decimalField] = $data[$decimalField] ?? 0;
                }
            }

            // Apply mode logic only if client sent a mode
            if (array_key_exists('max_amortization_mode', $data)) {
                switch ($data['max_amortization_mode']) {
                    case 'FIXED':
                        if (!array_key_exists('max_amortization', $data) || $data['max_amortization'] === null) {
                            return response()->json([
                                'message' => 'Max amortization is required for FIXED mode.',
                            ], 422);
                        }
                        $data['max_amortization_formula'] = null;
                        break;

                    case 'BASIC':
                        $data['max_amortization'] = null;
                        $data['max_amortization_formula'] = 'basic';
                        break;

                    case 'CUSTOM':
                        $data['max_amortization'] = null;
                        // formula stays as provided (can be null, validation already ran)
                        break;
                }
            }

            $typecodes = $data['typecodes'] ?? null;
            unset($data['typecodes']);

            if (!empty($data)) {
                $product->update($data);
            }

            if (!empty($typecodes)) {
                $product->types()->sync($typecodes);
            }

            return response()->json($product->load('types'));
        });
    }

    /**
     * Remove the specified resource from storage.
     * 
     * @param \Illuminate\Http\Request $request
     * @param \App\Models\WlnProducts  $product
     */
    public function destroy(WlnProducts $product)
    {
        $product->types()->detach();
        $product->delete();

        return response()->json(['deleted' => true]);
    }

    public function typesIndex()
    {
        $types = WlnType::select('typecode', 'lntype', 'lntags')
            ->orderBy('lntype')
            ->get();

        return response()->json($types);
    }
}
