<?php

namespace App\Repositories\Admin;

use App\Models\AppUser;
use Illuminate\Support\Collection;

class ClientRepository
{
    /**
     * Get all clients with complete registration documents.
     */
    public function getAllWithDocuments(): Collection
    {
        return AppUser::with(['wmaster', 'rejectionReasons:id,code,label'])
            ->whereNotNull('prc_id_photo_front')
            ->whereNotNull('prc_id_photo_back')
            ->whereNotNull('payslip_photo_path')
            ->orderBy('created_at', 'asc')
            ->get();
    }

    /**
     * Get client by account number with relations.
     */
    public function getByAccountWithRelations(string $acctno, array $relations = []): ?AppUser
    {
        return AppUser::with($relations)
            ->where('acctno', $acctno)
            ->first();
    }

    /**
     * Find client by account number or fail.
     */
    public function findByAccountOrFail(string $acctno): AppUser
    {
        return AppUser::where('acctno', $acctno)->firstOrFail();
    }
}
