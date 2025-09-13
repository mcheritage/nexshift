<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Document>
 */
class DocumentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'care_home_id' => \App\Models\CareHome::factory(),
            'document_type' => $this->faker->randomElement(\App\DocumentType::getAllRequired())->value,
            'original_name' => $this->faker->word() . '.pdf',
            'file_path' => 'documents/carehomes/' . $this->faker->uuid() . '/' . $this->faker->uuid() . '.pdf',
            'file_size' => $this->faker->numberBetween(1000, 5000000), // 1KB to 5MB
            'mime_type' => 'application/pdf',
            'status' => $this->faker->randomElement(['pending', 'approved', 'rejected']),
            'rejection_reason' => $this->faker->optional()->sentence(),
            'uploaded_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
        ];
    }
}
