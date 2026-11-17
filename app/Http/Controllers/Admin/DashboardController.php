<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppUser;
use App\Models\WlnSettings;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $clients = $this->clients();

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'pending' => $clients->where('status', 'pending')->count(),
                'clients' => $clients->count(),
                'products' => WlnSettings::where('ln_isActive', true)->count(),
                'today' => $clients->filter(fn ($u) => $u->created_at->isToday())->count(),
            ],
            'pending' => $clients->where('status', 'pending')->sortByDesc('created_at')->take(5)->values()
                ->map(fn ($u) => ['name' => $u->name, 'at' => $u->created_at->toISOString()]),
            'activity' => $this->events($clients)->where('event', '!=', 'submitted')->take(5)->values(),
        ]);
    }

    public function registrations(): Response
    {
        $clients = $this->clients();
        $decided = $clients->whereIn('status', ['approved', 'rejected']);
        $reviewed = $clients->filter(fn ($u) => $u->reviewed_at);

        return Inertia::render('admin/registrations', [
            'events' => $this->events($clients)->values(),
            'stats' => [
                'month' => $clients->filter(fn ($u) => $u->created_at->isCurrentMonth())->count(),
                'pending' => $clients->where('status', 'pending')->count(),
                'approved' => $clients->where('status', 'approved')->count(),
                'decided' => $decided->count(),
                // ponytail: reviewed_at is the latest decision; a rejected-then-resubmitted client skews this.
                'avg_days' => $reviewed->isEmpty() ? null : round($reviewed->avg(fn ($u) => $u->created_at->diffInHours($u->reviewed_at, false)) / 24, 1),
            ],
        ]);
    }

    private function clients(): Collection
    {
        return AppUser::with('rejectionReasons:id,code,label')->where('role', 'client')->get();
    }

    /** Registration log derived from app_user_table timestamps (no event table exists). */
    private function events(Collection $clients): Collection
    {
        $admins = AppUser::whereIn('user_id', $clients->pluck('reviewed_by')->filter()->unique())->get()->keyBy('user_id');
        $events = collect();

        foreach ($clients as $u) {
            $base = ['name' => $u->name, 'email' => $u->email, 'acctno' => $u->acctno];
            $events->push($base + [
                'id' => "s{$u->user_id}", 'at' => $u->created_at->toISOString(), 'event' => 'submitted', 'by' => null,
                'note' => 'New registration with PRC ID and payslip documents',
            ]);

            $decidedAt = $u->status === 'rejected' ? ($u->rejected_at ?? $u->reviewed_at) : $u->reviewed_at;
            if (in_array($u->status, ['approved', 'rejected'], true) && $decidedAt) {
                $events->push($base + [
                    'id' => "d{$u->user_id}", 'at' => $decidedAt->toISOString(), 'event' => $u->status,
                    'by' => $admins->get($u->reviewed_by)?->name,
                    'note' => $u->status === 'approved'
                        ? 'Documents verified and registration approved'
                        : ($u->rejectionReasons->pluck('label')->implode(' · ') ?: 'Registration rejected'),
                ]);
            }
        }

        return $events->sortByDesc('at');
    }
}
