<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();

        for ($i = 1; $i <= 20; $i++) {
            $firstName = $faker->firstName();
            $lastName = $faker->lastName();
            $companyName = $faker->boolean(30) ? $faker->company() : null;

            Customer::create([
                'display_name' => trim($firstName . ' ' . $lastName),
                'first_name' => $firstName,
                'last_name' => $lastName,
                'company_name' => $companyName,
                'email' => $faker->unique()->safeEmail(),
                'phone_number' => $faker->phoneNumber(),
                'nic' => $faker->bothify('#########?'),
                'passport' => $faker->boolean(40) ? strtoupper($faker->bothify('??######')) : null,
                'address' => $faker->address(),
                'tax_id' => $faker->boolean(40) ? strtoupper($faker->bothify('??########')) : null,
                'customer_number' => 1000 + $i,
                'opening_balance' => $faker->randomFloat(2, 0, 1500),
            ]);
        }
    }
}
