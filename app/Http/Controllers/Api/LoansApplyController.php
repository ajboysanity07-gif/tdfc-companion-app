<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WlnProducts;
use App\Models\WSalaryRecord;
use Illuminate\Http\Request;

class LoansApplyController extends Controller
{
    /**
     * Validate that expression contains only allowed characters for math operations.
     * Allowed: digits, decimal points, whitespace, parentheses, +, -, *, /
     */
    private function validateMathExpression(string $expression): array
    {
        // Check for disallowed characters (letters, functions, etc.)
        if (preg_match('/[a-zA-Z_]/', $expression)) {
            return [
                'valid' => false,
                'error' => 'Formula contains invalid characters or functions. Only numbers and basic operators (+, -, *, /) are allowed.'
            ];
        }

        // Check that only allowed characters are present
        if (!preg_match('/^[\d\s\.\+\-\*\/\(\)]+$/', $expression)) {
            return [
                'valid' => false,
                'error' => 'Formula contains invalid characters. Only numbers, operators (+, -, *, /), and parentheses are allowed.'
            ];
        }

        // Check balanced parentheses
        $balance = 0;
        $len = strlen($expression);
        for ($i = 0; $i < $len; $i++) {
            if ($expression[$i] === '(') $balance++;
            if ($expression[$i] === ')') $balance--;
            if ($balance < 0) {
                return [
                    'valid' => false,
                    'error' => 'Formula has mismatched parentheses.'
                ];
            }
        }
        if ($balance !== 0) {
            return [
                'valid' => false,
                'error' => 'Formula has mismatched parentheses.'
            ];
        }

        // Check for invalid operator sequences (but allow unary minus patterns)
        // Invalid: **, //, ++, +*, +/, *+, */ (without considering unary minus context)
        // Valid patterns that look like double operators: *-5, /-5, +-, *-, /-, (-5, -(
        $normalized = preg_replace('/\s+/', '', $expression);
        
        // Pattern for catching problematic double operators that are NOT valid unary minus cases
        // We need to be careful: "*-5" is valid (multiply by negative 5)
        // but "**" is invalid
        if (preg_match('/[\+\*\/]{2,}/', $normalized)) {
            return [
                'valid' => false,
                'error' => 'Formula has invalid operator sequence.'
            ];
        }

        return ['valid' => true];
    }

    /**
     * Tokenize and normalize unary minus in the expression.
     * Converts unary minus to a special token for proper handling.
     */
    private function tokenize(string $expression): array
    {
        $tokens = [];
        $expression = preg_replace('/\s+/', '', $expression); // Remove whitespace
        $len = strlen($expression);
        $i = 0;

        while ($i < $len) {
            $char = $expression[$i];

            // Handle numbers (including decimals)
            if (ctype_digit($char) || $char === '.') {
                $number = '';
                while ($i < $len && (ctype_digit($expression[$i]) || $expression[$i] === '.')) {
                    $number .= $expression[$i];
                    $i++;
                }
                $tokens[] = ['type' => 'number', 'value' => $number];
                continue;
            }

            // Handle operators and parentheses
            if (in_array($char, ['+', '-', '*', '/', '(', ')'])) {
                // Detect unary minus
                // A minus is unary if:
                // - It's at the start of the expression
                // - It follows an opening parenthesis
                // - It follows another operator
                $isUnaryMinus = false;
                if ($char === '-') {
                    $prevToken = end($tokens);
                    if (
                        count($tokens) === 0 || // Start of expression
                        $prevToken['type'] === 'operator' || // After operator
                        ($prevToken['type'] === 'paren' && $prevToken['value'] === '(') // After opening paren
                    ) {
                        $isUnaryMinus = true;
                    }
                }

                if ($isUnaryMinus) {
                    $tokens[] = ['type' => 'unary_minus', 'value' => '-'];
                } else if ($char === '(' || $char === ')') {
                    $tokens[] = ['type' => 'paren', 'value' => $char];
                } else {
                    $tokens[] = ['type' => 'operator', 'value' => $char];
                }
                $i++;
                continue;
            }

            $i++;
        }

        return $tokens;
    }

