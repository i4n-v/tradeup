<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Application\Identity\Exceptions\InvalidCredentialsException;
use App\Application\Identity\UseCases\LoginUser;
use App\Application\Identity\UseCases\LoginUserInput;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class LoginController extends Controller
{
    public function __construct(
        private readonly LoginUser $loginUser,
    ) {}

    public function __invoke(LoginRequest $request): JsonResponse
    {
        try {
            $result = $this->loginUser->execute(new LoginUserInput(
                email: $request->validated('email'),
                password: $request->validated('password'),
            ));
        } catch (InvalidCredentialsException $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'errors' => ['email' => [$e->getMessage()]],
            ], 422);
        }

        $user = $result->user;
        $avatarUrl = $user->avatarPath()
            ? Storage::disk('public')->url($user->avatarPath())
            : null;

        return response()->json([
            'token' => $result->token,
            'user' => [
                'id' => $user->id(),
                'name' => $user->name(),
                'email' => $user->email()->value(),
                'avatarUrl' => $avatarUrl,
                'createdAt' => $user->createdAt()->format('Y-m-d\TH:i:s\Z'),
            ],
        ]);
    }
}
