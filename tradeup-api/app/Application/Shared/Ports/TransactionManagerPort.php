<?php

namespace App\Application\Shared\Ports;

interface TransactionManagerPort
{
    public function run(callable $callback): mixed;
}
