<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Application\Identity\UseCases\LogoutUser;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class LogoutController extends Controller
{
    public function __construct(
        private readonly LogoutUser $logoutUser,
    ) {}

    public function __invoke(Request $request): Response
    {
        $this->logoutUser->execute($request->user());

        return response()->noContent();
    }
}
