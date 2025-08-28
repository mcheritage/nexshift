<?php

namespace App\Dtos;

class RegisterUserDto
{
    /**
     * Create a new class instance.
     */
    public function __construct(public string $first_name,
                                public string $last_name,
                                public string | null $other_names,
                                public string | null $gender,
                                public string $email,
                                public string $password)
    {
        //
    }
}
