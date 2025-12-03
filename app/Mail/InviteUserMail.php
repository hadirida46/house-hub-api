<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\User;

class InviteUserMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $password;
    public $houseHub;
    public $building;
    public $floor;
    public $apartment;
    public $subjectText;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user, $password, $houseHub, $building, $floor, $apartment, $subjectText = null)
    {
        $this->user = $user;
        $this->password = $password;
        $this->houseHub = $houseHub;
        $this->building = $building;
        $this->floor = $floor;
        $this->apartment = $apartment;
        $this->subjectText = $subjectText ?? 'You are invited to join our Building in House Hub App';
    }


    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subjectText,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.invite_user',
            with: [
                'name' => $this->user->name,
                'email' => $this->user->email,
                'password' => $this->password,
                'House Hub' => $this->houseHub,
                'building' => $this->building,
                'floor' => $this->floor,
                'apartment' => $this->apartment,
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
