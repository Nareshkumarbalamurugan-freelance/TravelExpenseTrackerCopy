import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SEO from "@/components/SEO";
import PositionRatesDisplay from "@/components/PositionRatesDisplay";
import { toast } from "@/hooks/use-toast";
import { getAvailablePositions } from "@/lib/expenseCalculator";

const Login = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [availablePositions, setAvailablePositions] = useState<string[]>([]);

  // Load available positions when component mounts
  useEffect(() => {
    const loadPositions = async () => {
      try {
        const positions = await getAvailablePositions();
        setAvailablePositions(positions);
        // Set default position if none selected
        if (positions.length > 0 && !position) {
          setPosition(positions[0]);
        }
      } catch (error) {
        console.error('Error loading positions:', error);
        // Fallback positions
        setAvailablePositions(['Sales Executive', 'Senior Executive', 'Manager', 'Regional Manager']);
        setPosition('Sales Executive');
      }
    };
    
    loadPositions();
  }, [position]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await login(email, password);
      if (error) {
        toast({ 
          title: "Login failed", 
          description: error,
          variant: "destructive" 
        });
      } else {
        navigate("/");
      }
    } catch (error) {
      toast({ 
        title: "Login failed", 
        description: "An unexpected error occurred",
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({ 
        title: "Registration failed", 
        description: "Passwords do not match",
        variant: "destructive" 
      });
      return;
    }

    if (!position) {
      toast({ 
        title: "Registration failed", 
        description: "Please select a position",
        variant: "destructive" 
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await register(email, password, name, position);
      if (error) {
        toast({ 
          title: "Registration failed", 
          description: error,
          variant: "destructive" 
        });
      } else {
        toast({ 
          title: "Registration successful", 
          description: `Welcome to Noveltech Feeds! Position: ${position}`
        });
        navigate("/");
      }
    } catch (error) {
      toast({ 
        title: "Registration failed", 
        description: "An unexpected error occurred",
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgot = () => {
    toast({ title: "Reset link sent", description: "Check your inbox to reset your password." });
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
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input 
                        id="login-email" 
                        type="email" 
                        placeholder="you@company.com" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
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
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <Button type="button" variant="link" onClick={handleForgot}>
                        Forgot password?
                      </Button>
                      <Button 
                        type="submit" 
                        size="xl" 
                        className="btn-ripple" 
                        onMouseDown={onMouseDownRipple}
                        disabled={isLoading}
                      >
                        {isLoading ? "Signing in..." : "Sign In"}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
                
                <TabsContent value="register" className="space-y-4">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Full Name</Label>
                      <Input 
                        id="register-name" 
                        type="text" 
                        placeholder="John" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input 
                        id="register-email" 
                        type="email" 
                        placeholder="you@company.com" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-position">Position</Label>
                      <Select value={position} onValueChange={setPosition} required>
                        <SelectTrigger>
                          <SelectValue placeholder={
                            availablePositions.length === 0 
                              ? "Loading positions..." 
                              : "Select your position"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePositions.map((pos) => (
                            <SelectItem key={pos} value={pos}>
                              {pos}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {position && (
                        <p className="text-xs text-muted-foreground">
                          This determines your travel expense rates
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input 
                        id="register-password" 
                        type="password" 
                        placeholder="••••••••" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input 
                        id="confirm-password" 
                        type="password" 
                        placeholder="••••••••" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        required 
                      />
                    </div>
                    <Button 
                      type="submit" 
                      size="xl" 
                      className="w-full btn-ripple" 
                      onMouseDown={onMouseDownRipple}
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating account..." : "Register"}
                    </Button>
                  </form>
                  
                  {/* Position Rates Display */}
                  <PositionRatesDisplay selectedPosition={position} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Login;
