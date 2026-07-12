import { Resend } from 'resend';
import { env } from '../config/env';

const resend = new Resend(env.RESEND_API_KEY);

const brandColor = '#6366f1';

function baseTemplate(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:Inter,ui-sans-serif,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
          <!-- Header -->
          <tr>
            <td style="padding-bottom:24px;text-align:center;">
              <div style="display:inline-block;width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,${brandColor},#a855f7);line-height:48px;text-align:center;font-size:22px;">📊</div>
              <p style="margin:8px 0 0;color:#f4f4f5;font-size:16px;font-weight:600;">Personal Finance</p>
            </td>
          </tr>
          <!-- Card -->
          <tr>
            <td style="background:#14141c;border:1px solid #26262f;border-radius:16px;padding:32px;">
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="margin:0;color:#71717a;font-size:12px;">Personal Finance Manager &bull; Your private on-device tracker</p>
              <p style="margin:4px 0 0;color:#71717a;font-size:11px;">If you didn't request this, you can safely ignore this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetLink: string
): Promise<void> {
  const html = baseTemplate(
    'Reset your password',
    `
    <h1 style="margin:0 0 8px;color:#f4f4f5;font-size:22px;font-weight:700;">Reset your password</h1>
    <p style="margin:0 0 24px;color:#a1a1aa;font-size:14px;line-height:1.6;">
      Hey ${name}, we received a request to reset the password for your account.
      Click the button below to set a new password. This link expires in <strong style="color:#f4f4f5;">1 hour</strong>.
    </p>
    <div style="text-align:center;margin-bottom:24px;">
      <a href="${resetLink}"
         style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,${brandColor},#a855f7);color:#fff;font-size:15px;font-weight:600;text-decoration:none;border-radius:12px;">
        Reset Password
      </a>
    </div>
    <p style="margin:0;color:#71717a;font-size:12px;word-break:break-all;">
      Or copy this link: <span style="color:#a1a1aa;">${resetLink}</span>
    </p>
    `
  );

  await resend.emails.send({
    from: env.EMAIL_FROM,
    to: email,
    subject: 'Reset your Finance Manager password',
    html,
  });
}

export async function sendOTPEmail(
  email: string,
  name: string,
  otp: string
): Promise<void> {
  const html = baseTemplate(
    'Verify your email',
    `
    <h1 style="margin:0 0 8px;color:#f4f4f5;font-size:22px;font-weight:700;">Verify your email</h1>
    <p style="margin:0 0 24px;color:#a1a1aa;font-size:14px;line-height:1.6;">
      Hey ${name}, enter the code below in the app to verify your email address.
      This code expires in <strong style="color:#f4f4f5;">10 minutes</strong>.
    </p>
    <div style="background:#1c1c26;border:1px solid #35354280;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
      <p style="margin:0;color:#71717a;font-size:12px;letter-spacing:0.05em;text-transform:uppercase;">Your verification code</p>
      <p style="margin:8px 0 0;color:#f4f4f5;font-size:36px;font-weight:700;letter-spacing:0.25em;">${otp}</p>
    </div>
    <p style="margin:0;color:#71717a;font-size:12px;">
      This code is valid for 10 minutes. If you didn't create an account, ignore this email.
    </p>
    `
  );

  await resend.emails.send({
    from: env.EMAIL_FROM,
    to: email,
    subject: `${otp} is your Finance Manager verification code`,
    html,
  });
}

export async function sendGoogleLoginNotificationEmail(
  email: string,
  name: string
): Promise<void> {
  const loginTime = new Date().toLocaleString();
  const html = baseTemplate(
    'New Google Login Detected',
    `
    <h1 style="margin:0 0 8px;color:#f4f4f5;font-size:22px;font-weight:700;">New login to your account</h1>
    <p style="margin:0 0 24px;color:#a1a1aa;font-size:14px;line-height:1.6;">
      Hey ${name}, you successfully signed in to your Personal Finance account using <strong style="color:#f4f4f5;">Google Sign-In</strong>.
    </p>
    <div style="background:#1c1c26;border:1px solid #35354280;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0;color:#71717a;font-size:12px;text-transform:uppercase;">Login Details</p>
      <p style="margin:8px 0 0;color:#f4f4f5;font-size:14px;"><strong>Method:</strong> Google OAuth</p>
      <p style="margin:4px 0 0;color:#f4f4f5;font-size:14px;"><strong>Time:</strong> ${loginTime}</p>
      <p style="margin:4px 0 0;color:#f4f4f5;font-size:14px;"><strong>Email:</strong> ${email}</p>
    </div>
    <p style="margin:0;color:#71717a;font-size:12px;">
      If you did not perform this login, please review your Google account security settings immediately.
    </p>
    `
  );

  await resend.emails.send({
    from: env.EMAIL_FROM,
    to: email,
    subject: 'Security Alert: Successful Google login',
    html,
  });
}

