<?php

namespace App\Application\Trading\Exceptions;

use RuntimeException;

final class QuoteUnavailableException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('The BTC price quote is currently unavailable. Please try again later.');
    }
}
