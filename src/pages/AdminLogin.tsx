import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';

const AdminLogin: React.FC = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  const navigate = useNavigate();


  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLogging(true);
    setError('');

    try {
      // Use email as username for admin login
      const { error } = await login(credentials.username, credentials.password);
      if (error) {
        setError('Invalid username or password');
        setIsLogging(false);
        return;
      }
      // Check for admin custom claim
      const user = auth.currentUser;
      let isAdmin = false;
      if (user) {
        const token = await user.getIdTokenResult();
        isAdmin = token.claims.admin === true;
      }
      if (isAdmin) {
        sessionStorage.setItem('adminAuthenticated', 'true');
        sessionStorage.setItem('adminLoginTime', new Date().toISOString());
        navigate('/admin');
      } else {
        setError('You do not have admin access.');
      }
    } catch (err) {
      setError('Login failed.');
    }
    setIsLogging(false);
  };

  const handleInputChange = (field: 'username' | 'password') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCredentials(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    setError(''); // Clear error on input change
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Admin Portal
          </CardTitle>
          <CardDescription className="text-gray-600">
            Travel Expense Tracker Administration
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={credentials.username}
                onChange={handleInputChange('username')}
                placeholder="Enter admin username"
                className="w-full"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={handleInputChange('password')}
                  placeholder="Enter admin password"
                  className="w-full pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLogging || !credentials.username || !credentials.password}
            >
              {isLogging ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-800 font-medium mb-1">
                Demo Credentials:
              </p>
              <p className="text-xs text-blue-700">
                Username: <code className="bg-blue-100 px-1 rounded">admin</code>
              </p>
              <p className="text-xs text-blue-700">
                Password: <code className="bg-blue-100 px-1 rounded">admin@poultrymitra</code>
              </p>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="text-sm"
            >
              ← Back to Main App
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
