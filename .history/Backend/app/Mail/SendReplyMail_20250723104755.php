<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\\Mail\\Mailable;
use Illuminate\\Queue\\SerializesModels;

class SendReplyMail extends Mailable
{
    use Queueable, SerializesModels;

    public $contact;
    public $replyMessage;

    /**
     * Create a new message instance.
     */
    public function __construct($contact, $replyMessage)
    {
        $this->contact = $contact;
        $this->replyMessage = $replyMessage;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Phản hồi liên hệ từ StrideX')
            ->view('emails.reply_contact')
            ->with([
                'contact' => $this->contact,
                'replyMessage' => $this->replyMessage,
            ]);
    }
}