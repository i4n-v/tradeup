<?php

namespace App\Application\Identity\UseCases;

use App\Domain\Identity\Repositories\UserRepository;
use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;

final class UploadAvatar
{
    private const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

    private const MAX_SIZE_BYTES = 5 * 1024 * 1024;

    private const MAX_DIMENSION_PX = 4096;

    public function __construct(
        private readonly UserRepository $users,
    ) {}

    public function execute(UploadAvatarInput $input): UploadAvatarResult
    {
        $file = $input->file;

        if (! in_array($file->getMimeType(), self::ALLOWED_MIMES, true)) {
            throw new InvalidArgumentException('Avatar must be a JPEG, PNG, or WebP image.');
        }

        if ($file->getSize() > self::MAX_SIZE_BYTES) {
            throw new InvalidArgumentException('Avatar must not exceed 5 MB.');
        }

        [$width, $height] = getimagesize($file->getRealPath());

        if ($width > self::MAX_DIMENSION_PX || $height > self::MAX_DIMENSION_PX) {
            throw new InvalidArgumentException('Avatar dimensions must not exceed 4096px.');
        }

        $extension = $file->getClientOriginalExtension() ?: $file->guessExtension();
        $path = "avatars/{$input->userId}.{$extension}";

        Storage::disk('public')->putFileAs('avatars', $file, "{$input->userId}.{$extension}");

        $user = $this->users->findById($input->userId);

        if ($user === null) {
            throw new \RuntimeException('User not found.');
        }

        $user->updateAvatarPath($path);
        $savedUser = $this->users->save($user);

        return new UploadAvatarResult(
            user: $savedUser,
            avatarUrl: Storage::disk('public')->url($path),
        );
    }
}
