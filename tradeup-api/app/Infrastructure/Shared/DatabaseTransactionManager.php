<?php

namespace App\Infrastructure\Shared;

use App\Application\Shared\Ports\TransactionManagerPort;
use Illuminate\Support\Facades\DB;

final class DatabaseTransactionManager implements TransactionManagerPort
{
    public function run(callable $callback): mixed
    {
        return DB::transaction($callback);
    }
}
