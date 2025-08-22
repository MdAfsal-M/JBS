import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { 
  Briefcase, 
  GraduationCap, 
  ShoppingCart, 
  Store, 
  MapPin, 
  Clock, 
  DollarSign,
  Star,
  Users,
  TrendingUp,
  Award,
  Heart,
  MessageCircle,
  Filter,
  Search,
  Plus,
  Eye,
  Phone,
  Mail,
  Bot
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { user, login } = useAuth();
  const [cart, setCart] = useState<any[]>([]);
  const [newsletter, setNewsletter] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [selectedInternship, setSelectedInternship] = useState<any>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [userType, setUserType] = useState("");
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { type: "bot", message: "Hello! I'm your JBS assistant. How can I help you today?" }
  ]);
  const [currentMessage, setCurrentMessage] = useState("");

  // Login state variables
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginUserType, setLoginUserType] = useState('student');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Login handler function
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!loginEmail || !loginPassword || !loginUserType) {
      setLoginError('Please fill in all fields');
      return;
    }
    
    try {
      setIsLoggingIn(true);
      setLoginError('');
      
      // Call login function from AuthContext and get redirect path
      const redirectPath = await login(loginEmail, loginPassword, loginUserType);
      
      // Close login dialog
      setShowLogin(false);
      
      // Navigate to the appropriate dashboard
      if (redirectPath) {
        navigate(redirectPath);
      }
      
    } catch (error: any) {
      // Enhanced error handling with specific error messages
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (error.response) {
        // Server responded with error
        const { status, data } = error.response;
        
        switch (status) {
          case 401:
            errorMessage = data.message || 'Invalid email or password';
            break;
          case 423:
            errorMessage = data.message || 'Account temporarily locked';
            break;
          case 403:
            errorMessage = data.message || 'Access denied - Invalid user type';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = data.message || `Error ${status}: ${data.message}`;
        }
      } else if (error.request) {
        // Request made but no response
        errorMessage = 'No response from server. Check your connection.';
      } else {
        // Other errors
        errorMessage = error.message || 'An unexpected error occurred.';
      }
      
      setLoginError(errorMessage);
      console.error('Login error details:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (user) {
      if (user.role === 'owner') {
        navigate('/owner-dashboard');
      } else if (user.role === 'student') {
        navigate('/student-dashboard');
      }
    }
  }, [user, navigate]);

  // Mock data
  const jobs = [
    {
      id: 1,
      title: "Part-time Sales Associate",
      company: "TechMart Electronics",
      location: "Chennai, TN",
      pay: "₹15,000/month",
      duration: "6 months",
      type: "Part-time",
      description: "Looking for energetic students to help with customer service and sales. Flexible timings available.",
      requirements: ["Good communication skills", "Basic computer knowledge", "Friendly personality"],
      posted: "2 days ago"
    },
    {
      id: 2,
      title: "Food Delivery Executive",
      company: "QuickBites Restaurant",
      location: "Bangalore, KA",
      pay: "₹20,000/month",
      duration: "Ongoing",
      type: "Full-time",
      description: "Join our delivery team and earn while studying. Own vehicle preferred.",
      requirements: ["Own vehicle", "Valid license", "Local area knowledge"],
      posted: "1 day ago"
    },
    {
      id: 3,
      title: "Tutor Assistant",
      company: "BrightMinds Coaching",
      location: "Mumbai, MH",
      pay: "₹12,000/month",
      duration: "3 months",
      type: "Part-time",
      description: "Help junior students with their studies. Great for education background students.",
      requirements: ["Graduate/UG", "Subject expertise", "Teaching aptitude"],
      posted: "3 days ago"
    }
  ];

  const internships = [
    {
      id: 1,
      title: "Digital Marketing Intern",
      company: "GrowthHackers Agency",
      location: "Remote",
      stipend: "₹8,000/month",
      duration: "3 months",
      type: "Paid",
      description: "Learn social media marketing, content creation, and analytics in a fast-growing digital agency.",
      requirements: ["Basic social media knowledge", "Creative thinking", "Good writing skills"],
      skills: ["Social Media", "Content Writing", "Analytics"],
      posted: "1 day ago"
    },
    {
      id: 2,
      title: "Web Development Intern",
      company: "CodeCrafters Solutions",
      location: "Hyderabad, TS",
      stipend: "₹12,000/month",
      duration: "6 months",
      type: "Paid",
      description: "Work on real client projects using React, Node.js, and modern web technologies.",
      requirements: ["HTML/CSS/JS knowledge", "React basics", "Problem-solving skills"],
      skills: ["React", "JavaScript", "Node.js"],
      posted: "2 days ago"
    },
    {
      id: 3,
      title: "Graphic Design Intern",
      company: "Creative Studio Hub",
      location: "Pune, MH",
      stipend: "Unpaid",
      duration: "2 months",
      type: "Unpaid",
      description: "Design marketing materials, social media posts, and brand assets for various clients.",
      requirements: ["Photoshop/Illustrator skills", "Portfolio required", "Creative mindset"],
      skills: ["Photoshop", "Illustrator", "Branding"],
      posted: "4 days ago"
    }
  ];

  const products = [
    {
      id: 1,
      name: "Wireless Earbuds",
      price: "₹2,999",
      originalPrice: "₹4,999",
      rating: 4.5,
      image: "/placeholder.svg",
      seller: "TechStore",
      category: "Electronics",
      description: "High-quality wireless earbuds with noise cancellation and 24-hour battery life.",
      features: ["Bluetooth 5.0", "Noise Cancellation", "24hr Battery", "Water Resistant"],
      inStock: true
    },
    {
      id: 2,
      name: "Study Desk Lamp",
      price: "₹1,299",
      originalPrice: "₹1,999",
      rating: 4.2,
      image: "/placeholder.svg",
      seller: "HomeDecor Plus",
      category: "Furniture",
      description: "Adjustable LED desk lamp perfect for studying and reading. Multiple brightness levels.",
      features: ["LED Technology", "Adjustable Arm", "Multiple Brightness", "USB Charging"],
      inStock: true
    },
    {
      id: 3,
      name: "Laptop Backpack",
      price: "₹1,999",
      originalPrice: "₹2,999",
      rating: 4.7,
      image: "/placeholder.svg",
      seller: "BagMart",
      category: "Accessories",
      description: "Water-resistant laptop backpack with multiple compartments for students and professionals.",
      features: ["Water Resistant", "Laptop Compartment", "Multiple Pockets", "Comfortable Straps"],
      inStock: false
    },
    {
      id: 4,
      name: "Smart Fitness Watch",
      price: "₹3,999",
      originalPrice: "₹5,999",
      rating: 4.3,
      image: "/placeholder.svg",
      seller: "FitTech",
      category: "Electronics",
      description: "Track your fitness goals with this feature-rich smartwatch.",
      features: ["Heart Rate Monitor", "GPS Tracking", "Sleep Monitor", "7-day Battery"],
      inStock: true
    }
  ];

  const testimonials = [
    {
      name: "Rahul Sharma",
      role: "Student",
      image: "/placeholder.svg",
      review: "Found my first part-time job through JBS. The platform is user-friendly and has great opportunities!"
    },
    {
      name: "Priya Patel",
      role: "Shop Owner",
      image: "/placeholder.svg",
      review: "JBS helped me find reliable students for my store. Perfect platform for local hiring!"
    },
    {
      name: "Amit Kumar",
      role: "Student",
      image: "/placeholder.svg",
      review: "Got an amazing internship that boosted my career. Highly recommend JBS to all students!"
    }
  ];

  const addToCart = (product: any) => {
    setCart([...cart, product]);
    toast({
      title: t("addedToCart"),
      description: `${product.name} ${t("itemAddedToCart")}`
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.id !== productId));
    toast({
      title: t("removedFromCart"),
      description: t("itemRemovedFromCart")
    });
  };

  const buyNow = (product: any) => {
    setShowLogin(true);
  };

  const applyJob = (job: any) => {
    setShowLogin(true);
  };

  const subscribeNewsletter = () => {
    if (newsletter) {
      toast({
        title: t("subscribedSuccessfully"),
        description: t("receiveLatestUpdates")
      });
      setNewsletter("");
    }
  };

  const sendChatMessage = () => {
    if (currentMessage.trim()) {
      setChatMessages([...chatMessages, 
        { type: "user", message: currentMessage },
        { type: "bot", message: t("thankYouForQuestion") }
      ]);
      setCurrentMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Language Switcher - removed duplicate plain <select>, keep only nav bar Select */}
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
                          <h1 className="text-2xl font-bold gradient-text">
              JBS
            </h1>
              <div className="hidden md:flex space-x-6">
                <a href="#home" className="text-foreground hover:text-primary transition-colors">{t("home")}</a>
                <a href="#about" className="text-foreground hover:text-primary transition-colors">{t("about")}</a>
                <a href="#jobs" className="text-foreground hover:text-primary transition-colors">{t("jobs")}</a>
                <a href="#internships" className="text-foreground hover:text-primary transition-colors">{t("internships")}</a>
                <a href="#products" className="text-foreground hover:text-primary transition-colors">{t("buyProducts")}</a>
                <button onClick={() => navigate("/owner-register")} className="text-foreground hover:text-primary transition-colors">{t("sellItems")}</button>
                <a href="#contact" className="text-foreground hover:text-primary transition-colors">{t("contact")}</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Language Selector - unified and improved */}
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-32">
                  <SelectValue>{language === 'en' ? 'English' : language === 'hi' ? 'हिन्दी' : 'தமிழ்'}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिन्दी</SelectItem>
                  <SelectItem value="ta">தமிழ்</SelectItem>
                </SelectContent>
              </Select>

              <Dialog open={showLogin} onOpenChange={(open) => {
                setShowLogin(open);
                if (!open) {
                  // Clear form when dialog is closed
                  setLoginEmail('');
                  setLoginPassword('');
                  setLoginUserType('student');
                  setLoginError('');
                  setIsLoggingIn(false);
                }
              }}>
                <DialogTrigger asChild>
                  <Button variant="outline">{t("login")}</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("loginToJBS")}</DialogTitle>
                    <DialogDescription>
                      Enter your credentials to access your account
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleLogin} className="space-y-4">
                    {/* Error Display */}
                    {loginError && (
                      <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded border border-red-200">
                        {loginError}
                      </div>
                    )}
                    
                    {/* Email Input */}
                    <div>
                      <Input 
                        placeholder={t("email")} 
                        type="email" 
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        disabled={isLoggingIn}
                      />
                    </div>
                    
                    {/* Password Input */}
                    <div>
                      <Input 
                        placeholder={t("password")} 
                        type="password" 
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        disabled={isLoggingIn}
                      />
                    </div>
                    
                    {/* User Type Selection */}
                    <div>
                      <Select value={loginUserType} onValueChange={setLoginUserType}>
                        <SelectTrigger disabled={isLoggingIn}>
                          <SelectValue placeholder={t("selectUserType")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">{t("studentJobSeeker")}</SelectItem>
                          <SelectItem value="owner">{t("shopOwnerBusiness")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-primary"
                      disabled={isLoggingIn}
                    >
                      {isLoggingIn ? 'Logging in...' : t("login")}
                    </Button>
                    
                    {/* Signup Link */}
                    <p className="text-center text-sm text-muted-foreground">
                      {t("dontHaveAccount")}
                      <button 
                        type="button"
                        onClick={() => {setShowLogin(false); setShowSignup(true);}}
                        className="text-primary hover:underline ml-1"
                        disabled={isLoggingIn}
                      >
                        {t("signup")}
                      </button>
                    </p>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={showSignup} onOpenChange={setShowSignup}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary">{t("signup")}</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("joinJBSPlatform")}</DialogTitle>
                    <DialogDescription>
                      Create your account to get started with JBS
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Input placeholder={t("fullName")} />
                    </div>
                    <div>
                      <Input placeholder={t("email")} type="email" />
                    </div>
                    <div>
                      <Input placeholder={t("password")} type="password" />
                    </div>
                    <div>
                      <Select value={userType} onValueChange={setUserType}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("iAmA")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">{t("studentJobSeeker")}</SelectItem>
                          <SelectItem value="owner">{t("shopOwnerBusiness")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      className="w-full bg-gradient-primary"
                      onClick={() => {
                        if (userType === "student") {
                          navigate("/student-register");
                        } else if (userType === "owner") {
                          navigate("/owner-register");
                        }
                      }}
                    >
                      {t("continueRegistration")}
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                      {t("alreadyHaveAccount")}
                      <button 
                        onClick={() => {setShowSignup(false); setShowLogin(true);}}
                        className="text-primary hover:underline ml-1"
                      >
                        {t("login")}
                      </button>
                    </p>
                  </div>
                </DialogContent>
              </Dialog>


              {/* Cart Button */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <ShoppingCart className="h-4 w-4" />
                    {cart.length > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full text-xs">
                        {cart.length}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{t("shoppingCart")} ({cart.length} {t("items")})</DialogTitle>
                    <DialogDescription>
                      Review and manage your shopping cart items
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {cart.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">{t("cartEmpty")}</p>
                    ) : (
                      <>
                        {cart.map((item, index) => (
                          <div key={index} className="flex items-center justify-between border-b pb-4">
                            <div className="flex items-center space-x-4">
                              <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                              <div>
                                <h4 className="font-medium">{item.name}</h4>
                                <p className="text-primary font-semibold">{item.price}</p>
                              </div>
                            </div>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                            >
                              {t("remove")}
                            </Button>
                          </div>
                        ))}
                        <div className="pt-4">
                          <Button className="w-full bg-gradient-primary" onClick={() => navigate("/student-register")}>
                            {t("proceedToCheckout")}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative bg-gradient-hero py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <img 
            src="/src/assets/hero-professional.jpg" 
            alt="Professional workspace" 
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in text-white hero-text">
            {t("connectingSkills")}
            <span className="block gradient-text">
              {t("underOneRoof")}
            </span>
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto animate-fade-in hero-text">
            {t("heroDescriptionNew")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in">
            <Button size="lg" className="bg-gradient-professional shadow-glow" onClick={() => navigate("/student-register")}>
              <Briefcase className="mr-2 h-5 w-5" />
              {t("exploreJobsInternships")}
            </Button>
            <Button size="lg" variant="outline" className="border-white text-blue-600 hover:bg-white hover:text-primary" onClick={() => navigate("/owner-register")}>
              <Store className="mr-2 h-5 w-5" />
              {t("startSellingHiring")}
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="animate-fade-in">
              <div className="text-4xl font-bold text-primary">10,000+</div>
              <div className="text-muted-foreground">{t("activeUsers")}</div>
            </div>
            <div className="animate-fade-in">
              <div className="text-4xl font-bold text-primary">5,000+</div>
              <div className="text-muted-foreground">{t("jobsPosted")}</div>
            </div>
            <div className="animate-fade-in">
              <div className="text-4xl font-bold text-primary">15,000+</div>
              <div className="text-muted-foreground">{t("itemsSold")}</div>
            </div>
            <div className="animate-fade-in">
              <div className="text-4xl font-bold text-primary">2,500+</div>
              <div className="text-muted-foreground">{t("internshipsOffered")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore by Category */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 section-heading">{t("exploreByCategory")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="group hover:shadow-glow transition-all duration-300 cursor-pointer animate-scale-in" onClick={() => document.getElementById('jobs')?.scrollIntoView({behavior: 'smooth'})}>
              <CardContent className="p-6 text-center">
                <Briefcase className="h-12 w-12 text-primary mx-auto mb-4 group-hover:animate-bounce-subtle" />
                <h3 className="text-xl font-semibold mb-2">{t("jobs")}</h3>
                <p className="text-muted-foreground">{t("findOpportunities")}</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 cursor-pointer animate-scale-in" onClick={() => document.getElementById('internships')?.scrollIntoView({behavior: 'smooth'})}>
              <CardContent className="p-6 text-center">
                <GraduationCap className="h-12 w-12 text-secondary mx-auto mb-4 group-hover:animate-bounce-subtle" />
                <h3 className="text-xl font-semibold mb-2">{t("internships")}</h3>
                <p className="text-muted-foreground">{t("gainExperience")}</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 cursor-pointer animate-scale-in" onClick={() => document.getElementById('products')?.scrollIntoView({behavior: 'smooth'})}>
              <CardContent className="p-6 text-center">
                <ShoppingCart className="h-12 w-12 text-warning mx-auto mb-4 group-hover:animate-bounce-subtle" />
                <h3 className="text-xl font-semibold mb-2">{t("buyProducts")}</h3>
                <p className="text-muted-foreground">{t("shopFromLocal")}</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-glow transition-all duration-300 cursor-pointer animate-scale-in" onClick={() => document.getElementById('sell')?.scrollIntoView({behavior: 'smooth'})}>
              <CardContent className="p-6 text-center">
                <Store className="h-12 w-12 text-success mx-auto mb-4 group-hover:animate-bounce-subtle" />
                <h3 className="text-xl font-semibold mb-2">{t("sellItems")}</h3>
                <p className="text-muted-foreground">{t("listProducts")}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Jobs Section */}
      <section id="jobs" className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-bold section-heading">{t("latestJobs")}</h2>
            <Button variant="outline" onClick={() => navigate("/student-dashboard")}>
              {t("viewAllJobs")}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-elegant transition-all duration-300 animate-fade-in">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <p className="text-muted-foreground">{job.company}</p>
                    </div>
                    <Badge variant={job.type === "Full-time" ? "default" : "secondary"}>
                      {job.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {job.location}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4 mr-2" />
                      {job.pay}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      {job.duration}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedJob(job)}>
                          <Eye className="h-4 w-4 mr-2" />
                          {t("viewDetails")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{selectedJob?.title}</DialogTitle>
                        </DialogHeader>
                        {selectedJob && (
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">{t("company")}</h4>
                              <p>{selectedJob.company}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">{t("description")}</h4>
                              <p>{selectedJob.description}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">{t("requirements")}</h4>
                              <ul className="list-disc list-inside space-y-1">
                                {selectedJob.requirements.map((req: string, index: number) => (
                                  <li key={index}>{req}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              <span><MapPin className="h-4 w-4 inline mr-1" />{selectedJob.location}</span>
                              <span><DollarSign className="h-4 w-4 inline mr-1" />{selectedJob.pay}</span>
                              <span><Clock className="h-4 w-4 inline mr-1" />{selectedJob.duration}</span>
                            </div>
                            <Button className="w-full bg-gradient-primary" onClick={() => applyJob(selectedJob)}>
                              {t("applyNow")}
                            </Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <Button size="sm" className="bg-gradient-primary" onClick={() => applyJob(job)}>
                      {t("applyNow")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Internships Section */}
      <section id="internships" className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-bold section-heading">{t("latestInternships")}</h2>
            <Button variant="outline" onClick={() => navigate("/student-dashboard")}>
              {t("viewAllInternships")}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {internships.map((internship) => (
              <Card key={internship.id} className="hover:shadow-elegant transition-all duration-300 animate-fade-in">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{internship.title}</CardTitle>
                      <p className="text-muted-foreground">{internship.company}</p>
                    </div>
                    <Badge variant={internship.type === "Paid" ? "default" : "secondary"}>
                      {internship.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {internship.location}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4 mr-2" />
                      {internship.stipend}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      {internship.duration}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {internship.skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedInternship(internship)}>
                          <Eye className="h-4 w-4 mr-2" />
                          {t("viewDetails")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{selectedInternship?.title}</DialogTitle>
                        </DialogHeader>
                        {selectedInternship && (
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">{t("company")}</h4>
                              <p>{selectedInternship.company}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">{t("description")}</h4>
                              <p>{selectedInternship.description}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">{t("requirements")}</h4>
                              <ul className="list-disc list-inside space-y-1">
                                {selectedInternship.requirements.map((req: string, index: number) => (
                                  <li key={index}>{req}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">{t("skills")}</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedInternship.skills.map((skill: string, index: number) => (
                                  <Badge key={index} variant="outline">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              <span><MapPin className="h-4 w-4 inline mr-1" />{selectedInternship.location}</span>
                              <span><DollarSign className="h-4 w-4 inline mr-1" />{selectedInternship.stipend}</span>
                              <span><Clock className="h-4 w-4 inline mr-1" />{selectedInternship.duration}</span>
                            </div>
                            <Button className="w-full bg-gradient-primary" onClick={() => applyJob(selectedInternship)}>
                              {t("applyNow")}
                            </Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <Button size="sm" className="bg-gradient-primary" onClick={() => applyJob(internship)}>
                      {t("applyNow")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-bold section-heading">{t("trendingProducts")}</h2>
            <Button variant="outline" onClick={() => navigate("/student-dashboard")}>
              {t("viewAllProducts")}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-elegant transition-all duration-300 animate-fade-in">
                <div className="relative">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-t-lg">
                      <span className="text-white font-semibold">{t("outOfStock")}</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-destructive">
                      {Math.round(((parseInt(product.originalPrice.slice(1)) - parseInt(product.price.slice(1))) / parseInt(product.originalPrice.slice(1))) * 100)}% OFF
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-primary">{product.price}</span>
                    <span className="text-sm text-muted-foreground line-through">{product.originalPrice}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-warning fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">({product.rating})</span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">{t("soldBy")} {product.seller}</p>
                  
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedProduct(product)}>
                          <Eye className="h-4 w-4 mr-2" />
                          {t("viewDetails")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{selectedProduct?.name}</DialogTitle>
                        </DialogHeader>
                        {selectedProduct && (
                          <div className="space-y-4">
                            <img 
                              src={selectedProduct.image} 
                              alt={selectedProduct.name}
                              className="w-full h-64 object-cover rounded-lg"
                            />
                            <div className="flex items-center gap-4">
                              <span className="text-2xl font-bold text-primary">{selectedProduct.price}</span>
                              <span className="text-lg text-muted-foreground line-through">{selectedProduct.originalPrice}</span>
                              <Badge className="bg-destructive">
                                {Math.round(((parseInt(selectedProduct.originalPrice.slice(1)) - parseInt(selectedProduct.price.slice(1))) / parseInt(selectedProduct.originalPrice.slice(1))) * 100)}% OFF
                              </Badge>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Description</h4>
                              <p>{selectedProduct.description}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Features</h4>
                              <ul className="list-disc list-inside space-y-1">
                                {selectedProduct.features.map((feature: string, index: number) => (
                                  <li key={index}>{feature}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                className="flex-1"
                                onClick={() => addToCart(selectedProduct)}
                                disabled={!selectedProduct.inStock}
                              >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                {t("addToCart")}
                              </Button>
                              <Button 
                                className="flex-1 bg-gradient-primary"
                                onClick={() => buyNow(selectedProduct)}
                                disabled={!selectedProduct.inStock}
                              >
                                {t("buyNow")}
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => addToCart(product)}
                      disabled={!product.inStock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      size="sm" 
                      className="bg-gradient-primary"
                      onClick={() => buyNow(product)}
                      disabled={!product.inStock}
                    >
                      {t("buyNow")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About JBS Platform */}
      <section id="about" className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-8 section-heading">{t("aboutPlatformTitle")}</h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t("aboutPlatformDesc")}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t("forStudents")}</h3>
                <p className="text-muted-foreground">{t("forStudentsDesc")}</p>
              </div>
              
              <div className="text-center">
                <div className="bg-secondary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Store className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t("forBusinesses")}</h3>
                <p className="text-muted-foreground">{t("forBusinessesDesc")}</p>
              </div>
              
              <div className="text-center">
                <div className="bg-warning/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-warning" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t("forGrowth")}</h3>
                <p className="text-muted-foreground">{t("forGrowthDesc")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 section-heading">{t("whatUsersSay")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="text-center animate-fade-in">
                <CardContent className="p-6">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full mx-auto mb-4"
                  />
                  <h3 className="font-semibold mb-1">{testimonial.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{testimonial.role}</p>
                  <p className="text-muted-foreground italic">"{testimonial.review}"</p>
                  <div className="flex justify-center mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-warning fill-current" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4 section-heading">{t("stayUpdated")}</h2>
          <p className="text-white/80 mb-8">{t("newsletterDescNew")}</p>
          <div className="max-w-md mx-auto flex gap-4">
            <Input 
              placeholder={t("enterEmail")} 
              value={newsletter}
              onChange={(e) => setNewsletter(e.target.value)}
              className="bg-white"
            />
            <Button variant="secondary" onClick={subscribeNewsletter}>
              {t("subscribe")}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 gradient-text">JBS</h3>
              <p className="text-gray-400">{t("footerDesc")}</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">{t("quickLinks")}</h4>
              <div className="space-y-2">
                <a href="#home" className="block text-gray-400 hover:text-white transition-colors">{t("home")}</a>
                <a href="#jobs" className="block text-gray-400 hover:text-white transition-colors">{t("jobs")}</a>
                <a href="#internships" className="block text-gray-400 hover:text-white transition-colors">{t("internships")}</a>
                <a href="#products" className="block text-gray-400 hover:text-white transition-colors">{t("buyProducts")}</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">{t("contactInfo")}</h4>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  +91-9876543210
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  support@jbs.com
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">{t("followUs")}</h4>
              <div className="flex space-x-4">
                <Button variant="ghost" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 JBS Platform. {t("allRightsReserved")}.</p>
          </div>
        </div>
      </footer>

      {/* AI Chatbot */}
      <div className="fixed bottom-4 right-4 z-50">
        <Dialog open={showChatbot} onOpenChange={setShowChatbot}>
          <DialogTrigger asChild>
            <Button size="icon" className="rounded-full bg-gradient-primary shadow-glow w-14 h-14 animate-bounce-subtle">
              <Bot className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                {t("jbsAssistant")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="h-64 overflow-y-auto border rounded p-4 space-y-3">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-2 rounded-lg ${
                      msg.type === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder={t("askAnything")}
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                />
                <Button onClick={sendChatMessage}>{t("send")}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default LandingPage;