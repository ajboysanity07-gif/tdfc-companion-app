<?php

namespace App\Repositories\Admin;

use App\Models\WlnProducts;
use App\Models\WlnType;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class ProductRepository
{
    /**
     * Get paginated products with types.
     */
    public function getPaginated(int $perPage = 15): LengthAwarePaginator
    {
        return WlnProducts::with('types')
            ->orderBy('product_name')
            ->paginate($perPage);
    }

    /**
     * Get all products.
     */
    public function getAll(): Collection
    {
        return WlnProducts::with('types')
            ->orderBy('product_name')
            ->get();
    }

    /**
     * Find product by ID with types.
     */
    public function findWithTypes(int $id): ?WlnProducts
    {
        return WlnProducts::with('types')->find($id);
    }

    /**
     * Create a new product.
     */
    public function create(array $data): WlnProducts
    {
        return WlnProducts::create($data);
    }

    /**
     * Update a product.
     */
    public function update(WlnProducts $product, array $data): bool
    {
        return $product->update($data);
    }

    /**
     * Delete a product.
     */
    public function delete(WlnProducts $product): bool
    {
        return $product->delete();
    }

    /**
     * Sync product types.
     */
    public function syncTypes(WlnProducts $product, array $typecodes): void
    {
        $product->types()->sync($typecodes);
    }

    /**
     * Detach all types from product.
     */
    public function detachAllTypes(WlnProducts $product): void
    {
        $product->types()->detach();
    }

    /**
     * Get all loan types.
     */
    public function getAllTypes(): Collection
    {
        return WlnType::select('typecode', 'lntype', 'lntags')
            ->orderBy('lntype')
            ->get();
    }

    /**
     * Get active products count.
     */
    public function getActiveCount(): int
    {
        return WlnProducts::where('is_active', true)->count();
    }

    /**
     * Get inactive products count.
     */
    public function getInactiveCount(): int
    {
        return WlnProducts::where('is_active', false)->count();
    }
}
