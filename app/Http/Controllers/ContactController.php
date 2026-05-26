<?php

namespace App\Http\Controllers;

use App\Mail\ContactEnquiry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'    => ['required', 'string', 'max:100'],
            'email'   => ['required', 'email', 'max:150'],
            'message' => ['required', 'string', 'max:2000'],
        ]);

        Mail::to('support@nexshiftcare.co.uk')->send(
            new ContactEnquiry($validated['name'], $validated['email'], $validated['message'])
        );

        return back()->with('contact_success', true);
    }
}
