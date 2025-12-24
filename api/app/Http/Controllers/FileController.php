<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FileController extends Controller
{
    public function uploadUserPhoto(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $file = $request->file('photo');
        $path = $file->store('photos', 'public');
        $filename = $file->hashName();
        $file->storeAs('photos', $filename, 'public');

        return response()->json([
            'photo_avatar_filename' => $filename,
        ], 200);
    }

}
