<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Application\Identity\Exceptions\DuplicateEmailException;
use App\Application\Identity\UseCases\RegisterUser;
use App\Application\Identity\UseCases\RegisterUserInput;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\RegisterRequest;
use Illuminate\Http\JsonResponse;

class RegisterController extends Controller
{
    public function __construct(
        private readonly RegisterUser $registerUser,
    ) {}

    public function __invoke(RegisterRequest $request): JsonResponse
    {
        try {
            $result = $this->registerUser->execute(new RegisterUserInput(
                name: $request->validated('name'),
                email: $request->validated('email'),
                password: $request->validated('password'),
            ));
        } catch (DuplicateEmailException $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'errors' => ['email' => [$e->getMessage()]],
            ], 422);
        }

        $user = $result->user;

        return response()->json([
            'user' => [
                'id' => $user->id(),
                'name' => $user->name(),
                'email' => $user->email()->value(),
                'avatarUrl' => null,
                'createdAt' => $user->createdAt()->format('Y-m-d\TH:i:s\Z'),
            ],
        ], 201);
    }
}
