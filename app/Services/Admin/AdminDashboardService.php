<?php

namespace App\Services\Admin;

use App\Repositories\Admin\AdminDashboardRepository;

class AdminDashboardService
{
    public function __construct(
        private AdminDashboardRepository $dashboardRepository
    ) {}

    /**
     * Get summary statistics for admin dashboard.
     */
    public function getSummary(): array
    {
        return [
            'totalUsers' => $this->dashboardRepository->getTotalUserCount(),
            'admins' => $this->dashboardRepository->getUserCountByRole('admin'),
            'customers' => $this->dashboardRepository->getUserCountByRole('customer'),
            'pendingApprovals' => $this->dashboardRepository->getPendingApprovalCount(),
            'activeProducts' => $this->dashboardRepository->getActiveProductsCount(),
            'inactiveProducts' => $this->dashboardRepository->getInactiveProductsCount(),
        ];
    }

    /**
     * Get recently registered users.
     */
    public function getRecentUsers(int $limit = 5): array
    {
        return $this->dashboardRepository
            ->getRecentUsers($limit)
            ->map(fn($user) => [
                'user_id' => $user->user_id,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status,
                'created_at' => $user->created_at->toIso8601String(),
            ])
            ->toArray();
    }

    /**
     * Get comprehensive dashboard statistics.
     */
    public function getComprehensiveStats(): array
    {
        $stats = $this->dashboardRepository->getDashboardStatistics();
        
        return [
            'users' => [
                'total' => $stats['total_users'],
                'admins' => $stats['admins'],
                'customers' => $stats['customers'],
                'pending_approvals' => $stats['pending_approvals'],
            ],
            'products' => [
                'active' => $stats['active_products'],
                'inactive' => $stats['inactive_products'],
                'total' => $stats['active_products'] + $stats['inactive_products'],
            ],
        ];
    }
}
