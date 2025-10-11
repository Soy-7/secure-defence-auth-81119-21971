import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Shield, Smartphone, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

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
  const [userType, setUserType] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const { toast } = useToast();

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

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userType || !serviceId) {
      toast({
        title: "Missing Information",
        description: "Select your user type and provide your Service ID to continue.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Credentials Recorded",
      description: "Proceed to secure authentication.",
    });
    setCurrentStep(2);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userType || !serviceId || !password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Simulate login attempt
    const loginSuccess = Math.random() > 0.3; // 70% success rate for demo
    
    if (loginSuccess) {
      setCurrentStep(3);
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

    if (otpCode.length === 6) {
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

  if (isLocked) {
    return (
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
  }

  if (currentStep === 3) {
    return (
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
            <Label>MFA Method</Label>
            <Select value={mfaMethod} onValueChange={(value: "totp" | "sms") => setMfaMethod(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="totp">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    TOTP Authenticator App
                  </div>
                </SelectItem>
                <SelectItem value="sms">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    SMS OTP
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

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
                : `Code sent to registered phone (***-***-${Math.floor(1000 + Math.random() * 9000)})`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="remember" className="rounded" />
            <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
              Remember this device for 1 week
            </Label>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Verify & Login
          </Button>

          <div className="text-center">
            <Button variant="link" size="sm">
              Use backup code
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-[hsl(213,100%,18%)]">Sign in to Defence Cyber Portal</h2>
            <p className="text-sm text-[hsl(0,0%,31%)] mt-2">Complete the secure login steps</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userType">User Type *</Label>
                <Select value={userType} onValueChange={setUserType}>
                  <SelectTrigger id="userType">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personnel">Defence Personnel</SelectItem>
                    <SelectItem value="family">Family Member</SelectItem>
                    <SelectItem value="veteran">Veteran</SelectItem>
                    <SelectItem value="cert">CERT Analyst</SelectItem>
                    <SelectItem value="commander">Commander</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="auditor">Auditor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceId">Service ID *</Label>
                <Input
                  id="serviceId"
                  type="text"
                  placeholder="Enter Service ID"
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                />
              </div>
            </div>

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
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(0,0%,31%)] hover:text-[hsl(213,100%,18%)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

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
              <Button className="flex-1" onClick={() => {
                setShowVPNModal(false);
                toast({ title: "Login flagged", description: "Proceeding with security flag." });
              }}>
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
              <Button className="flex-1" onClick={() => {
                toast({ title: "Redirecting to NCRP..." });
                window.open('https://cybercrime.gov.in', '_blank');
                setShowNCRPModal(false);
              }}>
                Redirect to NCRP
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LoginForm;
