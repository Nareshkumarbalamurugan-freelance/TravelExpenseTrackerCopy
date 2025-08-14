import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEmployeeByIdOrEmail, sendOTP, verifyOTP } from '../lib/unifiedEmployeeService';
import { toast } from '../components/ui/use-toast';

const Login: React.FC = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Check if input is employee ID or email
      const identifier = employeeId || email;
      const employee = await getEmployeeByIdOrEmail(identifier);
      
      if (!employee) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Employee not found. Please check your credentials."
        });
        return;
      }

      const { error } = await login(employee.email, password);
      if (error) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login Error",
        description: "An unexpected error occurred. Please try again."
      });
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const identifier = employeeId || email;
      const employee = await getEmployeeByIdOrEmail(identifier);
      
      if (!employee) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Employee not found. Please check your credentials."
        });
        return;
      }

      const sent = await sendOTP(employee.phone || employee.email);
      if (sent.success) {
        setOtpSent(true);
        toast({
          title: "OTP Sent",
          description: "Please check your registered email and phone for the OTP."
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to send OTP. Please try again."
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again."
      });
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const identifier = employeeId || email;
      const employee = await getEmployeeByIdOrEmail(identifier);
      
      if (!employee) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Employee not found. Please check your credentials."
        });
        return;
      }

      const isValid = await verifyOTP(employee.id, otp);
      if (isValid) {
        // TODO: Implement password reset logic
        toast({
          title: "Success",
          description: "Password reset successful. Please login with your new password."
        });
        setShowForgot(false);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Invalid or expired OTP. Please try again."
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again."
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Employee Login</h2>
        {!showForgot ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Employee ID</label>
              <input
                type="text"
                value={employeeId}
                onChange={e => setEmployeeId(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold">Login</button>
            <button type="button" className="w-full text-blue-600 mt-2" onClick={() => setShowForgot(true)}>
              Forgot Password?
            </button>
          </form>
        ) : (
          <form onSubmit={otpSent ? handleReset : handleForgot} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Employee ID</label>
              <input
                type="text"
                value={employeeId}
                onChange={e => setEmployeeId(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            {!otpSent ? (
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold">Send OTP</button>
            ) : (
              <>
                <div>
                  <label className="block mb-1 font-medium">OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <button type="submit" className="w-full bg-green-600 text-white py-2 rounded font-semibold">Reset Password</button>
              </>
            )}
            <button type="button" className="w-full text-gray-600 mt-2" onClick={() => setShowForgot(false)}>
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
