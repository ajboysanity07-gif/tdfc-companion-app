<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLoanApplicationRequest;
use App\Models\WlnProducts;
use App\Services\LoanCalculationService;
use Illuminate\Http\Request;

class LoansApplyController extends Controller
{
    public function __construct(
        private LoanCalculationService $loanService
    ) {}
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $products = WlnProducts::where('is_active', true)
            ->with('types')
            ->orderBy('product_name')
            ->get();

        $acctno = auth()->user()->acctno;

        $products = $products->map(function ($product) use ($acctno) {
            $computedResult = $this->loanService->calculateMaxAmortization($product, $acctno);
            $product->computed_result = round($computedResult, 2);
            return $product;
        });

        return response()->json([
            'success' => true,
            'data' => $products
        ]);
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
    public function store(StoreLoanApplicationRequest $request)
    {
        $acctno = auth()->user()->acctno;
        $product = WlnProducts::with('types')->findOrFail($request->product_id);

        if (!$product->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'This product is no longer available'
            ], 422);
        }

        // Validate term months
        if ($error = $this->loanService->validateTermMonths($product, $request->term_months)) {
            return response()->json(['success' => false, 'message' => $error], 422);
        }

        // Calculate and validate max amortization
        $computedResult = $this->loanService->calculateMaxAmortization($product, $acctno);
        if ($error = $this->loanService->validateAmortization($product, $request->amortization, $acctno)) {
            return response()->json(['success' => false, 'message' => $error], 422);
        }

        // Calculate fees and net proceeds
        $fees = $this->loanService->calculateLoanFees($product, $request->amortization, $request->old_balance);

        // TODO: Create loan applications table and persist data
        // $loanApplication = LoanApplication::create([...]);

        return response()->json([
            'success' => true,
            'message' => 'Loan application submitted successfully',
            'data' => [
                'acctno' => $acctno,
                'product' => [
                    'id' => $product->product_id,
                    'name' => $product->product_name,
                    'interest_rate' => $product->interest_rate,
                    'mode' => $product->mode,
                    'schemes' => $product->schemes,
                    'types' => $product->types,
                ],
                'loan_details' => [
                    'term_months' => $request->term_months,
                    'amortization' => $request->amortization,
                    'old_balance' => $request->old_balance,
                    'due_amount' => $request->amortization + $request->old_balance,
                    'computed_result' => round($computedResult, 2),
                ],
                'fees' => $fees,
                'estimated_net_proceeds' => $fees['estimated_net_proceeds'],
            ]
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
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
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
