<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class HouseHubRoleInvite extends Mailable
{
    use Queueable, SerializesModels;

    public $email;
    public $role;
    public $houseHubName;
    public $inviteLink;
    public $userName;
    public $password;

    public function __construct($email, $role, $houseHubName, $inviteLink, $userName, $password)
    {
        $this->email = $email;
        $this->role = $role;
        $this->houseHubName = $houseHubName;
        $this->inviteLink = $inviteLink;
        $this->userName = $userName;
        $this->password = $password;
    }

    public function build()
    {
        return $this->subject("You're invited to join {$this->houseHubName}")
            ->view('emails.househub_role_invite')
            ->with([
                'email'        => $this->email,
                'role'         => $this->role,
                'houseHubName' => $this->houseHubName,
                'inviteLink'   => $this->inviteLink,
                'userName'     => $this->userName,
                'password'     => $this->password,
            ]);
    }
}
