<?php

namespace App\Application\Identity\UseCases;

final readonly class LoginUserInput
{
    public function __construct(
        public string $email,
        public string $password,
    ) {}
}
