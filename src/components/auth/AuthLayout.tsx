import { ReactNode } from "react";
import { Shield } from "lucide-react";
import heroVideo from "@/assets/cyber-illustration_sqr.mp4";

interface AuthLayoutProps {
  children: ReactNode;
  activeTab?: "login" | "register";
}

const AuthLayout = ({ children, activeTab = "login" }: AuthLayoutProps) => {
  return (
  <div className="min-h-screen w-full bg-gradient-to-br from-[#14e0ff] via-[#0f6bff] to-[#001b44] flex items-center justify-center p-4">
      <div className="w-full max-w-[1400px] bg-gradient-to-br from-white to-[hsl(210,40%,98%)] rounded-xl shadow-[0_20px_50px_-12px_rgb(0,0,0,0.25)] overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0 min-h-[600px]">
          {/* Left Column - Illustration & Stepper */}
          <div className="bg-white p-8 lg:p-12 flex flex-col justify-between border-r border-[hsl(220,13%,91%)]">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <Shield className="w-10 h-10 text-[#0f6bff]" />
                <div>
                  <h1 className="text-2xl font-bold text-[hsl(213,100%,18%)]">Defence Cyber Portal</h1>
                  <p className="text-sm text-[hsl(0,0%,31%)]">Secure Access System</p>
                </div>
              </div>

              {/* Illustration */}
              <div className="flex items-center justify-center py-4">
                <video
                  className="w-full max-w-[475px] h-auto rounded-xl object-cover"
                  src={heroVideo}
                  autoPlay
                  loop
                  muted
                  playsInline
                  aria-label="Cybersecurity operations overview"
                />
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
