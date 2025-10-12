import { ReactNode } from "react";
import { Shield } from "lucide-react";
import cyberIllustration from "@/assets/cyber-illustration.png";

interface AuthLayoutProps {
  children: ReactNode;
  activeTab?: "login" | "register";
}

const AuthLayout = ({ children, activeTab = "login" }: AuthLayoutProps) => {
  return (
  <div className="min-h-screen w-full bg-gradient-to-br from-[#14e0ff] via-[#0f6bff] to-[#001b44] flex items-center justify-center p-4">
      <div className="w-full max-w-[1200px] bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden">
        <div className="grid md:grid-cols-[480px_1fr] gap-0">
          {/* Left Column - Illustration */}
          <div className="hidden md:flex flex-col bg-gradient-to-br from-[hsl(207,90%,54%)] to-[hsl(213,100%,18%)] p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Defence Cyber Portal</h1>
                    <p className="text-sm text-white/80">Secure Access System</p>
                  </div>
                </div>

                <div className="flex items-center justify-center py-8">
                  <img
                    src={cyberIllustration}
                    alt="Cybersecurity Operations Center"
                    className="w-full max-w-[360px] h-auto object-contain drop-shadow-2xl"
                  />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-xs text-white/90 leading-relaxed">
                  Secure authentication system for defence personnel, family members, and authorized personnel.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Auth Forms */}
          <div className="p-8 lg:p-12 bg-white">
            <div className="md:hidden mb-8 flex items-center gap-3">
              <Shield className="w-8 h-8 text-[hsl(207,90%,54%)]" />
              <div>
                <h1 className="text-lg font-bold text-[hsl(213,100%,18%)]">Defence Cyber Portal</h1>
                <p className="text-xs text-[hsl(0,0%,45%)]">Secure Access System</p>
              </div>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
