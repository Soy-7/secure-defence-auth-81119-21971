/**
 * TOTP Service
 * Handles Time-based One-Time Password generation and verification using otpauth
 */

import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';

export interface TotpSecret {
  ascii: string;
  hex: string;
  base32: string;
  otpauth_url?: string;
}

export interface TotpSetup {
  secret: TotpSecret;
  qrCodeDataUrl: string;
  manualEntryKey: string;
}

/**
 * Generate a new TOTP secret for a user
 */
export const generateTotpSecret = (userEmail: string, issuer: string = 'SecureDefence'): TotpSecret => {
  // Generate a random secret
  const secret = new OTPAuth.Secret({ size: 20 });
  
  // Create TOTP instance
  const totp = new OTPAuth.TOTP({
    issuer: issuer,
    label: userEmail,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: secret,
  });

  return {
    ascii: secret.buffer.toString(),
    hex: secret.hex,
    base32: secret.base32,
    otpauth_url: totp.toString(),
  };
};

/**
 * Generate QR code data URL from TOTP secret
 */
export const generateQRCode = async (otpauthUrl: string): Promise<string> => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#0a1628', // Dark blue color matching theme
        light: '#ffffff',
      },
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Complete TOTP setup - generates secret and QR code
 */
export const setupTotp = async (userEmail: string, issuer: string = 'SecureDefence'): Promise<TotpSetup> => {
  const secret = generateTotpSecret(userEmail, issuer);
  
  if (!secret.otpauth_url) {
    throw new Error('Failed to generate OTP auth URL');
  }

  const qrCodeDataUrl = await generateQRCode(secret.otpauth_url);
  
  return {
    secret,
    qrCodeDataUrl,
    manualEntryKey: formatSecretForDisplay(secret.base32),
  };
};

/**
 * Format secret key for manual entry (adds spaces every 4 characters)
 */
export const formatSecretForDisplay = (secret: string): string => {
  return secret.match(/.{1,4}/g)?.join(' ') || secret;
};

/**
 * Verify a TOTP token against a secret
 */
export const verifyTotpToken = (token: string, secretBase32: string): boolean => {
  try {
    const totp = new OTPAuth.TOTP({
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secretBase32),
    });

    // Verify with a window of 1 step (30 seconds before and after)
    const delta = totp.validate({
      token: token,
      window: 1,
    });

    return delta !== null;
  } catch (error) {
    console.error('Error verifying TOTP token:', error);
    return false;
  }
};

/**
 * Generate backup codes for recovery
 */
export const generateBackupCodes = (count: number = 10): string[] => {
  const codes: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const code = Array.from({ length: 8 }, () => 
      Math.floor(Math.random() * 10)
    ).join('');
    
    // Format as XXXX-XXXX
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  
  return codes;
};

export default {
  generateTotpSecret,
  generateQRCode,
  setupTotp,
  formatSecretForDisplay,
  verifyTotpToken,
  generateBackupCodes,
};
