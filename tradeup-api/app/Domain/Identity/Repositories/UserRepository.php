<?php

namespace App\Domain\Identity\Repositories;

use App\Domain\Identity\Entities\User;

interface UserRepository
{
    public function findByEmail(string $email): ?User;

    public function findById(int $id): ?User;

    public function save(User $user): User;
}
