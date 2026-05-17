<?php

namespace App\Application\Identity\UseCases;

use App\Application\Identity\Exceptions\DuplicateEmailException;
use App\Domain\Identity\Entities\User;
use App\Domain\Identity\Repositories\UserRepository;
use App\Domain\Trading\Entities\Wallet;
use App\Domain\Trading\Repositories\WalletRepository;
use Illuminate\Support\Facades\Hash;

final class RegisterUser
{
    public function __construct(
        private readonly UserRepository $users,
        private readonly WalletRepository $wallets,
    ) {}

    public function execute(RegisterUserInput $input): RegisterUserResult
    {
        if ($this->users->findByEmail($input->email) !== null) {
            throw new DuplicateEmailException($input->email);
        }

        $user = User::register(
            name: $input->name,
            email: $input->email,
            hashedPassword: Hash::make($input->password),
        );

        $savedUser = $this->users->save($user);

        $wallet = Wallet::openFor($savedUser->id());
        $this->wallets->save($wallet);

        return new RegisterUserResult($savedUser);
    }
}
