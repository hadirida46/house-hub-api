<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>HouseHub Invitation</title>
</head>
<body>
<p>Hello,</p>
<p>You have been invited to join <strong>{{ $houseHubName }}</strong> as a <strong>{{ $role }}</strong>.</p>
<p>Click the link below to accept your invitation:</p>
<p><a href="{{ $inviteLink }}">Accept Invitation</a></p>
<p>Thank you!</p>
</body>
</html>
