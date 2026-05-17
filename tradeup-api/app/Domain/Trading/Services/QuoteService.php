<?php

namespace App\Domain\Trading\Services;

interface QuoteService
{
    /**
     * Returns the current BRL price per 1 BTC as a string with 2 decimal places,
     * or null if the quote is unavailable.
     */
    public function getQuote(): ?string;
}
