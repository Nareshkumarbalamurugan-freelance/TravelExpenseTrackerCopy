import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SEO from "@/components/SEO";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  // const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [otpStep, setOtpStep] = useState<'email'|'otp'|'reset'>('email');
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  // Simulated OTP for demo (replace with real SMS/email OTP in production)
  const generatedOtp = "123456";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await login(email, password);
      if (error) {
        toast({ title: "Login failed", description: error, variant: "destructive" });
      } else {
        navigate("/");
      }
    } catch (error) {
      toast({ title: "Login failed", description: "An unexpected error occurred", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Registration removed per requirements

  // OTP-based password reset flow
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoading(true);
    setOtpError("");
    try {
      // Send password reset email as fallback
      await sendPasswordResetEmail(auth, otpEmail || email);
      // Simulate sending OTP (replace with real SMS/email OTP in production)
      setOtpStep('otp');
      setOtpSent(true);
      toast({ title: "OTP sent", description: "Enter the OTP sent to your email." });
    } catch (err: any) {
      setOtpError(err.message || "Failed to send reset email/OTP");
    }
    setOtpLoading(false);
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");
    if (enteredOtp === generatedOtp) {
      setOtpStep('reset');
      toast({ title: "OTP verified", description: "You can now set a new password." });
    } else {
      setOtpError("Invalid OTP. Please try again.");
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoading(true);
    setOtpError("");
    // In real app, call backend to set new password after OTP verification
    // Here, just show success for demo
    setTimeout(() => {
      setOtpLoading(false);
      setShowForgot(false);
      setOtpStep('email');
      setEnteredOtp("");
      setNewPassword("");
      toast({ title: "Password reset", description: "Your password has been reset. Please login." });
    }, 1200);
  };

  const onMouseDownRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty("--ripple-x", `${x}%`);
    e.currentTarget.style.setProperty("--ripple-y", `${y}%`);
  };

  return (
    <>
      <SEO title="Login" description="Login to your travel expense tracker account." canonical="/login" />
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6 animate-fade-in">
            <div className="text-2xl font-bold">Noveltech Feeds</div>
            <p className="text-muted-foreground text-sm mt-1">Employee Travel Expense Tracker</p>
          </div>
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-xl">Welcome</CardTitle>
            </CardHeader>
            <CardContent>
              {!showForgot ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <Button type="button" variant="link" onClick={() => setShowForgot(true)}>
                      Forgot password?
                    </Button>
                    <Button
                      type="submit"
                      size="xl"
                      className="btn-ripple"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div>
                  {otpStep === 'email' && (
                    <form onSubmit={handleForgot} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="forgot-email">Email</Label>
                        <Input
                          id="forgot-email"
                          type="email"
                          placeholder="you@company.com"
                          value={otpEmail || email}
                          onChange={e => setOtpEmail(e.target.value)}
                          required
                        />
                      </div>
                      {otpError && <div className="text-xs text-red-500">{otpError}</div>}
                      <Button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold" disabled={otpLoading}>
                        {otpLoading ? 'Sending...' : 'Send OTP'}
                      </Button>
                      <Button type="button" className="w-full text-gray-600 mt-2" onClick={() => setShowForgot(false)}>
                        Back to Login
                      </Button>
                    </form>
                  )}
                  {otpStep === 'otp' && (
                    <form onSubmit={handleOtpVerify} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Enter OTP</Label>
                        <InputOTP maxLength={6} value={enteredOtp} onChange={setEnteredOtp} autoFocus>
                          <InputOTPGroup>
                            {[0,1,2,3,4,5].map(i => <InputOTPSlot key={i} index={i} />)}
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      {otpError && <div className="text-xs text-red-500">{otpError}</div>}
                      <Button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold" disabled={otpLoading}>
                        {otpLoading ? 'Verifying...' : 'Verify OTP'}
                      </Button>
                    </form>
                  )}
                  {otpStep === 'reset' && (
                    <form onSubmit={handlePasswordReset} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          required
                        />
                      </div>
                      {otpError && <div className="text-xs text-red-500">{otpError}</div>}
                      <Button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold" disabled={otpLoading}>
                        {otpLoading ? 'Resetting...' : 'Reset Password'}
                      </Button>
                    </form>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Login;
