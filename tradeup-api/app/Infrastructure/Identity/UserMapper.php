<?php

namespace App\Infrastructure\Identity;

use App\Domain\Identity\Entities\User as DomainUser;
use App\Models\User as EloquentUser;
use DateTimeImmutable;

final class UserMapper
{
    public static function toDomain(EloquentUser $model): DomainUser
    {
        return DomainUser::reconstitute(
            id: $model->id,
            name: $model->name,
            email: $model->email,
            hashedPassword: $model->password,
            avatarPath: $model->avatar_path,
            createdAt: DateTimeImmutable::createFromMutable($model->created_at->toDateTime()),
        );
    }

    /** @return array<string, mixed> */
    public static function fromDomain(DomainUser $user): array
    {
        return [
            'name' => $user->name(),
            'email' => $user->email()->value(),
            'password' => $user->hashedPassword(),
            'avatar_path' => $user->avatarPath(),
        ];
    }
}
