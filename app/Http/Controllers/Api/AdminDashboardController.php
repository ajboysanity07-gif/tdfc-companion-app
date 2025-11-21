<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppUser;

class AdminDashboardController extends Controller
{
    public function summary()
    {
        return [
            'totalUsers' => AppUser::count(),
            'admins'     => AppUser::where('role', 'admin')->count(),
            'customers'  => AppUser::where('role', 'customer')->count(),
        ];
    }

    public function recentUsers()
    {
        return AppUser::orderByDesc('created_at')
            ->take(5)
            ->get(['user_id', 'email', 'role', 'status', 'created_at']);
    }
}
