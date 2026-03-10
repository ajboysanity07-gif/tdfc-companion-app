<?php

use PHPUnit\Framework\TestCase;

class RegistrationTest extends TestCase
{
    /**
     * Test the registration with valid data.
     */
    public function testRegistrationWithValidData()
    {
        // Simulate valid registration data
        $data = [
            'username' => 'validUser',
            'email' => 'valid@example.com',
            'password' => 'SecurePassword123!',
            'file' => __DIR__ . '/path/to/file.jpg', // Example file path
        ];

        // Simulate file upload and registration flow
        $response = $this->post('/register', $data);

        // Assert successful registration
        $this->assertEquals(200, $response->getStatusCode());
        $this->assertContains('Registration successful', (string)$response->getBody());
    }

    /**
     * Test registration with missing username error.
     */
    public function testRegistrationWithMissingUsername()
    {
        // Simulate registration data without username
        $data = [
            'email' => 'valid@example.com',
            'password' => 'SecurePassword123!',
            'file' => __DIR__ . '/path/to/file.jpg',
        ];

        $response = $this->post('/register', $data);

        // Assert validation error for missing username
        $this->assertEquals(422, $response->getStatusCode());
        $this->assertContains('The username field is required.', (string)$response->getBody());
    }

    /**
     * Test registration with invalid email format.
     */
    public function testRegistrationWithInvalidEmailFormat()
    {
        $data = [
            'username' => 'validUser',
            'email' => 'invalidEmail',
            'password' => 'SecurePassword123!',
            'file' => __DIR__ . '/path/to/file.jpg',
        ];

        $response = $this->post('/register', $data);

        // Assert validation error for invalid email
        $this->assertEquals(422, $response->getStatusCode());
        $this->assertContains('The email must be a valid email address.', (string)$response->getBody());
    }

    /**
     * Test registration with weak password.
     */
    public function testRegistrationWithWeakPassword()
    {
        $data = [
            'username' => 'validUser',
            'email' => 'valid@example.com',
            'password' => '123',
            'file' => __DIR__ . '/path/to/file.jpg',
        ];

        $response = $this->post('/register', $data);

        // Assert validation error for weak password
        $this->assertEquals(422, $response->getStatusCode());
        $this->assertContains('The password must be at least 8 characters.', (string)$response->getBody());
    }

    /**
     * Test registration error recovery.
     */
    public function testErrorRecoveryOnRegistration()
    {
        // Simulate invalid registration to cause errors
        $data = [
            'username' => 'validUser',
            'email' => 'valid@example.com',
            'password' => '',
            'file' => __DIR__ . '/path/to/file.jpg',
        ];

        $response = $this->post('/register', $data);

        // Assert validation errors
        $this->assertEquals(422, $response->getStatusCode());

        // Try recovering with a valid password
        $data['password'] = 'SecurePassword123!';
        $response = $this->post('/register', $data);

        // Assert successful registration after recovery
        $this->assertEquals(200, $response->getStatusCode());
        $this->assertContains('Registration successful', (string)$response->getBody());
    }
}
