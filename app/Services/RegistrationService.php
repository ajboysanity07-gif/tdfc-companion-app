<?php

namespace App\Services;

use Psr\Log\LoggerInterface;

class RegistrationService {
    protected $logger;

    public function __construct(LoggerInterface $logger) {
        $this->logger = $logger;
    }

    public function uploadRegistrationFile($file) {
        try {
            // Simulating file upload logic
            if (!move_uploaded_file($file['tmp_name'], '/uploads/' . basename($file['name']))) {
                throw new \Exception('File upload failed.');
            }
            return ['success' => true, 'message' => 'File uploaded successfully.'];
        } catch (\Exception $e) {
            // Log the error with context
            $this->logger->error('File upload error: ' . $e->getMessage(), [
                'file' => $file,
                'timestamp' => date('Y-m-d H:i:s')
            ]);
            return ['success' => false, 'message' => 'File upload failed due to storage issues. Please try again later.'];
        }
    }
}
