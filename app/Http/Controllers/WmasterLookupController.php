<?php

namespace App\Http\Controllers;

use App\Models\Wmaster;
use Illuminate\Http\Request;

class WmasterLookupController extends Controller
{
    /**
     * Handle the incoming GET request: /api/wmaster/lookup?acctno=xxxxxx
     */
    public function __invoke(Request $request)
    {
        // Validate: required, string, max length.
        $request->validate(['acctno' => ['required','string','max:50']]);

        // 'string' returns a Stringable in Laravel 9+. Use ->toString() or (string) cast.
        $acctno = (string) $request->string('acctno');

        // Query your domain model
        $wm = Wmaster::query()->where('acctno', $acctno)->first();

        // If not found: short response.
        if (!$wm) {
            return response()->json(['exists' => false]);
        }

        // If found, build payload.
        $payload = [
            'exists' => true,
            'bname' => (string) $wm->getAttribute('bname'), // Defensive: always string.
        ];

        // Optionally add role hint if available.
        if (array_key_exists('Userrights', $wm->getAttributes())) {
            $payload['roleHint'] = ((int) $wm->getAttribute('Userrights')) === 1 ? 'admin' : 'customer';
        }

        return response()->json($payload);
    }
}
