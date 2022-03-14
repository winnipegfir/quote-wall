<?php

namespace App\Jobs;

use App\Models\Quote;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\URL;
use Woeler\DiscordPhp\Exception\DiscordInvalidResponseException;
use Woeler\DiscordPhp\Message\DiscordEmbedMessage;
use Woeler\DiscordPhp\Webhook\DiscordWebhook;

class SendWebhook implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private Quote $quote;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(Quote $quote)
    {
        $this->quote = $quote;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $quote = $this->quote;

        $message = (new DiscordEmbedMessage())
            ->setTitle("New Quote")
            ->setDescription("*{$quote->content}*\n\n" . ($quote->name ?? "Anonymous"))
            ->setUrl(URL::to('/admin/quotes'))
            ->setUsername("Winnipeg FIR Quote Wall")
            ->setAvatar("https://i.imgur.com/E9EN20l.png");

        (new DiscordWebhook(config('local.discord-webhook')))->send($message);
    }
}
