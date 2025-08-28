<?php

namespace App\Http\Requests\Auth;

use App\Dtos\RegisterUserDto;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules;

class RegisterHealthWorkerRequest extends FormRequest
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
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'other_names' => 'nullable|string|max:255',
            'gender' => 'required|in:male,female,other',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ];
    }

    public function requestDataObject(): RegisterUserDto
    {
        $payload = $this->validated();

        return new RegisterUserDto(
            first_name: $payload['first_name'],
            last_name: $payload['last_name'],
            other_names: $payload['other_names'] ?? null,
            gender: $payload['gender'],
            email: $payload['email'],
            password: $payload['password'],
        );
    }
}
