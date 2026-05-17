<?php

namespace App\Application\Identity\UseCases;

use Illuminate\Http\UploadedFile;

final readonly class UploadAvatarInput
{
    public function __construct(
        public int $userId,
        public UploadedFile $file,
    ) {}
}
