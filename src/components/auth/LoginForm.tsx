import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Shield, Smartphone, AlertTriangle, Info } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { roleConfigurations, roleOptions, RoleConfig, RoleKey } from "@/lib/roleConfig";

const BASE_PASSWORD_POLICY = "Minimum 12 characters, at least one uppercase letter, one number, and one special character.";
const PASSWORD_POLICY_REGEX = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{12,}$/;

const formatCountdown = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [mfaMethod, setMfaMethod] = useState<"totp" | "sms">("totp");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(60);
  const [showSSOModal, setShowSSOModal] = useState(false);
  const [showVPNModal, setShowVPNModal] = useState(false);
  const [showNCRPModal, setShowNCRPModal] = useState(false);
  const [userType, setUserType] = useState<RoleKey | "">("");
  const [serviceId, setServiceId] = useState("");
  const [serviceIdError, setServiceIdError] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const otpTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();

  const currentRoleConfig = userType ? roleConfigurations[userType] : undefined;

  const computeNormalizedId = (value: string, config?: RoleConfig) => {
    if (!config) {
      return value.trim();
    }

    if (config.inputType === "email") {
      return value.trim().toLowerCase();
    }

    const cleaned = value.replace(/\s+/g, "");
    return config.enforceUppercase === false ? cleaned.trim() : cleaned.toUpperCase();
  };

  const handleRoleChange = (value: string) => {
    const roleKey = value as RoleKey;
    setUserType(roleKey);
    setServiceId("");
    setServiceIdError("");
    setEmail("");
    setEmailError("");
    setPasswordError("");
    setPhoneNumber("");
    setPhoneError("");
    const enforcedMethod = roleConfigurations[roleKey]?.enforcedMfaMethod;
    setMfaMethod(enforcedMethod ?? "totp");
  };

  const handleServiceIdChange = (rawValue: string) => {
    const normalized = computeNormalizedId(rawValue, currentRoleConfig);
    setServiceId(normalized);
    if (serviceIdError) {
      setServiceIdError("");
    }
  };

  const handleEmailChange = (rawValue: string) => {
    setEmail(rawValue);
    if (emailError) {
      setEmailError("");
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (passwordError) {
      setPasswordError("");
    }
  };

  const handlePhoneChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 15);
    setPhoneNumber(digitsOnly);
    if (phoneError) {
      setPhoneError("");
    }
    if (otpSent) {
      clearOtpTimer();
      setOtpSent(false);
      setOtpCountdown(0);
    }
  };

  const clearOtpTimer = () => {
    if (otpTimerRef.current) {
      clearInterval(otpTimerRef.current);
      otpTimerRef.current = null;
    }
  };

  const startOtpCountdown = () => {
    clearOtpTimer();
    setOtpCountdown(60);
    otpTimerRef.current = setInterval(() => {
      setOtpCountdown((prev) => {
        if (prev <= 1) {
          clearOtpTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = () => {
    if (phoneNumber.length < 10) {
      setPhoneError("Enter a valid phone number (10-15 digits).");
      toast({
        title: "Phone number required",
        description: "Provide a reachable contact number for OTP delivery.",
        variant: "destructive",
      });
      return;
    }

    setPhoneError("");
    setOtpSent(true);
    setOtpCode("");
    startOtpCountdown();
    toast({
      title: "OTP Sent",
      description: `A one-time code has been dispatched to ***-***-${phoneNumber.slice(-4)}.`,
    });
  };

  const handleMfaMethodChange = (value: string) => {
    if (currentRoleConfig?.enforcedMfaMethod) {
      setMfaMethod(currentRoleConfig.enforcedMfaMethod);
      return;
    }

    setMfaMethod(value === "sms" ? "sms" : "totp");
    if (value === "sms") {
      clearOtpTimer();
      setOtpSent(false);
      setOtpCountdown(0);
      setOtpCode("");
    } else {
      setPhoneError("");
      clearOtpTimer();
      setOtpSent(false);
      setOtpCountdown(0);
      setOtpCode("");
    }
  };

  const validateServiceId = (value: string, config: RoleConfig) => {
    if (!config.idPattern.test(value)) {
      setServiceIdError(config.idValidationMessage);
      return false;
    }

    setServiceIdError("");
    return true;
  };

  const validateEmailForRole = (value: string, config: RoleConfig): string | null => {
    const candidate = value.trim().toLowerCase();

    if (!candidate) {
      const message = config.emailErrorMessage ?? "Official defence email required.";
      setEmailError(message);
      return message;
    }

    if (config.emailWhitelist && !config.emailWhitelist.includes(candidate)) {
      const message = "Email not listed in the approved roster.";
      setEmailError(message);
      return message;
    }

    if (config.emailPattern && !config.emailPattern.test(candidate)) {
      const message = config.emailErrorMessage ?? "Please use the required official email domain.";
      setEmailError(message);
      return message;
    }

    setEmailError("");
    return null;
  };

  const steps = [
    {
      id: 1,
      title: "Unit Credentials",
      description: "Identify yourself"
    },
    {
      id: 2,
      title: "Security Check",
      description: "Password & network"
    },
    {
      id: 3,
      title: "MFA",
      description: "Authenticate"
    }
  ];

  useEffect(() => {
    if (currentRoleConfig?.enforcedMfaMethod && currentRoleConfig.enforcedMfaMethod !== mfaMethod) {
      setMfaMethod(currentRoleConfig.enforcedMfaMethod);
    }
  }, [currentRoleConfig?.enforcedMfaMethod, mfaMethod]);

  useEffect(() => {
    if (mfaMethod !== "sms") {
      clearOtpTimer();
      setOtpSent(false);
      setOtpCountdown(0);
    }
  }, [mfaMethod]);

  useEffect(() => {
    return () => clearOtpTimer();
  }, []);

  const roleSecurityMessages = currentRoleConfig
    ? [
        ...(currentRoleConfig.securityNotes ?? []),
        ...(currentRoleConfig.highPrivilege ? ["High-privilege monitoring enabled."] : []),
        ...(currentRoleConfig.readOnlyRole ? ["Access limited to read-only mode after login."] : []),
      ]
    : [];

  const requiresEmailEntry = Boolean(
    currentRoleConfig?.requiresDefenceEmail || currentRoleConfig?.inputType === "email"
  );
  const showServiceIdField = currentRoleConfig?.inputType !== "email";
  const minRequiredPasswordLength = useMemo(
    () => Math.max(12, currentRoleConfig?.passwordPolicy?.minLength ?? 12),
    [currentRoleConfig?.passwordPolicy?.minLength]
  );

  const baselinePasswordMessage = useMemo(
    () =>
      minRequiredPasswordLength > 12
        ? `Minimum ${minRequiredPasswordLength} characters, at least one uppercase letter, one number, and one special character.`
        : BASE_PASSWORD_POLICY,
    [minRequiredPasswordLength]
  );

  const passwordPolicyMessages = useMemo(() => {
    const messages = new Set<string>([baselinePasswordMessage]);
    const customMessage = currentRoleConfig?.passwordPolicy?.message;
    if (customMessage && customMessage !== baselinePasswordMessage) {
      messages.add(customMessage);
    }
    return Array.from(messages);
  }, [baselinePasswordMessage, currentRoleConfig?.passwordPolicy?.message]);

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userType) {
      toast({
        title: "Select Your Role",
        description: "Choose your role to continue the login process.",
        variant: "destructive",
      });
      return;
    }

    const config = roleConfigurations[userType];

    if (showServiceIdField) {
      const normalizedId = computeNormalizedId(serviceId, config);
      setServiceId(normalizedId);

      if (!normalizedId) {
        const message = `Provide your ${config.idLabel} to proceed.`;
        setServiceIdError(message);
        toast({
          title: "Credential Required",
          description: message,
          variant: "destructive",
        });
        return;
      }

      if (!validateServiceId(normalizedId, config)) {
        toast({
          title: "Check your credentials",
          description: config.idValidationMessage,
          variant: "destructive",
        });
        return;
      }
    }

    if (requiresEmailEntry) {
      const normalizedEmail = email.trim().toLowerCase();
      setEmail(normalizedEmail);
      const emailMessage = validateEmailForRole(normalizedEmail, config);

      if (emailMessage) {
        toast({
          title: "Resolve Email Requirement",
          description: emailMessage,
          variant: "destructive",
        });
        return;
      }
    }

    toast({
      title: "Credentials Recorded",
      description: "Proceed to secure authentication.",
    });
    setCurrentStep(2);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const missingServiceId = showServiceIdField && !serviceId;
    const missingEmail = requiresEmailEntry && !email.trim();

    if (!userType || missingServiceId || missingEmail || !password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const config = roleConfigurations[userType as RoleKey];

    if (showServiceIdField) {
      const normalizedId = computeNormalizedId(serviceId, config);
      setServiceId(normalizedId);

      if (!validateServiceId(normalizedId, config)) {
        toast({
          title: "Credential Validation Failed",
          description: config.idValidationMessage,
          variant: "destructive",
        });
        return;
      }
    }

    if (requiresEmailEntry) {
      const normalizedEmail = email.trim().toLowerCase();
      setEmail(normalizedEmail);
      const emailMessage = validateEmailForRole(normalizedEmail, config);

      if (emailMessage) {
        toast({
          title: "Email Validation Failed",
          description: emailMessage,
          variant: "destructive",
        });
        return;
      }
    }

    if (!PASSWORD_POLICY_REGEX.test(password)) {
      setPasswordError(baselinePasswordMessage);
      toast({
        title: "Password Policy Enforcement",
        description: baselinePasswordMessage,
        variant: "destructive",
      });
      return;
    }

    if (config.passwordPolicy) {
      const { minLength, requireSpecialCharacter, message } = config.passwordPolicy;
      const specialCharacterRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
      if (
        password.length < minLength ||
        (requireSpecialCharacter && !specialCharacterRegex.test(password))
      ) {
        setPasswordError(message);
        toast({
          title: "Password Policy Enforcement",
          description: message,
          variant: "destructive",
        });
        return;
      }
    }

    setPasswordError("");

    // Simulate login attempt
    const loginSuccess = Math.random() > 0.3; // 70% success rate for demo
    
    if (loginSuccess) {
      setCurrentStep(3);
      clearOtpTimer();
      setOtpSent(false);
      setOtpCountdown(0);
      setOtpCode("");
      toast({
        title: "Credentials Verified",
        description: "Please complete MFA authentication.",
      });
    } else {
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);
      
      if (newFailedAttempts >= 3) {
        setIsLocked(true);
        toast({
          title: "Account Locked",
          description: "Too many failed attempts. Your account is locked for 60 minutes.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login Failed",
          description: `Invalid credentials. ${3 - newFailedAttempts} attempts remaining.`,
          variant: "destructive",
        });
      }
    }
  };

  const handleMFAVerify = (e: React.FormEvent) => {
    e.preventDefault();

    if (mfaMethod === "sms") {
      if (phoneNumber.length < 10) {
        setPhoneError("Enter a valid phone number (10-15 digits).");
        toast({
          title: "Phone number required",
          description: "Provide a reachable contact number for OTP fallback.",
          variant: "destructive",
        });
        return;
      }

      if (!otpSent) {
        toast({
          title: "Send OTP",
          description: "Tap 'Send OTP' before entering the verification code.",
          variant: "destructive",
        });
        return;
      }

      if (otpCountdown === 0) {
        toast({
          title: "OTP Expired",
          description: "Your one-time code has expired. Request a new OTP.",
          variant: "destructive",
        });
        return;
      }
    }

    if (otpCode.length === 6) {
      clearOtpTimer();
      setOtpCountdown(0);
      setOtpSent(false);
      toast({
        title: "Authentication Successful",
        description: "Redirecting to dashboard...",
      });
      // Here you would redirect based on user role
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit code.",
        variant: "destructive",
      });
    }
  };
  let pageContent: JSX.Element;

  if (isLocked) {
    pageContent = (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-[hsl(213,100%,18%)]">Account Locked</h2>
          <p className="text-sm text-[hsl(0,0%,31%)] mt-2">Security measure activated</p>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Too many failed attempts. Your account is temporarily locked for {lockoutTime} minutes. Contact Admin or wait for the lockout period to expire.
          </AlertDescription>
        </Alert>

        <div className="text-center py-8">
          <div className="text-6xl font-bold text-[hsl(213,100%,18%)] mb-2">
            {lockoutTime}:00
          </div>
          <p className="text-sm text-[hsl(0,0%,31%)]">Time remaining</p>
        </div>

        <Button disabled className="w-full" size="lg">
          Request Unlock (Disabled)
        </Button>

        <div className="text-center">
          <Button variant="link" onClick={() => setShowNCRPModal(true)}>
            Unauthorized? Visit NCRP
          </Button>
        </div>
      </div>
    );
  } else if (currentStep === 3) {
    pageContent = (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-[hsl(213,100%,18%)]">Multi-Factor Authentication</h2>
          <p className="text-sm text-[hsl(0,0%,31%)] mt-2">Secure your access with MFA</p>
        </div>

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Choose your preferred authentication method
          </AlertDescription>
        </Alert>

        <form onSubmit={handleMFAVerify} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mfa-option">MFA Method</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3" role="radiogroup" id="mfa-option">
              <button
                type="button"
                onClick={() => handleMfaMethodChange("totp")}
                className={`rounded-lg border p-4 text-left transition shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[hsl(213,100%,18%)] ${
                  mfaMethod === "totp"
                    ? "border-[hsl(213,100%,18%)] bg-[hsl(210,40%,96.1%)]"
                    : "border-[hsl(213,100%,18%)]/20 bg-white"
                }`}
                role="radio"
                aria-checked={mfaMethod === "totp"}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    mfaMethod === "totp"
                      ? "bg-[hsl(213,100%,18%)] text-white"
                      : "bg-[hsl(213,100%,18%)]/10 text-[hsl(213,100%,18%)]"
                  }`}>
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-[hsl(213,100%,18%)]">Authenticator App</p>
                    <p className="text-xs text-[hsl(0,0%,45%)]">
                      Use TOTP codes from your registered authenticator.
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleMfaMethodChange("sms")}
                className={`rounded-lg border p-4 text-left transition shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[hsl(213,100%,18%)] ${
                  mfaMethod === "sms"
                    ? "border-[hsl(213,100%,18%)] bg-[hsl(210,40%,96.1%)]"
                    : "border-[hsl(213,100%,18%)]/20 bg-white"
                } ${currentRoleConfig?.enforcedMfaMethod === "totp" ? "opacity-60 cursor-not-allowed" : "hover:shadow-md"}`}
                role="radio"
                aria-checked={mfaMethod === "sms"}
                aria-disabled={currentRoleConfig?.enforcedMfaMethod === "totp"}
                disabled={currentRoleConfig?.enforcedMfaMethod === "totp"}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    mfaMethod === "sms"
                      ? "bg-[hsl(213,100%,18%)] text-white"
                      : "bg-[hsl(213,100%,18%)]/10 text-[hsl(213,100%,18%)]"
                  }`}>
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-[hsl(213,100%,18%)]">SMS OTP</p>
                    <p className="text-xs text-[hsl(0,0%,45%)]">
                      Receive one-time codes on your registered device.
                    </p>
                  </div>
                </div>
              </button>
            </div>
            {currentRoleConfig?.enforcedMfaMethod === "totp" && (
              <p className="text-xs text-[hsl(0,0%,45%)]">
                Authenticator-based MFA is enforced for this role.
              </p>
            )}
          </div>

          {mfaMethod === "sms" && (
            <div className="space-y-2">
              <Label htmlFor="phone">Registered Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="e.g., +91 9876543210"
                value={phoneNumber}
                onChange={(e) => handlePhoneChange(e.target.value)}
                maxLength={15}
                aria-invalid={Boolean(phoneError)}
              />
              {phoneError ? (
                <p className="text-xs text-[hsl(0,84%,60%)]">{phoneError}</p>
              ) : (
                <p className="text-xs text-[hsl(0,0%,45%)]">
                  Provide a reachable number for SMS delivery.
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSendOtp}
                  disabled={otpCountdown > 0}
                >
                  {otpSent
                    ? otpCountdown > 0
                      ? `Resend in ${formatCountdown(otpCountdown)}`
                      : "Resend OTP"
                    : "Send OTP"}
                </Button>
                {otpSent && (
                  <p
                    className={`text-xs ${
                      otpCountdown > 0
                        ? "text-[hsl(122,39%,49%)]"
                        : "text-[hsl(0,84%,60%)]"
                    }`}
                  >
                    {otpCountdown > 0
                      ? `OTP sent to ***-***-${phoneNumber.slice(-4)}. Valid for ${formatCountdown(otpCountdown)}.`
                      : "OTP expired. Tap resend to get a fresh code."}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="otp">
              {mfaMethod === "totp" ? "Authenticator Code" : "SMS Code"}
            </Label>
            <Input
              id="otp"
              type="text"
              placeholder="Enter 6-digit code"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              className="text-center text-2xl tracking-widest"
            />
            <p className="text-xs text-[hsl(0,0%,31%)]">
              {mfaMethod === "totp"
                ? "Enter the code from your authenticator app"
                : `Enter the code we just sent to your device`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="remember" className="rounded" />
            <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
              Remember this device for 1 week
            </Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
              Back
            </Button>
            <Button type="submit" className="w-full" size="lg">
              Verify & Login
            </Button>
          </div>

          <div className="text-center">
            <Button variant="link" size="sm">
              Use backup code
            </Button>
          </div>
        </form>
      </div>
    );
  } else {
    pageContent = (
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-[hsl(213,100%,18%)]">Sign in to Defence Cyber Portal</h2>
            <p className="text-sm text-[hsl(0,0%,31%)] mt-2">Complete the secure login steps</p>
          </div>

          <div className="flex items-center gap-3">
            {steps.map((step) => (
              <div key={step.id} className="flex-1 flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep >= step.id
                      ? "bg-gradient-to-br from-[hsl(207,90%,54%)] to-[hsl(213,100%,18%)] text-white"
                      : "bg-[hsl(213,100%,18%)]/10 text-[hsl(213,100%,18%)]"
                  }`}
                >
                  {step.id}
                </div>
                <div className="hidden md:block">
                  <p className="text-xs font-semibold text-[hsl(213,100%,18%)]">{step.title}</p>
                  <p className="text-[10px] text-[hsl(0,0%,31%)]">{step.description}</p>
                </div>
                {step.id !== steps.length && (
                  <div
                    className={`flex-1 h-0.5 rounded ${
                      currentStep > step.id
                        ? "bg-[hsl(207,90%,54%)]"
                        : "bg-[hsl(213,100%,18%)]/10"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {failedAttempts > 0 && failedAttempts < 3 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {failedAttempts} failed attempt(s). {3 - failedAttempts} remaining before lockout.
            </AlertDescription>
          </Alert>
        )}

        {currentStep === 1 && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              <div className="space-y-2 md:col-span-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="userType" className="flex-1">Select Your Role *</Label>
                  <span className="inline-flex w-4 h-4" aria-hidden="true" />
                </div>
                <Select value={userType} onValueChange={handleRoleChange}>
                  <SelectTrigger id="userType">
                    <SelectValue placeholder="Select Your Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {showServiceIdField && (
                <div
                  className={`space-y-2 ${
                    requiresEmailEntry ? "md:col-span-1" : "md:col-span-2"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Label htmlFor="serviceId" className="flex-1">
                      {(currentRoleConfig?.idLabel ?? "Credential ID")} *
                    </Label>
                    {currentRoleConfig && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="text-[hsl(213,100%,18%)]/70 hover:text-[hsl(213,100%,18%)] focus:outline-none inline-flex h-5 w-5 items-center justify-center"
                            aria-label="Role credential guidance"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs leading-relaxed">
                          {currentRoleConfig.tooltip}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <Input
                    id="serviceId"
                    type="text"
                    placeholder={currentRoleConfig?.placeholder ?? "Enter credential"}
                    value={serviceId}
                    onChange={(e) => handleServiceIdChange(e.target.value)}
                    autoComplete="off"
                    aria-invalid={Boolean(serviceIdError)}
                  />
                  {serviceIdError ? (
                    <p className="text-xs text-[hsl(0,84%,60%)]">{serviceIdError}</p>
                  ) : currentRoleConfig ? (
                    <p className="text-xs text-[hsl(0,0%,45%)]">{currentRoleConfig.tooltip}</p>
                  ) : null}
                </div>
              )}

              {requiresEmailEntry && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="officialEmail">
                    {currentRoleConfig?.inputType === "email"
                      ? `${currentRoleConfig.idLabel} *`
                      : "Official Defence Email *"}
                  </Label>
                  <Input
                    id="officialEmail"
                    type="email"
                    placeholder={currentRoleConfig?.inputType === "email" ? currentRoleConfig.placeholder : "yourname@army.mil.in"}
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    autoComplete="off"
                    aria-invalid={Boolean(emailError)}
                  />
                  {emailError ? (
                    <p className="text-xs text-[hsl(0,84%,60%)]">{emailError}</p>
                  ) : currentRoleConfig?.emailWarningMessage ? (
                    <p className="text-xs text-[hsl(25,95%,60%)]">{currentRoleConfig.emailWarningMessage}</p>
                  ) : currentRoleConfig?.tooltip ? (
                    <p className="text-xs text-[hsl(0,0%,45%)]">{currentRoleConfig.tooltip}</p>
                  ) : (
                    <p className="text-xs text-[hsl(0,0%,45%)]">Use your authorised defence email for verification.</p>
                  )}
                </div>
              )}
            </div>

            {roleSecurityMessages.length > 0 && (
              <div className="bg-[hsl(210,40%,96.1%)] border border-[hsl(213,100%,18%)]/15 rounded-lg p-3 text-xs text-[hsl(0,0%,31%)] space-y-1">
                <p className="font-semibold text-[hsl(213,100%,18%)] text-xs uppercase tracking-wide">
                  Role security notes
                </p>
                <ul className="space-y-1 list-disc list-inside">
                  {roleSecurityMessages.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
            )}

            <Collapsible>
              <CollapsibleTrigger className="text-sm text-[hsl(207,90%,54%)] hover:underline">
                What proofs we accept?
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="bg-[hsl(210,40%,96.1%)] p-4 rounded-lg text-sm space-y-2">
                  <p className="font-semibold">Accepted Identification Documents:</p>
                  <div className="grid gap-2 text-[hsl(0,0%,31%)] sm:grid-cols-2">
                    <p>• SPARSH ID (Service Personnel)</p>
                    <p>• Defence Force ID (D-FID)</p>
                    <p>• Service Number</p>
                    <p>• Pension Payment Order (PPO)</p>
                    <p>• ECHS Card Number</p>
                    <p>• Dependent ID Card</p>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Button type="submit" className="w-full" size="lg">
              Continue to Security Check
            </Button>
          </form>
        )}

        {currentStep === 2 && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  aria-invalid={Boolean(passwordError)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(0,0%,31%)] hover:text-[hsl(213,100%,18%)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError ? (
                <p className="text-xs text-[hsl(0,84%,60%)]">{passwordError}</p>
              ) : (
                <Collapsible>
                  <div className="flex items-center gap-2 text-xs text-[hsl(0,0%,45%)]">
                    <span>Must satisfy the requirements below.</span>
                    <CollapsibleTrigger className="text-[hsl(207,90%,54%)] hover:underline">
                      View policy
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent className="mt-2">
                    <div className="bg-[hsl(210,40%,96.1%)] border border-[hsl(213,100%,18%)]/15 rounded-lg p-4 space-y-2">
                      <p className="text-sm font-semibold text-[hsl(213,100%,18%)]">Password policy</p>
                      <p className="text-xs text-[hsl(0,0%,31%)]">
                        Ensure your password complies with the security standards below.
                      </p>
                      <ul className="text-xs text-[hsl(0,0%,31%)] list-disc list-inside space-y-1">
                        {passwordPolicyMessages.map((policy) => (
                          <li key={policy}>{policy}</li>
                        ))}
                      </ul>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>

            {currentRoleConfig?.requiresMfa && (
              <div className="bg-[hsl(210,40%,96.1%)] border border-[hsl(213,100%,18%)]/15 rounded-lg p-3 text-xs text-[hsl(0,0%,31%)]">
                Multi-factor authentication is mandatory for the selected role. Authenticator enforcement applies where specified.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
              <Button type="submit" className="w-full" size="lg">
                Verify & Proceed to MFA
              </Button>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setShowSSOModal(true)}
            >
              Sign in via Defence SSO
            </Button>

            <div className="text-center">
              <Button variant="link" size="sm">
                Forgot password?
              </Button>
            </div>
          </form>
        )}

        <div className="text-center pt-2">
          <Button variant="link" size="sm" onClick={() => setShowVPNModal(true)}>
            Network verification help
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <>
        {pageContent}

        {/* SSO Modal */}
        <Dialog open={showSSOModal} onOpenChange={setShowSSOModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Defence SSO Authentication</DialogTitle>
              <DialogDescription>
                Defence Single Sign-On (SSO) allows you to use your enterprise credentials to access the portal securely.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm">
                You will be redirected to the official Defence authentication gateway. Please ensure you have your:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 text-[hsl(0,0%,31%)]">
                <li>Enterprise User ID</li>
                <li>Digital Certificate (if required)</li>
                <li>Hardware token (if applicable)</li>
              </ul>
              <Button className="w-full" onClick={() => toast({ title: "SSO redirect initiated" })}>
                Continue to SSO Gateway
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* VPN Warning Modal */}
        <Dialog open={showVPNModal} onOpenChange={setShowVPNModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[hsl(25,95%,60%)]" />
                Unverified Network Detected
              </DialogTitle>
              <DialogDescription>
                You appear to be accessing from a VPN or proxy network.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm">
                Your network connection could not be verified. You may continue, but this activity will be flagged for security review.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowVPNModal(false)}>
                  Cancel Login
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    setShowVPNModal(false);
                    toast({ title: "Login flagged", description: "Proceeding with security flag." });
                  }}
                >
                  Continue Anyway
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* NCRP Redirect Modal */}
        <Dialog open={showNCRPModal} onOpenChange={setShowNCRPModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Redirect to NCRP</DialogTitle>
              <DialogDescription>
                National Cybercrime Reporting Portal
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm">
                If you believe you are unauthorized or have witnessed cybercrime activity, you can report it to the National Cybercrime Reporting Portal (NCRP).
              </p>
              <Alert>
                <AlertDescription className="text-xs">
                  You will be redirected to: <strong>cybercrime.gov.in</strong>
                </AlertDescription>
              </Alert>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowNCRPModal(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    toast({ title: "Redirecting to NCRP..." });
                    window.open("https://cybercrime.gov.in", "_blank");
                    setShowNCRPModal(false);
                  }}
                >
                  Redirect to NCRP
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    </TooltipProvider>
  );
};

export default LoginForm;