    /**
     * Convert infix tokens to postfix (RPN) using Shunting-yard algorithm.
     * Handles unary minus properly.
     */
    private function infixToPostfix(array $tokens): array
    {
        $output = [];
        $operatorStack = [];
        $precedence = ['+' => 1, '-' => 1, '*' => 2, '/' => 2, 'unary_minus' => 3];

        foreach ($tokens as $token) {
            if ($token['type'] === 'number') {
                $output[] = $token;
            } else if ($token['type'] === 'unary_minus') {
                // Treat unary minus as a high-precedence operator
                $operatorStack[] = $token;
            } else if ($token['type'] === 'operator') {
                $op = $token['value'];
                while (
                    !empty($operatorStack) &&
                    end($operatorStack)['type'] !== 'paren' &&
                    (
                        (end($operatorStack)['type'] === 'unary_minus') ||
                        (end($operatorStack)['type'] === 'operator' && $precedence[end($operatorStack)['value']] >= $precedence[$op])
                    )
                ) {
                    $output[] = array_pop($operatorStack);
                }
                $operatorStack[] = $token;
            } else if ($token['type'] === 'paren') {
                if ($token['value'] === '(') {
                    $operatorStack[] = $token;
                } else { // ')'
                    while (!empty($operatorStack) && end($operatorStack)['value'] !== '(') {
                        $output[] = array_pop($operatorStack);
                    }
                    if (!empty($operatorStack)) {
                        array_pop($operatorStack); // Remove the '('
                    }
                }
            }
        }

        while (!empty($operatorStack)) {
            $output[] = array_pop($operatorStack);
        }

        return $output;
    }

    /**
     * Evaluate a postfix (RPN) expression.
     */
    private function evaluatePostfix(array $postfix): array
    {
        $stack = [];

        foreach ($postfix as $token) {
            if ($token['type'] === 'number') {
                $stack[] = (float)$token['value'];
            } else if ($token['type'] === 'unary_minus') {
                if (count($stack) < 1) {
                    return ['success' => false, 'error' => 'Invalid expression structure'];
                }
                $operand = array_pop($stack);
                $stack[] = -$operand;
            } else if ($token['type'] === 'operator') {
                if (count($stack) < 2) {
                    return ['success' => false, 'error' => 'Invalid expression structure'];
                }
                $b = array_pop($stack);
                $a = array_pop($stack);

                switch ($token['value']) {
                    case '+':
                        $result = $a + $b;
                        break;
                    case '-':
                        $result = $a - $b;
                        break;
                    case '*':
                        $result = $a * $b;
                        break;
                    case '/':
                        if ($b == 0) {
                            return ['success' => false, 'error' => 'Division by zero in formula'];
                        }
                        $result = $a / $b;
                        break;
                    default:
                        return ['success' => false, 'error' => 'Unknown operator'];
                }

                $stack[] = $result;
            }
        }

        if (count($stack) !== 1) {
            return ['success' => false, 'error' => 'Invalid expression structure'];
        }

        $finalResult = $stack[0];

        // Check for invalid results
        if (!is_finite($finalResult)) {
            return ['success' => false, 'error' => 'Formula evaluation resulted in invalid value (INF or NaN)'];
        }

        return ['success' => true, 'result' => $finalResult];
    }

