<?php

namespace App\Domain\Trading\ValueObjects;

enum TransactionStatus: string
{
    case Pending = 'PENDING';
    case Completed = 'COMPLETED';
    case Failed = 'FAILED';
}
