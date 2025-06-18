import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY environment variable not set - email functionality will be disabled");
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log(`[EMAIL DISABLED] Would send email to ${params.to}: ${params.subject}`);
      return true; // Return true in development to not break the flow
    }

    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendVerificationEmail(email: string, code: string, firstName: string): Promise<boolean> {
  const subject = "Verify Your Email - Mechanic Finder";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Email Verification</h2>
      <p>Hi ${firstName},</p>
      <p>Thank you for registering with Mechanic Finder. Please verify your email address by entering the following code:</p>
      <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
        <h3 style="font-size: 32px; letter-spacing: 4px; margin: 0; color: #2563eb;">${code}</h3>
      </div>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't create an account with us, please ignore this email.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">
        This is an automated message from Mechanic Finder. Please do not reply to this email.
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    from: 'noreply@mechanicfinder.com',
    subject,
    html,
    text: `Hi ${firstName}, Please verify your email with this code: ${code}. This code expires in 10 minutes.`
  });
}