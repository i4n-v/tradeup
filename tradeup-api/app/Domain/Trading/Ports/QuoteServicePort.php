<?php

namespace App\Domain\Trading\Ports;

interface QuoteServicePort
{
    /**
     * Returns the current BRL price per 1 BTC as a string with 2 decimal places,
     * or null if the quote is currently unavailable.
     */
    public function getQuote(): ?string;
}
