<?php

namespace App\Application\Identity\UseCases;

final readonly class RegisterUserInput
{
    public function __construct(
        public string $name,
        public string $email,
        public string $password,
    ) {}
}
