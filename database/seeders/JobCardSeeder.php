<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\JobCard;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Carbon\Carbon;

class JobCardSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();
        $customerIds = Customer::pluck('id')->all();

        if (empty($customerIds)) {
            return;
        }

        $statuses = ['Pending', 'Diagnosing', 'Waiting for Parts', 'In Progress', 'Ready', 'Delivered', 'Cancelled'];
        $technicians = ['Asha Fernando', 'Bimal Perera', 'Chathura Silva', 'Dulani Jayawardena', 'Eranga Wijesinghe'];
        $complaints = [
            'Engine noise when starting',
            'Oil leak under the vehicle',
            'Brake pedal feels soft',
            'Air conditioning not cooling',
            'Battery drains overnight',
            'Strange vibration at high speed',
            'Headlight flickers intermittently',
            'Suspension feels too stiff',
            'Gear shifting is rough',
            'Check engine light is on',
        ];

        for ($i = 1; $i <= 20; $i++) {
            $serviceDate = Carbon::parse($faker->dateTimeBetween('-30 days', 'now'));
            $estimatedDelivery = $serviceDate->copy()->addDays($faker->numberBetween(2, 12));

            JobCard::create([
                'customer_id' => $faker->randomElement($customerIds),
                'device_id' => null,
                'job_card_number' => 'JC-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'service_date' => $serviceDate->format('Y-m-d'),
                'complaint' => $faker->randomElement($complaints),
                'technician_assigned' => $faker->randomElement($technicians),
                'estimated_delivery_date' => $estimatedDelivery->format('Y-m-d'),
                'estimated_cost' => $faker->randomFloat(2, 1500, 12000),
                'photos' => $faker->boolean(30) ? [$faker->imageUrl(640, 480, 'technics')] : null,
                'customer_signature' => $faker->boolean(30) ? 'Signed by ' . $faker->name() : null,
                'status' => $faker->randomElement($statuses),
            ]);
        }
    }
}
