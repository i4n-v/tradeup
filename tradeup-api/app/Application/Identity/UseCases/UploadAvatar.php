<?php

namespace App\Application\Identity\UseCases;

use App\Domain\Identity\Repositories\UserRepository;
use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;

final class UploadAvatar
{
    private const MAX_SIZE_BYTES = 5 * 1024 * 1024;

    private const MAX_DIMENSION_PX = 4096;

    public function __construct(
        private readonly UserRepository $users,
    ) {}

    public function execute(UploadAvatarInput $input): UploadAvatarResult
    {
        $file = $input->file;

        if ($file->getSize() > self::MAX_SIZE_BYTES) {
            throw new InvalidArgumentException('Avatar must not exceed 5 MB.');
        }

        $dimensions = getimagesize($file->getRealPath());

        if ($dimensions === false) {
            throw new InvalidArgumentException('Avatar file could not be read as an image.');
        }

        [$width, $height] = $dimensions;

        if ($width > self::MAX_DIMENSION_PX || $height > self::MAX_DIMENSION_PX) {
            throw new InvalidArgumentException('Avatar dimensions must not exceed 4096px.');
        }

        $extension = $file->getClientOriginalExtension() ?: $file->guessExtension();
        $filename = "{$input->userId}_".time().".{$extension}";
        $path = "avatars/{$filename}";

        $user = $this->users->findById($input->userId);

        if ($user === null) {
            throw new \RuntimeException('User not found.');
        }

        if ($user->avatarPath() !== null) {
            Storage::disk('public')->delete($user->avatarPath());
        }

        Storage::disk('public')->putFileAs('avatars', $file, $filename);

        $user->updateAvatarPath($path);
        $savedUser = $this->users->save($user);

        return new UploadAvatarResult(
            user: $savedUser,
            avatarUrl: Storage::disk('public')->url($path),
        );
    }
}
