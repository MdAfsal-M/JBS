import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Lock, Mail, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Admin credentials
  const ADMIN_EMAIL = "jbs2026off@gmail.com";
  const ADMIN_PASSWORD = "techsquad";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check admin credentials
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        console.log("Admin login successful, setting localStorage...");
        
        // Set authentication state in localStorage
        localStorage.setItem("adminLoggedIn", "true");
        localStorage.setItem("adminEmail", email);
        
        console.log("localStorage set, navigating to admin dashboard...");
        
        toast({
          title: t("loginSuccessful"),
          description: "Welcome to JBS Admin Dashboard!",
          variant: "default",
        });
        
        // Navigate to admin dashboard
        navigate("/admin-dashboard");
        console.log("Navigation triggered to /admin-dashboard");
      } else {
        console.log("Invalid credentials provided");
        toast({
          title: t("loginFailed"),
          description: t("invalidEmailPassword"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: t("loginFailed"),
        description: t("invalidEmailPassword"),
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Link to="/" className="flex items-center text-primary hover:text-primary/80 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("backToHome")}
              </Link>
            </div>
            <CardTitle className="text-2xl font-bold gradient-text">
              {t("adminLogin")}
            </CardTitle>
            <p className="text-muted-foreground">
              {t("accessAdminDashboard")}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  {t("email")}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("enterAdminEmail")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  {t("password")}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder={t("enterPassword")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-primary" 
                disabled={isLoading}
              >
                {isLoading ? t("loggingIn") : t("loginToAdminDashboard")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin; 