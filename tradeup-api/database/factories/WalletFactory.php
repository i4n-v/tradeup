<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Wallet;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Wallet>
 */
class WalletFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'brl_balance' => '10000.00',
            'btc_balance' => '0.00000000',
            'updated_at' => now(),
        ];
    }

    public function withBrl(string $amount): static
    {
        return $this->state(fn (array $attributes) => [
            'brl_balance' => $amount,
        ]);
    }

    public function withBtc(string $amount): static
    {
        return $this->state(fn (array $attributes) => [
            'btc_balance' => $amount,
        ]);
    }
}
