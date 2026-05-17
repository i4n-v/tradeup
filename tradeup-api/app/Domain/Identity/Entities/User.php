<?php

namespace App\Domain\Identity\Entities;

use App\Domain\Identity\ValueObjects\Email;
use DateTimeImmutable;

final class User
{
    public function __construct(
        private readonly ?int $id,
        private string $name,
        private readonly Email $email,
        private string $hashedPassword,
        private ?string $avatarPath,
        private readonly DateTimeImmutable $createdAt,
    ) {}

    public static function register(
        string $name,
        string $email,
        string $hashedPassword,
    ): self {
        return new self(
            id: null,
            name: $name,
            email: new Email($email),
            hashedPassword: $hashedPassword,
            avatarPath: null,
            createdAt: new DateTimeImmutable,
        );
    }

    public static function reconstitute(
        int $id,
        string $name,
        string $email,
        string $hashedPassword,
        ?string $avatarPath,
        DateTimeImmutable $createdAt,
    ): self {
        return new self(
            id: $id,
            name: $name,
            email: new Email($email),
            hashedPassword: $hashedPassword,
            avatarPath: $avatarPath,
            createdAt: $createdAt,
        );
    }

    public function id(): ?int
    {
        return $this->id;
    }

    public function name(): string
    {
        return $this->name;
    }

    public function email(): Email
    {
        return $this->email;
    }

    public function hashedPassword(): string
    {
        return $this->hashedPassword;
    }

    public function avatarPath(): ?string
    {
        return $this->avatarPath;
    }

    public function createdAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function updateName(string $name): void
    {
        $this->name = $name;
    }

    public function updateAvatarPath(?string $avatarPath): void
    {
        $this->avatarPath = $avatarPath;
    }
}
