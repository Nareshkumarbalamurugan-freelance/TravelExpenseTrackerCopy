import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LoginSelector = () => {
  const navigate = useNavigate();
  
  // Redirect to mobile login immediately
  useEffect(() => {
    navigate('/mobile-login');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  );
};

export default LoginSelector;
