<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Vehicle;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class VehicleSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();
        $customerIds = Customer::pluck('id')->all();

        if (empty($customerIds)) {
            return;
        }

        $vehicleTypes = ['Car', 'Motorcycle', 'Truck', 'Van', 'SUV', 'Pickup'];
        $fuelTypes = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];
        $brands = [
            'Toyota' => ['Corolla', 'Hilux', 'RAV4', 'Prius'],
            'Honda' => ['Civic', 'Accord', 'CR-V', 'City'],
            'Suzuki' => ['Swift', 'Baleno', 'Jimny', 'Ciaz'],
            'Nissan' => ['Sunny', 'X-Trail', 'Navara', 'Note'],
            'Mitsubishi' => ['Lancer', 'Outlander', 'Triton', 'Pajero'],
            'Ford' => ['Ranger', 'Escape', 'Everest', 'Fiesta'],
        ];
        $regions = ['WP', 'KA', 'GB', 'NR', 'MC', 'CW'];
        $series = ['A', 'B', 'C', 'E', 'K', 'S'];

        for ($i = 1; $i <= 20; $i++) {
            $brand = $faker->randomElement(array_keys($brands));
            $models = $brands[$brand];

            Vehicle::create([
                'vehicle_type' => $faker->randomElement($vehicleTypes),
                'brand' => $brand,
                'model' => $faker->randomElement($models),
                'fuel_type' => $faker->randomElement($fuelTypes),
                'customer_id' => $faker->randomElement($customerIds),
                'vehicle_no' => sprintf('%s %s-%04d', $faker->randomElement($regions), $faker->randomElement($series), $faker->numberBetween(1, 9999)),
            ]);
        }
    }
}
