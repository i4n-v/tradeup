<?php

namespace App\Domain\Trading\ValueObjects;

enum TradeType: string
{
    case Buy = 'BUY';
    case Sell = 'SELL';
}
