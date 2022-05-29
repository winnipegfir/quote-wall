<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use MeiliSearch\Client;
use MeiliSearch\MeiliSearch;

class GenerateMeilisearchFilters extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'meilisearch:filters';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Creates the filters required for Meilisearch to work on the quote wall.';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        if (class_exists(MeiliSearch::class)) {
            $client = app(Client::class);
            $config = config('scout.meilisearch.settings');
            collect($config)
                ->each(function ($settings, $class) use ($client) {
                    $model = new $class;
                    $index = $client->index($model->searchableAs());
                    collect($settings)
                        ->each(function ($params, $method) use ($index) {
                            $index->{$method}($params);
                        });

                });
        }

        return 0;
    }
}
