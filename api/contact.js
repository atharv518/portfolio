// ============================================================
// Vercel Serverless Function: /api/contact
// Secure Contact Form Handler with Supabase & Resend
// ============================================================

// Simple in-memory rate limiter for serverless instance lifespan
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.startTime > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, startTime: now });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  record.count += 1;
  return true;
}

// Basic input sanitization to prevent HTML/XSS injection
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>]/g, '') // strip HTML brackets
    .trim();
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default async function handler(req, res) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  // 2. Identify client IP for rate limiting
  const forwardedFor = req.headers['x-forwarded-for'];
  const clientIp = typeof forwardedFor === 'string'
    ? forwardedFor.split(',')[0].trim()
    : req.socket?.remoteAddress || 'unknown';

  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please wait a few minutes before trying again.'
    });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }
    const { name, email, message, _gotcha } = body || {};

    // 3. Spam Honeypot Check: bots auto-fill hidden inputs
    if (_gotcha) {
      // Silently accept to mislead spammers without executing downstream calls
      return res.status(200).json({ success: true, message: 'Message received successfully.' });
    }

    // 4. Validate and sanitize inputs
    const cleanName = sanitizeString(name);
    const cleanEmail = typeof email === 'string' ? email.trim() : '';
    const cleanMessage = sanitizeString(message);

    if (!cleanName || cleanName.length < 2 || cleanName.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid name between 2 and 100 characters.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail) || cleanEmail.length > 255) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.'
      });
    }

    if (!cleanMessage || cleanMessage.length < 10 || cleanMessage.length > 5000) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a message between 10 and 5000 characters.'
      });
    }

    // 5. Environment variable checks
    const supabaseUrl = process.env.SUPABASE_URL;
    // Supports new Supabase key format (SUPABASE_SECRET_KEY: sb_secret_...) with fallback
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;
    const notificationEmail = process.env.NOTIFICATION_EMAIL || 'atharvhadpe18@gmail.com';

    // Check if services are configured
    if (!supabaseUrl || !supabaseSecretKey) {
      console.error('Missing Supabase configuration (SUPABASE_URL or SUPABASE_SECRET_KEY) in environment variables.');
      return res.status(500).json({
        success: false,
        error: 'Server database is not configured. Please contact the site owner directly.'
      });
    }

    // 6. Save message to Supabase
    let insertedRecordId = null;

    // Use dynamic import for @supabase/supabase-js with direct REST API fallback
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseSecretKey, {
        auth: { persistSession: false }
      });

      const { data, error: dbError } = await supabase
        .from('contacts')
        .insert([
          {
            name: cleanName,
            email: cleanEmail,
            message: cleanMessage,
            email_sent: false
          }
        ])
        .select('id')
        .single();

      if (dbError) {
        console.error('Supabase DB Insert Error:', dbError);
        throw new Error('Database insert failed');
      }

      insertedRecordId = data?.id;
    } catch (dbErr) {
      // Fallback: direct Supabase REST API via native fetch
      const restEndpoint = `${supabaseUrl.replace(/\/+$/, '')}/rest/v1/contacts`;
      const response = await fetch(restEndpoint, {
        method: 'POST',
        headers: {
          'apikey': supabaseSecretKey,
          'Authorization': `Bearer ${supabaseSecretKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          message: cleanMessage,
          email_sent: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Supabase REST fallback failed:', errorText);
        return res.status(500).json({
          success: false,
          error: 'Failed to save your message. Please email me directly.'
        });
      }

      const rows = await response.json();
      insertedRecordId = rows?.[0]?.id;
    }

    // 7. Send notification email via Resend
    let emailSentSuccessfully = false;

    if (resendApiKey) {
      try {
        const escapedName = escapeHtml(cleanName);
        const escapedEmail = escapeHtml(cleanEmail);
        const escapedMessage = escapeHtml(cleanMessage).replace(/\n/g, '<br/>');
        const timestamp = new Date().toUTCString();

        const emailPayload = {
          from: 'Portfolio Contact <onboarding@resend.dev>',
          to: [notificationEmail],
          reply_to: cleanEmail,
          subject: `New Portfolio Message from ${escapedName}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #232733; border-radius: 8px; background-color: #0c0f14; color: #e6ebf5;">
              <h2 style="color: #6366f1; margin-top: 0; border-bottom: 1px solid #232733; padding-bottom: 12px;">New Contact Submission</h2>
              <p style="margin: 8px 0;"><strong>Name:</strong> ${escapedName}</p>
              <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${escapedEmail}" style="color: #818cf8;">${escapedEmail}</a></p>
              <p style="margin: 8px 0;"><strong>Received:</strong> ${timestamp}</p>
              <div style="margin-top: 20px; padding: 16px; background-color: #151923; border: 1px solid #282f40; border-radius: 6px;">
                <p style="margin: 0 0 8px 0; font-weight: 600; color: #94a3b8; font-size: 13px;">MESSAGE:</p>
                <p style="margin: 0; line-height: 1.6; white-space: pre-wrap;">${escapedMessage}</p>
              </div>
              <p style="margin-top: 24px; font-size: 12px; color: #64748b;">You can reply directly to this email to contact ${escapedName}.</p>
            </div>
          `,
          text: `New Portfolio Message from ${cleanName}\n\nEmail: ${cleanEmail}\nReceived: ${timestamp}\n\nMessage:\n${cleanMessage}\n`
        };

        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(emailPayload)
        });

        if (resendRes.ok) {
          emailSentSuccessfully = true;

          // Update record in Supabase to mark email_sent = true
          if (insertedRecordId) {
            try {
              const restEndpoint = `${supabaseUrl.replace(/\/+$/, '')}/rest/v1/contacts?id=eq.${insertedRecordId}`;
              await fetch(restEndpoint, {
                method: 'PATCH',
                headers: {
                  'apikey': supabaseSecretKey,
                  'Authorization': `Bearer ${supabaseSecretKey}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email_sent: true })
              });
            } catch (patchErr) {
              console.error('Failed to update email_sent status in Supabase:', patchErr);
            }
          }
        } else {
          const resendError = await resendRes.text();
          console.error('Resend delivery failed:', resendError);
          // Note: Message is already safely retained in Supabase!
        }
      } catch (emailErr) {
        console.error('Error dispatching email via Resend:', emailErr);
        // Note: Message is already safely retained in Supabase!
      }
    } else {
      console.warn('RESEND_API_KEY is not configured. Saved to Supabase only.');
    }

    // 8. Return success response to the client
    return res.status(200).json({
      success: true,
      message: 'Thank you! Your message has been received and saved.'
    });

  } catch (error) {
    console.error('Unexpected error handling contact form:', error);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while processing your request. Please try again later.'
    });
  }
}
