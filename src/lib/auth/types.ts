export type MfaMethod = "totp" | "email";

export interface OtpState {
  otpCode: string;
  otpSent: boolean;
  otpCountdown: number;
  otpError: string;
}

export interface SendOtpRequest {
  email: string;
  purpose: "login" | "registration" | "password-reset";
}

export interface VerifyOtpRequest {
  email: string;
  otpCode: string;
  purpose: "login" | "registration" | "password-reset";
}

export interface OtpResponse {
  success: boolean;
  message: string;
  expiresIn?: number; // seconds
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  mfaEnabled: boolean;
  mfaMethod?: MfaMethod;
  totpSecret?: string; // TOTP secret for verification
}
