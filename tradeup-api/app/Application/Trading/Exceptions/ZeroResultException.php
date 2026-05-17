<?php

namespace App\Application\Trading\Exceptions;

use RuntimeException;

final class ZeroResultException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('The trade amount is too small and results in a zero value after rounding.');
    }
}
