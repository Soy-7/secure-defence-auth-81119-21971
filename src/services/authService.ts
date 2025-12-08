/**
 * Authentication Service
 * Handles API calls for OTP sending/verification
 * 
 * NOTE: These are mock implementations. Replace with actual API calls in production.
 */

import type { SendOtpRequest, VerifyOtpRequest, OtpResponse, AuthUser } from "@/lib/auth/types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

/**
 * Send OTP to email
 */
export const sendOtp = async (request: SendOtpRequest): Promise<OtpResponse> => {
  // Mock implementation - replace with actual API call
  // Example: return fetch(`${API_BASE_URL}/auth/send-otp`, { method: 'POST', body: JSON.stringify(request) })
  
  console.log(`[AuthService] Sending OTP to ${request.email} for ${request.purpose}`);
  
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock success response
  return {
    success: true,
    message: `OTP sent to ${request.email}`,
    expiresIn: 60,
  };
};

/**
 * Verify OTP
 */
export const verifyOtp = async (request: VerifyOtpRequest): Promise<OtpResponse> => {
  // Mock implementation - replace with actual API call
  // Example: return fetch(`${API_BASE_URL}/auth/verify-otp`, { method: 'POST', body: JSON.stringify(request) })
  
  console.log(`[AuthService] Verifying OTP for ${request.email}`);
  
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock validation (accepts any 6-digit code for demo)
  if (request.otpCode.length === 6) {
    return {
      success: true,
      message: "OTP verified successfully",
    };
  }

  return {
    success: false,
    message: "Invalid OTP code",
  };
};

/**
 * Login with credentials
 */
export const login = async (credentials: {
  identifier: string;
  email?: string;
  password: string;
  role: string;
}): Promise<{ success: boolean; user?: AuthUser; message: string }> => {
  console.log(`[AuthService] Login attempt for role: ${credentials.role}`);
  
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Mock 70% success rate for demo
  const success = Math.random() > 0.3;

  if (success) {
    return {
      success: true,
      user: {
        id: crypto.randomUUID(),
        email: credentials.email || `${credentials.identifier}@defence.in`,
        role: credentials.role,
        mfaEnabled: true,
        mfaMethod: "email",
      },
      message: "Login successful",
    };
  }

  return {
    success: false,
    message: "Invalid credentials",
  };
};

/**
 * Complete MFA verification
 */
export const verifyMfa = async (params: {
  userId: string;
  method: "totp" | "email";
  code: string;
}): Promise<{ success: boolean; token?: string; message: string }> => {
  console.log(`[AuthService] MFA verification via ${params.method}`);
  
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (params.code.length === 6) {
    return {
      success: true,
      token: `mock-jwt-token-${Date.now()}`,
      message: "MFA verified",
    };
  }

  return {
    success: false,
    message: "Invalid verification code",
  };
};

/**
 * Register new user
 */
export const register = async (userData: {
  fullName: string;
  email: string;
  mobile: string;
  serviceId: string;
  role: string;
  password: string;
  mfaMethod: "totp" | "email";
}): Promise<{ success: boolean; message: string }> => {
  console.log(`[AuthService] Registration for ${userData.email} as ${userData.role}`);
  
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    success: true,
    message: "Registration submitted for verification",
  };
};

export default {
  sendOtp,
  verifyOtp,
  login,
  verifyMfa,
  register,
};
