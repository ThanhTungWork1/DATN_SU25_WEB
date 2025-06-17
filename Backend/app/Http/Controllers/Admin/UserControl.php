<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UserControl extends Controller
{
    public function listUsers()
    {
        return view('admin.users.list-user');
    }
}
