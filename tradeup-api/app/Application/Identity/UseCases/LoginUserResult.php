<?php

namespace App\Application\Identity\UseCases;

use App\Domain\Identity\Entities\User;

final readonly class LoginUserResult
{
    public function __construct(
        public string $token,
        public User $user,
    ) {}
}
