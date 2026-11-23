<?php

namespace Tests\Feature;

use App\Models\AppUser;
use Tests\TestCase;

class AdminMemberPagesTest extends TestCase
{
    public function test_client_cannot_open_admin_member_pages()
    {
        $client = new AppUser(['role' => 'client', 'status' => 'approved']);

        $this->actingAs($client)->get('/admin/clients/abc/dashboard')->assertForbidden();
    }

    public function test_admin_is_blocked_from_member_own_routes()
    {
        $admin = new AppUser(['role' => 'admin', 'status' => 'approved']);

        $this->actingAs($admin)->get('/loans/transactions')->assertForbidden();
    }

    public function test_pending_member_is_404()
    {
        $admin = new AppUser(['role' => 'admin', 'status' => 'approved']);
        $pending = new AppUser(['role' => 'client', 'status' => 'pending']);
        $pending->user_id = 'p1';
        $request = \Illuminate\Http\Request::create('/x');
        $request->setRouteResolver(fn () => new class($pending) { public function __construct(private $u) {} public function parameter($k, $d = null) { return $this->u; } });

        $this->expectException(\Symfony\Component\HttpKernel\Exception\NotFoundHttpException::class);
        AppUser::subject($request);
    }
}
