<?php

namespace App\Dtos;

use Illuminate\Http\Request;

class LoginUserDto
{
    /**
     * Create a new class instance.
     */
    public function __construct(
                                public string $email,
                                public string $password)
    {
        //
    }

    public static function fromRequest(Request $request): LoginUserDto
    {
        return new self(
            email: $request->email,
            password: $request->password,
        );
    }
}
