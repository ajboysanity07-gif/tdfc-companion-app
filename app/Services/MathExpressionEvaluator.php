<?php

namespace App\Services;

class MathExpressionEvaluator
{
    /**
     * Validate that expression contains only allowed characters for math operations.
     * Allowed: digits, decimal points, whitespace, parentheses, +, -, *, /
     */
    public function validate(string $expression): array
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

        // Check for invalid operator sequences
        $normalized = preg_replace('/\s+/', '', $expression);
        
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
     */
    private function tokenize(string $expression): array
    {
        $tokens = [];
        $expression = preg_replace('/\s+/', '', $expression);
        $len = strlen($expression);
        $i = 0;

        while ($i < $len) {
            $char = $expression[$i];

            if (ctype_digit($char) || $char === '.') {
                $number = '';
                while ($i < $len && (ctype_digit($expression[$i]) || $expression[$i] === '.')) {
                    $number .= $expression[$i];
                    $i++;
                }
                $tokens[] = ['type' => 'number', 'value' => $number];
                continue;
            }

            if (in_array($char, ['+', '-', '*', '/', '(', ')'])) {
                $isUnaryMinus = false;
                if ($char === '-') {
                    $prevToken = end($tokens);
                    if (
                        count($tokens) === 0 ||
                        $prevToken['type'] === 'operator' ||
                        ($prevToken['type'] === 'paren' && $prevToken['value'] === '(')
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
                } else {
                    while (!empty($operatorStack) && end($operatorStack)['value'] !== '(') {
                        $output[] = array_pop($operatorStack);
                    }
                    if (!empty($operatorStack)) {
                        array_pop($operatorStack);
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

        if (!is_finite($finalResult)) {
            return ['success' => false, 'error' => 'Formula evaluation resulted in invalid value (INF or NaN)'];
        }

        return ['success' => true, 'result' => $finalResult];
    }

    /**
     * Evaluate a math expression with {basic} placeholder.
     */
    public function evaluate(string $formula, float $basic): array
    {
        $expression = str_replace(['{basic}', 'basic'], [(string)$basic, (string)$basic], $formula);

        $validation = $this->validate($expression);
        if (!$validation['valid']) {
            return ['success' => false, 'error' => $validation['error']];
        }

        try {
            $tokens = $this->tokenize($expression);
            $postfix = $this->infixToPostfix($tokens);
            return $this->evaluatePostfix($postfix);
        } catch (\Exception $e) {
            return ['success' => false, 'error' => 'Failed to evaluate formula: ' . $e->getMessage()];
        }
    }
}
