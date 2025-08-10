import React, { useState } from 'react';

const Login: React.FC = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement login logic
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Send OTP to registered phone/email
    setOtpSent(true);
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Verify OTP and reset password
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
