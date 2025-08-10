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
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmailInput, setResetEmailInput] = useState("");
  const [resetEmployeeIdInput, setResetEmployeeIdInput] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Helper to resolve employeeId to email (simulate Firestore lookup)
  async function resolveEmailFromEmployeeId(empId: string): Promise<string | null> {
    // TODO: Replace with real Firestore lookup
    if (empId === "EMP001") return "nareshkumarbalamurugan@gmail.com";
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    let loginEmail = email;
    if (!loginEmail && employeeId) {
      // If email not entered, but employeeId is, resolve email
      loginEmail = await resolveEmailFromEmployeeId(employeeId.trim());
      if (!loginEmail) {
        console.warn("Login failed: Employee ID not found", employeeId);
        toast({ title: "Login failed", description: "Employee ID not found", variant: "destructive" });
        setIsLoading(false);
        return;
      }
    }
    try {
      console.log("Attempting login", { loginEmail, passwordLength: password.length });
      const { error } = await login(loginEmail, password);
      if (error) {
        console.error("Login error:", error);
        toast({ title: "Login failed", description: error, variant: "destructive" });
      } else {
        console.log("Login successful, navigating to home");
        navigate("/");
      }
    } catch (error) {
      console.error("Unexpected login error:", error);
      toast({ title: "Login failed", description: "An unexpected error occurred", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Registration removed per requirements

  // OTP-based password reset flow
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError("");
    let resetEmail = resetEmailInput || email;
    if (!resetEmail && resetEmployeeIdInput) {
      resetEmail = await resolveEmailFromEmployeeId(resetEmployeeIdInput.trim());
      if (!resetEmail) {
        console.warn("Password reset: Employee ID not found", resetEmployeeIdInput);
        setResetError("Employee ID not found");
        setResetLoading(false);
        return;
      }
    }
    try {
      console.log("Sending password reset email to", resetEmail);
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSent(true);
      toast({ title: "Reset email sent", description: "Check your inbox for the reset link." });
    } catch (err: any) {
      console.error("Failed to send reset email:", err);
      setResetError(err.message || "Failed to send reset email");
    }
    setResetLoading(false);
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
                    <Label htmlFor="login-employeeId">Employee ID</Label>
                    <Input
                      id="login-employeeId"
                      type="text"
                      placeholder="EMP001"
                      value={employeeId}
                      onChange={e => setEmployeeId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
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
                  <div className="text-xs text-gray-500">You can login with either Employee ID or Email.</div>
                </form>
              ) : (
                <form onSubmit={handleForgot} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-employeeId">Employee ID</Label>
                    <Input
                      id="forgot-employeeId"
                      type="text"
                      placeholder="EMP001"
                      value={resetEmployeeIdInput}
                      onChange={e => setResetEmployeeIdInput(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">Email</Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="you@company.com"
                      value={resetEmailInput}
                      onChange={e => setResetEmailInput(e.target.value)}
                    />
                  </div>
                  <div className="text-xs text-gray-500">You can reset password with either Employee ID or Email.</div>
                  {resetError && <div className="text-xs text-red-500">{resetError}</div>}
                  {resetSent && <div className="text-xs text-green-600">Reset email sent! Check your inbox.</div>}
                  <Button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold" disabled={resetLoading}>
                    {resetLoading ? 'Sending...' : 'Send Reset Email'}
                  </Button>
                  <Button type="button" className="w-full text-gray-600 mt-2" onClick={() => setShowForgot(false)}>
                    Back to Login
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
  </>
  );
};

export default Login;
