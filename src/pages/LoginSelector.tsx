import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";

const LoginSelector = () => {
  const navigate = useNavigate();
  return (
    <>
      <SEO title="Login - Select Role" description="Choose Employee or Manager login." />
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded shadow p-8 flex flex-col gap-6 items-center">
          <div className="text-2xl font-bold mb-2">Noveltech Feeds</div>
          <div className="text-lg mb-4">Employee Travel Expense Tracker</div>
          <Button className="w-full mb-2" onClick={() => navigate("/login-employee")}>Employee Login</Button>
          <Button className="w-full" variant="outline" onClick={() => navigate("/login-manager")}>Manager Login</Button>
        </div>
      </div>
    </>
  );
};

export default LoginSelector;
