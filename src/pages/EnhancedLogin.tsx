// 📱 Enhanced Employee Login - Mobile Optimized with Employee ID/Email Support
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getEmployeeByIdOrEmail } from '@/lib/unifiedEmployeeService';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import SEO from '@/components/SEO';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  Smartphone,
  Building2,
  AlertCircle,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';

const EnhancedLogin = () => {
  const navigate = useNavigate();
  const { login, user, loading } = useAuth();
  const { toast } = useToast();

  // Form states
  const [loginInput, setLoginInput] = useState(''); // Can be Employee ID or Email
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Password reset states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  
  // Employee resolution
  const [resolvedEmployee, setResolvedEmployee] = useState<any>(null);
  const [inputType, setInputType] = useState<'email' | 'employeeId' | 'unknown'>('unknown');

  // Auto-detect input type and resolve employee
  useEffect(() => {
    if (!loginInput.trim()) {
      setInputType('unknown');
      setResolvedEmployee(null);
      return;
    }

    const detectAndResolve = async () => {
      const input = loginInput.trim();
      
      // Detect if it's an email (contains @)
      if (input.includes('@')) {
        setInputType('email');
        try {
          const employee = await getEmployeeByIdOrEmail(input);
          setResolvedEmployee(employee);
        } catch (error) {
          setResolvedEmployee(null);
        }
      } else {
        // Assume it's an Employee ID
        setInputType('employeeId');
        try {
          const employee = await getEmployeeByIdOrEmail(input);
          setResolvedEmployee(employee);
        } catch (error) {
          setResolvedEmployee(null);
        }
      }
    };

    const timeoutId = setTimeout(detectAndResolve, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [loginInput]);

  // Handle main login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginInput.trim() || !password) {
      toast({
        title: 'Missing Information',
        description: 'Please enter your Employee ID or Email and Password',
        variant: 'destructive'
      });
      return;
    }

    if (!resolvedEmployee) {
      toast({
        title: 'Employee Not Found',
        description: 'Please check your Employee ID or Email and try again',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔐 Login attempt:', { 
        input: loginInput, 
        resolvedEmail: resolvedEmployee.email,
        employeeName: resolvedEmployee.name 
      });

      const { error } = await login(resolvedEmployee.email, password);
      
      if (error) {
        console.error('💥 Login error:', error);
        toast({
          title: 'Login Failed',
          description: error.includes('wrong-password') ? 'Incorrect password' : error,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Login Successful!',
          description: `Welcome back, ${resolvedEmployee.name}`,
        });
        // Navigation will be handled by auth context
      }
    } catch (error: any) {
      console.error('💥 Login exception:', error);
      toast({
        title: 'Login Error',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail.trim()) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email address',
        variant: 'destructive'
      });
      return;
    }

    setResetLoading(true);

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSent(true);
      toast({
        title: 'Password Reset Sent!',
        description: 'Check your email for password reset instructions',
      });
    } catch (error: any) {
      console.error('💥 Password reset error:', error);
      toast({
        title: 'Reset Failed',
        description: error.message || 'Failed to send reset email',
        variant: 'destructive'
      });
    } finally {
      setResetLoading(false);
    }
  };

  // Auto-navigate if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Employee Login - N.VELTEC" 
        description="Secure employee login for N.VELTEC Travel Expense Tracker" 
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Company Branding */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Building2 className="h-12 w-12 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">N.VELTEC</h1>
                <p className="text-sm text-gray-600">Travel Expense Tracker</p>
              </div>
            </div>
          </div>

          {showForgotPassword ? (
            // Password Reset Form
            <Card className="shadow-xl border-0">
              <CardHeader className="text-center pb-2">
                <CardTitle className="flex items-center justify-center gap-2 text-xl">
                  <Mail className="h-5 w-5 text-blue-600" />
                  Reset Password
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  Enter your email to receive reset instructions
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {!resetSent ? (
                  <form onSubmit={handlePasswordReset} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="resetEmail">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="resetEmail"
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="pl-10 h-12"
                          required
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                      disabled={resetLoading}
                    >
                      {resetLoading ? 'Sending...' : 'Send Reset Email'}
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full h-12"
                      onClick={() => setShowForgotPassword(false)}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Login
                    </Button>
                  </form>
                ) : (
                  <div className="text-center space-y-4">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                    <div>
                      <h3 className="font-medium text-gray-900">Email Sent!</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Check your inbox for password reset instructions
                      </p>
                    </div>
                    <Button 
                      onClick={() => {
                        setShowForgotPassword(false);
                        setResetSent(false);
                        setResetEmail('');
                      }}
                      variant="outline" 
                      className="w-full h-12"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Login
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            // Main Login Form
            <Card className="shadow-xl border-0">
              <CardHeader className="text-center pb-2">
                <CardTitle className="flex items-center justify-center gap-2 text-xl">
                  <LogIn className="h-5 w-5 text-blue-600" />
                  Employee Login
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  Enter your Employee ID or Email to continue
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Employee ID / Email Input */}
                  <div className="space-y-2">
                    <Label htmlFor="loginInput">Employee ID or Email</Label>
                    <div className="relative">
                      {inputType === 'email' ? (
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      ) : (
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      )}
                      <Input
                        id="loginInput"
                        type="text"
                        value={loginInput}
                        onChange={(e) => setLoginInput(e.target.value)}
                        placeholder="Enter Employee ID or Email"
                        className="pl-10 h-12"
                        required
                      />
                      {resolvedEmployee && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                      )}
                    </div>
                    
                    {/* Employee Resolution Feedback */}
                    {loginInput && (
                      <div className="text-sm">
                        {resolvedEmployee ? (
                          <Alert className="border-green-200 bg-green-50">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-700">
                              Found: {resolvedEmployee.name} ({resolvedEmployee.grade})
                            </AlertDescription>
                          </Alert>
                        ) : inputType !== 'unknown' && (
                          <Alert className="border-red-200 bg-red-50">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-700">
                              {inputType === 'email' ? 'Email not found' : 'Employee ID not found'}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="pl-10 pr-10 h-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Login Button */}
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isLoading || !resolvedEmployee}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Signing In...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <LogIn className="h-4 w-4" />
                        Sign In
                      </div>
                    )}
                  </Button>
                </form>

                {/* Forgot Password Link */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Forgot your password?
                  </button>
                </div>

                {/* Mobile Optimization Note */}
                <div className="text-center mt-6 p-3 bg-blue-50 rounded-lg">
                  <Smartphone className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                  <p className="text-xs text-blue-700">
                    Optimized for mobile devices • Contact HR for account issues
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default EnhancedLogin;
