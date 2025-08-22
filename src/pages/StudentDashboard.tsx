import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import ProductDetails from "@/components/ProductDetails";
import Cart from "@/components/Cart";
import JobApplication from "@/components/JobApplication";
import Messaging from "@/components/Messaging";
import OrderSummary from "@/components/OrderSummary";
import StudentOpportunitiesView from "@/components/StudentOpportunitiesView";
import MyApplications from "@/components/MyApplications";
import { 
  User,
  Bookmark, 
  Bot, 
  Bell, 
  Settings, 
  LogOut,
  Briefcase, 
  GraduationCap, 
  ShoppingCart, 
  MapPin, 
  Clock, 
  DollarSign,
  Star,
  Filter,
  Search,
  Eye,
  Plus,
  Heart,
  MessageCircle,
  MessageSquare,
  Send,
  Edit,
  Phone,
  Mail,
  Calendar,
  Camera,
  Home,
  CreditCard,
  Truck,
  Package,
  Building,
  Menu,
  X,
  Sliders,
  ArrowLeft,
  CheckCircle,
  FileText
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { studentViewAPI } from "@/services/api";
import { useQuery } from "@tanstack/react-query";


const StudentDashboard = () => {
  console.log("StudentDashboard component is rendering");
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { logout: authLogout, user, updateUser, refreshUserProfile } = useAuth();
  const [profileRefreshed, setProfileRefreshed] = useState(false);
  
  // Handle URL parameters for messaging redirection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get('view');
    const type = urlParams.get('type');
    const id = urlParams.get('id');
    
    if (view === 'messaging') {
      setShowMessaging(true);
      // Clear URL parameters after handling
      window.history.replaceState({}, '', '/student-dashboard');
    }
  }, []);

  // Handle My Applications button click from StudentOpportunitiesView
  useEffect(() => {
    const handleShowMyApplications = () => {
      setCurrentView("applications");
    };

    window.addEventListener('showMyApplications', handleShowMyApplications);
    
    return () => {
      window.removeEventListener('showMyApplications', handleShowMyApplications);
    };
  }, []);
  
  // Initialize profile with real user data when component mounts
  useEffect(() => {
    if (user) {
      const userProfile = {
        name: user.profile?.firstName && user.profile?.lastName ? 
          `${user.profile.firstName} ${user.profile.lastName}` : user.username || 'Student User',
        email: user.email || '',
        phone: user.profile?.phone || '',
        city: user.profile?.city || '',
        education: user.profile?.education || 'Student',
        experience: user.profile?.experience || 'Entry Level',
        skills: user.profile?.skills || ['Communication', 'Teamwork'],
        bio: user.profile?.bio || 'Passionate student looking for opportunities.',
        profilePicture: user.profile?.avatar || '',
        preferences: {
          jobTypes: user.profile?.jobTypes || ['Full-time', 'Part-time'],
          salaryRange: user.profile?.salaryRange || '₹0 - ₹15,000',
          workLocation: user.profile?.workLocation || 'On-site',
          industries: user.profile?.industries || ['Technology', 'Education']
        },
        portfolio: {
          website: user.profile?.website || '',
          github: user.profile?.github || '',
          linkedin: user.profile?.linkedin || ''
        },
        documents: {
          resume: user.profile?.resume || '',
          portfolio: user.profile?.portfolio || ''
        }
      };
      setProfile(userProfile);
      setEditedProfile(userProfile);
    }
  }, [user]);
  
  // Refresh user profile from backend when component mounts
  useEffect(() => {
    if (user && refreshUserProfile && !profileRefreshed) {
      refreshUserProfile();
      setProfileRefreshed(true);
    }
  }, [user, refreshUserProfile, profileRefreshed]);
  
  const [currentView, setCurrentView] = useState("jobs");
  const [cart, setCart] = useState<any[]>([]);
  const [savedItems, setSavedItems] = useState({ jobs: [] as any[], internships: [] as any[] });
  const [likedItems, setLikedItems] = useState<{[key: string]: boolean}>({});
  const [orders, setOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { type: "bot", message: "Hello! I'm your JBS AI assistant. How can I help you today? I can help you with job searches, internships, product recommendations, and more!" }
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [notifications, setNotifications] = useState([
    { id: 1, type: "job", message: "New job matching your profile: Frontend Developer", time: "2 hours ago", read: false },
    { id: 2, type: "order", message: "Your order for Wireless Earbuds has been shipped", time: "1 day ago", read: false },
    { id: 3, type: "internship", message: "Application status updated for Digital Marketing Intern", time: "2 days ago", read: true },
    { id: 4, type: "product", message: "Price drop alert: Study Desk Lamp now ₹999", time: "3 hours ago", read: false },
    { id: 5, type: "job", message: "Interview scheduled for Sales Associate position", time: "5 hours ago", read: false },
    { id: 6, type: "order", message: "Order delivered: Premium Laptop Backpack", time: "1 day ago", read: true },
    { id: 7, type: "internship", message: "New internship: UI/UX Design Intern at Tech Corp", time: "4 hours ago", read: false }
  ]);
  const [profile, setProfile] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    phone: "+91-9876543210",
    city: "Mumbai",
    education: "Computer Science Graduate",
    experience: "1-2 years",
    skills: ["JavaScript", "React", "Node.js", "Python", "UI/UX Design"],
    bio: "Passionate software developer with experience in web technologies and design.",
    profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    preferences: {
      jobTypes: ["Full-time", "Part-time", "Remote"],
      salaryRange: "₹15,000 - ₹30,000",
      workLocation: "Hybrid",
      industries: ["Technology", "Marketing", "Design"]
    },
    portfolio: {
      website: "https://alexjohnson.dev",
      github: "https://github.com/alexjohnson",
      linkedin: "https://linkedin.com/in/alexjohnson"
    },
    documents: {
      resume: "alex_resume.pdf",
      portfolio: "alex_portfolio.pdf"
    }
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [reviewData, setReviewData] = useState({
    address: "",
    phone: "",
    paymentMethod: "cod"
  });
  
  // New state variables for enhanced features
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showJobApplication, setShowJobApplication] = useState(false);
  const [showMessaging, setShowMessaging] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobApplications, setJobApplications] = useState<any[]>([]);
  const [selectedProductForOrder, setSelectedProductForOrder] = useState<any>(null);
  const [selectedQuantityForOrder, setSelectedQuantityForOrder] = useState(1);
  
  // Profile edit state
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  
  // View/Edit state for items
  const [showJobDetailsDialog, setShowJobDetailsDialog] = useState(false);
  const [showInternshipDetailsDialog, setShowInternshipDetailsDialog] = useState(false);
  const [showProductDetailsDialog, setShowProductDetailsDialog] = useState(false);
  const [showOrderDetailsDialog, setShowOrderDetailsDialog] = useState(false);
  const [selectedJobForView, setSelectedJobForView] = useState<any>(null);
  const [selectedInternshipForView, setSelectedInternshipForView] = useState<any>(null);
  const [selectedProductForView, setSelectedProductForView] = useState<any>(null);
  const [selectedOrderForView, setSelectedOrderForView] = useState<any>(null);

  // Fetch real jobs and internships from backend
  const { data: jobsData, isLoading: jobsLoading, error: jobsError } = useQuery({
    queryKey: ['student-jobs', searchQuery, selectedCategory, priceRange],
    queryFn: () => studentViewAPI.getJobs({
      search: searchQuery || undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      location: undefined,
      page: 1,
      limit: 50
    }),
    enabled: currentView === "jobs"
  });

  const { data: internshipsData, isLoading: internshipsLoading, error: internshipsError } = useQuery({
    queryKey: ['student-internships', searchQuery, selectedCategory, priceRange],
    queryFn: () => studentViewAPI.getInternships({
      search: searchQuery || undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      location: undefined,
      page: 1,
      limit: 50
    }),
    enabled: currentView === "internships"
  });

  // Use real data or fallback to empty arrays
  const jobs = jobsData?.data || [];
  const internships = internshipsData?.data || [];

  // Extended mock data with more entries and images (fallback)
  const mockJobs = [
    {
      id: 1,
      title: "Part-time Sales Associate",
      company: "TechMart Electronics",
      location: "Chennai, TN",
      pay: "₹15,000/month",
      duration: "6 months",
      type: "Part-time",
      category: "Sales",
      description: "Looking for energetic students to help with customer service and sales. Flexible timings available. Perfect for students who can work evenings and weekends.",
      requirements: ["Good communication skills", "Basic computer knowledge", "Friendly personality", "Previous retail experience preferred"],
      posted: "2 days ago",
      image: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=400&h=200&fit=crop"
    },
    {
      id: 2,
      title: "Food Delivery Executive",
      company: "QuickBites Restaurant",
      location: "Bangalore, KA",
      pay: "₹20,000/month",
      duration: "Ongoing",
      type: "Full-time",
      category: "Delivery",
      description: "Join our delivery team and earn while studying. Own vehicle preferred. Fuel allowance provided.",
      requirements: ["Own vehicle", "Valid license", "Local area knowledge", "Time management skills"],
      posted: "1 day ago",
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=200&fit=crop"
    },
    {
      id: 3,
      title: "Tutor Assistant",
      company: "BrightMinds Coaching",
      location: "Mumbai, MH",
      pay: "₹12,000/month",
      duration: "3 months",
      type: "Part-time",
      category: "Education",
      description: "Help junior students with their studies. Great for education background students. Evening shifts available.",
      requirements: ["Graduate/UG", "Subject expertise", "Teaching aptitude", "Patience with students"],
      posted: "3 days ago",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=200&fit=crop"
    },
    {
      id: 4,
      title: "Customer Service Representative",
      company: "HelpDesk Solutions",
      location: "Hyderabad, TS",
      pay: "₹18,000/month",
      duration: "6 months",
      type: "Part-time",
      category: "Customer Service",
      description: "Handle customer queries via phone and chat. Training provided. Work from home options available.",
      requirements: ["Good English communication", "Computer skills", "Problem-solving ability", "Calm demeanor"],
      posted: "1 day ago",
      image: "https://images.unsplash.com/photo-1553484771-371a605b060b?w=400&h=200&fit=crop"
    },
    {
      id: 5,
      title: "Content Writer Intern",
      company: "Digital Media Hub",
      location: "Delhi, DL",
      pay: "₹14,000/month",
      duration: "4 months",
      type: "Part-time",
      category: "Marketing",
      description: "Create engaging content for social media and blogs. Great opportunity for creative minds.",
      requirements: ["Strong writing skills", "Social media knowledge", "Creative thinking", "Research skills"],
      posted: "2 days ago",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop"
    },
    {
      id: 6,
      title: "Retail Sales Assistant",
      company: "Fashion Forward",
      location: "Kolkata, WB",
      pay: "₹16,000/month",
      duration: "5 months",
      type: "Part-time",
      category: "Retail",
      description: "Assist customers with fashion choices and manage inventory. Great for fashion enthusiasts.",
      requirements: ["Fashion sense", "Customer service skills", "Physical stamina", "Team player"],
      posted: "3 days ago",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop"
    },
    {
      id: 7,
      title: "Digital Marketing Assistant",
      company: "Growth Agency",
      location: "Pune, MH",
      pay: "₹17,000/month",
      duration: "4 months",
      type: "Part-time",
      category: "Marketing",
      description: "Support digital marketing campaigns and social media management. Learn real marketing skills.",
      requirements: ["Social media knowledge", "Basic design skills", "Analytics interest", "Creative thinking"],
      posted: "1 day ago",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop"
    },
    {
      id: 8,
      title: "Event Management Trainee",
      company: "Eventopia",
      location: "Ahmedabad, GJ",
      pay: "₹13,000/month",
      duration: "3 months",
      type: "Part-time",
      category: "Events",
      description: "Help organize and manage events. Great networking opportunity and hands-on experience.",
      requirements: ["Organizational skills", "Communication skills", "Flexibility", "Team coordination"],
      posted: "2 days ago",
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=200&fit=crop"
    },
    {
      id: 9,
      title: "Data Entry Clerk",
      company: "InfoSystems Ltd",
      location: "Noida, UP",
      pay: "₹11,000/month",
      duration: "2 months",
      type: "Part-time",
      category: "Administration",
      description: "Accurate data entry and record maintenance. Perfect for detail-oriented students.",
      requirements: ["Computer literacy", "Attention to detail", "Fast typing", "MS Office knowledge"],
      posted: "4 days ago",
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=200&fit=crop"
    },
    {
      id: 10,
      title: "Frontend Developer Intern",
      company: "WebTech Solutions",
      location: "Gurgaon, HR",
      pay: "₹22,000/month",
      duration: "6 months",
      type: "Full-time",
      category: "Technology",
      description: "Build responsive web applications using React and modern tools. Mentorship included.",
      requirements: ["React knowledge", "HTML/CSS/JS", "Git basics", "Problem-solving skills"],
      posted: "1 day ago",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=200&fit=crop"
    }
  ];

  const mockInternships = [
    {
      id: 1,
      title: "Digital Marketing Intern",
      company: "GrowthHackers Agency",
      location: "Remote",
      stipend: "₹8,000/month",
      duration: "3 months",
      type: "Paid",
      category: "Marketing",
      description: "Learn social media marketing, content creation, and analytics in a fast-growing digital agency. Work with real clients and campaigns.",
      requirements: ["Basic social media knowledge", "Creative thinking", "Good writing skills", "Analytical mindset"],
      skills: ["Social Media", "Content Writing", "Analytics", "SEO"],
      posted: "1 day ago",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop"
    },
    {
      id: 2,
      title: "Web Development Intern",
      company: "CodeCrafters Solutions",
      location: "Hyderabad, TS",
      stipend: "₹12,000/month",
      duration: "6 months",
      type: "Paid",
      category: "Technology",
      description: "Work on real client projects using React, Node.js, and modern web technologies. Mentorship included.",
      requirements: ["HTML/CSS/JS knowledge", "React basics", "Problem-solving skills", "Team collaboration"],
      skills: ["React", "JavaScript", "Node.js", "Git"],
      posted: "2 days ago",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=200&fit=crop"
    },
    {
      id: 3,
      title: "Graphic Design Intern",
      company: "Creative Studio Hub",
      location: "Pune, MH",
      stipend: "₹6,000/month",
      duration: "2 months",
      type: "Paid",
      category: "Design",
      description: "Design marketing materials, social media posts, and brand assets for various clients. Portfolio building opportunity.",
      requirements: ["Photoshop/Illustrator skills", "Portfolio required", "Creative mindset", "Deadline management"],
      skills: ["Photoshop", "Illustrator", "Branding", "UI Design"],
      posted: "4 days ago",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=200&fit=crop"
    },
    {
      id: 4,
      title: "Data Science Intern",
      company: "Analytics Pro",
      location: "Bangalore, KA",
      stipend: "₹15,000/month",
      duration: "6 months",
      type: "Paid",
      category: "Technology",
      description: "Work with real datasets and machine learning models. Gain hands-on experience in data analysis and visualization.",
      requirements: ["Python basics", "Statistics knowledge", "Analytical thinking", "Excel proficiency"],
      skills: ["Python", "Machine Learning", "Data Analysis", "SQL"],
      posted: "3 days ago",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop"
    },
    {
      id: 5,
      title: "Mobile App Development Intern",
      company: "AppTech Solutions",
      location: "Chennai, TN",
      stipend: "₹10,000/month",
      duration: "4 months",
      type: "Paid",
      category: "Technology",
      description: "Develop mobile applications using React Native and Flutter. Work on live projects with experienced developers.",
      requirements: ["Programming knowledge", "Mobile development interest", "Problem-solving", "Learning attitude"],
      skills: ["React Native", "Flutter", "Mobile UI", "API Integration"],
      posted: "1 day ago",
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=200&fit=crop"
    },
    {
      id: 6,
      title: "UI/UX Design Intern",
      company: "DesignCorp",
      location: "Mumbai, MH",
      stipend: "₹9,000/month",
      duration: "3 months",
      type: "Paid",
      category: "Design",
      description: "Create user interfaces and user experiences for web and mobile applications. Build your design portfolio.",
      requirements: ["Design tools knowledge", "User research interest", "Creative thinking", "Attention to detail"],
      skills: ["Figma", "Adobe XD", "User Research", "Prototyping"],
      posted: "2 days ago",
      image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400&h=200&fit=crop"
    },
    {
      id: 7,
      title: "Content Marketing Intern",
      company: "ContentCraft",
      location: "Delhi, DL",
      stipend: "₹7,000/month",
      duration: "3 months",
      type: "Paid",
      category: "Marketing",
      description: "Create blog posts, social media content, and marketing materials. Learn content strategy and SEO.",
      requirements: ["Writing skills", "SEO basics", "Social media knowledge", "Research abilities"],
      skills: ["Content Writing", "SEO", "Social Media", "Marketing"],
      posted: "3 days ago",
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=200&fit=crop"
    },
    {
      id: 8,
      title: "Finance Analyst Intern",
      company: "FinanceHub",
      location: "Bangalore, KA",
      stipend: "₹11,000/month",
      duration: "4 months",
      type: "Paid",
      category: "Finance",
      description: "Assist with financial analysis, reporting, and market research. Great for finance and economics students.",
      requirements: ["Finance knowledge", "Excel skills", "Analytical thinking", "Attention to detail"],
      skills: ["Excel", "Financial Analysis", "Reporting", "Research"],
      posted: "2 days ago",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=200&fit=crop"
    },
    {
      id: 9,
      title: "HR Intern",
      company: "PeopleFirst",
      location: "Mumbai, MH",
      stipend: "₹8,500/month",
      duration: "3 months",
      type: "Paid",
      category: "Human Resources",
      description: "Support recruitment, employee engagement, and HR operations. Learn about human resources management.",
      requirements: ["Communication skills", "People skills", "Organizational ability", "Confidentiality"],
      skills: ["Recruitment", "Employee Relations", "HR Operations", "Communication"],
      posted: "1 day ago",
      image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=200&fit=crop"
    },
    {
      id: 10,
      title: "Product Management Intern",
      company: "InnovateTech",
      location: "Pune, MH",
      stipend: "₹13,000/month",
      duration: "5 months",
      type: "Paid",
      category: "Product",
      description: "Work with product teams to develop roadmaps, analyze user feedback, and support product launches.",
      requirements: ["Analytical thinking", "Communication skills", "Tech interest", "Problem-solving"],
      skills: ["Product Strategy", "User Research", "Analytics", "Communication"],
      posted: "3 days ago",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop"
    }
  ];

  const products = [
    {
      id: 1,
      name: "Wireless Earbuds Pro",
      price: "₹2,999",
      originalPrice: "₹4,999",
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&h=300&fit=crop",
      seller: "TechStore Premium",
      category: "Electronics",
      description: "Premium wireless earbuds with active noise cancellation, 30-hour battery life, and premium sound quality. Perfect for students and professionals.",
      features: ["Active Noise Cancellation", "30hr Battery Life", "Premium Sound", "Water Resistant", "Quick Charge"],
      inStock: true,
      reviews: 1250,
      shipping: "Free delivery"
    },
    {
      id: 2,
      name: "LED Study Desk Lamp",
      price: "₹1,299",
      originalPrice: "₹1,999",
      rating: 4.2,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
      seller: "HomeDecor Plus",
      category: "Furniture",
      description: "Adjustable LED desk lamp with eye-care technology, multiple brightness levels, and USB charging port. Perfect for late-night studying.",
      features: ["Eye-care LED", "Adjustable Arm", "USB Charging Port", "Touch Control", "Memory Function"],
      inStock: true,
      reviews: 890,
      shipping: "₹50 delivery"
    },
    {
      id: 3,
      name: "Premium Laptop Backpack",
      price: "₹1,999",
      originalPrice: "₹2,999",
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop",
      seller: "BagMart Pro",
      category: "Accessories",
      description: "Water-resistant laptop backpack with anti-theft zippers, multiple compartments, and ergonomic design. Perfect for students and professionals.",
      features: ["Anti-theft Zippers", "Laptop Compartment", "Water Resistant", "Multiple Pockets", "Ergonomic Design"],
      inStock: true,
      reviews: 2100,
      shipping: "Free delivery"
    },
    {
      id: 4,
      name: "Smart Fitness Watch",
      price: "₹3,999",
      originalPrice: "₹5,999",
      rating: 4.3,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
      seller: "FitTech Solutions",
      category: "Electronics",
      description: "Advanced fitness tracking with heart rate monitoring, GPS, sleep tracking, and 10-day battery life. Stay healthy while studying.",
      features: ["Heart Rate Monitor", "GPS Tracking", "Sleep Monitor", "10-day Battery", "Waterproof"],
      inStock: true,
      reviews: 750,
      shipping: "Free delivery"
    },
    {
      id: 5,
      name: "Bluetooth Keyboard",
      price: "₹1,799",
      originalPrice: "₹2,499",
      rating: 4.4,
      image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop",
      seller: "TechMart",
      category: "Electronics",
      description: "Wireless mechanical keyboard with RGB backlighting, long battery life, and ergonomic design for comfortable typing.",
      features: ["Mechanical Keys", "RGB Backlight", "Wireless", "Long Battery", "Ergonomic"],
      inStock: false,
      reviews: 450,
      shipping: "₹75 delivery"
    },
    {
      id: 6,
      name: "Study Chair Cushion",
      price: "₹899",
      originalPrice: "₹1,299",
      rating: 4.1,
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
      seller: "ComfortZone",
      category: "Furniture",
      description: "Memory foam chair cushion for better posture and comfort during long study sessions. Reduces back pain and improves focus.",
      features: ["Memory Foam", "Ergonomic Design", "Washable Cover", "Non-slip Base", "Posture Support"],
      inStock: true,
      reviews: 680,
      shipping: "₹40 delivery"
    },
    {
      id: 7,
      name: "Wireless Mouse",
      price: "₹1,199",
      originalPrice: "₹1,699",
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop",
      seller: "TechMart",
      category: "Electronics",
      description: "Ergonomic wireless mouse with precision tracking, long battery life, and silent clicking for quiet study environments.",
      features: ["Silent Clicks", "Precision Tracking", "Ergonomic Design", "Long Battery", "Wireless"],
      inStock: true,
      reviews: 520,
      shipping: "Free delivery"
    },
    {
      id: 8,
      name: "USB-C Hub",
      price: "₹2,299",
      originalPrice: "₹3,199",
      rating: 4.4,
      image: "https://images.unsplash.com/photo-1589739900243-493d3a434c77?w=400&h=300&fit=crop",
      seller: "TechHub",
      category: "Electronics",
      description: "Multi-port USB-C hub with HDMI, USB ports, and card readers. Perfect for expanding laptop connectivity.",
      features: ["Multi-port", "HDMI Output", "USB 3.0", "Card Reader", "Compact Design"],
      inStock: true,
      reviews: 340,
      shipping: "₹60 delivery"
    },
    {
      id: 9,
      name: "Notebook Set",
      price: "₹599",
      originalPrice: "₹899",
      rating: 4.3,
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
      seller: "StationeryWorld",
      category: "Stationery",
      description: "High-quality notebook set with ruled pages, perfect for note-taking and journaling. Durable binding and smooth paper.",
      features: ["High-quality Paper", "Durable Binding", "Multiple Sizes", "Ruled Pages", "Eco-friendly"],
      inStock: true,
      reviews: 820,
      shipping: "₹25 delivery"
    },
    {
      id: 10,
      name: "Portable Phone Stand",
      price: "₹699",
      originalPrice: "₹999",
      rating: 4.2,
      image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=300&fit=crop",
      seller: "TechAccess",
      category: "Accessories",
      description: "Adjustable phone stand for video calls, watching content, and hands-free use. Compatible with all smartphones.",
      features: ["Adjustable Angle", "Universal Compatibility", "Foldable", "Non-slip Base", "Lightweight"],
      inStock: true,
      reviews: 290,
      shipping: "₹30 delivery"
    },
    {
      id: 11,
      name: "Programming Book Bundle",
      price: "₹2,499",
      originalPrice: "₹3,999",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
      seller: "BookHub Pro",
      category: "Books",
      description: "Complete programming book collection covering JavaScript, Python, React, and algorithms. Perfect for computer science students.",
      features: ["Latest Editions", "Code Examples", "Practice Problems", "Digital Access", "Expert Authors"],
      inStock: true,
      reviews: 1150,
      shipping: "Free delivery"
    },
    {
      id: 12,
      name: "Blue Light Glasses",
      price: "₹1,299",
      originalPrice: "₹1,899",
      rating: 4.4,
      image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=300&fit=crop",
      seller: "EyeCare Plus",
      category: "Health",
      description: "Stylish blue light blocking glasses to reduce eye strain from screens. Perfect for students spending long hours studying on computers.",
      features: ["Blue Light Protection", "Anti-glare", "Stylish Design", "Comfortable Fit", "UV Protection"],
      inStock: true,
      reviews: 670,
      shipping: "₹40 delivery"
    }
  ];

  // Filter functions
  const getFilteredJobs = () => {
    let filtered = jobs;
    
    if (searchQuery) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(job => job.category === selectedCategory);
    }
    
    if (priceRange !== "all") {
      filtered = filtered.filter(job => {
        const salary = parseInt(job.pay.replace(/[^\d]/g, ''));
        if (priceRange === "0-15000") return salary <= 15000;
        if (priceRange === "15000-20000") return salary >= 15000 && salary <= 20000;
        if (priceRange === "20000+") return salary >= 20000;
        return true;
      });
    }
    
    return filtered;
  };

  const getFilteredInternships = () => {
    let filtered = internships;
    
    if (searchQuery) {
      filtered = filtered.filter(internship => 
        internship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        internship.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        internship.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(internship => internship.category === selectedCategory);
    }
    
    if (priceRange !== "all") {
      filtered = filtered.filter(internship => {
        const stipend = parseInt(internship.stipend.replace(/[^\d]/g, ''));
        if (priceRange === "0-8000") return stipend <= 8000;
        if (priceRange === "8000-12000") return stipend >= 8000 && stipend <= 12000;
        if (priceRange === "12000+") return stipend >= 12000;
        return true;
      });
    }
    
    return filtered;
  };

  const getFilteredProducts = () => {
    let filtered = products;
    
    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.seller.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    if (priceRange !== "all") {
      filtered = filtered.filter(product => {
        const price = parseInt(product.price.replace(/[^\d]/g, ''));
        if (priceRange === "0-1000") return price <= 1000;
        if (priceRange === "1000-3000") return price >= 1000 && price <= 3000;
        if (priceRange === "3000+") return price >= 3000;
        return true;
      });
    }
    
    return filtered;
  };

  const getFilteredOrders = () => {
    return orders.filter(order => 
      searchQuery === "" || 
      order.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyerName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const applyFilters = () => {
    // Filters are applied automatically through the filter functions
    toast({
      title: "Filters Applied",
      description: "Search results updated based on your filters."
    });
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setPriceRange("all");
    toast({
      title: "Filters Reset",
      description: "All filters have been cleared."
    });
  };

  const likeItem = (id: number, type: string) => {
    setLikedItems(prev => ({
      ...prev,
      [`${type}-${id}`]: !prev[`${type}-${id}`]
    }));
    toast({
      title: likedItems[`${type}-${id}`] ? "Removed from favorites" : "Added to favorites",
      description: "Item has been updated in your favorites list."
    });
  };

  const addToCart = (product: any, quantity: number = 1) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(prev => prev.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart(prev => [...prev, { ...product, quantity }]);
    }
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`
    });
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    setCart(prev => prev.map(item => 
      item.id === productId ? { ...item, quantity } : item
    ));
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.id !== productId));
    toast({
      title: "Removed from Cart",
      description: "Item has been removed from your cart."
    });
  };

  const handleJobApply = (job: any) => {
    setSelectedJob(job);
    setShowJobApplication(true);
  };

  const handleJobApplicationSubmit = (jobId: number) => {
    const application = {
      id: Date.now(),
      jobId,
      job: selectedJob,
      status: "Applied",
      appliedDate: new Date().toISOString(),
      studentId: "student123",
      studentName: profile.name
    };
    setJobApplications(prev => [...prev, application]);
    toast({
      title: "Application Submitted",
      description: "Your job application has been submitted successfully."
    });
  };

  const handleJobMessage = (jobId: number) => {
    setShowMessaging(true);
    toast({
      title: "Message Feature",
      description: "Messaging feature opened. You can now communicate with the employer."
    });
  };

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };

  const handleBuyNow = (product: any, quantity: number) => {
    setSelectedProductForOrder(product);
    setSelectedQuantityForOrder(quantity);
    setShowOrderSummary(true);
    setShowProductDetails(false);
  };

  const handleOrderPlaced = (order: any) => {
    setOrders(prev => [...prev, order]);
    
    // Add notification for successful order
    const newNotification = {
      id: Date.now(),
      type: "order",
      message: `Order placed successfully! ${order.productName} - Order ID: ${order.id}`,
      time: "Just now",
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
    
    toast({
      title: "Order Placed Successfully!",
      description: `Your order for ${order.productName} has been placed. You will receive updates via notifications.`,
    });
  };

  // View functions for items
  const handleViewJob = (job: any) => {
    setSelectedJobForView(job);
    setShowJobDetailsDialog(true);
  };

  const handleViewInternship = (internship: any) => {
    setSelectedInternshipForView(internship);
    setShowInternshipDetailsDialog(true);
  };

  const handleViewProduct = (product: any) => {
    setSelectedProductForView(product);
    setShowProductDetailsDialog(true);
  };

  const handleViewOrder = (order: any) => {
    setSelectedOrderForView(order);
    setShowOrderDetailsDialog(true);
  };

  const saveItem = (item: any, type: 'jobs' | 'internships') => {
    setSavedItems(prev => ({
      ...prev,
      [type]: [...prev[type], item]
    }));
    toast({
      title: "Item Saved",
      description: `${item.title} has been saved to your bookmarks.`
    });
  };

  const sendChatMessage = () => {
    if (currentMessage.trim()) {
      setChatMessages([...chatMessages, 
        { type: "user", message: currentMessage },
        { type: "bot", message: getAIResponse(currentMessage) }
      ]);
      setCurrentMessage("");
    }
  };

  const getAIResponse = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('job') || lowerMessage.includes('work') || lowerMessage.includes('employment')) {
      return "I can help you find the perfect job! I see you're interested in employment opportunities. Based on your profile, I recommend checking out our " + (currentView === 'jobs' ? 'current job listings' : 'Jobs section') + ". Would you like me to filter jobs by your preferred location, salary range, or job type?";
    } else if (lowerMessage.includes('internship') || lowerMessage.includes('intern')) {
      return "Great choice looking into internships! They're perfect for gaining experience while studying. I can help you find internships in " + (profile.skills.join(', ')) + " or other areas you're interested in. Would you like me to show you paid internships or filter by duration?";
    } else if (lowerMessage.includes('product') || lowerMessage.includes('buy') || lowerMessage.includes('shop')) {
      return "I can help you find the right products for your studies! We have everything from tech gadgets to study materials. What specific products are you looking for? I can filter by category, price range, or show you our most popular items among students.";
    } else if (lowerMessage.includes('cart') || lowerMessage.includes('order')) {
      return `You currently have ${cart.length} items in your cart. ${cart.length > 0 ? "Would you like me to help you review your cart or proceed with checkout?" : "Would you like me to recommend some popular products that other students are buying?"}`;
    } else if (lowerMessage.includes('salary') || lowerMessage.includes('pay') || lowerMessage.includes('money')) {
      return "I can help you find opportunities that match your salary expectations! Based on your experience level, I'd recommend looking at positions paying ₹15,000-₹25,000 per month. Would you like me to filter jobs and internships by specific salary ranges?";
    } else if (lowerMessage.includes('profile') || lowerMessage.includes('skill') || lowerMessage.includes('experience')) {
      return `Based on your profile, you have skills in ${profile.skills.slice(0, 3).join(', ')}. I can help you find opportunities that match your background in ${profile.education}. Would you like me to recommend jobs or internships specifically for your skill set?`;
    } else if (lowerMessage.includes('location') || lowerMessage.includes('remote') || lowerMessage.includes('city')) {
      return `I see you're based in ${profile.city}. I can help you find local opportunities or remote work options. Would you like me to filter jobs by location preferences - local, remote, or hybrid positions?`;
    } else if (lowerMessage.includes('notification') || lowerMessage.includes('update') || lowerMessage.includes('alert')) {
      return `You have ${notifications.filter(n => !n.read).length} unread notifications including job matches, order updates, and application status changes. Would you like me to summarize your important notifications?`;
    } else if (lowerMessage.includes('help') || lowerMessage.includes('how') || lowerMessage.includes('what')) {
      return "I'm here to help you navigate the JBS platform! I can assist you with finding jobs, internships, shopping for study materials, managing your orders, and updating your profile. What specific area would you like help with today?";
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return `Hello ${profile.name}! I'm your personal JBS assistant. I can help you find the perfect job or internship, recommend study products, manage your applications, and answer any questions about the platform. What would you like to explore today?`;
    } else {
      return "I'm your JBS AI assistant, specialized in helping students like you find jobs, internships, and study materials. I can search and filter opportunities based on your preferences, help manage your applications and orders, and provide personalized recommendations. How can I assist you today?";
    }
  };

  const markNotificationRead = (id: number) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const placeOrder = () => {
    if (!reviewData.address || !reviewData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const order = {
      id: Date.now(),
      productName: selectedProduct?.name,
      productImage: selectedProduct?.image,
      buyerName: profile.name,
      buyerEmail: profile.email,
      buyerPhone: reviewData.phone,
      amount: selectedProduct?.price,
      orderDate: new Date().toISOString().split('T')[0],
      status: "pending",
      address: reviewData.address,
      paymentMethod: reviewData.paymentMethod
    };

    setOrders(prev => [...prev, order]);
    setCart(prev => prev.filter(item => item.id !== selectedProduct?.id));
    setShowReview(false);
    setSelectedProduct(null);
    
    toast({
      title: "Order Placed Successfully!",
      description: `Your order for ${selectedProduct?.name} has been placed.`
    });
  };

  const logout = () => {
    // Call the AuthContext logout function to clear authentication state
    authLogout();
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out."
    });
    
    // Redirect to home page
    window.location.href = "/";
  };

  // Profile edit functions
  const handleProfileEdit = () => {
    setIsProfileEditing(true);
    // Initialize edited profile with current user data
    if (user) {
      setEditedProfile({
        name: user.profile?.firstName && user.profile?.lastName ? 
          `${user.profile.firstName} ${user.profile.lastName}` : user.username || '',
        email: user.email || '',
        phone: user.profile?.phone || '',
        city: user.profile?.city || '',
        bio: user.profile?.bio || '',
        education: user.profile?.education || 'Student',
        profilePicture: user.profile?.avatar || '',
        skills: user.profile?.skills || ['Communication', 'Teamwork'],
        experience: user.profile?.experience || 'Entry Level',
        preferences: {
          jobTypes: user.profile?.jobTypes || ['Full-time', 'Part-time'],
          salaryRange: user.profile?.salaryRange || '₹0 - ₹15,000',
          workLocation: user.profile?.workLocation || 'On-site',
          industries: user.profile?.industries || ['Technology', 'Education']
        },
        portfolio: {
          website: user.profile?.website || '',
          github: user.profile?.github || '',
          linkedin: user.profile?.linkedin || ''
        }
      });
    }
  };

  const handleProfileSave = async () => {
    try {
      // Extract profile data from editedProfile
      const profileData = {
        profile: {
          firstName: editedProfile.name.split(' ')[0] || '',
          lastName: editedProfile.name.split(' ').slice(1).join(' ') || '',
          phone: editedProfile.phone,
          city: editedProfile.city,
          bio: editedProfile.bio,
          education: editedProfile.education,
          skills: editedProfile.skills,
          experience: editedProfile.experience,
          jobTypes: editedProfile.preferences.jobTypes,
          salaryRange: editedProfile.preferences.salaryRange,
          workLocation: editedProfile.preferences.workLocation,
          industries: editedProfile.preferences.industries,
          website: editedProfile.portfolio.website,
          github: editedProfile.portfolio.github,
          linkedin: editedProfile.portfolio.linkedin
        }
      };

      // Update profile in backend
      await updateUser(profileData);
      
      // Update local profile state
      setProfile(editedProfile);
      setIsProfileEditing(false);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      
      // Refresh user data from backend
      await refreshUserProfile();
      
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleProfileCancel = () => {
    setIsProfileEditing(false);
    setEditedProfile(profile);
  };

  const handleProfileFieldChange = (field: string, value: any) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const menuItems = [
    { id: "jobs", label: "Jobs", icon: Briefcase },
    { id: "internships", label: "Internships", icon: GraduationCap },
    { id: "applications", label: "My Applications", icon: FileText },
    { id: "products", label: "Products", icon: ShoppingCart },
    { id: "orders", label: "My Orders", icon: Package },
    { id: "saved", label: "Saved Items", icon: Bookmark },
    { id: "chat", label: "AI Assistant", icon: Bot },
    { id: "messaging", label: "Messages", icon: MessageSquare },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  const getCategories = () => {
    if (currentView === "jobs") {
      return ["all", "Sales", "Delivery", "Education", "Customer Service", "Marketing", "Retail", "Events", "Administration", "Technology"];
    } else if (currentView === "internships") {
      return ["all", "Marketing", "Technology", "Design", "Finance", "Human Resources", "Product"];
    } else if (currentView === "products") {
      return ["all", "Electronics", "Furniture", "Accessories", "Stationery", "Books", "Health"];
    }
    return ["all"];
  };

  const getPriceRanges = () => {
    if (currentView === "jobs") {
      return [
        { value: "all", label: "All Salaries" },
        { value: "0-15000", label: "₹0 - ₹15,000" },
        { value: "15000-20000", label: "₹15,000 - ₹20,000" },
        { value: "20000+", label: "₹20,000+" }
      ];
    } else if (currentView === "internships") {
      return [
        { value: "all", label: "All Stipends" },
        { value: "0-8000", label: "₹0 - ₹8,000" },
        { value: "8000-12000", label: "₹8,000 - ₹12,000" },
        { value: "12000+", label: "₹12,000+" }
      ];
    } else if (currentView === "products") {
      return [
        { value: "all", label: "All Prices" },
        { value: "0-1000", label: "₹0 - ₹1,000" },
        { value: "1000-3000", label: "₹1,000 - ₹3,000" },
        { value: "3000+", label: "₹3,000+" }
      ];
    }
    return [{ value: "all", label: "All" }];
  };

  return (
    <div className="min-h-screen bg-background flex">

      {/* Fixed Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} fixed left-0 top-0 h-full bg-card border-r border-border transition-all duration-300 z-50 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Building className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg gradient-text">JBS</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hover:bg-accent"
          >
            {sidebarCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </Button>
        </div>

        {/* Sidebar Menu */}
        <div className="flex-1 p-2 space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={currentView === item.id ? "default" : "ghost"}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-3'} h-10`}
              onClick={() => {
                if (item.id === "internships") {
                  setCurrentView("internships");
                } else if (item.id === "messaging") {
                  setShowMessaging(true);
                } else {
                  setCurrentView(item.id);
                }
              }}
            >
              <item.icon className={`w-4 h-4 ${sidebarCollapsed ? '' : 'mr-2'}`} />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Button>
          ))}
        </div>

        {/* Logout Button */}
        <div className="p-2 border-t border-border">
          <Button
            variant="ghost"
            className={`w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 ${sidebarCollapsed ? 'px-2' : 'px-3'} h-10`}
            onClick={logout}
          >
            <LogOut className={`w-4 h-4 ${sidebarCollapsed ? '' : 'mr-2'}`} />
            {!sidebarCollapsed && <span>Logout</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300`}>
        {/* Advanced Filter Bar */}
        {["jobs", "internships", "products", "orders"].includes(currentView) && (
          <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border p-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder={`Search ${currentView}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Enhanced Filter Dialog */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="whitespace-nowrap">
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Filter {currentView}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {/* Category Filter */}
                      <div>
                        <Label>Category</Label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger className="w-full mt-2">
                            <SelectValue placeholder="All Categories" />
                          </SelectTrigger>
                          <SelectContent>
                            {getCategories().map(category => (
                              <SelectItem key={category} value={category}>
                                {category === "all" ? "All Categories" : category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Price Range Filter */}
                      <div>
                        <Label>
                          {currentView === "jobs" ? "Salary Range" : 
                           currentView === "internships" ? "Stipend Range" : "Price Range"}
                        </Label>
                        <Select value={priceRange} onValueChange={setPriceRange}>
                          <SelectTrigger className="w-full mt-2">
                            <SelectValue placeholder="All Ranges" />
                          </SelectTrigger>
                          <SelectContent>
                            {getPriceRanges().map(range => (
                              <SelectItem key={range.value} value={range.value}>
                                {range.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Additional Filters for Jobs/Internships */}
                      {(currentView === "jobs" || currentView === "internships") && (
                        <>
                          <div>
                            <Label>Type</Label>
                            <Select defaultValue="all">
                              <SelectTrigger className="w-full mt-2">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="full-time">Full-time</SelectItem>
                                <SelectItem value="part-time">Part-time</SelectItem>
                                <SelectItem value="remote">Remote</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Duration</Label>
                            <Select defaultValue="all">
                              <SelectTrigger className="w-full mt-2">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Any Duration</SelectItem>
                                <SelectItem value="1-3">1-3 months</SelectItem>
                                <SelectItem value="3-6">3-6 months</SelectItem>
                                <SelectItem value="6+">6+ months</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}

                      {/* Additional Filters for Products */}
                      {currentView === "products" && (
                        <>
                          <div>
                            <Label>Rating</Label>
                            <Select defaultValue="all">
                              <SelectTrigger className="w-full mt-2">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Ratings</SelectItem>
                                <SelectItem value="4+">4+ Stars</SelectItem>
                                <SelectItem value="3+">3+ Stars</SelectItem>
                                <SelectItem value="2+">2+ Stars</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Availability</Label>
                            <Select defaultValue="all">
                              <SelectTrigger className="w-full mt-2">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Products</SelectItem>
                                <SelectItem value="in-stock">In Stock</SelectItem>
                                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-4">
                        <Button variant="outline" onClick={resetFilters} className="flex-1">
                          Reset
                        </Button>
                        <Button onClick={applyFilters} className="flex-1">
                          Apply
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="p-6">
          {/* Jobs View */}
          {currentView === "jobs" && (
            <div className="max-w-6xl mx-auto">
              <StudentOpportunitiesView opportunityType="jobs" />
            </div>
          )}

          {/* Internships View */}
          {currentView === "internships" && (
            <div className="max-w-6xl mx-auto">
              <StudentOpportunitiesView opportunityType="internships" />
            </div>
          )}

          {/* My Applications View */}
          {currentView === "applications" && (
            <div className="max-w-6xl mx-auto">
              <MyApplications />
            </div>
          )}

          {/* Products View */}
          {currentView === "products" && (
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentView("dashboard")}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <h1 className="text-3xl font-bold gradient-text">Student Products</h1>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="px-3 py-1">
                    {getFilteredProducts().length} Products Found
                  </Badge>
                  <Button
                    variant="outline"
                    onClick={() => setShowCart(true)}
                    className="relative"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Cart ({cart.length})
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {getFilteredProducts().map((product) => (
                  <Card 
                    key={product.id} 
                    className="hover:shadow-lg transition-all duration-300 group border-border/50 hover:border-primary/20 cursor-pointer"
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            likeItem(product.id, 'product');
                          }}
                          className="bg-background/80 backdrop-blur-sm hover:bg-background"
                        >
                          <Heart 
                            className={`w-4 h-4 ${likedItems[`product-${product.id}`] ? 'fill-red-500 text-red-500' : ''}`} 
                          />
                        </Button>
                      </div>
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Badge variant="destructive">Out of Stock</Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                          <p className="text-muted-foreground text-xs">
                            by {product.seller}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-primary">{product.price}</span>
                          {product.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              {product.originalPrice}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm ml-1">{product.rating}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            ({product.reviews} reviews)
                          </span>
                        </div>
                        
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewProduct(product);
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1 hover-scale"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product);
                            }}
                            disabled={!product.inStock}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* My Orders View */}
          {currentView === "orders" && (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentView("dashboard")}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <h1 className="text-3xl font-bold gradient-text">My Orders</h1>
                </div>
                <Badge variant="secondary" className="px-3 py-1">
                  {getFilteredOrders().length} Orders
                </Badge>
              </div>
              
              {getFilteredOrders().length === 0 ? (
                <Card className="p-8 text-center">
                  <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start shopping to see your orders here!
                  </p>
                  <Button onClick={() => setCurrentView("products")}>
                    Browse Products
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {getFilteredOrders().map((order) => (
                    <Card key={order.id} className="p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleViewOrder(order)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img 
                            src={order.productImage} 
                            alt={order.productName}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div>
                            <h3 className="font-semibold">{order.productName}</h3>
                            <p className="text-muted-foreground">Order #{order.id}</p>
                            <p className="text-sm text-muted-foreground">
                              Ordered on {order.orderDate}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">{order.amount}</p>
                          <Badge 
                            variant={order.status === "delivered" ? "default" : 
                                   order.status === "shipped" ? "secondary" : "outline"}
                            className="mt-1"
                          >
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Saved Items View */}
          {currentView === "saved" && (
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentView("dashboard")}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <h1 className="text-3xl font-bold gradient-text">Saved Items</h1>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Saved Jobs */}
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Briefcase className="w-5 h-5 mr-2" />
                    Saved Jobs ({savedItems.jobs.length})
                  </h2>
                  {savedItems.jobs.length === 0 ? (
                    <Card className="p-8 text-center">
                      <Bookmark className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">No saved jobs yet</p>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {savedItems.jobs.map((job) => (
                        <Card key={job.id} className="p-4">
                          <h3 className="font-semibold">{job.title}</h3>
                          <p className="text-muted-foreground text-sm">{job.company}</p>
                          <p className="text-primary font-medium mt-2">{job.pay}</p>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Saved Internships */}
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2" />
                    Saved Internships ({savedItems.internships.length})
                  </h2>
                  {savedItems.internships.length === 0 ? (
                    <Card className="p-8 text-center">
                      <Bookmark className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">No saved internships yet</p>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {savedItems.internships.map((internship) => (
                        <Card key={internship.id} className="p-4">
                          <h3 className="font-semibold">{internship.title}</h3>
                          <p className="text-muted-foreground text-sm">{internship.company}</p>
                          <p className="text-primary font-medium mt-2">{internship.stipend}</p>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* AI Assistant View */}
          {currentView === "chat" && (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentView("dashboard")}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <h1 className="text-3xl font-bold gradient-text">AI Assistant</h1>
              </div>
              
              <Card className="h-[400px] flex flex-col">
                <CardHeader className="border-b border-border py-3">
                  <CardTitle className="flex items-center text-lg">
                    <Bot className="w-5 h-5 mr-2" />
                    JBS AI Assistant
                  </CardTitle>
                </CardHeader>
                
                <div className="flex-1 p-3 overflow-y-auto space-y-3 max-h-[280px]">
                  {chatMessages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] p-2 rounded-lg text-sm ${
                        msg.type === "user" 
                          ? "bg-primary text-primary-foreground ml-2" 
                          : "bg-muted mr-2"
                      }`}>
                        {msg.message}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-3 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask me anything..."
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                      className="flex-1"
                    />
                    <Button onClick={sendChatMessage} disabled={!currentMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Notifications View */}
          {currentView === "notifications" && (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold gradient-text">Notifications</h1>
                <Badge variant="secondary" className="px-3 py-1">
                  {notifications.filter(n => !n.read).length} Unread
                </Badge>
              </div>
              
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                      !notification.read ? "border-primary/50 bg-primary/5" : ""
                    }`}
                    onClick={() => markNotificationRead(notification.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          !notification.read ? "bg-primary" : "bg-muted-foreground"
                        }`} />
                        <div>
                          <p className={notification.read ? "text-muted-foreground" : ""}>
                            {notification.message}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {notification.type}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Profile View */}
          {currentView === "profile" && (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold gradient-text">Profile</h1>
                {!isProfileEditing ? (
                  <Button onClick={handleProfileEdit} className="flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleProfileCancel}>
                      Cancel
                    </Button>
                    <Button onClick={handleProfileSave} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Picture & Basic Info */}
                <Card className="p-6">
                  <div className="text-center">
                    <Avatar className="w-24 h-24 mx-auto mb-4">
                      <AvatarImage src={profile.profilePicture} />
                      <AvatarFallback>{profile.name[0]}</AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-semibold">{profile.name}</h2>
                    <p className="text-muted-foreground">{profile.education}</p>
                    <Button variant="outline" className="mt-4">
                      <Camera className="w-4 h-4 mr-2" />
                      Change Photo
                    </Button>
                  </div>
                </Card>

                {/* Contact Information */}
                <Card className="p-6 lg:col-span-2">
                  <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Full Name</Label>
                        <Input 
                          value={isProfileEditing ? editedProfile.name : profile.name} 
                          readOnly={!isProfileEditing}
                          onChange={(e) => handleProfileFieldChange('name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input 
                          value={isProfileEditing ? editedProfile.email : profile.email} 
                          readOnly={!isProfileEditing}
                          onChange={(e) => handleProfileFieldChange('email', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input 
                          value={isProfileEditing ? editedProfile.phone : profile.phone} 
                          readOnly={!isProfileEditing}
                          onChange={(e) => handleProfileFieldChange('phone', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>City</Label>
                        <Input 
                          value={isProfileEditing ? editedProfile.city : profile.city} 
                          readOnly={!isProfileEditing}
                          onChange={(e) => handleProfileFieldChange('city', e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Bio</Label>
                      <Textarea 
                        value={isProfileEditing ? editedProfile.bio : profile.bio} 
                        readOnly={!isProfileEditing}
                        onChange={(e) => handleProfileFieldChange('bio', e.target.value)}
                      />
                    </div>
                  </div>
                </Card>

                {/* Skills & Experience */}
                <Card className="p-6 lg:col-span-3">
                  <h3 className="text-lg font-semibold mb-4">Skills & Experience</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium">Skills</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {profile.skills.map((skill) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Experience</Label>
                      <p className="mt-2 text-muted-foreground">{profile.experience}</p>
                    </div>
                  </div>
                </Card>

                {/* Job Preferences */}
                <Card className="p-6 lg:col-span-3">
                  <h3 className="text-lg font-semibold mb-4">Job Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Job Types</Label>
                      <div className="mt-2 space-y-1">
                        {profile.preferences.jobTypes.map((type) => (
                          <Badge key={type} variant="outline" className="block w-fit">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Salary Range</Label>
                      <p className="mt-2 text-muted-foreground">{profile.preferences.salaryRange}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Work Location</Label>
                      <p className="mt-2 text-muted-foreground">{profile.preferences.workLocation}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Industries</Label>
                      <div className="mt-2 space-y-1">
                        {profile.preferences.industries.map((industry) => (
                          <Badge key={industry} variant="outline" className="block w-fit">
                            {industry}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Portfolio Links */}
                <Card className="p-6 lg:col-span-3">
                  <h3 className="text-lg font-semibold mb-4">Portfolio & Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Website</Label>
                      <p className="mt-1 text-primary">{profile.portfolio.website}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">GitHub</Label>
                      <p className="mt-1 text-primary">{profile.portfolio.github}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">LinkedIn</Label>
                      <p className="mt-1 text-primary">{profile.portfolio.linkedin}</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Enhanced Settings View */}
          {currentView === "settings" && (
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold gradient-text mb-6">Settings</h1>
              
              <div className="space-y-6">
                {/* Account Settings */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Account Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Display Name</Label>
                        <Input defaultValue={profile.name} />
                      </div>
                      <div>
                        <Label>Email Address</Label>
                        <Input defaultValue={profile.email} />
                      </div>
                    </div>
                    <div>
                      <Label>Change Password</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <Input type="password" placeholder="Current Password" />
                        <Input type="password" placeholder="New Password" />
                      </div>
                    </div>
                    <Button>Update Account</Button>
                  </div>
                </Card>

                {/* Notification Preferences */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Bell className="w-5 h-5 mr-2" />
                    Notification Preferences
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Job Alerts</Label>
                        <p className="text-sm text-muted-foreground">Get notified about new job opportunities</p>
                      </div>
                      <input type="checkbox" defaultChecked className="toggle" aria-label="Enable job alerts" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Internship Alerts</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications about internship openings</p>
                      </div>
                      <input type="checkbox" defaultChecked className="toggle" aria-label="Enable internship alerts" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Order Updates</Label>
                        <p className="text-sm text-muted-foreground">Get updates on your order status</p>
                      </div>
                      <input type="checkbox" defaultChecked className="toggle" aria-label="Enable order updates" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Price Drop Alerts</Label>
                        <p className="text-sm text-muted-foreground">Notify when saved products go on sale</p>
                      </div>
                      <input type="checkbox" className="toggle" aria-label="Enable price drop alerts" />
                    </div>
                    <Separator />
                    <div>
                      <Label>Email Frequency</Label>
                      <Select defaultValue="daily">
                        <SelectTrigger className="w-full mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instant">Instant</SelectItem>
                          <SelectItem value="daily">Daily Digest</SelectItem>
                          <SelectItem value="weekly">Weekly Summary</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>

                {/* Privacy Settings */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Privacy & Security
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Profile Visibility</Label>
                        <p className="text-sm text-muted-foreground">Allow employers to find your profile</p>
                      </div>
                      <Select defaultValue="public">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                          <SelectItem value="limited">Limited</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Contact Information</Label>
                        <p className="text-sm text-muted-foreground">Display email and phone in profile</p>
                      </div>
                      <input type="checkbox" defaultChecked className="toggle" aria-label="Show contact information" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">Add extra security to your account</p>
                      </div>
                      <Button variant="outline" size="sm">Enable 2FA</Button>
                    </div>
                    <Separator />
                    <div>
                      <Label>Data Export</Label>
                      <p className="text-sm text-muted-foreground mb-2">Download your account data</p>
                      <Button variant="outline">Request Data Export</Button>
                    </div>
                  </div>
                </Card>

                {/* Application Preferences */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Briefcase className="w-5 h-5 mr-2" />
                    Application Preferences
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Default Resume</Label>
                      <Select defaultValue="main">
                        <SelectTrigger className="w-full mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="main">Main Resume (alex_resume.pdf)</SelectItem>
                          <SelectItem value="tech">Tech Resume (alex_tech.pdf)</SelectItem>
                          <SelectItem value="creative">Creative Resume (alex_creative.pdf)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Auto-Apply Settings</Label>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm">Enable auto-apply for matched jobs</span>
                        <input type="checkbox" className="toggle" aria-label="Enable auto-apply for matched jobs" />
                      </div>
                    </div>
                    <div>
                      <Label>Salary Expectations</Label>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <Input placeholder="Minimum (₹)" defaultValue="15000" />
                        </div>
                        <div>
                          <Input placeholder="Maximum (₹)" defaultValue="30000" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* App Preferences */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    App Preferences
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Theme</Label>
                      <Select defaultValue="system">
                        <SelectTrigger className="w-full mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Language</Label>
                      <Select defaultValue="en">
                        <SelectTrigger className="w-full mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="hi">हिंदी</SelectItem>
                          <SelectItem value="bn">বাংলা</SelectItem>
                          <SelectItem value="ta">தமிழ்</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Sound Notifications</Label>
                        <p className="text-sm text-muted-foreground">Play sound for notifications</p>
                      </div>
                      <input type="checkbox" defaultChecked className="toggle" aria-label="Enable sound notifications" />
                    </div>
                  </div>
                </Card>

                {/* Danger Zone */}
                <Card className="p-6 border-destructive/50">
                  <h3 className="text-lg font-semibold mb-4 text-destructive flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Danger Zone
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Deactivate Account</Label>
                        <p className="text-sm text-muted-foreground">Temporarily disable your account</p>
                      </div>
                      <Button variant="outline" className="text-destructive border-destructive">
                        Deactivate
                      </Button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Delete Account</Label>
                        <p className="text-sm text-muted-foreground">Permanently delete your account and data</p>
                      </div>
                      <Button variant="destructive">Delete Account</Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Review Dialog */}
      <Dialog open={showReview} onOpenChange={setShowReview}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Order Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedProduct && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <h4 className="font-semibold">{selectedProduct.name}</h4>
                  <p className="text-primary font-medium">{selectedProduct.price}</p>
                </div>
              </div>
            )}
            
            <div>
              <Label>Delivery Address *</Label>
              <Textarea
                placeholder="Enter your complete delivery address"
                value={reviewData.address}
                onChange={(e) => setReviewData({...reviewData, address: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label>Phone Number *</Label>
              <Input
                placeholder="Enter your phone number"
                value={reviewData.phone}
                onChange={(e) => setReviewData({...reviewData, phone: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label>Payment Method</Label>
              <Select value={reviewData.paymentMethod} onValueChange={(value) => setReviewData({...reviewData, paymentMethod: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cod">Cash on Delivery</SelectItem>
                  <SelectItem value="upi">UPI Payment</SelectItem>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowReview(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={placeOrder} className="flex-1">
                Place Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Details Dialog */}
      {selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          isOpen={showProductDetails}
          onClose={() => {
            setShowProductDetails(false);
            setSelectedProduct(null);
          }}
          onAddToCart={addToCart}
          onLike={(productId) => likeItem(productId, 'product')}
          isLiked={likedItems[`product-${selectedProduct.id}`] || false}
          onBuyNow={handleBuyNow}
        />
      )}

      {/* Cart Dialog */}
      <Cart
        cart={cart}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onClose={() => setShowCart(false)}
        isOpen={showCart}
      />

      {/* Job Application Dialog */}
      {selectedJob && (
        <JobApplication
          job={selectedJob}
          isOpen={showJobApplication}
          onClose={() => {
            setShowJobApplication(false);
            setSelectedJob(null);
          }}
          onApply={handleJobApplicationSubmit}
          onMessage={handleJobMessage}
        />
      )}

      {/* Messaging Dialog */}
      <Messaging
        isOpen={showMessaging}
        onClose={() => setShowMessaging(false)}
      />

      {/* Job Details Dialog */}
      <Dialog open={showJobDetailsDialog} onOpenChange={setShowJobDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Job Details
            </DialogTitle>
            <DialogDescription>
              {selectedJobForView?.title} • {selectedJobForView?.company}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Job Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <img src={selectedJobForView?.image} alt={selectedJobForView?.title} className="w-8 h-8 rounded" />
                  {selectedJobForView?.title}
                </CardTitle>
                <CardDescription>{selectedJobForView?.company} • {selectedJobForView?.location}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Job Type</p>
                    <p className="font-medium">{selectedJobForView?.type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Duration</p>
                    <p className="font-medium">{selectedJobForView?.duration}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pay</p>
                    <p className="font-medium">{selectedJobForView?.pay}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Posted</p>
                    <p className="font-medium">{selectedJobForView?.posted}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                  <p className="text-sm leading-relaxed">
                    {selectedJobForView?.description || "No description available."}
                  </p>
                </div>

                {selectedJobForView?.requirements && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Requirements</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {selectedJobForView.requirements.map((req: string, index: number) => (
                        <li key={index} className="text-muted-foreground">{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setShowJobDetailsDialog(false);
                  handleJobApply(selectedJobForView);
                }}
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Apply Now
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setShowJobDetailsDialog(false);
                  setCurrentView("messaging");
                  setShowMessaging(true);
                }}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Message Employer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Internship Details Dialog */}
      <Dialog open={showInternshipDetailsDialog} onOpenChange={setShowInternshipDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Internship Details
            </DialogTitle>
            <DialogDescription>
              {selectedInternshipForView?.title} • {selectedInternshipForView?.company}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Internship Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <img src={selectedInternshipForView?.image} alt={selectedInternshipForView?.title} className="w-8 h-8 rounded" />
                  {selectedInternshipForView?.title}
                </CardTitle>
                <CardDescription>{selectedInternshipForView?.company} • {selectedInternshipForView?.location}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Internship Type</p>
                    <p className="font-medium">{selectedInternshipForView?.type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Duration</p>
                    <p className="font-medium">{selectedInternshipForView?.duration}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Stipend</p>
                    <p className="font-medium">{selectedInternshipForView?.stipend}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Posted</p>
                    <p className="font-medium">{selectedInternshipForView?.posted}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                  <p className="text-sm leading-relaxed">
                    {selectedInternshipForView?.description || "No description available."}
                  </p>
                </div>

                {selectedInternshipForView?.skills && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Required Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedInternshipForView.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setShowInternshipDetailsDialog(false);
                  // Handle internship application
                }}
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                Apply Now
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setShowInternshipDetailsDialog(false);
                  setCurrentView("messaging");
                  setShowMessaging(true);
                }}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Message Employer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Details Dialog */}
      <Dialog open={showProductDetailsDialog} onOpenChange={setShowProductDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Details
            </DialogTitle>
            <DialogDescription>
              {selectedProductForView?.name} • {selectedProductForView?.seller}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Product Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <img src={selectedProductForView?.image} alt={selectedProductForView?.name} className="w-8 h-8 rounded" />
                  {selectedProductForView?.name}
                </CardTitle>
                <CardDescription>{selectedProductForView?.category} • {selectedProductForView?.seller}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Price</p>
                    <p className="font-medium">{selectedProductForView?.price}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Rating</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{selectedProductForView?.rating}</span>
                      <span className="text-sm text-muted-foreground">({selectedProductForView?.reviews} reviews)</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Availability</p>
                    <Badge variant={selectedProductForView?.inStock ? 'default' : 'destructive'}>
                      {selectedProductForView?.inStock ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Category</p>
                    <p className="font-medium">{selectedProductForView?.category}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                  <p className="text-sm leading-relaxed">
                    {selectedProductForView?.description || "No description available."}
                  </p>
                </div>

                {selectedProductForView?.features && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Features</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedProductForView.features.map((feature: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setShowProductDetailsDialog(false);
                  addToCart(selectedProductForView);
                }}
                disabled={!selectedProductForView?.inStock}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
              <Button variant="outline" className="flex-1">
                <Heart className="h-4 w-4 mr-2" />
                Save for Later
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Summary Dialog */}
      {selectedProductForOrder && (
        <OrderSummary
          product={selectedProductForOrder}
          quantity={selectedQuantityForOrder}
          isOpen={showOrderSummary}
          onClose={() => {
            setShowOrderSummary(false);
            setSelectedProductForOrder(null);
            setSelectedQuantityForOrder(1);
          }}
          onOrderPlaced={handleOrderPlaced}
        />
      )}

      {/* Order Details Dialog */}
      <Dialog open={showOrderDetailsDialog} onOpenChange={setShowOrderDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Details
            </DialogTitle>
            <DialogDescription>
              Order #{selectedOrderForView?.id} • {selectedOrderForView?.productName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Order Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <img src={selectedOrderForView?.productImage} alt={selectedOrderForView?.productName} className="w-8 h-8 rounded" />
                  {selectedOrderForView?.productName}
                </CardTitle>
                <CardDescription>Order #{selectedOrderForView?.id} • {selectedOrderForView?.orderDate}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Order Status</p>
                    <Badge variant={selectedOrderForView?.status === "delivered" ? "default" : 
                                   selectedOrderForView?.status === "shipped" ? "secondary" : "outline"}>
                      {selectedOrderForView?.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Order Amount</p>
                    <p className="font-medium">{selectedOrderForView?.amount}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Order Date</p>
                    <p className="font-medium">{selectedOrderForView?.orderDate}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                    <p className="font-medium">{selectedOrderForView?.paymentMethod}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Customer Name</p>
                    <p className="font-medium">{selectedOrderForView?.buyerName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedOrderForView?.buyerEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedOrderForView?.buyerPhone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Delivery Address</p>
                    <p className="font-medium">{selectedOrderForView?.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Delivery Status</p>
                    <Badge variant={selectedOrderForView?.status === "delivered" ? "default" : 
                                   selectedOrderForView?.status === "shipped" ? "secondary" : "outline"}>
                      {selectedOrderForView?.status === "pending" ? "Processing" : 
                       selectedOrderForView?.status === "shipped" ? "In Transit" : 
                       selectedOrderForView?.status === "delivered" ? "Delivered" : selectedOrderForView?.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Estimated Delivery</p>
                    <p className="font-medium">
                      {selectedOrderForView?.status === "pending" ? "3-5 business days" :
                       selectedOrderForView?.status === "shipped" ? "1-2 business days" :
                       selectedOrderForView?.status === "delivered" ? "Delivered" : "TBD"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tracking Number</p>
                    <p className="font-medium">
                      {selectedOrderForView?.status === "shipped" || selectedOrderForView?.status === "delivered" 
                        ? `TRK${selectedOrderForView?.id}` : "Not available yet"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Carrier</p>
                    <p className="font-medium">
                      {selectedOrderForView?.status === "shipped" || selectedOrderForView?.status === "delivered" 
                        ? "Express Delivery" : "TBD"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Product Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={selectedOrderForView?.productImage} 
                    alt={selectedOrderForView?.productName}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <h4 className="font-semibold">{selectedOrderForView?.productName}</h4>
                    <p className="text-sm text-muted-foreground">Product ID: {selectedOrderForView?.id}</p>
                    <p className="text-primary font-medium">{selectedOrderForView?.amount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setShowOrderDetailsDialog(false);
                  setCurrentView("messaging");
                  setShowMessaging(true);
                }}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  // Handle reorder functionality
                  toast({
                    title: "Reorder",
                    description: "Product added to cart for reorder."
                  });
                }}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Reorder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDashboard;