import { storage } from './storage';
import { sendVerificationEmail } from './email';

// Generate a 6-digit verification code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate a 4-digit phone OTP
export function generatePhoneOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Create and send email verification code
export async function createEmailVerification(userId: number, email: string, firstName: string): Promise<boolean> {
  try {
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store verification code
    await storage.createVerificationCode({
      userId,
      code,
      type: 'email',
      purpose: 'verification',
      email,
      expiresAt,
    });

    // Send email
    const emailSent = await sendVerificationEmail(email, code, firstName);
    return emailSent;
  } catch (error) {
    console.error('Error creating email verification:', error);
    return false;
  }
}

// Create phone OTP (mock implementation - would integrate with SMS service)
export async function createPhoneVerification(userId: number, phone: string): Promise<boolean> {
  try {
    const code = generatePhoneOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store verification code
    await storage.createVerificationCode({
      userId,
      code,
      type: 'phone',
      purpose: 'verification',
      phone,
      expiresAt,
    });

    // Mock SMS sending - log to console in development
    console.log(`[SMS] Sending OTP ${code} to ${phone}`);
    
    // In production, you would integrate with Twilio, AWS SNS, or another SMS service
    return true;
  } catch (error) {
    console.error('Error creating phone verification:', error);
    return false;
  }
}

// Verify email code
export async function verifyEmailCode(userId: number, code: string): Promise<boolean> {
  try {
    const verification = await storage.getLatestVerificationCode(userId, 'email', 'verification');
    
    if (!verification) {
      return false;
    }

    if (verification.usedAt) {
      return false; // Code already used
    }

    if (new Date() > verification.expiresAt) {
      return false; // Code expired
    }

    if (verification.code !== code) {
      return false; // Invalid code
    }

    // Mark code as used
    await storage.markVerificationCodeUsed(verification.id);

    // Update user email verification status
    await storage.updateUser(userId, { emailVerified: true });

    return true;
  } catch (error) {
    console.error('Error verifying email code:', error);
    return false;
  }
}

// Verify phone OTP
export async function verifyPhoneOTP(userId: number, code: string): Promise<boolean> {
  try {
    const verification = await storage.getLatestVerificationCode(userId, 'phone', 'verification');
    
    if (!verification) {
      return false;
    }

    if (verification.usedAt) {
      return false; // Code already used
    }

    if (new Date() > verification.expiresAt) {
      return false; // Code expired
    }

    if (verification.code !== code) {
      return false; // Invalid code
    }

    // Mark code as used
    await storage.markVerificationCodeUsed(verification.id);

    // Update user phone verification status
    await storage.updateUser(userId, { phoneVerified: true });

    return true;
  } catch (error) {
    console.error('Error verifying phone OTP:', error);
    return false;
  }
}

// Resend verification code
export async function resendVerification(userId: number, type: 'email' | 'phone'): Promise<boolean> {
  try {
    const user = await storage.getUser(userId);
    if (!user) {
      return false;
    }

    if (type === 'email' && user.email) {
      return await createEmailVerification(userId, user.email, user.firstName);
    } else if (type === 'phone' && user.phone) {
      return await createPhoneVerification(userId, user.phone);
    }

    return false;
  } catch (error) {
    console.error('Error resending verification:', error);
    return false;
  }
}