    /**
     * Main method to evaluate a math expression with {basic} placeholder.
     */
    private function evaluateMathExpression(string $formula, float $basic): array
    {
        // Replace both {basic} and 'basic' (without braces) with the numeric value
        $expression = str_replace(['{basic}', 'basic'], [(string)$basic, (string)$basic], $formula);

        // Validate the expression
        $validation = $this->validateMathExpression($expression);
        if (!$validation['valid']) {
            return ['success' => false, 'error' => $validation['error']];
        }

        // Tokenize
        try {
            $tokens = $this->tokenize($expression);
        } catch (\Exception $e) {
            return ['success' => false, 'error' => 'Failed to parse formula: ' . $e->getMessage()];
        }

        // Convert to postfix
        try {
            $postfix = $this->infixToPostfix($tokens);
        } catch (\Exception $e) {
            return ['success' => false, 'error' => 'Failed to process formula: ' . $e->getMessage()];
        }

        // Evaluate
        return $this->evaluatePostfix($postfix);
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $products = WlnProducts::where('is_active', true)
            ->with('types')
            ->orderBy('product_name')
            ->get();

        // Get the authenticated user's account number for BASIC/CUSTOM calculations
        $acctno = auth()->user()->acctno;

        // Calculate computed_result for each product
        $products = $products->map(function ($product) use ($acctno) {
            $computedResult = 0.00;

            if ($product->max_amortization_mode === 'FIXED') {
                // For FIXED mode: use max_amortization as computed_result
                if (!empty($product->max_amortization)) {
                    $cleanedValue = preg_replace('/[,\s]/', '', $product->max_amortization);
                    $computedResult = (float) $cleanedValue;
                }
            } elseif (in_array($product->max_amortization_mode, ['BASIC', 'CUSTOM'])) {
                // For BASIC/CUSTOM mode: fetch basic salary and evaluate formula
                $salaryRecord = WSalaryRecord::where('acctno', $acctno)->first();
                
                if ($salaryRecord && is_numeric($salaryRecord->salary_amount) && !empty($product->max_amortization_formula)) {
                    $basic = (float) $salaryRecord->salary_amount;
                    
                    // If formula is just "basic", return the salary amount directly
                    if (trim($product->max_amortization_formula) === 'basic') {
                        $computedResult = $basic;
                    } else {
                        // Replace {basic} placeholder with actual value and evaluate
                        $evalResult = $this->evaluateMathExpression($product->max_amortization_formula, $basic);
                        
                        if ($evalResult['success']) {
                            $computedResult = (float) $evalResult['result'];
                        }
                    }
                }
            }

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
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:wln_products,product_id',
            'term_months' => 'required|integer|min:1',
            'amortization' => 'required|numeric|min:0',
            'old_balance' => 'required|numeric|min:0',
        ]);

        // Get the authenticated user's account number
        $acctno = auth()->user()->acctno;

        // Get product details with types
        $product = WlnProducts::with('types')->findOrFail($validated['product_id']);

        // Check if product is active
        if (!$product->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'This product is no longer available'
            ], 422);
        }

        // ========== COMPUTE RESULT BASED ON MAX_AMORTIZATION_MODE ==========
        $computedResult = 0.00;

        if ($product->max_amortization_mode === 'FIXED') {
            // For FIXED mode: use max_amortization as computed_result
            if (!empty($product->max_amortization)) {
                // Remove commas/spaces and convert to decimal
                $cleanedValue = preg_replace('/[,\s]/', '', $product->max_amortization);
                $computedResult = (float) $cleanedValue;
            } else {
                // If max_amortization is NULL/empty in FIXED mode, treat as 0.00
                $computedResult = 0.00;
            }
        } elseif (in_array($product->max_amortization_mode, ['BASIC', 'CUSTOM'])) {
            // For BASIC/CUSTOM mode: fetch basic salary and evaluate formula
            
            // 1. Fetch basic salary from wsalary_records
            $salaryRecord = WSalaryRecord::where('acctno', $acctno)->first();
            
            if (!$salaryRecord || !is_numeric($salaryRecord->salary_amount)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unable to calculate amortization: salary record is missing or invalid'
                ], 422);
            }
            
            $basic = (float) $salaryRecord->salary_amount;
            
            // 2. Get formula from product
            $formula = $product->max_amortization_formula;
            
            if (empty($formula)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unable to calculate amortization: formula is not configured for this product'
                ], 422);
            }
            
            // 3. Evaluate formula using math-only evaluator
            $evalResult = $this->evaluateMathExpression($formula, $basic);
            
            if (!$evalResult['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unable to calculate amortization: ' . $evalResult['error']
                ], 422);
            }
            
            $computedResult = (float) $evalResult['result'];
        }

        // Ensure computed_result is formatted as decimal with 2 places
        $computedResult = round($computedResult, 2);

        // ========== END COMPUTED RESULT CALCULATION ==========

        // Validate term against product limits
        $maxTermMonths = floor($product->max_term_days / 30);
        if ($validated['term_months'] > $maxTermMonths) {
            return response()->json([
                'success' => false,
                'message' => "Term exceeds maximum allowed ({$maxTermMonths} months) for this product"
            ], 422);
        }

        // Validate amortization against computed_result (dynamic max amortization)
        if ($computedResult > 0 && $validated['amortization'] > $computedResult) {
            return response()->json([
                'success' => false,
                'message' => "Amortization exceeds maximum allowed (₱" . number_format($computedResult, 2) . ") for this product"
            ], 422);
        }

        // Calculate loan details based on product
        $termMonths = $validated['term_months'];
        $amortization = $validated['amortization'];
        $oldBalance = $validated['old_balance'];
        
        // Calculate due amount
        $dueAmount = $amortization + $oldBalance;
        
        // Calculate deductions based on product fees
        $serviceFee = $product->service_fee ?? 0;
        $lrf = $product->lrf ?? 0;
        $documentStamp = $product->document_stamp ?? 0;
        $mortPlusNotarial = $product->mort_plus_notarial ?? 0;
        
        $totalDeductions = $serviceFee + $lrf + $documentStamp + $mortPlusNotarial + $oldBalance;
        $estimatedNetProceeds = max(0, $amortization - $totalDeductions);

        // TODO: Create a loan applications table and model to persist this data
        // When you create the model, add computed_result to the fillable array and save it:
        // $loanApplication = LoanApplication::create([
        //     'acctno' => $acctno,
        //     'product_id' => $validated['product_id'],
        //     'term_months' => $validated['term_months'],
        //     'amortization' => $validated['amortization'],
        //     'old_balance' => $validated['old_balance'],
        //     'computed_result' => number_format($computedResult, 2, '.', ''), // Store as decimal string
        //     // ... other fields
        // ]);

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
                    'term_months' => $termMonths,
                    'amortization' => $amortization,
                    'old_balance' => $oldBalance,
                    'due_amount' => $dueAmount,
                    'computed_result' => $computedResult, // Include the computed result
                ],
                'fees' => [
                    'service_fee' => $serviceFee,
                    'lrf' => $lrf,
                    'document_stamp' => $documentStamp,
                    'mort_plus_notarial' => $mortPlusNotarial,
                    'total_deductions' => $totalDeductions,
                ],
                'estimated_net_proceeds' => $estimatedNetProceeds,
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
