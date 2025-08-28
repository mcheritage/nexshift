<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

//require __DIR__.'/carehome.php';
//require __DIR__.'/admin.php';

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

