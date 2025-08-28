<?php

namespace App\Dtos;

class RegisterCareHomeDto
{
    /**
     * Create a new class instance.
     */
    public function __construct(public string $name, public string $email, public string $password)
    {
        //
    }
}
