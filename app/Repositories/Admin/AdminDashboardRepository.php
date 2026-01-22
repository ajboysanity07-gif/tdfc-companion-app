<?php

namespace App\Repositories\Admin;

use App\Models\AppUser;
use App\Models\WlnProducts;
use Illuminate\Support\Collection;

class AdminDashboardRepository
{
    /**
     * Get total user count.
     */
    public function getTotalUserCount(): int
    {
        return AppUser::count();
    }

    /**
     * Get count of users by role.
     */
    public function getUserCountByRole(string $role): int
    {
        return AppUser::where('role', $role)->count();
    }

    /**
     * Get count of users by status.
     */
    public function getUserCountByStatus(string $status): int
    {
        return AppUser::where('status', $status)->count();
    }

    /**
     * Get recent users ordered by creation date.
     */
    public function getRecentUsers(int $limit = 5): Collection
    {
        return AppUser::orderByDesc('created_at')
            ->take($limit)
            ->get(['user_id', 'email', 'role', 'status', 'created_at']);
    }

    /**
     * Get pending approval count.
     */
    public function getPendingApprovalCount(): int
    {
        return AppUser::where('status', AppUser::STATUS_PENDING)->count();
    }

    /**
     * Get active products count.
     */
    public function getActiveProductsCount(): int
    {
        return WlnProducts::where('is_active', true)->count();
    }

    /**
     * Get inactive products count.
     */
    public function getInactiveProductsCount(): int
    {
        return WlnProducts::where('is_active', false)->count();
    }

    /**
     * Get all dashboard statistics in one query.
     */
    public function getDashboardStatistics(): array
    {
        return [
            'total_users' => $this->getTotalUserCount(),
            'admins' => $this->getUserCountByRole('admin'),
            'customers' => $this->getUserCountByRole('client'),
            'pending_approvals' => $this->getPendingApprovalCount(),
            'active_products' => $this->getActiveProductsCount(),
            'inactive_products' => $this->getInactiveProductsCount(),
        ];
    }
}
