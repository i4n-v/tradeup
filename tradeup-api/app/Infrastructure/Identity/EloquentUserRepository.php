<?php

namespace App\Infrastructure\Identity;

use App\Domain\Identity\Entities\User as DomainUser;
use App\Domain\Identity\Repositories\UserRepository;
use App\Models\User as EloquentUser;

final class EloquentUserRepository implements UserRepository
{
    public function findByEmail(string $email): ?DomainUser
    {
        $model = EloquentUser::where('email', strtolower(trim($email)))->first();

        return $model ? UserMapper::toDomain($model) : null;
    }

    public function findById(int $id): ?DomainUser
    {
        $model = EloquentUser::find($id);

        return $model ? UserMapper::toDomain($model) : null;
    }

    public function save(DomainUser $user): DomainUser
    {
        if ($user->id() === null) {
            $model = EloquentUser::create(UserMapper::fromDomain($user));
        } else {
            $model = EloquentUser::findOrFail($user->id());
            $model->update(UserMapper::fromDomain($user));
        }

        return UserMapper::toDomain($model->fresh());
    }
}
