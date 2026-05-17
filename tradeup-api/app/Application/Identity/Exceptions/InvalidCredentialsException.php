<?php

namespace App\Application\Identity\Exceptions;

use RuntimeException;

final class InvalidCredentialsException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('The provided credentials are incorrect.');
    }
}
