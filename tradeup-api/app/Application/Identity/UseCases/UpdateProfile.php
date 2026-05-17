<?php

namespace App\Application\Identity\UseCases;

use App\Domain\Identity\Entities\User;
use App\Domain\Identity\Repositories\UserRepository;

final class UpdateProfile
{
    public function __construct(
        private readonly UserRepository $users,
    ) {}

    public function execute(UpdateProfileInput $input): User
    {
        $user = $this->users->findById($input->userId);

        if ($user === null) {
            throw new \RuntimeException('User not found.');
        }

        $user->updateName($input->name);

        return $this->users->save($user);
    }
}
