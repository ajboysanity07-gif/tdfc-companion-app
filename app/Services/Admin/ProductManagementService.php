<?php

namespace App\Services\Admin;

use App\Models\WlnProducts;
use App\Repositories\Admin\ProductRepository;
use Illuminate\Support\Facades\DB;

class ProductManagementService
{
    public function __construct(
        private ProductRepository $productRepo
    ) {}

    /**
     * Create a new product with types.
     */
    public function createProduct(array $data): WlnProducts
    {
        return DB::transaction(function () use ($data) {
            // Extract typecodes
            $typecodes = $data['typecodes'] ?? [];
            unset($data['typecodes']);

            // Normalize data based on mode
            $data = $this->normalizeProductData($data);

            // Create product
            $product = $this->productRepo->create($data);

            // Sync types
            if (!empty($typecodes)) {
                $this->productRepo->syncTypes($product, $typecodes);
            }

            // Reload with types
            return $this->productRepo->findWithTypes($product->product_id);
        });
    }

    /**
     * Update an existing product.
     */
    public function updateProduct(WlnProducts $product, array $data): WlnProducts
    {
        return DB::transaction(function () use ($product, $data) {
            // Extract typecodes
            $typecodes = $data['typecodes'] ?? null;
            unset($data['typecodes']);

            // Normalize decimal fields
            foreach (['service_fee', 'lrf', 'document_stamp', 'mort_plus_notarial'] as $field) {
                if (array_key_exists($field, $data)) {
                    $data[$field] = $data[$field] ?? 0;
                }
            }

            // Normalize data based on mode if mode is provided
            if (array_key_exists('max_amortization_mode', $data)) {
                $data = $this->normalizeProductData($data);
            }

            // Update product
            if (!empty($data)) {
                $this->productRepo->update($product, $data);
            }

            // Sync types if provided
            if ($typecodes !== null) {
                $this->productRepo->syncTypes($product, $typecodes);
            }

            // Reload with types
            return $this->productRepo->findWithTypes($product->product_id);
        });
    }

    /**
     * Delete a product.
     */
    public function deleteProduct(WlnProducts $product): void
    {
        DB::transaction(function () use ($product) {
            $this->productRepo->detachAllTypes($product);
            $this->productRepo->delete($product);
        });
    }

    /**
     * Normalize product data based on max_amortization_mode.
     */
    private function normalizeProductData(array $data): array
    {
        $mode = $data['max_amortization_mode'] ?? null;

        if (!$mode) {
            return $data;
        }

        switch ($mode) {
            case WlnProducts::MODE_FIXED:
                // FIXED: Require max_amortization, clear formula
                if (!isset($data['max_amortization'])) {
                    throw new \Exception('Max amortization is required for FIXED mode.');
                }
                $data['max_amortization_formula'] = null;
                break;

            case WlnProducts::MODE_BASIC:
                // BASIC: Clear max_amortization, set formula to 'basic'
                $data['max_amortization'] = null;
                $data['max_amortization_formula'] = 'basic';
                break;

            case WlnProducts::MODE_CUSTOM:
                // CUSTOM: Clear max_amortization, keep user's formula
                $data['max_amortization'] = null;
                // formula stays as provided
                break;
        }

        return $data;
    }

    /**
     * Validate max amortization mode requirements.
     */
    public function validateModeRequirements(string $mode, ?string $formula, ?int $maxAmortization): ?string
    {
        switch ($mode) {
            case WlnProducts::MODE_FIXED:
                if ($maxAmortization === null) {
                    return 'Max amortization is required for FIXED mode.';
                }
                break;

            case WlnProducts::MODE_CUSTOM:
                if (empty($formula)) {
                    return 'Formula is required for CUSTOM mode.';
                }
                break;
        }

        return null;
    }
}
