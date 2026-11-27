<?php

namespace Tests\Feature;

use App\Http\Controllers\Admin\ClientManagementController;
use App\Services\BorrowerClass;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class BorrowerClassOverrideTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_override_and_restore_automatic_borrower_class(): void
    {
        $admin = $this->member([
            'email' => 'admin@example.com',
            'role' => 'admin',
        ]);
        $client = $this->member([
            'acctno' => '000002',
            'email' => 'client@example.com',
        ]);

        $this->actingAs($admin)
            ->post(route('admin.client-management.borrower-class.update', $client), [
                'class' => 'C',
                'reason' => 'Verified overdue documents require manual review.',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('app_user_table', [
            'user_id' => $client->user_id,
            'manual_borrower_class' => 'C',
        ]);
        $this->assertDatabaseHas('borrower_class_overrides', [
            'user_id' => $client->user_id,
            'previous_override_class' => null,
            'new_override_class' => 'C',
            'reason' => 'Verified overdue documents require manual review.',
            'changed_by' => $admin->user_id,
        ]);

        $client->refresh();

        $this->actingAs($admin)
            ->post(route('admin.client-management.borrower-class.update', $client), [
                'class' => null,
                'reason' => 'Loan records have been corrected.',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('app_user_table', [
            'user_id' => $client->user_id,
            'manual_borrower_class' => null,
        ]);
        $this->assertDatabaseHas('borrower_class_overrides', [
            'user_id' => $client->user_id,
            'previous_override_class' => 'C',
            'new_override_class' => null,
            'reason' => 'Loan records have been corrected.',
            'changed_by' => $admin->user_id,
        ]);
    }

    public function test_override_requires_a_valid_class_and_reason(): void
    {
        $admin = $this->member([
            'email' => 'admin@example.com',
            'role' => 'admin',
        ]);
        $client = $this->member([
            'acctno' => '000002',
            'email' => 'client@example.com',
        ]);

        $this->actingAs($admin)
            ->from('/admin/client-management')
            ->post(route('admin.client-management.borrower-class.update', $client), [
                'class' => 'Z',
                'reason' => '',
            ])
            ->assertRedirect('/admin/client-management')
            ->assertSessionHasErrors(['class', 'reason']);
    }

    public function test_effective_class_uses_override_then_falls_back_to_detection(): void
    {
        $client = $this->member(['manual_borrower_class' => null]);

        $this->assertSame('A', BorrowerClass::effectiveFor($client));

        $client->manual_borrower_class = 'D';

        $this->assertSame('D', BorrowerClass::effectiveFor($client));
    }

    public function test_client_management_payload_includes_class_override_history(): void
    {
        $admin = $this->member([
            'email' => 'admin@example.com',
            'role' => 'admin',
        ]);
        $client = $this->member([
            'acctno' => '000002',
            'email' => 'client@example.com',
            'prc_id_photo_front' => 'front.jpg',
            'prc_id_photo_back' => 'back.jpg',
            'payslip_photo_path' => 'payslip.jpg',
            'manual_borrower_class' => 'B',
        ]);
        $client->borrowerClassOverrides()->create([
            'previous_override_class' => null,
            'new_override_class' => 'B',
            'detected_class' => 'A',
            'reason' => 'Manual review.',
            'changed_by' => $admin->user_id,
        ]);

        $request = Request::create('/admin/client-management');
        $request->headers->set('X-Inertia', 'true');
        $props = (new ClientManagementController)->index()->toResponse($request)->getData(true)['props']['pendingUsers'];
        $payload = collect($props)->firstWhere('user_id', $client->user_id);

        $this->assertSame('B', $payload['class']);
        $this->assertSame('A', $payload['detected_class']);
        $this->assertSame('B', $payload['manual_class']);
        $this->assertSame('Manual review.', $payload['class_history'][0]['reason']);
        $this->assertSame($admin->name, $payload['class_history'][0]['changed_by']);
    }
}
