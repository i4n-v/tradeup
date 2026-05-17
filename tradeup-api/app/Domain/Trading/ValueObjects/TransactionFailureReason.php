<?php

namespace App\Domain\Trading\ValueObjects;

enum TransactionFailureReason: string
{
    case InsufficientBrlFunds = 'INSUFFICIENT_BRL_FUNDS';
    case InsufficientBtcFunds = 'INSUFFICIENT_BTC_FUNDS';
    case QuoteUnavailable = 'QUOTE_UNAVAILABLE';
    case ZeroResult = 'ZERO_RESULT';
    case Unknown = 'UNKNOWN';
}
