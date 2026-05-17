<?php

namespace App\Application\Identity\UseCases;

use App\Domain\Identity\Entities\User;

final readonly class UploadAvatarResult
{
    public function __construct(
        public User $user,
        public string $avatarUrl,
    ) {}
}
