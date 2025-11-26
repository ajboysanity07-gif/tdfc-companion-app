<?php

namespace App\Http\Controllers\Api;

use App\Models\WlnType;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class ProductManagementController extends Controller
{
    // Fetch all products
    public function index()
    {
        // Logic to fetch and return products
        $products = WlnType::with(['settings', 'display', 'tags'])
            ->whereHas(
                'display',
                fn($q) => $q->where('isDisplayed', true)
            )
            ->get(['typecode', 'lntype']);
        return response()->json($products);
    }

    // Activate a product by typecode
    public function activate($typecode)
    {
        // Logic to activate the product
        $product = WlnType::with('display')
            ->where('typecode', $typecode)
            ->firstOrFail();

        $product->display()->update(
            [
                'isDisplayed' => true,
                'updated_at' => now()
            ]
        );
        return response()->json($product->fresh('display'));
    }
    // Deactivate a product by typecode
    public function deactivate($typecode)
    {
        // Logic to deactivate the product
        $product = WlnType::with(['display',])
            ->where('typecode', $typecode)
            ->firstOrFail();

        $product->display()->update(
            [
                'isDisplayed' => false,
                'updated_at' => now()
            ]
        );

        return response()->json($product->fresh(['display']));
    }

    public function hidden()
{
    return WlnType::with(['display'])
        ->whereHas('display', fn($q) => $q->where('isDisplayed', false))
        ->get(['typecode', 'lntype']);

        return response()->json($products);
}
}
