<?php

namespace Database\Factories;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Transaction>
 */
class TransactionFactory extends Factory
{
    public function definition(): array
    {
        $type = fake()->randomElement(['BUY', 'SELL']);
        $price = number_format(fake()->numberBetween(20000000, 30000000) / 100, 2, '.', '');

        return [
            'user_id' => User::factory(),
            'type' => $type,
            'btc_amount' => number_format(fake()->randomFloat(8, 0.00000001, 1.0), 8, '.', ''),
            'brl_amount' => number_format(fake()->randomFloat(2, 1.0, 10000.0), 2, '.', ''),
            'btc_price_brl' => $price,
            'created_at' => now(),
        ];
    }

    public function buy(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'BUY',
        ]);
    }

    public function sell(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'SELL',
        ]);
    }
}
