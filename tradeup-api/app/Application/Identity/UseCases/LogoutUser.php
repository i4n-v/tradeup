<?php

namespace App\Application\Identity\UseCases;

use App\Models\User as EloquentUser;

final class LogoutUser
{
    public function execute(EloquentUser $user): void
    {
        $user->currentAccessToken()->delete();
    }
}
