<?php

namespace App\Http\Controllers;

use App\Models\Wmaster;
use Illuminate\Http\Request;

class WmasterLookupController extends Controller
{
    public function __invoke(Request $request)
    {
        $request->validate(['acctno' => ['required','string','max:50']]);

        $acctno = $request->string('acctno');
        $wm = Wmaster::query()->where('acctno', $acctno)->first();

        if (! $wm) {
            return response()->json(['exists' => false]);
        }

        $payload = [
            'exists' => true,
            'bname' => $wm->getAttribute('bname'),
        ];

        if (array_key_exists('Userrights', $wm->getAttributes())) {
            $payload['roleHint'] = ((int) $wm->getAttribute('Userrights')) === 1 ? 'admin' : 'customer';
        }

        return response()->json($payload);
    }
}
