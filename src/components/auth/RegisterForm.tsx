import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Smartphone, CheckCircle2, Clock, QrCode, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { roleConfigurations, roleOptions, RoleKey, RoleConfig, defenceEmailPattern } from "@/lib/roleConfig";

const RegisterForm = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [userType, setUserType] = useState<RoleKey | "">("");
  const [serviceId, setServiceId] = useState("");
  const [serviceIdError, setServiceIdError] = useState("");
  const [unit, setUnit] = useState("");
  const [mfaMethod, setMfaMethod] = useState<"totp" | "sms">("totp");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showMFASetup, setShowMFASetup] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailWarning, setEmailWarning] = useState("");
  const { toast } = useToast();

  const steps = [
    { id: 1, title: "Identity", description: "Who are you?" },
    { id: 2, title: "Service", description: "Defence credentials" },
    { id: 3, title: "Security", description: "MFA & consent" },
    { id: 4, title: "Activate", description: "Secure account" },
  ];

  const currentRoleConfig = useMemo<RoleConfig | undefined>(
    () => (userType ? roleConfigurations[userType] : undefined),
    [userType]
  );

  const roleSecurityMessages = useMemo(
    () =>
      currentRoleConfig
        ? [
            ...(currentRoleConfig.securityNotes ?? []),
            ...(currentRoleConfig.highPrivilege ? ["High-privilege monitoring enabled."] : []),
            ...(currentRoleConfig.readOnlyRole ? ["Access is read-only after approval."] : []),
          ]
        : [],
    [currentRoleConfig]
  );

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

  const resetEmailMessages = () => {
    setEmailError("");
    setEmailWarning("");
  };

  const evaluateEmailAgainstRole = (
    config?: RoleConfig,
    providedEmail?: string,
    roleKey?: RoleKey
  ) => {
    resetEmailMessages();

    if (!config) {
      return;
    }

    const candidate = (providedEmail ?? email).trim().toLowerCase();
    if (!candidate) {
      return;
    }

    if (config.emailWhitelist && !config.emailWhitelist.includes(candidate)) {
      setEmailError("Email not listed in the approved roster.");
      return;
    }

    if (config.requiresDefenceEmail && config.emailPattern && !config.emailPattern.test(candidate)) {
      setEmailError(config.emailErrorMessage ?? "Official defence email required.");
      return;
    }

    if (config.emailPattern && !config.emailPattern.test(candidate)) {
      if (config.emailWarningMessage) {
        setEmailWarning(config.emailWarningMessage);
      }
      return;
    }

    if (roleKey === "family" && !defenceEmailPattern.test(candidate)) {
      setEmailWarning(
        config.emailWarningMessage ?? "Non-defence email detected. Manual verification required."
      );
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    evaluateEmailAgainstRole(currentRoleConfig, value, userType || undefined);
  };

  const handleRoleChange = (value: string) => {
    const roleKey = value as RoleKey;
    setUserType(roleKey);
    setServiceId("");
    setServiceIdError("");
    evaluateEmailAgainstRole(roleConfigurations[roleKey], undefined, roleKey);
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

  const handleMfaMethodChange = (value: string) => {
    if (currentRoleConfig?.enforcedMfaMethod) {
      setMfaMethod(currentRoleConfig.enforcedMfaMethod);
      return;
    }

    setMfaMethod(value === "sms" ? "sms" : "totp");
  };

  const validateServiceId = (value: string, config: RoleConfig) => {
    if (!value) {
      const message = `Provide your ${config.idLabel}.`;
      setServiceIdError(message);
      return message;
    }

    if (!config.idPattern.test(value)) {
      setServiceIdError(config.idValidationMessage);
      return config.idValidationMessage;
    }

    if (config.inputType === "email") {
      if (config.emailWhitelist && !config.emailWhitelist.includes(value)) {
        const message = "Email not listed in the approved roster.";
        setServiceIdError(message);
        return message;
      }
      if (config.emailPattern && !config.emailPattern.test(value)) {
        const message = config.emailErrorMessage ?? config.idValidationMessage;
        setServiceIdError(message);
        return message;
      }
    }

    setServiceIdError("");
    return null;
  };

  useEffect(() => {
    if (currentRoleConfig?.enforcedMfaMethod && mfaMethod !== currentRoleConfig.enforcedMfaMethod) {
      setMfaMethod(currentRoleConfig.enforcedMfaMethod);
    }
  }, [currentRoleConfig?.enforcedMfaMethod, mfaMethod]);

  const handleIdentityStep = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !mobile) {
      toast({
        title: "Details Needed",
        description: "Provide your name, email, and mobile number.",
        variant: "destructive",
      });
      return;
    }

    if (mobile.length < 10 || mobile.length > 15) {
      toast({
        title: "Invalid Mobile Number",
        description: "Please enter a valid mobile number (10-15 digits).",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Identity Confirmed",
      description: "Next, share your service credentials.",
    });
    setCurrentStep(2);
  };

  const handleServiceStep = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userType) {
      toast({
        title: "Select Your Role",
        description: "Choose your role to continue registration.",
        variant: "destructive",
      });
      return;
    }

    const config = roleConfigurations[userType];
    const normalizedId = computeNormalizedId(serviceId, config);
    setServiceId(normalizedId);

    const serviceIdMessage = validateServiceId(normalizedId, config);
    if (serviceIdMessage) {
      toast({
        title: "Check your credentials",
        description: serviceIdMessage,
        variant: "destructive",
      });
      return;
    }

    if (emailError) {
      toast({
        title: "Resolve Email Requirement",
        description: emailError,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Service Details Saved",
      description: "Configure security preferences.",
    });
    setCurrentStep(3);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      toast({
        title: "Accept Terms",
        description: "Confirm eligibility to proceed.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitted(true);
    setCurrentStep(4);

    // Simulate verification process
    setTimeout(() => {
      const isDefenceEmail = defenceEmailPattern.test(email.toLowerCase());
      setIsVerified(isDefenceEmail);

      if (isDefenceEmail) {
        toast({
          title: "Verification Successful",
          description: "Your Defence credentials have been verified.",
        });
        setShowMFASetup(true);
      } else {
        toast({
          title: "Manual Review Required",
          description: "Your registration will be reviewed by an administrator.",
        });
      }
    }, 2500);
  };

  if (isSubmitted && !isVerified && !emailError) {
    return (
      <div className="space-y-6 text-center py-8">
        <div className="flex justify-center">
          <div className="w-16 h-16 border-4 border-[hsl(213,100%,18%)] border-t-transparent rounded-full animate-spin" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[hsl(213,100%,18%)]">Verification in Progress</h2>
          <p className="text-sm text-[hsl(0,0%,31%)] mt-2">
            Validating your credentials with Defence systems...
          </p>
        </div>
      </div>
    );
  }

  if (isSubmitted && !isVerified && emailError) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-[hsl(213,100%,18%)]">Manual Review Required</h2>
          <p className="text-sm text-[hsl(0,0%,31%)] mt-2">Your registration is pending verification</p>
        </div>

        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Your registration has been submitted for manual review. You'll receive an email notification once your account is verified by an administrator.
          </AlertDescription>
        </Alert>

        <div className="bg-[hsl(210,40%,96.1%)] p-4 rounded-lg space-y-2">
          <h3 className="font-semibold text-sm">What happens next?</h3>
          <ul className="text-sm space-y-1 text-[hsl(0,0%,31%)]">
            <li>• Admin team will verify your credentials</li>
            <li>• Review typically takes 24-48 hours</li>
            <li>• You'll receive email notification</li>
            <li>• Once approved, you can set up MFA and login</li>
          </ul>
        </div>

        <Button variant="outline" className="w-full" onClick={() => {
          setIsSubmitted(false);
          setIsVerified(false);
          setShowMFASetup(false);
          setCurrentStep(1);
        }}>
          Submit Another Registration
        </Button>
      </div>
    );
  }

  if (showMFASetup) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-[hsl(213,100%,18%)]">Set Up Multi-Factor Authentication</h2>
          <p className="text-sm text-[hsl(0,0%,31%)] mt-2">Secure your account with MFA</p>
        </div>

        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Account created successfully! Now let's secure it with MFA.
          </AlertDescription>
        </Alert>

        {mfaMethod === "totp" ? (
          <div className="space-y-4">
            <div className="bg-[hsl(210,40%,96.1%)] p-6 rounded-lg text-center space-y-4">
              <QrCode className="w-24 h-24 mx-auto text-[hsl(213,100%,18%)]" />
              <p className="text-sm font-medium">Scan this QR code with your authenticator app</p>
              <p className="text-xs text-[hsl(0,0%,31%)]">
                Use Google Authenticator, Microsoft Authenticator, or any TOTP-compatible app
              </p>
            </div>

            <div className="space-y-2">
              <Label>Manual Entry Key</Label>
              <Input 
                value="JBSWY3DPEHPK3PXP" 
                readOnly 
                className="font-mono text-center"
              />
              <p className="text-xs text-[hsl(0,0%,31%)]">
                Use this if you can't scan the QR code
              </p>
            </div>

            <div className="bg-[hsl(25,95%,60%)]/10 border border-[hsl(25,95%,60%)]/20 p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">Backup Codes</h4>
              <p className="text-xs text-[hsl(0,0%,31%)]">
                Save these codes securely. Each can be used once if you lose access to your authenticator.
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-sm">
                <code className="bg-white p-2 rounded">ABC-123-XYZ</code>
                <code className="bg-white p-2 rounded">DEF-456-UVW</code>
                <code className="bg-white p-2 rounded">GHI-789-RST</code>
                <code className="bg-white p-2 rounded">JKL-012-OPQ</code>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertDescription>
                A 6-digit code will be sent to your registered mobile number: ***-***-{mobile.slice(-4)}
              </AlertDescription>
            </Alert>
            <p className="text-sm text-[hsl(0,0%,31%)]">
              You'll receive an SMS code every time you log in. Standard SMS charges may apply.
            </p>
          </div>
        )}

        <Button className="w-full" size="lg" onClick={() => {
          toast({
            title: "MFA Setup Complete",
            description: "Your account is now secure. Redirecting to login...",
          });
        }}>
          Complete Setup & Continue
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-[hsl(213,100%,18%)]">Register for Access</h2>
          <p className="text-sm text-[hsl(0,0%,31%)] mt-2">Follow the guided onboarding steps</p>
        </div>

        <div className="flex items-center gap-3">
          {steps.map((step) => (
            <div key={step.id} className="flex-1 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${
                currentStep >= step.id
                  ? "bg-gradient-to-br from-[hsl(207,90%,54%)] to-[hsl(213,100%,18%)] text-white"
                  : "bg-[hsl(213,100%,18%)]/10 text-[hsl(213,100%,18%)]"
              }`}>
                {step.id}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-semibold text-[hsl(213,100%,18%)]">
                  {step.title}
                </p>
                <p className="text-[10px] text-[hsl(0,0%,31%)]">
                  {step.description}
                </p>
              </div>
              {step.id !== steps.length && (
                <div className={`flex-1 h-0.5 rounded ${currentStep > step.id ? "bg-[hsl(207,90%,54%)]" : "bg-[hsl(213,100%,18%)]/10"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {currentStep === 1 && (
        <form onSubmit={handleIdentityStep} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number *</Label>
              <Input
                id="mobile"
                type="tel"
                placeholder="+91 XXXXXXXXXX"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="yourname@army.mil.in"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
            />
            {emailError ? (
              <p className="text-xs text-[hsl(0,84%,60%)]">{emailError}</p>
            ) : emailWarning ? (
              <p className="text-xs text-[hsl(25,95%,60%)]">{emailWarning}</p>
            ) : email ? (
              <p className="text-xs text-[hsl(122,39%,49%)] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Email domain verified
              </p>
            ) : null}
          </div>

          <Button type="submit" className="w-full" size="lg">
            Continue to Service Details
          </Button>
        </form>
      )}

      {currentStep === 2 && (
        <form onSubmit={handleServiceStep} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="userType">Select Your Role *</Label>
              <Select value={userType} onValueChange={handleRoleChange}>
                <SelectTrigger id="userType">
                  <SelectValue placeholder="Select role" />
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

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="serviceId">
                  {(currentRoleConfig?.idLabel ?? "Credential ID")} *
                </Label>
                {currentRoleConfig && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="text-[hsl(213,100%,18%)]/70 hover:text-[hsl(213,100%,18%)] focus:outline-none"
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
                type={currentRoleConfig?.inputType ?? "text"}
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Unit / Organization (Optional)</Label>
            <Input
              id="unit"
              type="text"
              placeholder="Enter your unit or organization"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
              Back
            </Button>
            <Button type="submit" className="w-full" size="lg">
              Continue to Security Preferences
            </Button>
          </div>
        </form>
      )}

      {currentStep === 3 && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Preferred MFA Method *</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="totp"
                  name="mfa"
                  value="totp"
                  checked={mfaMethod === "totp"}
                  onChange={(e) => handleMfaMethodChange(e.target.value)}
                  className="rounded-full"
                />
                <Label htmlFor="totp" className="font-normal cursor-pointer flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  TOTP Authenticator App (Recommended)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="sms"
                  name="mfa"
                  value="sms"
                  checked={mfaMethod === "sms"}
                  onChange={(e) => handleMfaMethodChange(e.target.value)}
                  disabled={currentRoleConfig?.enforcedMfaMethod === "totp"}
                  className="rounded-full"
                />
                <Label htmlFor="sms" className="font-normal cursor-pointer flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  SMS OTP (Fallback)
                </Label>
              </div>
            </div>
            <p className="text-xs text-[hsl(0,0%,31%)]">
              {currentRoleConfig?.enforcedMfaMethod === "totp"
                ? "Authenticator-based MFA is enforced for this role."
                : "TOTP offers higher security and works offline"}
            </p>
          </div>

          <Collapsible>
            <CollapsibleTrigger className="text-sm text-[hsl(207,90%,54%)] hover:underline">
              What proofs we accept?
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="bg-[hsl(210,40%,96.1%)] p-4 rounded-lg text-sm space-y-2">
                <p className="font-semibold">Accepted Identification Documents:</p>
                <ul className="space-y-1 text-[hsl(0,0%,31%)]">
                  <li>• SPARSH ID (Service Personnel)</li>
                  <li>• Defence Force ID (D-FID)</li>
                  <li>• Service Number</li>
                  <li>• Pension Payment Order (PPO)</li>
                  <li>• ECHS Card Number</li>
                  <li>• Dependent ID Card</li>
                </ul>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="flex items-start gap-2 py-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 rounded"
            />
            <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
              I confirm I am a verified Defence personnel / family member / veteran and understand access restrictions *
            </Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
              Back
            </Button>
            <Button type="submit" className="w-full" size="lg">
              Submit for Verification
            </Button>
          </div>
        </form>
      )}

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription className="text-xs">
          All registrations are verified. False information may result in legal action.
        </AlertDescription>
      </Alert>
      </div>
    </TooltipProvider>
  );
};

export default RegisterForm;
