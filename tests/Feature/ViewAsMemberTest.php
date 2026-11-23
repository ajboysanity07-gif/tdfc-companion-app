<?php

namespace Tests\Feature;

use App\Models\AppUser;
use Tests\TestCase;

class ViewAsMemberTest extends TestCase
{
    public function test_admin_is_blocked_from_member_pages_unless_viewing_a_member()
    {
        $admin = new AppUser(['role' => 'admin', 'status' => 'approved']);

        $this->actingAs($admin)->get('/dashboard')->assertForbidden();
        $this->actingAs($admin)->get('/loans/transactions')->assertForbidden();
    }
}
