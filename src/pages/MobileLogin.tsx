import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEmployeeByIdOrEmail } from '../lib/unifiedEmployeeService';
import { auth, db } from '../lib/firebase';
import { Eye, EyeOff, User, Lock, Building2, Smartphone } from 'lucide-react';

const MobileLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login, user, loading } = useAuth();
  
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginMethod, setLoginMethod] = useState<'email' | 'employeeId'>('email');

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      // Use mobile smart dashboard router for role-based navigation
      navigate('/mobile-dashboard');
    }
  }, [user, loading, navigate]);

  const resolveEmailFromEmployeeId = async (empId: string): Promise<string | null> => {
    try {
      const employee = await getEmployeeByIdOrEmail(empId);
      return employee?.email || null;
    } catch (error) {
      console.error('Error resolving employee ID:', error);
      return null;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if ((!email && !employeeId) || !password) {
      setError('Please enter your credentials and password');
      return;
    }

    setIsLoading(true);
    
    try {
      let loginEmail = email;
      
      if (loginMethod === 'employeeId' && employeeId) {
        loginEmail = await resolveEmailFromEmployeeId(employeeId.trim());
        if (!loginEmail) {
          setError('Employee ID not found');
          setIsLoading(false);
          return;
        }
      }

      console.log('🔐 Attempting login with:', { email: loginEmail, passwordLength: password.length });
      
      const { error: loginError } = await login(loginEmail, password);
      
      if (loginError) {
        console.error('❌ Login failed:', loginError);
        
        // Provide specific error messages
        if (loginError.includes('invalid-credential') || loginError.includes('user-not-found')) {
          setError(`Authentication failed. User might not exist in Firebase Auth. Email: ${loginEmail}`);
        } else if (loginError.includes('wrong-password')) {
          setError('Incorrect password. Please check your credentials.');
        } else if (loginError.includes('too-many-requests')) {
          setError('Too many failed attempts. Please try again later.');
        } else {
          setError(loginError);
        }
      } else {
        console.log('✅ Login successful');
        // Navigation will be handled by useEffect
      }
    } catch (error) {
      console.error('💥 Unexpected login error:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Travel Expense Tracker
          </h1>
          <p className="text-gray-600 text-sm">
            Sign in to manage your expenses
          </p>
        </div>

        {/* Login Form */}
        <div className="mobile-card">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Login Method Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setLoginMethod('email')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  loginMethod === 'email' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600'
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('employeeId')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  loginMethod === 'employeeId' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600'
                }`}
              >
                Employee ID
              </button>
            </div>

            {/* Email/Employee ID Input */}
            <div className="mobile-form-group">
              <label className="mobile-form-label">
                {loginMethod === 'email' ? 'Email Address' : 'Employee ID'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                {loginMethod === 'email' ? (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mobile-form-input pl-10"
                    placeholder="your.email@company.com"
                    required
                  />
                ) : (
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="mobile-form-input pl-10"
                    placeholder="EMP001"
                    required
                  />
                )}
              </div>
            </div>

            {/* Password Input */}
            <div className="mobile-form-group">
              <label className="mobile-form-label">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mobile-form-input pl-10 pr-10"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
                {error.includes('user-not-found') || error.includes('not found') && (
                  <div className="mt-2">
                    <p className="text-xs text-red-600 mb-2">
                      Test users may not be created yet.
                    </p>
                    <a
                      href="/setup-users"
                      className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                    >
                      Create Test Users
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mobile-btn-primary"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="mobile-spinner mr-2"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Quick Login Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-3">Quick Role-Based Login:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setEmail('emp.c1@nveltec.com');
                  setPassword('Test123!');
                  setLoginMethod('email');
                }}
                className="p-2 bg-blue-100 rounded text-blue-700 hover:bg-blue-200"
                title="emp.c1@nveltec.com / Test123!"
              >
                Employee
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('mgr1@nveltec.com');
                  setPassword('Test123!');
                  setLoginMethod('email');
                }}
                className="p-2 bg-purple-100 rounded text-purple-700 hover:bg-purple-200"
                title="mgr1@nveltec.com / Test123!"
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('hr1@nveltec.com');
                  setPassword('Test123!');
                  setLoginMethod('email');
                }}
                className="p-2 bg-green-100 rounded text-green-700 hover:bg-green-200"
                title="hr1@nveltec.com / Test123!"
              >
                HR
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin.test@nveltec.com');
                  setPassword('Admin123!');
                  setLoginMethod('email');
                }}
                className="p-2 bg-red-100 rounded text-red-700 hover:bg-red-200"
                title="admin.test@nveltec.com / Admin123!"
              >
                Admin
              </button>
            </div>
            
            {/* Role Navigation Info */}
            <div className="mt-3 text-xs text-gray-500 space-y-1">
              <p><span className="text-blue-600">Employee</span> → Employee Mobile Dashboard</p>
              <p><span className="text-purple-600">Manager</span> → Manager Dashboard</p>
              <p><span className="text-green-600">HR</span> → Manager Dashboard (HR permissions)</p>
              <p><span className="text-red-600">Admin</span> → Admin Dashboard</p>
            </div>
            
            {/* Emergency User Creation */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={async () => {
                  setIsLoading(true);
                  setError('');
                  
                  try {
                    console.log('🚀 Creating emergency test user...');
                    
                    const { createUserWithEmailAndPassword } = await import('firebase/auth');
                    const { setDoc, doc } = await import('firebase/firestore');
                    
                    const testUserData = {
                      email: 'test@test.com',
                      password: 'password123',
                      employeeId: 'TEST001',
                      name: 'Test User',
                      role: 'employee',
                      grade: 'C',
                      department: 'Testing',
                      position: 'Test Engineer',
                      phone: '+91-9876543210'
                    };
                    
                    let user;
                    
                    try {
                      const userCredential = await createUserWithEmailAndPassword(auth, testUserData.email, testUserData.password);
                      user = userCredential.user;
                      console.log('✅ Auth user created');
                      
                      // Sign out immediately
                      await auth.signOut();
                    } catch (authError: any) {
                      if (authError.code === 'auth/email-already-in-use') {
                        console.log('ℹ️ User already exists in Auth');
                        user = { uid: 'test_user_001' };
                      } else {
                        throw authError;
                      }
                    }
                    
                    const userData = {
                      uid: user.uid,
                      email: testUserData.email,
                      employeeId: testUserData.employeeId,
                      name: testUserData.name,
                      grade: testUserData.grade,
                      position: testUserData.position,
                      department: testUserData.department,
                      phone: testUserData.phone,
                      role: testUserData.role,
                      isActive: true,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      travelEntitlement: testUserData.grade,
                      joinDate: new Date('2024-01-15'),
                      employeeType: 'permanent',
                      location: 'Chennai',
                      costCenter: testUserData.department
                    };
                    
                    // Create in both collections
                    await setDoc(doc(db, 'users', user.uid), userData);
                    await setDoc(doc(db, 'employees', testUserData.employeeId), userData);
                    
                    console.log('✅ Emergency test user created successfully!');
                    setError('✅ Test user created! Email: test@test.com, Password: password123');
                    
                    // Auto-fill the form
                    setEmail('test@test.com');
                    setPassword('password123');
                    setLoginMethod('email');
                    
                  } catch (error: any) {
                    console.error('❌ Emergency user creation failed:', error);
                    setError(`Failed to create test user: ${error.message}`);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="w-full p-2 bg-blue-100 rounded text-blue-700 hover:bg-blue-200 text-xs font-medium"
                disabled={isLoading}
              >
                🆘 Create Emergency Test User
              </button>
            </div>
          </div>

          {/* Fallback Simple Credentials */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800 font-medium mb-2">If above fails, try simple test account:</p>
            <button
              type="button"
              onClick={() => {
                setEmail('test@test.com');
                setPassword('password');
                setLoginMethod('email');
              }}
              className="w-full p-2 bg-yellow-100 text-yellow-800 rounded text-xs hover:bg-yellow-200"
              title="test@test.com / password"
            >
              Simple Test Account (test@test.com / password)
            </button>
          </div>
          
          <div className="mt-3 text-center space-y-2">
            <a
              href="/setup-users"
              className="block text-xs text-blue-600 hover:text-blue-700 underline"
            >
              Create Test Users in Firebase
            </a>
            <button
              type="button"
              onClick={async () => {
                try {
                  const { auth } = await import('../lib/firebase');
                  console.log('🔍 Current Firebase Auth State:', auth.currentUser);
                  console.log('🧪 Test credentials being used:');
                  console.log('- Employee: emp1@nveltec.com / Test123!');
                  console.log('- Manager: mgr1@nveltec.com / Test123!');
                  console.log('- HR: hr1@nveltec.com / Test123!');
                  console.log('- Admin: admin.test@nveltec.com / Admin123!');
                } catch (error) {
                  console.error('Debug error:', error);
                }
              }}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Debug: Log Auth Info to Console
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            © 2025 Travel Expense Tracker. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileLogin;
