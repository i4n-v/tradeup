<?php

namespace App\Application\Trading\UseCases;

use App\Domain\Trading\Repositories\TransactionRepository;
use InvalidArgumentException;

final class ListTransactions
{
    public function __construct(
        private readonly TransactionRepository $transactions,
    ) {}

    public function execute(ListTransactionsInput $input): ListTransactionsResult
    {
        if ($input->limit > 200) {
            throw new InvalidArgumentException('Limit must not exceed 200.');
        }

        $items = $this->transactions->listByUserId($input->userId, $input->page, $input->limit);
        $total = $this->transactions->countByUserId($input->userId);

        return new ListTransactionsResult(
            items: $items,
            page: $input->page,
            limit: $input->limit,
            total: $total,
        );
    }
}
