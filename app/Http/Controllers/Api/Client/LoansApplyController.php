<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Http\Requests\Client\StoreLoanApplicationRequest;
use App\Models\WlnProducts;
use App\Services\Client\LoanCalculationService;
use Illuminate\Http\Request;

class LoansApplyController extends Controller
{
    public function __construct(
        private LoanCalculationService $loanService
    ) {}
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $acctno = auth()->user()->acctno;
        
        // Check if include_hidden parameter is set
        $includeHidden = $request->query('include_hidden', false);

        // Query products with SQL-based filtering
        $query = WlnProducts::with('types', 'tags')
            ->orderBy('product_name');
        
        // Apply is_active filter unless include_hidden is true
        if (!$includeHidden) {
            $query->where('is_active', true);
            
            // SQL-based filtering: Exclude products with tags matching user's active loan typecodes
            $query->whereDoesntHave('tags', function ($q) use ($acctno) {
                $q->whereIn('typecode', function ($subQuery) use ($acctno) {
                    $subQuery->select('typecode')
                        ->from('wlnmaster')
                        ->where('acctno', $acctno)
                        ->whereNotNull('typecode');
                });
            });

            
            // Debug: Check user's loan typecodes
            $userTypecodes = \App\Models\WlnMaster::where('acctno', $acctno)
                ->whereNotNull('typecode')
                ->pluck('typecode')
                ->unique();
        }
        
        $products = $query->get()->map(function ($product) use ($acctno) {
            $computedResult = $this->loanService->calculateMaxAmortization($product, $acctno);
            $product->computed_result = round($computedResult, 2);
            return $product;
        });

        return response()->json([
            'success' => true,
            'data' => $products->values()
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
