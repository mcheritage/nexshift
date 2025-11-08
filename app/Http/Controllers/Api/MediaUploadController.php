<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class MediaUploadController extends Controller
{
    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        /** @var User $user */
        $user = $request->user();

        $path = $request->file('image')->storePublicly('uploads/' . $user->id, 'public');

        return response()->json([
            'success' => true,
            'url' => asset('storage/' . $path),
        ]);

    }
}
