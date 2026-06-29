import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getOrgId } from '@/lib/supabase'
import nodemailer from 'nodemailer'

export const dynamic = 'force-dynamic'

// Helper: send reply email via SMTP
async function sendSMTPReply(to: string, subject: string, bodyText: string, originalMessageId?: string) {
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = Number(process.env.SMTP_PORT) || 587
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASSWORD
  const smtpFrom = process.env.SMTP_FROM || '"Support Team" <no-reply@voxaiagents.com>'

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.log('[API/Emails/PATCH] SMTP not configured. Skipping direct email send.')
    return { success: false, reason: 'SMTP credentials missing' }
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    })

    const mailOptions: any = {
      from: smtpFrom,
      to,
      subject: subject.startsWith('Re:') ? subject : `Re: ${subject}`,
      text: bodyText,
      // Thread headers to keep conversations grouped in customer's client
      ...(originalMessageId ? {
        headers: {
          'In-Reply-To': originalMessageId,
          'References': originalMessageId
        }
      } : {})
    }

    const info = await transporter.sendMail(mailOptions)
    console.log(`[API/Emails/PATCH] SMTP reply sent! MessageID: ${info.messageId}`)
    return { success: true, messageId: info.messageId }
  } catch (err) {
    console.error('[API/Emails/PATCH] SMTP transmission failed:', err)
    return { success: false, error: String(err) }
  }
}

// 1. PATCH: Update draft content, adjust status (e.g. approve/send)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { status, ai_draft_reply } = await req.json()

    // 1. Fetch current email to verify ownership and read fields
    const { data: email, error: fetchErr } = await supabaseAdmin
      .from('emails')
      .select('*')
      .eq('id', params.id)
      .eq('org_id', orgId)
      .single()

    if (fetchErr || !email) {
      return NextResponse.json({ error: 'Email ticket not found or unauthorized' }, { status: 404 })
    }

    // 2. Prepare database updates
    const updates: any = {
      updated_at: new Date().toISOString()
    }
    if (ai_draft_reply !== undefined) updates.ai_draft_reply = ai_draft_reply
    if (status !== undefined) updates.status = status

    // 3. Update in database
    const { data: updatedEmail, error: updateErr } = await supabaseAdmin
      .from('emails')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (updateErr || !updatedEmail) {
      console.error('[API/Emails/PATCH] Update error:', updateErr)
      throw updateErr
    }

    // 4. If status is updated to 'sent', trigger SMTP dispatch and/or n8n Webhook
    if (status === 'sent') {
      const emailRecipient = email.from_email
      const emailSubject = email.subject
      const replyBody = ai_draft_reply || email.ai_draft_reply || ''

      console.log(`[API/Emails/PATCH] Approving email reply to: ${emailRecipient}`)

      // A. Try SMTP direct send
      const smtpResult = await sendSMTPReply(emailRecipient, emailSubject, replyBody, email.message_id)

      // B. Fetch n8n Webhook URL to dispatch outbound notification event
      const { data: settings } = await supabaseAdmin
        .from('organization_settings')
        .select('n8n_webhook_url')
        .eq('org_id', orgId)
        .maybeSingle()

      if (settings?.n8n_webhook_url) {
        try {
          console.log(`[API/Emails/PATCH] Forwarding reply to n8n Webhook: ${settings.n8n_webhook_url}`)
          await fetch(settings.n8n_webhook_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'email_reply_sent',
              ticket_id: email.id,
              recipient_email: emailRecipient,
              subject: emailSubject,
              reply_body: replyBody,
              original_message_id: email.message_id,
              smtp_sent: smtpResult.success,
              timestamp: new Date().toISOString()
            })
          })
        } catch (webhookErr) {
          console.error('[API/Emails/PATCH] Failed to dispatch webhook to n8n:', webhookErr)
        }
      }

      // If both missing, log a mock email dispatch to server console
      if (!smtpResult.success && !settings?.n8n_webhook_url) {
        console.log('\n--- 📬 [MOCK EMAIL SENT] ---')
        console.log(`To: ${emailRecipient}`)
        console.log(`Subject: Re: ${emailSubject}`)
        console.log(`Body:\n${replyBody}`)
        console.log('----------------------------\n')
        console.log('[API/Emails/PATCH] Neither SMTP nor n8n Webhook is configured. Mock email logged to console.')
      }
    }

    return NextResponse.json(updatedEmail)
  } catch (err: any) {
    console.error('[API/Emails/PATCH]', err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

// 2. DELETE: Remove/Archive an email thread
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { error } = await supabaseAdmin
      .from('emails')
      .delete()
      .eq('id', params.id)
      .eq('org_id', orgId)

    if (error) {
      console.error('[API/Emails/DELETE] Delete error:', error)
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
