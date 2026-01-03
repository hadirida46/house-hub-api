<p>Hello {{ $userName }},</p>

<p>You are invited to join <strong>{{ $houseHubName }}</strong> as <strong>{{ $role }}</strong>.</p>

<p>Your login email: {{ $email }}</p>
<p>Your temporary password: <strong>{{ $password }}</strong></p>
<p>Please log in and change your password after your first login for security.</p>

<p>Click the link below to join:</p>
<p><a href="{{ $inviteLink }}">Join Now</a></p>
