<?php

namespace App\Http\Requests\Auth;

use App\Dtos\RegisterCareHomeDto;
use App\Dtos\RegisterUserDto;
use App\Models\CareHome;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules;


class RegisterCareHomeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|unique:'.CareHome::class,
            'phone_number' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ];
    }


    public function requestDataObject(): RegisterCareHomeDto
    {
        $payload = $this->validated();

        return new RegisterCareHomeDto(
            name: $payload['name'],
            email: $payload['email'],
            password: $payload['password'],
            phone_number: $payload['phone_number'] ?? null,
            address: $payload['address'] ?? null,
        );
    }
}
