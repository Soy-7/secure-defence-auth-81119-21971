import { ReactNode } from "react";
import { Shield } from "lucide-react";
import cyberIllustration from "@/assets/cyber-illustration.png";

interface AuthLayoutProps {
  children: ReactNode;
  activeTab?: "login" | "register";
}

const AuthLayout = ({ children, activeTab = "login" }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[hsl(213,100%,18%)] to-[hsl(211,56%,21%)] flex items-center justify-center p-4">
      <div className="w-full max-w-[1400px] bg-gradient-to-br from-white to-[hsl(210,40%,98%)] rounded-xl shadow-[0_20px_50px_-12px_rgb(0,0,0,0.25)] overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0 min-h-[600px]">
          {/* Left Column - Illustration & Stepper */}
          <div className="bg-white p-8 lg:p-12 flex flex-col justify-between border-r border-[hsl(220,13%,91%)]">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <Shield className="w-10 h-10 text-[hsl(213,100%,18%)]" />
                <div>
                  <h1 className="text-2xl font-bold text-[hsl(213,100%,18%)]">Defence Cyber Portal</h1>
                  <p className="text-sm text-[hsl(0,0%,31%)]">Secure Access System</p>
                </div>
              </div>

              {/* Illustration */}
              <div className="flex items-center justify-center py-4">
                <img 
                  src={cyberIllustration} 
                  alt="Cybersecurity Operations Center" 
                  className="w-full max-w-[420px] h-auto object-contain"
                />
              </div>
            </div>

            {/* Stepper - Different for Login and Register */}
            <div className="space-y-4 mt-8">
              <h3 className="text-sm font-semibold text-[hsl(0,0%,45%)] uppercase tracking-wide">
                {activeTab === "login" ? "Login Process" : "Registration Process"}
              </h3>
              
              <div className="space-y-3">
                {activeTab === "login" ? (
                  <>
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[hsl(207,90%,54%)] to-[hsl(213,100%,18%)] flex items-center justify-center text-white text-sm font-bold shadow-md">1</div>
                        <div className="w-0.5 h-8 bg-gradient-to-b from-[hsl(207,90%,54%)] to-[hsl(220,13%,91%)]"></div>
                      </div>
                      <div className="flex-1 pt-1.5">
                        <p className="text-sm font-semibold text-[hsl(213,100%,18%)]">Enter Credentials</p>
                        <p className="text-xs text-[hsl(0,0%,45%)]">User type & service ID</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[hsl(207,90%,54%)] to-[hsl(213,100%,18%)] flex items-center justify-center text-white text-sm font-bold shadow-md">2</div>
                        <div className="w-0.5 h-8 bg-gradient-to-b from-[hsl(207,90%,54%)] to-[hsl(220,13%,91%)]"></div>
                      </div>
                      <div className="flex-1 pt-1.5">
                        <p className="text-sm font-semibold text-[hsl(213,100%,18%)]">MFA Verification</p>
                        <p className="text-xs text-[hsl(0,0%,45%)]">2FA authentication</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[hsl(207,90%,54%)] to-[hsl(213,100%,18%)] flex items-center justify-center text-white text-sm font-bold shadow-md">3</div>
                      </div>
                      <div className="flex-1 pt-1.5">
                        <p className="text-sm font-semibold text-[hsl(213,100%,18%)]">Access Dashboard</p>
                        <p className="text-xs text-[hsl(0,0%,45%)]">Portal access granted</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[hsl(207,90%,54%)] to-[hsl(213,100%,18%)] flex items-center justify-center text-white text-sm font-bold shadow-md">1</div>
                        <div className="w-0.5 h-8 bg-gradient-to-b from-[hsl(207,90%,54%)] to-[hsl(220,13%,91%)]"></div>
                      </div>
                      <div className="flex-1 pt-1.5">
                        <p className="text-sm font-semibold text-[hsl(213,100%,18%)]">Submit Details</p>
                        <p className="text-xs text-[hsl(0,0%,45%)]">Personal & service info</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[hsl(207,90%,54%)] to-[hsl(213,100%,18%)] flex items-center justify-center text-white text-sm font-bold shadow-md">2</div>
                        <div className="w-0.5 h-8 bg-gradient-to-b from-[hsl(207,90%,54%)] to-[hsl(220,13%,91%)]"></div>
                      </div>
                      <div className="flex-1 pt-1.5">
                        <p className="text-sm font-semibold text-[hsl(213,100%,18%)]">Verification</p>
                        <p className="text-xs text-[hsl(0,0%,45%)]">Credential validation</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[hsl(207,90%,54%)] to-[hsl(213,100%,18%)] flex items-center justify-center text-white text-sm font-bold shadow-md">3</div>
                        <div className="w-0.5 h-8 bg-gradient-to-b from-[hsl(207,90%,54%)] to-[hsl(220,13%,91%)]"></div>
                      </div>
                      <div className="flex-1 pt-1.5">
                        <p className="text-sm font-semibold text-[hsl(213,100%,18%)]">Setup MFA</p>
                        <p className="text-xs text-[hsl(0,0%,45%)]">Security configuration</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[hsl(207,90%,54%)] to-[hsl(213,100%,18%)] flex items-center justify-center text-white text-sm font-bold shadow-md">4</div>
                      </div>
                      <div className="flex-1 pt-1.5">
                        <p className="text-sm font-semibold text-[hsl(213,100%,18%)]">Account Active</p>
                        <p className="text-xs text-[hsl(0,0%,45%)]">Ready to login</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Auth Forms */}
          <div className="p-8 lg:p-12 bg-gradient-to-br from-white to-[hsl(210,40%,98%)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
