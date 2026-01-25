<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\RefundRequest;
use App\Models\Order;

class RefundCompletionMail extends Mailable
{
    use Queueable, SerializesModels;

    public $refundRequest;
    public $order;

    /**
     * Create a new message instance.
     */
    public function __construct(RefundRequest $refundRequest, Order $order)
    {
        $this->refundRequest = $refundRequest;
        $this->order = $order;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Hoàn tiền thành công - Đơn hàng #' . $this->order->id,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.refund-completion',
            with: [
                'refundRequest' => $this->refundRequest,
                'order' => $this->order,
            ],
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
