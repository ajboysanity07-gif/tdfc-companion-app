<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\AdminUserResource;
use App\Services\Admin\AdminDashboardService;
use Illuminate\Http\JsonResponse;

class AdminDashboardController extends Controller
{
    public function __construct(
        private AdminDashboardService $dashboardService
    ) {}

    /**
     * Get admin dashboard summary statistics.
     */
    public function summary(): JsonResponse
    {
        $summary = $this->dashboardService->getSummary();
        
        return response()->json($summary);
    }

    /**
     * Get recent users for admin dashboard.
     */
    public function recentUsers(): JsonResponse
    {
        $users = $this->dashboardService->getRecentUsers(5);
        
        return response()->json($users);
    }
}
