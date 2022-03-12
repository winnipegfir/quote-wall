<?php

namespace Database\Seeders;

use App\Models\Quote;
use Carbon\Carbon;
use Faker\Factory;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $faker = Factory::create();

        for ($n = 0; $n < 100; $n++) {
            Quote::query()->create([
                'content' => $faker->text(),
                'name' => (rand(1,10) == 1 ? null : $faker->name()),
                'ip_address' => (rand(0,1) == 1 ? $faker->ipv4() : $faker->ipv6()),
                'status' => Quote::APPROVED,
                'created_at' => Carbon::now()->subDays(rand(0,60))->subHours(rand(0,24))->subMinutes(rand(0,60))
            ]);
        }
    }
}
