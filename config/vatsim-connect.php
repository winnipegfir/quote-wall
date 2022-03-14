<?php

return [
    'client_id' =>      env('VATSIM_CLIENT_ID'),
    'client_secret' =>  env('VATSIM_CLIENT_SECRET'),
    'redirect_uri' =>   env('VATSIM_REDIRECT_URL'),
    'scope' =>          '',
    'required_scope' => '',
    'base' =>           env('VATSIM_BASE_URL', 'https://auth-dev.vatsim.net/')
];
