<?php

namespace App\Application\Identity\UseCases;

final readonly class UpdateProfileInput
{
    public function __construct(
        public int $userId,
        public string $name,
    ) {}
}
