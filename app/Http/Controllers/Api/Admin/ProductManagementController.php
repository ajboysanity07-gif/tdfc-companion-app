<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Http\Resources\Admin\ProductResource;
use App\Http\Resources\Admin\ProductTypeResource;
use App\Models\WlnProducts;
use App\Repositories\Admin\ProductRepository;
use App\Services\Admin\ProductManagementService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProductManagementController extends Controller
{
    public function __construct(
        private ProductRepository $productRepository,
        private ProductManagementService $productManagementService
    ) {}

    /**
     * Display a paginated listing of loan products.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 15);
        $products = $this->productRepository->getPaginated($perPage);

        return response()->json([
            'data' => ProductResource::collection($products->items()),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    /**
     * Store a newly created loan product.
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = $this->productManagementService->createProduct(
            $request->validated()
        );

        return response()->json(new ProductResource($product), 201);
    }

    /**
     * Display the specified loan product.
     */
    public function show(WlnProducts $product): JsonResponse
    {
        $product = $this->productRepository->findWithTypes($product->product_code);

        return response()->json(new ProductResource($product));
    }

    /**
     * Update the specified loan product.
     */
    public function update(UpdateProductRequest $request, WlnProducts $product): JsonResponse
    {
        $product = $this->productManagementService->updateProduct(
            $product,
            $request->validated()
        );

        return response()->json(new ProductResource($product));
    }

    /**
     * Remove the specified loan product.
     */
    public function destroy(WlnProducts $product): JsonResponse
    {
        $this->productManagementService->deleteProduct($product);

        return response()->json(['deleted' => true]);
    }

    /**
     * Get all loan types.
     */
    public function typesIndex(): JsonResponse
    {
        $types = $this->productRepository->getAllTypes();

        return response()->json(ProductTypeResource::collection($types));
    }
}
