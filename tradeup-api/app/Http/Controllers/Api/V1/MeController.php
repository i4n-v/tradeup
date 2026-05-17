<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Identity\Repositories\UserRepository;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MeController extends Controller
{
    public function __construct(
        private readonly UserRepository $users,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $user = $this->users->findById($request->user()->id);

        $avatarUrl = $user?->avatarPath()
            ? Storage::disk('public')->url($user->avatarPath())
            : null;

        return response()->json([
            'id' => $user?->id(),
            'name' => $user?->name(),
            'email' => $user?->email()->value(),
            'avatarUrl' => $avatarUrl,
            'createdAt' => $user?->createdAt()->format('Y-m-d\TH:i:s\Z'),
        ]);
    }
}
