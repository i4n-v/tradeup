<?php

namespace App\Infrastructure\Trading;

use App\Domain\Trading\Ports\QuoteServicePort;

final class MockQuoteService implements QuoteServicePort
{
    public function getQuote(): ?string
    {
        return number_format(random_int(20000000, 30000000) / 100, 2, '.', '');
    }
}
