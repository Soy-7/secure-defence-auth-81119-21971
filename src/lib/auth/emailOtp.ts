/**
 * Email OTP utilities for the Defence Portal
 */

export const OTP_LENGTH = 6;
export const OTP_EXPIRY_SECONDS = 60;

/**
 * Format countdown timer as MM:SS or just seconds
 */
export const formatCountdown = (seconds: number): string => {
  if (seconds <= 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}:${secs.toString().padStart(2, "0")}` : `0:${secs.toString().padStart(2, "0")}`;
};

/**
 * Validate OTP format (6 digits)
 */
export const isValidOtpFormat = (otp: string): boolean => {
  return /^\d{6}$/.test(otp);
};

/**
 * Sanitize OTP input - remove non-digits and limit to 6 chars
 */
export const sanitizeOtpInput = (value: string): string => {
  return value.replace(/\D/g, "").slice(0, OTP_LENGTH);
};

/**
 * Mask email for display (e.g., "u***@domain.com")
 */
export const maskEmail = (email: string): string => {
  if (!email || !email.includes("@")) return email;
  const [local, domain] = email.split("@");
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }
  return `${local[0]}${local[1]}***@${domain}`;
};

/**
 * Generate a mock OTP (for demo/testing purposes only)
 * In production, OTP is generated server-side
 */
export const generateMockOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
