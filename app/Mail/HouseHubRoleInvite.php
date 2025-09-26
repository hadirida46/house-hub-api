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

    /**
     * Create a new message instance.
     */
    public function __construct($email, $role, $houseHubName, $inviteLink)
    {
        $this->email = $email;
        $this->role = $role;
        $this->houseHubName = $houseHubName;
        $this->inviteLink = $inviteLink;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject("You're invited to join {$this->houseHubName}")
            ->view('emails.househub_role_invite');
    }
}
