<?php

namespace App\Application\Trading\Exceptions;

use RuntimeException;

final class InsufficientFundsException extends RuntimeException
{
    public function __construct(string $currency)
    {
        parent::__construct("Insufficient {$currency} balance to complete this trade.");
    }
}
