<?php

namespace App\Providers;

use App\Application\Shared\Ports\TransactionManagerPort;
use App\Domain\Identity\Repositories\UserRepository;
use App\Domain\Trading\Ports\QuoteServicePort;
use App\Domain\Trading\Repositories\TransactionRepository;
use App\Domain\Trading\Repositories\WalletRepository;
use App\Infrastructure\Identity\EloquentUserRepository;
use App\Infrastructure\Shared\DatabaseTransactionManager;
use App\Infrastructure\Trading\EloquentTransactionRepository;
use App\Infrastructure\Trading\EloquentWalletRepository;
use App\Infrastructure\Trading\MockQuoteService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(UserRepository::class, EloquentUserRepository::class);
        $this->app->bind(WalletRepository::class, EloquentWalletRepository::class);
        $this->app->bind(TransactionRepository::class, EloquentTransactionRepository::class);
        $this->app->bind(QuoteServicePort::class, MockQuoteService::class);
        $this->app->bind(TransactionManagerPort::class, DatabaseTransactionManager::class);
    }

    public function boot(): void
    {
        //
    }
}
