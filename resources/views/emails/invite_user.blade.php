<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Welcome to House Hub</title>
</head>
<body>
<h2>Hello {{ $name }},</h2>

<p>You have been invited to join our <strong>Building in House Hub App</strong>.</p>

<p><strong>House Hub:</strong> {{ $houseHub }}<br>
    <strong>Building:</strong> {{ $building }}<br>
    <strong>Floor:</strong> {{ $floor }}<br>
    <strong>Apartment:</strong> {{ $apartment }}</p>

<p>Here are your login details:</p>
<ul>
    <li><strong>Email:</strong> {{ $email }}</li>
    <li><strong>Password:</strong> {{ $password }}</li>
</ul>

<p>Please log in and change your password after your first login for security.</p>

<br>
<p>Best regards,<br>
    The House Hub Team</p>
</body>
</html>
