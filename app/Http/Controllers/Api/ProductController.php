<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\WlnType;
use App\Models\WlnSettings;
use App\Models\WlnDisplay;
use App\Models\WlnTags;
use App\Models\WlnTagSummary;

class ProductController extends Controller
{
    // List all products where wlnDisplay.isDisplayed = true
    public function index(Request $request)
    {
        $products = WlnType::with([
            'settings', 'display', 'tags.summaries'
        ])->whereHas('display', function ($q) {
            $q->where('isDisplayed', true);
        })->get();

        return response()->json($products);
    }

    // Show one product by typecode
    public function show($typecode)
    {
        $product = WlnType::with([
            'settings', 'display', 'tags.summaries'
        ])->where('typecode', $typecode)->firstOrFail();

        return response()->json($product);
    }

    // Store new product (only if not exists). Also create relations entries.
    public function store(Request $request)
    {
        $data = $request->validate([
            'typecode' => 'required|max:2',
            'lntype' => 'required',
            'int_rate' => 'nullable|numeric',
            // Add other required fields validation as needed
        ]);

        $wlnType = WlnType::create($data);
        WlnSettings::create(['typecode' => $data['typecode']]);
        WlnDisplay::create(['typecode' => $data['typecode']]);
        // etc.

        return response()->json($wlnType->load(['settings', 'display', 'tags']), 201);
    }

    // Update fields of product and relations
    public function update(Request $request, $typecode)
    {
        $product = WlnType::where('typecode', $typecode)->firstOrFail();

        $data = $request->validate([
            'lntype' => 'nullable',
            'int_rate' => 'nullable|numeric',
            // More fields as needed
        ]);

        $product->update($data);

        // Update settings if posted in request (nested update)
        if ($request->has('settings')) {
            $product->settings()->update($request->input('settings'));
        }
        // Update display if posted in request
        if ($request->has('display')) {
            $product->display()->update($request->input('display'));
        }

        return response()->json($product->fresh(['settings', 'display', 'tags']));
    }

    // Delete product + cascade relations
    public function destroy($typecode)
    {
        $product = WlnType::where('typecode', $typecode)->firstOrFail();
        $product->delete();

        // Cascade: Eloquent model with relations will handle this if set in migrations.
        return response()->json(['deleted' => true]);
    }

    // Add/Update tags
    public function addTag(Request $request, $typecode)
    {
        $data = $request->validate([
            'tag_name' => 'required|string|max:255'
        ]);

        $tag = WlnTags::firstOrCreate([
            'typecode' => $typecode,
            'tag_name' => $data['tag_name']
        ]);

        $tagSummary = WlnTagSummary::firstOrCreate([
            'wlntag_id' => $tag->id
        ]);

        return response()->json($tag->load('summaries'));
    }
}
