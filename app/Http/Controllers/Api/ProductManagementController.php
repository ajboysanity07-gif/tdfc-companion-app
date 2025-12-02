<?php

namespace App\Http\Controllers\Api;

use App\Models\WlnType;
use App\Models\WlnProducts;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;

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
        $data = $request->validate([
            'product_name' => 'required|string|max:255',
            'is_active' => 'required|boolean',
            'is_multiple' => 'required|boolean',
            'schemes' => 'nullable|string',
            'mode' => 'nullable|string',
            'interest_rate' => 'nullable|numeric',
            'max_term_days' => 'nullable|integer',
            'is_max_term_editable' => 'nullable|boolean',
            'max_amortization_mode' => 'required|string|in:FIXED,BASIC,CUSTOM',
            'max_amortization_formula' => 'nullable|string|max:255',
            'max_amortization' => 'nullable|integer',
            'is_max_amortization_editable' => 'nullable|boolean',
            'service_fee' => 'nullable|numeric',
            'lrf' => 'nullable|numeric',
            'document_stamp' => 'nullable|numeric',
            'mort_plus_notarial' => 'nullable|numeric',
            'terms' => 'nullable|string',
            'typecodes' => 'nullable|array',
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
        return DB::transaction(function () use ($request, $product) {
            $data = $request->validate([
                'product_name' => 'sometimes|required|string|max:255',
                'is_active' => 'sometimes|required|boolean',
                'is_multiple' => 'sometimes|required|boolean',
                'schemes' => 'sometimes|nullable|string',
                'mode' => 'sometimes|nullable|string',
                'interest_rate' => 'sometimes|nullable|numeric',
                'max_term_days' => 'sometimes|nullable|integer',
                'is_max_term_editable' => 'sometimes|nullable|boolean',
                'max_amortization_mode' => 'required|string|in:FIXED,BASIC,CUSTOM',
                'max_amortization_formula' => 'nullable|string|max:255',
                'max_amortization' => 'nullable|integer',
                'is_max_amortization_editable' => 'sometimes|nullable|boolean',
                'service_fee' => 'sometimes|nullable|numeric',
                'lrf' => 'sometimes|nullable|numeric',
                'document_stamp' => 'sometimes|nullable|numeric',
                'mort_plus_notarial' => 'sometimes|nullable|numeric',
                'terms' => 'sometimes|nullable|string',
                'typecodes' => 'sometimes|nullable|array',
                'typecodes.*' => 'string|size:2|exists:wlntype,typecode'
            ]);

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
        $types = WlnType::select('typecode', 'lntype','lntags')
            ->orderBy('lntype')
            ->get();

        return response()->json($types);
    }
}
