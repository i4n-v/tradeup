<?php

namespace App\Application\Identity\UseCases;

use App\Application\Identity\Exceptions\InvalidCredentialsException;
use App\Domain\Identity\Repositories\UserRepository;
use App\Models\User as EloquentUser;
use Illuminate\Support\Facades\Hash;

final class LoginUser
{
    public function __construct(
        private readonly UserRepository $users,
    ) {}

    public function execute(LoginUserInput $input): LoginUserResult
    {
        $domainUser = $this->users->findByEmail($input->email);

        if ($domainUser === null || ! Hash::check($input->password, $domainUser->hashedPassword())) {
            throw new InvalidCredentialsException;
        }

        /** @var EloquentUser $eloquentUser */
        $eloquentUser = EloquentUser::findOrFail($domainUser->id());

        $token = $eloquentUser->createToken('api', ['*'], now()->addDays(7))->plainTextToken;

        return new LoginUserResult(token: $token, user: $domainUser);
    }
}
