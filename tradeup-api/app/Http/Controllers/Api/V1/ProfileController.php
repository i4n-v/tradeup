<?php

namespace App\Http\Controllers\Api\V1;

use App\Application\Identity\UseCases\UpdateProfile;
use App\Application\Identity\UseCases\UpdateProfileInput;
use App\Application\Identity\UseCases\UploadAvatar;
use App\Application\Identity\UseCases\UploadAvatarInput;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Profile\UpdateProfileRequest;
use App\Http\Requests\Api\V1\Profile\UploadAvatarRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function __construct(
        private readonly UpdateProfile $updateProfile,
        private readonly UploadAvatar $uploadAvatar,
    ) {}

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $this->updateProfile->execute(new UpdateProfileInput(
            userId: $request->user()->id,
            name: $request->validated('name'),
        ));

        $avatarUrl = $user->avatarPath()
            ? Storage::disk('public')->url($user->avatarPath())
            : null;

        return response()->json([
            'id' => $user->id(),
            'name' => $user->name(),
            'email' => $user->email()->value(),
            'avatarUrl' => $avatarUrl,
            'createdAt' => $user->createdAt()->format('Y-m-d\TH:i:s\Z'),
        ]);
    }

    public function uploadAvatar(UploadAvatarRequest $request): JsonResponse
    {
        $result = $this->uploadAvatar->execute(new UploadAvatarInput(
            userId: $request->user()->id,
            file: $request->file('avatar'),
        ));

        return response()->json([
            'avatarUrl' => $result->avatarUrl,
        ]);
    }
}
