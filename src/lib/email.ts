import nodemailer from 'nodemailer'

interface EmailPayload {
  customerName: string
  customerEmail: string
  referenceNumber: string
  status: string
  items: string
  totalAmount: number
}

import { STATUS_TITLES, STATUS_COLORS } from './order-constants'


/**
 * Main notification dispatcher. Triggers both SMTP direct mail and n8n webhook if configured.
 */
export async function sendOrderStatusNotification(
  payload: EmailPayload,
  n8nWebhookUrl?: string | null
) {
  const { customerName, customerEmail, referenceNumber, status, items, totalAmount } = payload
  const friendlyStatus = STATUS_TITLES[status] || status
  const statusColor = STATUS_COLORS[status] || '#10b981'

  console.log(`[Notification Engine] Triggering alerts for Order: ${referenceNumber} (${friendlyStatus})`)

  // 1. Trigger n8n webhook if linked
  if (n8nWebhookUrl) {
    try {
      console.log(`[Notification Engine] Forwarding event to n8n Webhook: ${n8nWebhookUrl}`)
      await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'order_status_updated',
          referenceNumber,
          customerName,
          customerEmail,
          status,
          friendlyStatus,
          items,
          totalAmount,
          timestamp: new Date().toISOString()
        })
      })
    } catch (webhookErr) {
      console.error('[Notification Engine] Failed to dispatch n8n webhook notification:', webhookErr)
    }
  }

  // 2. Direct SMTP Email
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = Number(process.env.SMTP_PORT) || 587
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASSWORD
  const smtpFrom = process.env.SMTP_FROM || '"Orders Team" <no-reply@voxaiagents.com>'

  const subject = `Order Status Update: ${referenceNumber} - ${friendlyStatus}`

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; color: #1f2937; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px border #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .header { background: #111827; padding: 32px 24px; text-align: center; }
        .logo { font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
        .content { padding: 32px 24px; }
        .status-badge { display: inline-block; padding: 6px 16px; border-radius: 9999px; font-weight: 700; font-size: 12px; text-transform: uppercase; color: #ffffff; margin-bottom: 20px; }
        h2 { font-size: 20px; font-weight: 700; color: #111827; margin-top: 0; }
        p { line-height: 1.6; font-size: 14px; color: #4b5563; }
        .order-details { margin: 24px 0; padding: 20px; background: #f3f4f6; border-radius: 12px; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
        .detail-row:last-child { margin-bottom: 0; border-top: 1px solid #e5e7eb; padding-top: 8px; font-weight: 700; font-size: 14px; color: #111827; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo">ORDER NOTIFICATION</div>
        </div>
        <div class="content">
          <span class="status-badge" style="background-color: ${statusColor}">${friendlyStatus}</span>
          <h2>Hello ${customerName},</h2>
          <p>The status of your order <strong>${referenceNumber}</strong> has been updated to <strong>${friendlyStatus}</strong>.</p>
          
          <div class="order-details">
            <div class="detail-row">
              <span>Items Ordered:</span>
              <strong>${items}</strong>
            </div>
            <div class="detail-row">
              <span>Total Amount:</span>
              <strong>₹${totalAmount.toFixed(2)}</strong>
            </div>
          </div>
          
          <p>If you have any questions regarding your delivery status, please reply to this email or contact support.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} VoxAI Dashboard. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `

  if (smtpHost && smtpUser && smtpPass) {
    try {
      console.log(`[Notification Engine] Initializing SMTP connection to: ${smtpHost}:${smtpPort}`)
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      })

      const mailOptions = {
        from: smtpFrom,
        to: customerEmail,
        subject,
        html: htmlContent,
      }

      const info = await transporter.sendMail(mailOptions)
      console.log(`[Notification Engine] Email dispatched successfully! MessageID: ${info.messageId}`)
      return { success: true, messageId: info.messageId }
    } catch (smtpErr) {
      console.error('[Notification Engine] SMTP transmission failed:', smtpErr)
      return { success: false, error: String(smtpErr) }
    }
  } else {
    // Fail-safe mock logging
    console.log('\n--- ✉️ [MOCK EMAIL SENT] ---')
    console.log(`To: ${customerEmail}`)
    console.log(`Subject: ${subject}`)
    console.log(`Status Color: ${statusColor}`)
    console.log(`Content:\nHello ${customerName},\nYour order ${referenceNumber} status is now: ${friendlyStatus}.\nItems: ${items}\nTotal: ₹${totalAmount}\n--------------------------\n`)
    console.log('[Notification Engine] SMTP credentials are not configured in .env.local. Email logged to server console.')
    return { success: true, logged: true }
  }
}
