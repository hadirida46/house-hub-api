<p>Hello {{ $user->name }},</p>

<p>You have been added as a resident. Please click the link below to set your password and access your account:</p>

<p><a href="{{ url('/password/reset?email=' . $user->email) }}">Set your password</a></p>

<p>Thanks,<br>The Building App Team</p>
