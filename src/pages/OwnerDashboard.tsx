import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { dashboardAPI, jobsAPI, internshipsAPI, ownerJobsAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import OpportunityForm from "@/components/OpportunityForm";
import OwnerApplicationsView from "@/components/OwnerApplicationsView";
import OwnerNotifications from "@/components/OwnerNotifications";


import { 
  User, 
  Store, 
  Bot, 
  Bell, 
  Settings, 
  LogOut,
  ShoppingCart, 
  Briefcase, 
  GraduationCap,
  Upload,
  Eye,
  Users,
  Plus,
  MessageCircle,
  Send,
  Edit,
  Phone,
  Mail,
  MapPin,
  Camera,
  Building,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Filter,
  Search,
  Menu,
  X,
  Bookmark,
  Heart,
  MoreHorizontal,
  ArrowLeft,
  Download,
  Copy,
  Share,
  BarChart3,
  FileText
} from "lucide-react";

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState("jobs");
  const [showOpportunityForm, setShowOpportunityForm] = useState(false);
  const [selectedOpportunityType, setSelectedOpportunityType] = useState<'job' | 'internship'>('job');

  // Fetch dashboard data from backend
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useQuery({
    queryKey: ['owner-dashboard'],
    queryFn: dashboardAPI.getOwnerDashboard,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: analytics } = useQuery({
    queryKey: ['owner-analytics'],
    queryFn: dashboardAPI.getOwnerAnalytics,
  });

  const { data: quickStats } = useQuery({
    queryKey: ['owner-quick-stats'],
    queryFn: dashboardAPI.getOwnerQuickStats,
  });

  // Fetch unread notification count
  const { data: notificationCount } = useQuery({
    queryKey: ['owner-notification-count'],
    queryFn: async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/owner/notifications?unreadOnly=true&limit=1`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        return data.pagination?.totalItems || 0;
      } catch (error) {
        console.error('Error fetching notification count:', error);
        return 0;
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Real-time owner jobs with filters (for analytics)
  // NOTE: The query is declared AFTER job filter states are defined to avoid undefined references

  // Handle logout
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account."
    });
    navigate('/');
  };
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: [0, 50000],
    jobType: "all",
    duration: "all",
    location: "all",
    stipendRange: [0, 25000],
    category: "all"
  });
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { type: "bot", message: "Hello! I'm your JBS assistant. How can I help you today?" }
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@example.com",
    phone: "+91 9876543210",
    city: "Chennai",
    businessName: "Tech Solutions Pvt Ltd",
    businessType: "retail",
    businessAddress: "123 Business Street, Chennai, TN",
    businessHours: "9 AM - 6 PM",
    businessDescription: "Leading technology solutions provider",
    gst: "22AAAAA0000A1Z5",
    pan: "AAAPL1234C",
    website: "https://techsolutions.com",
    linkedin: "https://linkedin.com/in/johndoe",
    bio: "Experienced business owner with 10+ years in technology sector.",
    profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  });

  // Initialize profile with real user data when component mounts
  useEffect(() => {
    if (user) {
      const userProfile = {
        name: user.profile?.firstName && user.profile?.lastName ? 
          `${user.profile.firstName} ${user.profile.lastName}` : user.username || 'Owner User',
        email: user.email || '',
        phone: user.profile?.phone || '',
        city: user.profile?.city || '',
        bio: user.profile?.bio || 'Business owner looking to connect with talented students.',
        profilePicture: user.profile?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        businessName: user.business?.businessName || 'My Business',
        businessType: user.business?.businessType || 'retail',
        gst: user.business?.gstNumber || '',
        pan: user.business?.panNumber || '',
        businessAddress: user.business?.address?.city || '',
        businessHours: user.business?.businessHours || '9 AM - 6 PM',
        businessDescription: user.business?.description || 'Leading business in the industry.',
        website: user.business?.website || '',
        linkedin: user.profile?.linkedin || ''
      };
      setProfile(userProfile);
    }
  }, [user]);

  // Popup dialog states
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [showInternshipDialog, setShowInternshipDialog] = useState(false);
  const [showTrackDialog, setShowTrackDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);
  const [showAddVariationDialog, setShowAddVariationDialog] = useState(false);
  const [showAllFiltersDialog, setShowAllFiltersDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all-inventory");
  const [searchField, setSearchField] = useState("title");
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [listingStatus, setListingStatus] = useState("all");
  const [fulfilledBy, setFulfilledBy] = useState("all");
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [selectedJobs, setSelectedJobs] = useState<number[]>([]);
  const [jobSelectedTab, setJobSelectedTab] = useState("all-jobs");
  const [jobSearchField, setJobSearchField] = useState("title");
  const [jobSearchQuery, setJobSearchQuery] = useState("");
  const [jobSortBy, setJobSortBy] = useState("date");
  const [jobStatus, setJobStatus] = useState("all");
  const [jobType, setJobType] = useState("all");
  const [showJobAddDialog, setShowJobAddDialog] = useState(false);
  const [showJobEditDialog, setShowJobEditDialog] = useState(false);
  const [showJobFiltersDialog, setShowJobFiltersDialog] = useState(false);
  const [showJobSettingsDialog, setShowJobSettingsDialog] = useState(false);

  // Real-time owner jobs with filters (for analytics)
  const { data: ownerJobsResult, isFetching: ownerJobsLoading, refetch: refetchOwnerJobs } = useQuery({
    queryKey: ['owner-jobs', jobStatus, jobSearchQuery],
    queryFn: () => ownerJobsAPI.getJobs({
      status: jobStatus,
      search: jobSearchQuery,
      limit: 1000,
      page: 1,
    }),
    refetchInterval: 5000,
    keepPreviousData: true,
    staleTime: 4000,
  });

  // Real-time owner internships with filters (for analytics)
  const { data: ownerInternshipsResult, isFetching: ownerInternshipsLoading, refetch: refetchOwnerInternships } = useQuery({
    queryKey: ['owner-internships', internshipStatus, internshipSearchQuery],
    queryFn: () => ownerJobsAPI.getInternships({
      status: internshipStatus,
      search: internshipSearchQuery,
      limit: 1000,
      page: 1,
    }),
    refetchInterval: 5000,
    keepPreviousData: true,
    staleTime: 4000,
  });
  
  // New state variables for Applicants and Job Details features
  const [showApplicantsDialog, setShowApplicantsDialog] = useState(false);
  const [showJobDetailsDialog, setShowJobDetailsDialog] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [applicantSearchQuery, setApplicantSearchQuery] = useState("");
  const [applicantStatusFilter, setApplicantStatusFilter] = useState("all");
  const [editingJob, setEditingJob] = useState<any>(null);
  const [isEditingJob, setIsEditingJob] = useState(false);
  
  // Internship management state
  const [selectedInternship, setSelectedInternship] = useState<any>(null);
  const [editingInternship, setEditingInternship] = useState<any>(null);
  const [isEditingInternship, setIsEditingInternship] = useState(false);
  const [selectedInternshipId, setSelectedInternshipId] = useState<number | null>(null);
  const [internshipSelectedTab, setInternshipSelectedTab] = useState("all-internships");
  const [showInternshipDetailsDialog, setShowInternshipDetailsDialog] = useState(false);
  
  // Internship filtering and search state
  const [internshipSearchQuery, setInternshipSearchQuery] = useState("");
  const [internshipSortBy, setInternshipSortBy] = useState("date");
  const [internshipStatus, setInternshipStatus] = useState("all");
  const [internshipType, setInternshipType] = useState("all");
  
  // Buy product state
  const [selectedProductForBuy, setSelectedProductForBuy] = useState<any>(null);
  const [selectedProductForView, setSelectedProductForView] = useState<any>(null);
  const [showBuyProductDialog, setShowBuyProductDialog] = useState(false);
  const [buyQuantity, setBuyQuantity] = useState(1);
  
  // Product management state
  const [showProductDetailsDialog, setShowProductDetailsDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  
  // My Orders state
  const [myOrders, setMyOrders] = useState([
    {
      id: "ORD-001",
      product: {
        id: 1,
        name: "Wireless Earbuds",
        image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400",
        price: 2999,
        originalPrice: 3999,
        seller: "TechMart Electronics",
        sellerId: "seller-001"
      },
      quantity: 1,
      orderDate: "2024-01-15T10:30:00Z",
      status: "Delivered",
      totalAmount: 3049,
      deliveryCharges: 50,
      buyerId: "buyer-001",
      tracking: [
        { step: "Order Placed", status: "completed", time: "2024-01-15T10:30:00Z" },
        { step: "Confirmed", status: "completed", time: "2024-01-15T11:00:00Z" },
        { step: "Shipped", status: "completed", time: "2024-01-16T09:00:00Z" },
        { step: "Out for Delivery", status: "completed", time: "2024-01-17T14:00:00Z" },
        { step: "Delivered", status: "completed", time: "2024-01-17T16:30:00Z" }
      ],
      rating: 5,
      review: "Excellent product! Fast delivery and great quality."
    },
    {
      id: "ORD-002",
      product: {
        id: 2,
        name: "Study Desk Lamp",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        price: 1299,
        originalPrice: 1599,
        seller: "Home Essentials",
        sellerId: "seller-002"
      },
      quantity: 2,
      orderDate: "2024-01-14T15:45:00Z",
      status: "In Transit",
      totalAmount: 2648,
      deliveryCharges: 50,
      buyerId: "buyer-001",
      tracking: [
        { step: "Order Placed", status: "completed", time: "2024-01-14T15:45:00Z" },
        { step: "Confirmed", status: "completed", time: "2024-01-14T16:00:00Z" },
        { step: "Shipped", status: "completed", time: "2024-01-15T10:00:00Z" },
        { step: "Out for Delivery", status: "active", time: "2024-01-16T08:00:00Z" },
        { step: "Delivered", status: "pending", time: null }
      ],
      rating: null,
      review: null
    },
    {
      id: "ORD-003",
      product: {
        id: 3,
        name: "Laptop Backpack",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
        price: 1999,
        originalPrice: 2499,
        seller: "Office Supplies Co",
        sellerId: "seller-003"
      },
      quantity: 1,
      orderDate: "2024-01-13T12:20:00Z",
      status: "Processing",
      totalAmount: 2049,
      deliveryCharges: 50,
      buyerId: "buyer-001",
      tracking: [
        { step: "Order Placed", status: "completed", time: "2024-01-13T12:20:00Z" },
        { step: "Confirmed", status: "active", time: "2024-01-13T13:00:00Z" },
        { step: "Shipped", status: "pending", time: null },
        { step: "Out for Delivery", status: "pending", time: null },
        { step: "Delivered", status: "pending", time: null }
      ],
      rating: null,
      review: null
    }
  ]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Form states for new job/internship
  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    location: "",
    pay: "",
    duration: "",
    type: "full-time",
    description: "",
    requirements: "",
    contactDetails: "",
    genderPreference: "any",
    category: "General",
    experience: "Entry Level",
    payType: "monthly",
    isRemote: false,
    isUrgent: false
  });

  const [newInternship, setNewInternship] = useState({
    title: "",
    company: "",
    location: "",
    stipend: "",
    duration: "",
    type: "paid",
    description: "",
    requirements: "",
    skills: "",
    contactDetails: "",
    genderPreference: "any",
    category: "General",
    startDate: "",
    endDate: "",
    applicationDeadline: "",
    isRemote: false,
    isUrgent: false
  });
  
  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    originalPrice: "",
    category: "",
    description: "",
    features: "",
    images: [] as File[],
    inStock: true,
    quantity: "",
    brand: "",
    condition: "new",
    // B2B Quantity-based pricing
    isB2B: false,
    selectedQuantityRange: "",
    quantityPricing: {
      "1-5": { sellerPrice: "", marketPrice: "" },
      "5-10": { sellerPrice: "", marketPrice: "" },
      "10-20": { sellerPrice: "", marketPrice: "" }
    }
  });


  // Menu items matching StudentDashboard structure
  const menuItems = [
    { id: "jobs", label: "Jobs", icon: Briefcase },
    { id: "internships", label: "Internship Management", icon: GraduationCap },
    { id: "applications", label: "Applications", icon: FileText },
    { id: "products", label: "Product Managing", icon: ShoppingCart },
    { id: "buy-products", label: "Buy Products", icon: ShoppingCart },
    { id: "my-orders", label: "My Orders", icon: Package },
    { id: "order-management", label: "Order Management", icon: Package },
    { id: "chat", label: "AI Assistant", icon: Bot },
    { id: "messages", label: "Messages", icon: MessageCircle },
    { 
      id: "notifications", 
      label: "Notifications", 
      icon: Bell,
      badge: true // Add badge property
    },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  // Mock data for jobs with more entries
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
      contactDetails: "9876543210",
      genderPreference: "any",
      posted: "2 days ago",
      views: 45,
      applicants: 12,
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400"
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
      contactDetails: "8765432109",
      genderPreference: "male",
      posted: "1 day ago",
      views: 38,
      applicants: 8,
      image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400"
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
      contactDetails: "7654321098",
      genderPreference: "female",
      posted: "3 days ago",
      views: 62,
      applicants: 15,
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400"
    },
    {
      id: 4,
      title: "Customer Service Representative",
      company: "ServiceFirst Solutions",
      location: "Delhi, DL",
      pay: "₹18,000/month",
      duration: "4 months",
      type: "Full-time",
      description: "Handle customer inquiries and provide excellent support via phone and chat.",
      requirements: ["Excellent English", "Computer skills", "Problem-solving ability"],
      contactDetails: "6543210987",
      genderPreference: "any",
      posted: "4 days ago",
      views: 29,
      applicants: 6,
      image: "https://images.unsplash.com/photo-1553727091-8473deef90ec?w=400"
    },
    {
      id: 5,
      title: "Data Entry Clerk",
      company: "InfoManage Corp",
      location: "Hyderabad, TS",
      pay: "₹14,000/month",
      duration: "2 months",
      type: "Part-time",
      description: "Accurate data entry and document management. Perfect for detail-oriented students.",
      requirements: ["Typing speed 40+ WPM", "MS Office knowledge", "Attention to detail"],
      contactDetails: "5432109876",
      genderPreference: "any",
      posted: "5 days ago",
      views: 33,
      applicants: 9,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
    },
    {
      id: 6,
      title: "Retail Assistant",
      company: "FashionHub Store",
      location: "Pune, MH",
      pay: "₹16,000/month",
      duration: "5 months",
      type: "Part-time",
      description: "Assist customers with shopping, manage inventory, and handle cash transactions.",
      requirements: ["Friendly personality", "Basic math skills", "Retail experience preferred"],
      posted: "6 days ago",
      views: 41,
      applicants: 11,
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400"
    }
  ];

  // Mock data for internships with more entries
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
      posted: "1 day ago",
      views: 78,
      applicants: 23,
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400"
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
      posted: "2 days ago",
      views: 94,
      applicants: 31,
      image: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=400"
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
      posted: "4 days ago",
      views: 52,
      applicants: 14,
      image: "https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=400"
    },
    {
      id: 4,
      title: "Content Writing Intern",
      company: "WordSmith Media",
      location: "Remote",
      stipend: "₹6,000/month",
      duration: "4 months",
      type: "Paid",
      description: "Create engaging content for blogs, social media, and marketing campaigns.",
      requirements: ["Excellent writing skills", "Research ability", "SEO knowledge"],
      skills: ["Content Writing", "SEO", "Research"],
      posted: "3 days ago",
      views: 67,
      applicants: 19,
      image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400"
    },
    {
      id: 5,
      title: "Mobile App Development Intern",
      company: "AppTech Solutions",
      location: "Bangalore, KA",
      stipend: "₹15,000/month",
      duration: "5 months",
      type: "Paid",
      description: "Develop mobile applications for Android and iOS platforms using React Native.",
      requirements: ["React Native knowledge", "Mobile development interest", "Programming skills"],
      skills: ["React Native", "Mobile Development", "JavaScript"],
      posted: "5 days ago",
      views: 89,
      applicants: 27,
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400"
    },
    {
      id: 6,
      title: "HR Intern",
      company: "PeopleFirst HR",
      location: "Mumbai, MH",
      stipend: "₹7,000/month",
      duration: "3 months",
      type: "Paid",
      description: "Assist with recruitment, employee onboarding, and HR administrative tasks.",
      requirements: ["Communication skills", "MS Office", "HR interest"],
      skills: ["HR", "Communication", "Administration"],
      posted: "6 days ago",
      views: 43,
      applicants: 16,
      image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400"
    }
  ];

  // Mock data for products with more entries
  const products = [
    {
      id: 1,
      name: "Wireless Earbuds",
      price: "₹2,999",
      originalPrice: "₹4,999",
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400",
      seller: "TechStore",
      category: "Electronics",
      description: "High-quality wireless earbuds with noise cancellation and 24-hour battery life.",
      features: ["Bluetooth 5.0", "Noise Cancellation", "24hr Battery", "Water Resistant"],
      inStock: true,
      views: 234,
      orders: 45
    },
    {
      id: 2,
      name: "Study Desk Lamp",
      price: "₹1,299",
      originalPrice: "₹1,999",
      rating: 4.2,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      seller: "HomeDecor Plus",
      category: "Furniture",
      description: "Adjustable LED desk lamp perfect for studying and reading. Multiple brightness levels.",
      features: ["LED Technology", "Adjustable Arm", "Multiple Brightness", "USB Charging"],
      inStock: true,
      views: 189,
      orders: 67
    },
    {
      id: 3,
      name: "Laptop Backpack",
      price: "₹1,999",
      originalPrice: "₹2,999",
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
      seller: "BagMart",
      category: "Accessories",
      description: "Water-resistant laptop backpack with multiple compartments for students and professionals.",
      features: ["Water Resistant", "Laptop Compartment", "Multiple Pockets", "Comfortable Straps"],
      inStock: false,
      views: 156,
      orders: 32
    },
    {
      id: 4,
      name: "Smart Fitness Watch",
      price: "₹3,999",
      originalPrice: "₹5,999",
      rating: 4.3,
      image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400",
      seller: "FitTech",
      category: "Electronics",
      description: "Track your fitness goals with this feature-rich smartwatch.",
      features: ["Heart Rate Monitor", "GPS Tracking", "Sleep Monitor", "7-day Battery"],
      inStock: true,
      views: 278,
      orders: 38
    },
    {
      id: 5,
      name: "Programming Books Set",
      price: "₹2,499",
      originalPrice: "₹3,999",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400",
      seller: "BookHub",
      category: "Books",
      description: "Complete set of programming books including JavaScript, Python, and React.",
      features: ["Latest Editions", "Code Examples", "Practice Exercises", "Digital Access"],
      inStock: true,
      views: 145,
      orders: 89
    },
    {
      id: 6,
      name: "Bluetooth Speaker",
      price: "₹2,499",
      originalPrice: "₹3,499",
      rating: 4.4,
      image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400",
      seller: "AudioTech",
      category: "Electronics",
      description: "Portable Bluetooth speaker with excellent sound quality and long battery life.",
      features: ["360° Sound", "12hr Battery", "Waterproof", "Voice Assistant"],
      inStock: true,
      views: 201,
      orders: 54
    }
  ];

  // Mock notifications
  const notifications = [
    { id: 1, type: "order", message: "New order received for Wireless Earbuds", time: "1 hour ago", read: false },
    { id: 2, type: "applicant", message: "New job application for Sales Associate position", time: "3 hours ago", read: false },
    { id: 3, type: "product", message: "Product 'Study Desk Lamp' is running low on stock", time: "1 day ago", read: true }
  ];

  // Filter functions matching StudentDashboard
  const getFilteredJobs = () => {
    // Use API data when available for real-time results
    // ownerJobsAPI.getJobs returns { success, data: Job[], pagination }
    const apiJobs = (ownerJobsResult as any)?.data || [];
    let filtered = apiJobs as any[];

    if (jobSearchQuery) {
      const q = jobSearchQuery.toLowerCase();
      filtered = filtered.filter(job =>
        job.title?.toLowerCase().includes(q) ||
        job.company?.toLowerCase().includes(q) ||
        job.location?.toLowerCase().includes(q)
      );
    }

    if (jobStatus !== "all") {
      filtered = filtered.filter(job => (job.status || 'active') === jobStatus);
    }

    if (jobType !== "all") {
      filtered = filtered.filter(job => (job.jobType || j.type) === jobType);
    }

    return filtered;
  };

  const getFilteredInternships = () => {
    // Use API data if available, otherwise fall back to mock data
    const internshipsData = ownerInternshipsResult?.data || internships;
    let filtered = internshipsData;
    
    if (internshipSearchQuery) {
      filtered = filtered.filter(internship => 
        internship.title?.toLowerCase().includes(internshipSearchQuery.toLowerCase()) ||
        internship.company?.toLowerCase().includes(internshipSearchQuery.toLowerCase()) ||
        internship.location?.toLowerCase().includes(internshipSearchQuery.toLowerCase())
      );
    }
    
    if (internshipType !== "all") {
      filtered = filtered.filter(internship => internship.type === internshipType);
    }
    
    if (internshipStatus !== "all") {
      filtered = filtered.filter(internship => internship.status === internshipStatus);
    }
    
    // Apply sorting
    if (internshipSortBy === "date") {
      filtered = filtered.sort((a, b) => new Date(b.createdAt || b.posted).getTime() - new Date(a.createdAt || a.posted).getTime());
    } else if (internshipSortBy === "views") {
      filtered = filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (internshipSortBy === "applicants") {
      filtered = filtered.sort((a, b) => (b.applicants || 0) - (a.applicants || 0));
    } else if (internshipSortBy === "title") {
      filtered = filtered.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    return filtered;
  };

  const getFilteredProducts = () => {
    let filtered = products;
    
    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    if (priceRange !== "all") {
      filtered = filtered.filter(product => {
        const price = parseInt(product.price.replace(/[^\d]/g, ''));
        if (priceRange === "0-1000") return price <= 1000;
        if (priceRange === "1000-3000") return price > 1000 && price <= 3000;
        if (priceRange === "3000+") return price > 3000;
        return true;
      });
    }
    
    return filtered;
  };

  const getCategories = () => {
    if (currentView === "jobs") {
      return ["all", "Full-time", "Part-time", "Remote"];
    } else if (currentView === "internships") {
      return ["all", "Paid", "Unpaid"];
    } else if (currentView === "products") {
      return ["all", "Electronics", "Furniture", "Accessories", "Books"];
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

  const applyFilters = () => {
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

  const sendChatMessage = () => {
    if (currentMessage.trim()) {
      setChatMessages([...chatMessages, 
        { type: "user", message: currentMessage },
        { type: "bot", message: getOwnerAIResponse(currentMessage) }
      ]);
      setCurrentMessage("");
    }
  };

  const getOwnerAIResponse = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('order') || lowerMessage.includes('sale') || lowerMessage.includes('customer')) {
      return `Great question about orders! You currently have active orders to manage. I can help you track sales performance, update order statuses, and manage customer communications. Would you like me to guide you through order fulfillment or customer service best practices?`;
    } else if (lowerMessage.includes('job') || lowerMessage.includes('hire') || lowerMessage.includes('candidate')) {
      return `Perfect! For hiring management, you have ${jobs.length} job postings with active applicants. I can help you screen candidates, schedule interviews, and manage the hiring process efficiently. Would you like tips on writing effective job descriptions or interviewing techniques?`;
    } else if (lowerMessage.includes('product') || lowerMessage.includes('sell') || lowerMessage.includes('inventory')) {
      return `Excellent! Your product catalog currently has ${products.length} items listed. I can help you optimize product listings, manage inventory levels, set competitive pricing, and improve product descriptions to boost sales. What specific product management task can I assist you with?`;
    } else if (lowerMessage.includes('internship') || lowerMessage.includes('intern')) {
      return `Internships are a strategic way to build your talent pipeline! You have ${internships.length} internship postings available. I can help you create compelling internship programs and manage applications. Would you like guidance on structuring internship programs?`;
    } else if (lowerMessage.includes('analytics') || lowerMessage.includes('performance')) {
      return "Analytics are crucial for business growth! I can help you track key metrics like conversion rates, sales trends, and popular products. Your dashboard shows important business insights. What specific metrics interest you most?";
    } else if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
      return "I'm your comprehensive business advisor for the JBS platform! I provide expert guidance on order fulfillment, inventory management, hiring processes, sales optimization, and business growth strategies. What specific business challenge would you like me to help solve?";
    } else {
      return "Thank you for your question! I'm here to help you succeed on the JBS platform. I can assist with business management, sales optimization, hiring, and growth strategies. How can I help you today?";
    }
  };



  const saveProfile = async () => {
    try {
      // Update user profile in backend
      if (user && user.id) {
        const updatedProfileData = {
          profile: {
            firstName: profile.name.split(' ')[0] || profile.name,
            lastName: profile.name.split(' ').slice(1).join(' ') || '',
            phone: profile.phone,
            city: profile.city,
            bio: profile.bio,
            linkedin: profile.linkedin
          },
          business: {
            businessName: profile.businessName,
            businessType: profile.businessType,
            gstNumber: profile.gst,
            panNumber: profile.pan,
            address: {
              city: profile.businessAddress
            },
            businessHours: profile.businessHours,
            description: profile.businessDescription,
            website: profile.website
          }
        };

        // Call API to update profile
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/users/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(updatedProfileData)
        });

        if (response.ok) {
          setEditingProfile(false);
          toast({
            title: "Profile Updated",
            description: "Your profile has been saved successfully."
          });
          
          // Refresh user data from context
          // You might want to add a refresh function to AuthContext
        } else {
          throw new Error('Failed to update profile');
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Calculate market price based on seller price
  const calculateMarketPrice = (sellerPrice: number) => {
    const commission = sellerPrice * 0.05; // 5% commission
    const deliveryCharge = 20; // ₹20 delivery charge
    const subtotal = sellerPrice + commission + deliveryCharge;
    const gst = subtotal * 0.18; // 18% GST
    return subtotal + gst;
  };

  // Update market price when seller price changes
  const updateMarketPrice = (quantityRange: string, sellerPrice: string) => {
    const price = parseFloat(sellerPrice) || 0;
    const marketPrice = calculateMarketPrice(price);
    
    setNewProduct(prev => ({
      ...prev,
      quantityPricing: {
        ...prev.quantityPricing,
        [quantityRange]: {
          ...prev.quantityPricing[quantityRange],
          sellerPrice,
          marketPrice: marketPrice.toFixed(2)
        }
      }
    }));
  };

  // Analytics data and calculations
  const getAnalyticsData = () => {
    const products = getFilteredProducts();
    const totalProducts = products.length;
    const totalViews = products.reduce((sum, product) => sum + (product.views || 0), 0);
    const totalSales = products.reduce((sum, product) => sum + (product.orders || 0), 0);
    const bestPerforming = products.reduce((best, product) => 
      (product.views || 0) > (best.views || 0) ? product : best
    , products[0] || { views: 0, name: "N/A" });
    
    return {
      totalProducts,
      totalViews,
      totalSales,
      bestPerforming
    };
  };

  const renderProductAnalyticsCards = () => {
    const analytics = getAnalyticsData();
    return (
      <>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{analytics.totalProducts}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Units in Stock</p>
                <p className="text-2xl font-bold">{analytics.totalProducts * 25}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Views This Month</p>
                <p className="text-2xl font-bold">{analytics.totalViews}</p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Eye className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Best Performing</p>
                <p className="text-lg font-bold truncate">{analytics.bestPerforming?.name || "N/A"}</p>
                <p className="text-xs text-muted-foreground">{analytics.bestPerforming?.views || 0} views</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </>
    );
  };

  // Product Managing button handlers
  const handleAddVariation = () => {
    setShowAddVariationDialog(true);
    toast({
      title: "Add Variation",
      description: "Add variation dialog opened",
    });
  };

  const handleAllFilters = () => {
    setShowAllFiltersDialog(true);
    toast({
      title: "All Filters",
      description: "Advanced filtering options opened",
    });
  };

  const handleSettings = () => {
    setShowSettingsDialog(true);
    toast({
      title: "Settings",
      description: "View customization settings opened",
    });
  };

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    toast({
      title: "Tab Changed",
      description: `Switched to ${tab.replace('-', ' ')}`,
    });
  };

  const handleSearchFieldChange = (field: string) => {
    setSearchField(field);
  };

  const handleSearchQueryChange = (query: string) => {
    setProductSearchQuery(query);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    toast({
      title: "Sort Changed",
      description: `Sorted by ${sort.replace('-', ' ')}`,
    });
  };

  const handleListingStatusChange = (status: string) => {
    setListingStatus(status);
    toast({
      title: "Status Filter",
      description: `Filtered by ${status} status`,
    });
  };

  const handleFulfilledByChange = (fulfillment: string) => {
    setFulfilledBy(fulfillment);
    toast({
      title: "Fulfillment Filter",
      description: `Filtered by ${fulfillment} fulfillment`,
    });
  };

  const handleProductSelection = (productId: number, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  const handleSelectAllProducts = (checked: boolean) => {
    if (checked) {
      const allProductIds = getFilteredProducts().map(product => product.id);
      setSelectedProducts(allProductIds);
    } else {
      setSelectedProducts([]);
    }
  };

  const handleEditProduct = (productId: number) => {
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product);
    setEditingProduct({ ...product });
    setIsEditingProduct(true);
    setShowProductDetailsDialog(true);
    setCurrentView("products");
  };

  const handleViewProduct = (productId: number) => {
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product);
    setEditingProduct({ ...product });
    setIsEditingProduct(false);
    setShowProductDetailsDialog(true);
    setCurrentView("products");
  };

  const handleMoreActions = (productId: number) => {
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product);
    setCurrentView("products");
    toast({
      title: "Product Actions",
      description: `Managing product: ${product?.name}`,
    });
  };

  // Contact number validation function
  const validateContactNumber = (contact: string): boolean => {
    // Remove all non-digit characters
    const cleanContact = contact.replace(/\D/g, '');
    // Check if it's exactly 10 digits and starts with 6-9 (Indian mobile format)
    return /^[6-9]\d{9}$/.test(cleanContact);
  };

  // Format contact number for display
  const formatContactNumber = (contact: string): string => {
    const cleanContact = contact.replace(/\D/g, '');
    if (cleanContact.length === 10) {
      return `+91 ${cleanContact.slice(0, 5)} ${cleanContact.slice(5)}`;
    }
    return contact;
  };

  // Get gender preference display text
  const getGenderPreferenceText = (preference: string): string => {
    switch (preference) {
      case "male":
        return "Male";
      case "female":
        return "Female";
      case "other":
        return "Other";
      default:
        return "No Preference";
    }
  };

  // Job-specific handler functions
  const handleJobTabChange = (tab: string) => {
    setJobSelectedTab(tab);
    toast({
      title: "Tab Changed",
      description: `Switched to ${tab.replace('-', ' ')}`,
    });
  };

  const handleJobSearchFieldChange = (field: string) => {
    setJobSearchField(field);
  };

  const handleJobSearchQueryChange = (query: string) => {
    setJobSearchQuery(query);
  };

  const handleJobSortChange = (sort: string) => {
    setJobSortBy(sort);
    toast({
      title: "Sort Changed",
      description: `Jobs sorted by ${sort}`,
    });
  };

  const handleJobStatusChange = (status: string) => {
    setJobStatus(status);
    toast({
      title: "Status Changed",
      description: `Filtered by ${status} status`,
    });
  };

  const handleJobTypeChange = (type: string) => {
    setJobType(type);
    toast({
      title: "Type Changed",
      description: `Filtered by ${type} type`,
    });
  };

  const handleJobSelection = (jobId: number, checked: boolean) => {
    if (checked) {
      setSelectedJobs(prev => [...prev, jobId]);
    } else {
      setSelectedJobs(prev => prev.filter(id => id !== jobId));
    }
  };

  const handleSelectAllJobs = (checked: boolean) => {
    if (checked) {
      setSelectedJobs(getFilteredJobs().map(job => job.id));
    } else {
      setSelectedJobs([]);
    }
  };

  const handleEditJob = (jobId: number) => {
    const job = jobs.find(j => j.id === jobId);
    setSelectedJob(job);
    setEditingJob({ ...job });
    setIsEditingJob(true);
    setShowJobDetailsDialog(true);
    setCurrentView("jobs");
    toast({
      title: "Edit Job",
      description: `Editing job: ${job?.title}`,
    });
  };

  const handleViewJob = (jobId: number) => {
    const job = jobs.find(j => j.id === jobId);
    setSelectedJob(job);
    setEditingJob({ ...job });
    setIsEditingJob(false);
    setShowJobDetailsDialog(true);
    setCurrentView("jobs");
  };

  const handleMoreJobActions = (jobId: number) => {
    const job = jobs.find(j => j.id === jobId);
    setSelectedJob(job);
    setCurrentView("jobs");
    toast({
      title: "Job Actions",
      description: `Managing job: ${job?.title}`,
    });
  };

  // Internship action handlers
  const handleEditInternship = (internshipId: number) => {
    const internship = internships.find(i => i.id === internshipId);
    setSelectedInternship(internship);
    setEditingInternship({ ...internship });
    setIsEditingInternship(true);
    setShowInternshipDetailsDialog(true);
    setCurrentView("internships");
    toast({
      title: "Edit Internship",
      description: `Editing internship: ${internship?.title}`,
    });
  };

  const handleViewInternship = (internshipId: number) => {
    const internship = internships.find(i => i.id === internshipId);
    setSelectedInternship(internship);
    setEditingInternship({ ...internship });
    setIsEditingInternship(false);
    setShowInternshipDetailsDialog(true);
    setCurrentView("internships");
  };

  const handleMoreInternshipActions = (internshipId: number) => {
    const internship = internships.find(i => i.id === internshipId);
    setSelectedInternship(internship);
    setCurrentView("internships");
    toast({
      title: "Internship Actions",
      description: `Managing internship: ${internship?.title}`,
    });
  };

  const handleViewInternshipApplicants = (internshipId: number) => {
    setSelectedInternshipId(internshipId);
    const internship = internships.find(i => i.id === internshipId);
    setSelectedInternship(internship);
    setCurrentView("internships");
    setInternshipSelectedTab("applications");
  };

  const handleViewInternshipDetails = (internshipId: number) => {
    setSelectedInternshipId(internshipId);
    const internship = internships.find(i => i.id === internshipId);
    setSelectedInternship(internship);
    setShowInternshipDetailsDialog(true);
  };

  // Internship-specific handler functions
  const handleInternshipTabChange = (tab: string) => {
    setInternshipSelectedTab(tab);
    toast({
      title: "Tab Changed",
      description: `Switched to ${tab.replace('-', ' ')}`,
    });
  };

  const handleInternshipSearchQueryChange = (query: string) => {
    setInternshipSearchQuery(query);
  };

  const handleInternshipSortChange = (sort: string) => {
    setInternshipSortBy(sort);
    toast({
      title: "Sort Changed",
      description: `Internships sorted by ${sort}`,
    });
  };

  const handleInternshipStatusChange = (status: string) => {
    setInternshipStatus(status);
    toast({
      title: "Status Changed",
      description: `Filtered by ${status} status`,
    });
  };

  const handleInternshipTypeChange = (type: string) => {
    setInternshipType(type);
    toast({
      title: "Type Changed",
      description: `Filtered by ${type} type`,
    });
  };

  const handleViewJobDetails = (jobId: number) => {
    setSelectedJobId(jobId);
    const job = jobs.find(j => j.id === jobId);
    setSelectedJob(job);
    setShowJobDetailsDialog(true);
  };

  const handleViewJobApplicants = (jobId: number) => {
    setSelectedJobId(jobId);
    const job = jobs.find(j => j.id === jobId);
    setSelectedJob(job);
    
    // Mock applicants data
    const mockApplicants = [
      {
        id: 1,
        name: "Sarah Johnson",
        email: "sarah.johnson@email.com",
        phone: "+91 9876543210",
        education: "B.Tech Computer Science - IIT Delhi",
        skills: ["React", "Node.js", "Python", "MongoDB"],
        experience: "2 years",
        resume: "https://example.com/resume1.pdf",
        status: "applied", // applied, shortlisted, selected, rejected
        applicationDate: "2024-01-15T10:30:00Z",
        profilePicture: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
      },
      {
        id: 2,
        name: "Michael Chen",
        email: "michael.chen@email.com",
        phone: "+91 9876543211",
        education: "B.Tech Information Technology - NIT Trichy",
        skills: ["JavaScript", "TypeScript", "Angular", "Java"],
        experience: "1.5 years",
        resume: "https://example.com/resume2.pdf",
        status: "shortlisted",
        applicationDate: "2024-01-14T14:20:00Z",
        profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
      },
      {
        id: 3,
        name: "Priya Sharma",
        email: "priya.sharma@email.com",
        phone: "+91 9876543212",
        education: "M.Tech Computer Science - BITS Pilani",
        skills: ["Machine Learning", "Python", "TensorFlow", "SQL"],
        experience: "3 years",
        resume: "https://example.com/resume3.pdf",
        status: "selected",
        applicationDate: "2024-01-13T09:15:00Z",
        profilePicture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
      },
      {
        id: 4,
        name: "Rahul Kumar",
        email: "rahul.kumar@email.com",
        phone: "+91 9876543213",
        education: "B.Tech Electronics - VIT Vellore",
        skills: ["C++", "Embedded Systems", "IoT", "Arduino"],
        experience: "1 year",
        resume: "https://example.com/resume4.pdf",
        status: "rejected",
        applicationDate: "2024-01-12T16:45:00Z",
        profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
      },
      {
        id: 5,
        name: "Anjali Patel",
        email: "anjali.patel@email.com",
        phone: "+91 9876543214",
        education: "B.Tech Computer Science - SRM University",
        skills: ["Vue.js", "PHP", "MySQL", "AWS"],
        experience: "2.5 years",
        resume: "https://example.com/resume5.pdf",
        status: "applied",
        applicationDate: "2024-01-11T11:30:00Z",
        profilePicture: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
      }
    ];
    
    setApplicants(mockApplicants);
    setShowApplicantsDialog(true);
  };

  // Helper functions for applicants and job management
  const handleApplicantStatusChange = (applicantId: number, status: string) => {
    setApplicants(prev => prev.map(applicant => 
      applicant.id === applicantId 
        ? { ...applicant, status }
        : applicant
    ));
    toast({
      title: "Status Updated",
      description: `Applicant status changed to ${status}`,
    });
  };

  const handleMessageApplicant = (applicantId: number) => {
    setShowApplicantsDialog(false);
    setCurrentView("messaging");
    // Navigate to messaging with specific student
    toast({
      title: "Opening Chat",
      description: "Redirecting to messaging section...",
    });
  };

  const handleSaveJobChanges = () => {
    // Update the job in the jobs array
    const updatedJobs = jobs.map(job => 
      job.id === editingJob.id ? editingJob : job
    );
    // In a real app, you would update the state or make an API call
    toast({
      title: "Job Updated",
      description: "Job details have been saved successfully.",
    });
    setIsEditingJob(false);
  };

  const handleCancelJobEdit = () => {
    setEditingJob(selectedJob);
    setIsEditingJob(false);
  };

  const getFilteredApplicants = () => {
    let filtered = applicants;
    
    // Filter by status
    if (applicantStatusFilter !== "all") {
      filtered = filtered.filter(applicant => applicant.status === applicantStatusFilter);
    }
    
    // Filter by search query
    if (applicantSearchQuery) {
      filtered = filtered.filter(applicant => 
        applicant.name.toLowerCase().includes(applicantSearchQuery.toLowerCase()) ||
        applicant.education.toLowerCase().includes(applicantSearchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  // Product management helper functions
  const handleSaveProductChanges = () => {
    // Update the product in the products array
    const updatedProducts = products.map(product => 
      product.id === editingProduct.id ? editingProduct : product
    );
    // In a real app, you would update the state or make an API call
    toast({
      title: "Product Updated",
      description: "Product details have been saved successfully.",
    });
    setIsEditingProduct(false);
  };

  const handleCancelProductEdit = () => {
    setEditingProduct(selectedProduct);
    setIsEditingProduct(false);
  };

  // My Orders functions
  const handleBuyNow = (product: any) => {
    setSelectedProductForBuy(product);
    setShowBuyProductDialog(true);
    toast({
      title: "Product Selected",
      description: `Ready to purchase ${product.name}`,
    });
  };

  const handleViewProductDetails = (product: any) => {
    setSelectedProductForView(product);
    setShowProductDetailsDialog(true);
  };

  const handleViewOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleRateProduct = (orderId: string, rating: number, review: string) => {
    setMyOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, rating, review }
        : order
    ));
    toast({
      title: "Review Submitted!",
      description: "Thank you for your feedback.",
    });
    setShowOrderDetails(false);
  };

  const handleReorder = (order: any) => {
    handleBuyNow(order.product);
    setShowOrderDetails(false);
  };

  const handleDownloadInvoice = (order: any) => {
    // Mock invoice download
    toast({
      title: "Invoice Downloaded",
      description: "Invoice has been downloaded successfully.",
    });
  };

  const handleContactSeller = (sellerId: string) => {
    toast({
      title: "Contact Seller",
      description: "Opening chat with seller...",
    });
  };

  const handleJobAddDialog = () => {
    setShowJobAddDialog(true);
  };

  const handleJobFiltersDialog = () => {
    setShowJobFiltersDialog(true);
  };

  const handleJobSettingsDialog = () => {
    setShowJobSettingsDialog(true);
  };

  // Get job analytics data (real-time, honors filters)
  const getJobAnalyticsData = () => {
    // Owner jobs API returns: { success, data: jobs[], pagination }
    const apiJobs = (ownerJobsResult as any)?.data || [];

    // Apply client-side filters that aren't supported by API
    let filtered = apiJobs as any[];
    if (jobType !== "all") {
      filtered = filtered.filter(j => (j.jobType || j.type) === jobType);
    }

    const totalJobs = filtered.length;
    const totalViews = filtered.reduce((sum, job) => sum + (job.views || 0), 0);
    const totalApplicants = filtered.reduce((sum, job) => sum + (job.applicants || 0), 0);
    const bestPerformingJob = filtered.reduce((best, job) =>
      (job.views || 0) > (best.views || 0) ? job : best, filtered[0] || { views: 0, title: "No jobs yet" }
    );

    return {
      totalJobs,
      totalViews,
      totalApplicants,
      bestPerformingJob: bestPerformingJob?.title || "No jobs yet"
    };
  };

    const renderJobAnalyticsCards = () => {
    const analytics = getJobAnalyticsData();
    return (
      <>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
                <p className="text-2xl font-bold">{analytics.totalJobs}</p>
              </div>
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Views</p>
              <p className="text-2xl font-bold">{analytics.totalViews}</p>
            </div>
            <Eye className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Applicants</p>
              <p className="text-2xl font-bold">{analytics.totalApplicants}</p>
            </div>
            <Users className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Best Performing</p>
              <p className="text-sm font-medium truncate">{analytics.bestPerformingJob}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>
    </>
  );
};

  const renderInternshipAnalyticsCards = () => {
    const internshipsData = getFilteredInternships();
    const totalInternships = internshipsData.length;
    const totalViews = internshipsData.reduce((sum, internship) => sum + (internship.views || 0), 0);
    const totalApplicants = internshipsData.reduce((sum, internship) => sum + (internship.applicants || 0), 0);
    const bestPerformingInternship = internshipsData.reduce((best, current) => 
      (current.applicants || 0) > (best?.applicants || 0) ? current : best, null
    );

    return (
      <>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Internships</p>
                <p className="text-2xl font-bold">{totalInternships}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{totalViews}</p>
              </div>
              <Eye className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Applicants</p>
                <p className="text-2xl font-bold">{totalApplicants}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Best Performing</p>
                <p className="text-sm font-medium truncate">{bestPerformingInternship?.title || "No internships yet"}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>
    </>
  );
};

  // Handle job posting
  const handlePostJob = async () => {
    try {
      // Validate required fields
      if (!newJob.title || !newJob.company || !newJob.location || !newJob.pay || !newJob.description || !newJob.contactDetails || !newJob.requirements.trim()) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields including requirements.",
          variant: "destructive"
        });
        return;
      }

      // Validate contact number
      if (!validateContactNumber(newJob.contactDetails)) {
        toast({
          title: "Invalid Contact Number",
          description: "Please enter a valid 10-digit Indian mobile number.",
          variant: "destructive"
        });
        return;
      }

      // Prepare job data for API
      const jobData = {
        title: newJob.title,
        company: newJob.company,
        location: newJob.location,
        pay: newJob.pay,
        jobType: newJob.type,
        description: newJob.description,
        requirements: newJob.requirements
          .split('\n')
          .filter(req => req.trim())
          .flatMap(req => req.split(',').map(r => r.trim()))
          .filter(req => req.length > 0)
          .map(req => req.replace(/^[-•*]\s*/, '')), // Remove bullet points if any
        category: newJob.category,
        experience: newJob.experience,
        payType: newJob.payType,
        isRemote: newJob.isRemote,
        isUrgent: newJob.isUrgent,
        contactInfo: {
          phone: newJob.contactDetails
        }
      };



      console.log('Sending job data:', jobData);

      // Create job using API
      const response = await jobsAPI.create(jobData);
      
      toast({
        title: "Job Posted Successfully",
        description: "Your job has been posted and is now live."
      });

      // Reset form and close dialog
      setShowJobDialog(false);
      setNewJob({
        title: "", 
        company: "", 
        location: "", 
        pay: "", 
        duration: "", 
        type: "full-time", 
        description: "", 
        requirements: "", 
        contactDetails: "", 
        genderPreference: "any",
        category: "General",
        experience: "Entry Level",
        payType: "monthly",
        isRemote: false,
        isUrgent: false
      });

      // Immediately show the newly created job's details
      const createdJob = (response as any)?.job || (response as any);
      if (createdJob?.id || createdJob?._id) {
        const newId = createdJob.id || createdJob._id;
        setSelectedJobId(newId);
        setSelectedJob(createdJob);
        setIsEditingJob(false);
        setShowJobDetailsDialog(true);
        setCurrentView("jobs");
      }
      
    } catch (error) {
      console.error('Error posting job:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = "Failed to post job. Please try again.";
      
      if (error.response?.data?.errors) {
        // Handle validation errors from backend
        const validationErrors = error.response.data.errors;
        errorMessage = validationErrors.map((err: any) => err.msg).join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error Posting Job",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  // Handle internship posting
  const handlePostInternship = async () => {
    try {
      // Validate required fields
      if (!newInternship.title || !newInternship.company || !newInternship.location || !newInternship.stipend || !newInternship.description || !newInternship.contactDetails) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return;
      }

      // Validate contact number
      if (!validateContactNumber(newInternship.contactDetails)) {
        toast({
          title: "Invalid Contact Number",
          description: "Please enter a valid 10-digit Indian mobile number.",
          variant: "destructive"
        });
        return;
      }

      // Prepare internship data for API
      const internshipData = {
        title: newInternship.title,
        company: newInternship.company,
        location: newInternship.location,
        stipend: newInternship.stipend,
        duration: newInternship.duration,
        stipendType: newInternship.type,
        description: newInternship.description,
        requirements: newInternship.requirements.split('\n').filter(req => req.trim()),
        category: newInternship.category,
        startDate: new Date().toISOString(), // Default to current date
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Default to 30 days from now
        applicationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default to 7 days from now
        isRemote: newInternship.isRemote,
        isUrgent: newInternship.isUrgent,
        contactInfo: {
          phone: newInternship.contactDetails
        }
      };

      // Create internship using API
      const response = await internshipsAPI.create(internshipData);
      
      toast({
        title: "Internship Posted Successfully",
        description: "Your internship has been posted and is now live."
      });

      // Reset form and close dialog
      setShowInternshipDialog(false);
      setNewInternship({
        title: "", 
        company: "", 
        location: "", 
        stipend: "", 
        duration: "", 
        type: "paid", 
        description: "", 
        requirements: "", 
        skills: "", 
        contactDetails: "", 
        genderPreference: "any",
        category: "General",
        startDate: "",
        endDate: "",
        applicationDeadline: "",
        isRemote: false,
        isUrgent: false
      });

      // Refresh dashboard data
      // You might want to add a refetch function here
      
    } catch (error) {
      console.error('Error posting internship:', error);
      toast({
        title: "Error Posting Internship",
        description: error.response?.data?.message || "Failed to post internship. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Fixed Sidebar - Matching StudentDashboard */}
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
            <div key={item.id} className="relative">
              <Button
                variant={currentView === item.id ? "default" : "ghost"}
                className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-3'} h-10`}
                onClick={() => {
                  if (item.id === "chat") {
                    setShowChatbot(true);
                  } else if (item.id === "order-management") {
                    navigate("/order-management");
                  } else if (item.id === "internships") {
                    navigate("/internship-management");
                  } else {
                    setCurrentView(item.id);
                  }
                }}
              >
                              <item.icon className={`w-4 h-4 ${sidebarCollapsed ? '' : 'mr-2'}`} />
              {!sidebarCollapsed && <span>{item.label}</span>}
              {item.badge && sidebarCollapsed && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {notificationCount || 0}
                </Badge>
              )}
              </Button>
              {item.badge && !sidebarCollapsed && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {notificationCount || 0}
                </Badge>
              )}
            </div>
          ))}
        </div>

        {/* Language Selector */}
        {!sidebarCollapsed && (
          <div className="p-2 border-t border-border">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिंदी</SelectItem>
                <SelectItem value="ta">தமிழ்</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Action Buttons */}
        {!sidebarCollapsed && (
          <div className="p-2 space-y-2 border-t border-border">
            <Dialog open={showTrackDialog} onOpenChange={setShowTrackDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Eye className="h-4 w-4" />
                  {t("track")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tracking Options</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <Button variant="outline" onClick={() => {
                      toast({title: "Order Tracking", description: "Viewing all order statuses and delivery updates."});
                      setShowTrackDialog(false);
                    }}>
                      <Package className="h-4 w-4 mr-2" />
                      Track Orders
                    </Button>
                    <Button variant="outline" onClick={() => {
                      toast({title: "Application Tracking", description: "Viewing job and internship applications."});
                      setShowTrackDialog(false);
                    }}>
                      <Users className="h-4 w-4 mr-2" />
                      Track Applications
                    </Button>
                    <Button variant="outline" onClick={() => {
                      toast({title: "Performance Tracking", description: "Viewing business analytics and performance metrics."});
                      setShowTrackDialog(false);
                    }}>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Track Performance
                    </Button>
                    <Button variant="outline" onClick={() => {
                      toast({title: "Inventory Tracking", description: "Monitoring stock levels and product availability."});
                      setShowTrackDialog(false);
                    }}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Track Inventory
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Phone className="h-4 w-4" />
                  {t("contact")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Contact Options</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <Button variant="outline" onClick={() => {
                      toast({title: "Customer Support", description: "Connecting to customer support team."});
                      setShowContactDialog(false);
                    }}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Customer Support
                    </Button>
                    <Button variant="outline" onClick={() => {
                      toast({title: "Technical Support", description: "Connecting to technical support team."});
                      setShowContactDialog(false);
                    }}>
                      <Settings className="h-4 w-4 mr-2" />
                      Technical Support
                    </Button>
                    <Button variant="outline" onClick={() => {
                      toast({title: "Business Inquiries", description: "Opening business inquiry form."});
                      setShowContactDialog(false);
                    }}>
                      <Building className="h-4 w-4 mr-2" />
                      Business Inquiries
                    </Button>
                    <Button variant="outline" onClick={() => {
                      toast({title: "Feedback", description: "Opening feedback form."});
                      setShowContactDialog(false);
                    }}>
                      <Star className="h-4 w-4 mr-2" />
                      Send Feedback
                    </Button>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground mb-2">Quick Contact:</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>+91 98765 43210</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>support@jbs.com</span>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}


      </div>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300`}>
        {/* Advanced Filter Bar - Matching StudentDashboard */}
        {["jobs", "internships", "products", "my-orders"].includes(currentView) && (
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
                    <Button variant="outline" className="gap-2">
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Filter {currentView}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      {/* Category Filter */}
                      <div>
                        <Label className="text-sm font-medium">Category</Label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {getCategories().map((category) => (
                              <SelectItem key={category} value={category}>
                                {category === "all" ? "All Categories" : category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Price Range Filter */}
                      <div>
                        <Label className="text-sm font-medium">Price Range</Label>
                        <Select value={priceRange} onValueChange={setPriceRange}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {getPriceRanges().map((range) => (
                              <SelectItem key={range.value} value={range.value}>
                                {range.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button variant="outline" onClick={resetFilters} className="flex-1">
                        Reset Filters
                      </Button>
                      <Button onClick={applyFilters} className="flex-1">
                        Apply Filters
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="p-6">
          {/* Main Dashboard Overview */}
          {currentView === "overview" && (
            <div className="max-w-7xl mx-auto">
              {/* Welcome Section */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold gradient-text mb-4">
                  Welcome back, {user?.profile?.firstName || 'Owner'}! 👋
                </h1>
                <p className="text-xl text-muted-foreground">
                  Manage your business opportunities, products, and track your performance.
                </p>
              </div>

              {/* Quick Actions Section */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Post New Job */}
                                     <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
                     setSelectedOpportunityType('Job');
                     setShowOpportunityForm(true);
                   }}>
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Post New Job</h3>
                      <p className="text-sm text-muted-foreground">
                        Create a new job posting to attract talented candidates
                      </p>
                    </CardContent>
                  </Card>

                  {/* Post New Internship */}
                                     <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
                     setSelectedOpportunityType('Internship');
                     setShowOpportunityForm(true);
                   }}>
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <GraduationCap className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Post New Internship</h3>
                      <p className="text-sm text-muted-foreground">
                        Offer internship opportunities to students and fresh graduates
                      </p>
                    </CardContent>
                  </Card>

                  {/* Manage Products */}
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentView("products")}>
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingCart className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Manage Products</h3>
                      <p className="text-sm text-muted-foreground">
                        Add, edit, and manage your product catalog
                      </p>
                    </CardContent>
                  </Card>

                  {/* View Analytics */}
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentView("analytics")}>
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BarChart3 className="w-8 h-8 text-orange-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">View Analytics</h3>
                      <p className="text-sm text-muted-foreground">
                        Track your business performance and insights
                      </p>
                    </CardContent>
                  </Card>

                  {/* Manage Orders */}
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentView("order-management")}>
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-red-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Manage Orders</h3>
                      <p className="text-sm text-muted-foreground">
                        Process and track customer orders
                      </p>
                    </CardContent>
                  </Card>

                  {/* View Applications */}
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentView("applications")}>
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-indigo-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">View Applications</h3>
                      <p className="text-sm text-muted-foreground">
                        Review job and internship applications
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Recent Activity Section */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Recent Jobs */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5" />
                        Recent Jobs
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {jobs.slice(0, 3).map((job) => (
                          <div key={job.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{job.title}</p>
                              <p className="text-xs text-muted-foreground">{job.company}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {job.applicants} applicants
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Internships */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5" />
                        Recent Internships
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {internships.slice(0, 3).map((internship) => (
                          <div key={internship.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{internship.title}</p>
                              <p className="text-xs text-muted-foreground">{internship.company}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {internship.applicants} applicants
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Products */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5" />
                        Recent Products
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {products.slice(0, 3).map((product) => (
                          <div key={product.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{product.name}</p>
                              <p className="text-xs text-muted-foreground">₹{product.price}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {product.views} views
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}



          {/* Jobs View */}
          {currentView === "jobs" && (
            <div className="max-w-7xl mx-auto">
              {/* Top Section */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentView("jobs")}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                  </Button>
                  <h1 className="text-3xl font-bold gradient-text">Job Managing</h1>
                </div>
                <Button onClick={handleJobAddDialog} className="gap-2">
                      <Plus className="h-4 w-4" />
                  Post New Job
                    </Button>
              </div>

              {/* Analytics Summary Section */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {renderJobAnalyticsCards()}
              </div>

              {/* Horizontal Filters Section */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* Quick Action Tabs */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={jobSelectedTab === "all-jobs" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleJobTabChange("all-jobs")}
                      >
                        All Jobs
                      </Button>
                      <Button
                        variant={jobSelectedTab === "active-jobs" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleJobTabChange("active-jobs")}
                      >
                        Active Jobs
                      </Button>
                      <Button
                        variant={jobSelectedTab === "expired-jobs" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleJobTabChange("expired-jobs")}
                      >
                        Expired Jobs
                      </Button>
                      <Button
                        variant={jobSelectedTab === "draft-jobs" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleJobTabChange("draft-jobs")}
                      >
                        Draft Jobs
                      </Button>
                      <Button
                        variant={jobSelectedTab === "archived-jobs" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleJobTabChange("archived-jobs")}
                      >
                        Archived Jobs
                      </Button>
                    </div>

                    {/* Search and Filter Row */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="md:col-span-2">
                        <div className="flex gap-2">
                          <Select value={jobSearchField} onValueChange={handleJobSearchFieldChange}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="title">Job Title</SelectItem>
                              <SelectItem value="company">Company</SelectItem>
                              <SelectItem value="location">Location</SelectItem>
                              <SelectItem value="id">Job ID</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input 
                            placeholder="Search jobs..." 
                            className="flex-1"
                            value={jobSearchQuery}
                            onChange={(e) => handleJobSearchQueryChange(e.target.value)}
                          />
                        </div>
                      </div>
                      <Select value={jobSortBy} onValueChange={handleJobSortChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="date">Date Posted</SelectItem>
                          <SelectItem value="views">Views</SelectItem>
                          <SelectItem value="applicants">Applicants</SelectItem>
                          <SelectItem value="pay">Pay</SelectItem>
                          <SelectItem value="title">Job Title</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={jobStatus} onValueChange={handleJobStatusChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Job Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={jobType} onValueChange={handleJobTypeChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Job Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="remote">Remote</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center">
                      <Button variant="outline" onClick={handleJobFiltersDialog}>
                        All Filters
                      </Button>
                      <Button variant="outline" size="icon" onClick={handleJobSettingsDialog}>
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Jobs List (from API) */}
              <div className="rounded-lg border p-4 bg-background">
                {ownerJobsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading jobs…</p>
                ) : (
                  (() => {
                    const jobsFromApi = getFilteredJobs();
                    if (!jobsFromApi || jobsFromApi.length === 0) {
                      return (
                        <div className="py-8 text-center">
                          <p className="text-sm text-muted-foreground">No jobs found. Post your first job to see it here.</p>
                        </div>
                      );
                    }
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {jobsFromApi.map((job: any) => (
                          <Card key={job._id} className="hover:shadow-sm transition-shadow">
                            <CardContent className="p-4 space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="min-w-0">
                                  <p className="text-base font-semibold truncate">{job.title}</p>
                                  <p className="text-sm text-muted-foreground truncate">{job.company}</p>
                                </div>
                                <Badge variant="outline" className="shrink-0">{job.status || 'active'}</Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {job.location}
                              </div>
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{(job.applicants || 0)} applicants</span>
                                <span>{(job.views || 0)} views</span>
                              </div>
                              <div className="flex gap-2 pt-1">
                                <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/owner/job-details/${job._id}`)}>
                                  Details
                                </Button>
                                <Button size="sm" className="flex-1" onClick={() => navigate(`/owner/job-applicants/${job._id}`)}>
                                  Applicants
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    );
                  })()
                )}
              </div>

              {/* Job Dialog */}
              <Dialog open={showJobDialog} onOpenChange={setShowJobDialog}>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Post New Job</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh]">
                      <div className="space-y-4 p-1">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Job Title</Label>
                            <Input 
                              value={newJob.title}
                              onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                              placeholder="Enter job title"
                            />
                          </div>
                          <div>
                            <Label>Company</Label>
                            <Input 
                              value={newJob.company}
                              onChange={(e) => setNewJob({...newJob, company: e.target.value})}
                              placeholder="Company name"
                            />
                          </div>
                          <div>
                            <Label>Location</Label>
                            <Input 
                              value={newJob.location}
                              onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                              placeholder="Job location"
                            />
                          </div>
                          <div>
                            <Label>Pay</Label>
                            <Input 
                              value={newJob.pay}
                              onChange={(e) => setNewJob({...newJob, pay: e.target.value})}
                              placeholder="₹15,000/month"
                            />
                          </div>
                          <div>
                            <Label>Duration</Label>
                            <Select value={newJob.duration} onValueChange={(value) => setNewJob({...newJob, duration: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select duration" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1 month">1 month</SelectItem>
                                <SelectItem value="3 months">3 months</SelectItem>
                                <SelectItem value="6 months">6 months</SelectItem>
                                <SelectItem value="1 year">1 year</SelectItem>
                                <SelectItem value="Ongoing">Ongoing</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Job Type</Label>
                            <Select value={newJob.type} onValueChange={(value) => setNewJob({...newJob, type: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="full-time">Full-time</SelectItem>
                                <SelectItem value="part-time">Part-time</SelectItem>
                                <SelectItem value="contract">Contract</SelectItem>
                                <SelectItem value="freelance">Freelance</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea 
                            value={newJob.description}
                            onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                            placeholder="Job description..."
                            rows={4}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Category</Label>
                            <Input 
                              value={newJob.category}
                              onChange={(e) => setNewJob({...newJob, category: e.target.value})}
                              placeholder="e.g., Technology, Sales, Marketing"
                            />
                          </div>
                          <div>
                            <Label>Experience Level</Label>
                            <Select 
                              value={newJob.experience} 
                              onValueChange={(value) => setNewJob({...newJob, experience: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select experience level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Entry Level">Entry Level</SelectItem>
                                <SelectItem value="Mid Level">Mid Level</SelectItem>
                                <SelectItem value="Senior Level">Senior Level</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Pay Type</Label>
                            <Select 
                              value={newJob.payType} 
                              onValueChange={(value) => setNewJob({...newJob, payType: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select pay type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="hourly">Hourly</SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                                <SelectItem value="project-based">Project-based</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Contact Number / WhatsApp *</Label>
                            <Input 
                              value={newJob.contactDetails}
                              onChange={(e) => setNewJob({...newJob, contactDetails: e.target.value})}
                              placeholder="Enter 10-digit mobile number"
                              type="tel"
                            />
                            {newJob.contactDetails && !validateContactNumber(newJob.contactDetails) && (
                              <p className="text-sm text-red-500 mt-1">
                                Please enter a valid 10-digit Indian mobile number
                              </p>
                            )}
                          </div>
                          <div>
                            <Label>Gender Preference for Employee</Label>
                            <Select 
                              value={newJob.genderPreference} 
                              onValueChange={(value) => setNewJob({...newJob, genderPreference: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select preference" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="any">No Preference</SelectItem>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Remote Work</Label>
                            <Select 
                              value={newJob.isRemote ? "true" : "false"} 
                              onValueChange={(value) => setNewJob({...newJob, isRemote: value === "true"})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Remote work option" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="false">On-site</SelectItem>
                                <SelectItem value="true">Remote</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Urgent Position</Label>
                            <Select 
                              value={newJob.isUrgent ? "true" : "false"} 
                              onValueChange={(value) => setNewJob({...newJob, isUrgent: value === "true"})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Urgency level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="false">Normal</SelectItem>
                                <SelectItem value="true">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label>Requirements (one per line)</Label>
                          <Textarea 
                            value={newJob.requirements}
                            onChange={(e) => setNewJob({...newJob, requirements: e.target.value})}
                            placeholder="Good communication skills&#10;Basic computer knowledge&#10;Friendly personality"
                            rows={3}
                          />
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button variant="outline" onClick={() => setShowJobDialog(false)} className="flex-1">
                            Cancel
                          </Button>
                          <Button onClick={handlePostJob} className="flex-1">
                            Post Job
                          </Button>
                        </div>
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>

              {/* Job Add Dialog */}
              <Dialog open={showJobAddDialog} onOpenChange={setShowJobAddDialog}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Job</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Create a new job posting with all the required details.
                    </p>
                    <div className="flex gap-2">
                      <Button onClick={() => {
                        setShowJobAddDialog(false);
                        setShowJobDialog(true);
                      }} className="flex-1">
                        Create Job
                      </Button>
                      <Button variant="outline" onClick={() => setShowJobAddDialog(false)} className="flex-1">
                        Cancel
                      </Button>
                    </div>
                        </div>
                </DialogContent>
              </Dialog>

              {/* Job Filters Dialog */}
              <Dialog open={showJobFiltersDialog} onOpenChange={setShowJobFiltersDialog}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Advanced Job Filters</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Date Range</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select date range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="week">This Week</SelectItem>
                          <SelectItem value="month">This Month</SelectItem>
                          <SelectItem value="quarter">This Quarter</SelectItem>
                        </SelectContent>
                      </Select>
                          </div>
                    <div>
                      <Label>Pay Range</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select pay range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-10000">₹0 - ₹10,000</SelectItem>
                          <SelectItem value="10000-20000">₹10,000 - ₹20,000</SelectItem>
                          <SelectItem value="20000-50000">₹20,000 - ₹50,000</SelectItem>
                          <SelectItem value="50000+">₹50,000+</SelectItem>
                        </SelectContent>
                      </Select>
                          </div>
                    <div>
                      <Label>Location</Label>
                      <Input placeholder="Enter location" />
                        </div>
                    <div className="flex gap-2">
                      <Button onClick={() => setShowJobFiltersDialog(false)} className="flex-1">
                        Apply Filters
                            </Button>
                      <Button variant="outline" onClick={() => setShowJobFiltersDialog(false)} className="flex-1">
                        Cancel
                            </Button>
                          </div>
                        </div>
                </DialogContent>
              </Dialog>

              {/* Job Settings Dialog */}
              <Dialog open={showJobSettingsDialog} onOpenChange={setShowJobSettingsDialog}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Job View Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Default Sort</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select default sort" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="date">Date Posted</SelectItem>
                          <SelectItem value="views">Views</SelectItem>
                          <SelectItem value="applicants">Applicants</SelectItem>
                        </SelectContent>
                      </Select>
                        </div>
                    <div>
                      <Label>Items per page</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select items per page" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10 items</SelectItem>
                          <SelectItem value="25">25 items</SelectItem>
                          <SelectItem value="50">50 items</SelectItem>
                        </SelectContent>
                      </Select>
                      </div>
                    <div className="flex gap-2">
                      <Button onClick={() => setShowJobSettingsDialog(false)} className="flex-1">
                        Save Settings
                      </Button>
                      <Button variant="outline" onClick={() => setShowJobSettingsDialog(false)} className="flex-1">
                        Cancel
                      </Button>
              </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              {/* Products Section removed as requested */}
            </div>
          )}

          {/* Internships View */}
          {currentView === "internships" && (
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentView("jobs")}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                  </Button>
                  <h1 className="text-3xl font-bold gradient-text">Internship Management</h1>
                </div>
                <Button onClick={() => setShowInternshipDialog(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Post New Internship
                </Button>
              </div>

              {/* Analytics Summary Section */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {renderInternshipAnalyticsCards()}
              </div>

              {/* Horizontal Filters Section */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* Quick Action Tabs */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={internshipSelectedTab === "all-internships" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleInternshipTabChange("all-internships")}
                      >
                        All Internships
                      </Button>
                      <Button
                        variant={internshipSelectedTab === "active-internships" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleInternshipTabChange("active-internships")}
                      >
                        Active Internships
                      </Button>
                      <Button
                        variant={internshipSelectedTab === "expired-internships" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleInternshipTabChange("expired-internships")}
                      >
                        Expired Internships
                      </Button>
                      <Button
                        variant={internshipSelectedTab === "draft-internships" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleInternshipTabChange("draft-internships")}
                      >
                        Draft Internships
                      </Button>
                      <Button
                        variant={internshipSelectedTab === "archived-internships" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleInternshipTabChange("archived-internships")}
                      >
                        Archived Internships
                      </Button>
                    </div>

                    {/* Search and Filter Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <Input 
                          placeholder="Search internships..." 
                          className="flex-1"
                          value={internshipSearchQuery}
                          onChange={(e) => handleInternshipSearchQueryChange(e.target.value)}
                        />
                      </div>
                      <Select value={internshipSortBy} onValueChange={handleInternshipSortChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="date">Date Posted</SelectItem>
                          <SelectItem value="views">Views</SelectItem>
                          <SelectItem value="applicants">Applicants</SelectItem>
                          <SelectItem value="title">Internship Title</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={internshipType} onValueChange={handleInternshipTypeChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Internship Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="Paid">Paid</SelectItem>
                          <SelectItem value="Unpaid">Unpaid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Post New Internship</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh]">
                      <div className="space-y-4 p-1">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Internship Title</Label>
                            <Input 
                              value={newInternship.title}
                              onChange={(e) => setNewInternship({...newInternship, title: e.target.value})}
                              placeholder="Enter internship title"
                            />
                          </div>
                          <div>
                            <Label>Company</Label>
                            <Input 
                              value={newInternship.company}
                              onChange={(e) => setNewInternship({...newInternship, company: e.target.value})}
                              placeholder="Company name"
                            />
                          </div>
                          <div>
                            <Label>Location</Label>
                            <Input 
                              value={newInternship.location}
                              onChange={(e) => setNewInternship({...newInternship, location: e.target.value})}
                              placeholder="Internship location"
                            />
                          </div>
                          <div>
                            <Label>Stipend</Label>
                            <Input 
                              value={newInternship.stipend}
                              onChange={(e) => setNewInternship({...newInternship, stipend: e.target.value})}
                              placeholder="₹8,000/month or Unpaid"
                            />
                          </div>
                          <div>
                            <Label>Duration</Label>
                            <Select value={newInternship.duration} onValueChange={(value) => setNewInternship({...newInternship, duration: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select duration" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1 month">1 month</SelectItem>
                                <SelectItem value="2 months">2 months</SelectItem>
                                <SelectItem value="3 months">3 months</SelectItem>
                                <SelectItem value="6 months">6 months</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Type</Label>
                            <Select value={newInternship.type} onValueChange={(value) => setNewInternship({...newInternship, type: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Paid">Paid</SelectItem>
                                <SelectItem value="Unpaid">Unpaid</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea 
                            value={newInternship.description}
                            onChange={(e) => setNewInternship({...newInternship, description: e.target.value})}
                            placeholder="Internship description..."
                            rows={4}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Contact Number / WhatsApp *</Label>
                            <Input 
                              value={newInternship.contactDetails}
                              onChange={(e) => setNewInternship({...newInternship, contactDetails: e.target.value})}
                              placeholder="Enter 10-digit mobile number"
                              type="tel"
                            />
                            {newInternship.contactDetails && !validateContactNumber(newInternship.contactDetails) && (
                              <p className="text-sm text-red-500 mt-1">
                                Please enter a valid 10-digit Indian mobile number
                              </p>
                            )}
                          </div>
                          <div>
                            <Label>Gender Preference for Intern</Label>
                            <Select 
                              value={newInternship.genderPreference} 
                              onValueChange={(value) => setNewInternship({...newInternship, genderPreference: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select preference" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="any">No Preference</SelectItem>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label>Requirements (one per line)</Label>
                          <Textarea 
                            value={newInternship.requirements}
                            onChange={(e) => setNewInternship({...newInternship, requirements: e.target.value})}
                            placeholder="Good communication skills&#10;Basic technical knowledge&#10;Eagerness to learn"
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Category</Label>
                            <Input 
                              value={newInternship.category}
                              onChange={(e) => setNewInternship({...newInternship, category: e.target.value})}
                              placeholder="e.g., Technology, Marketing, Design"
                            />
                          </div>
                          <div>
                            <Label>Skills (comma separated)</Label>
                            <Input 
                              value={newInternship.skills}
                              onChange={(e) => setNewInternship({...newInternship, skills: e.target.value})}
                              placeholder="React, JavaScript, Node.js"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Remote Work</Label>
                            <Select 
                              value={newInternship.isRemote ? "true" : "false"} 
                              onValueChange={(value) => setNewInternship({...newInternship, isRemote: value === "true"})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Remote work option" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="false">On-site</SelectItem>
                                <SelectItem value="true">Remote</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Urgent Position</Label>
                            <Select 
                              value={newInternship.isUrgent ? "true" : "false"} 
                              onValueChange={(value) => setNewInternship({...newInternship, isUrgent: value === "true"})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Urgency level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="false">Normal</SelectItem>
                                <SelectItem value="true">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button variant="outline" onClick={() => setShowInternshipDialog(false)} className="flex-1">
                            Cancel
                          </Button>
                          <Button onClick={handlePostInternship} className="flex-1">
                            Post Internship
                          </Button>
                        </div>
                      </div>
                    </ScrollArea>
                  </DialogContent>
      </Dialog>


              </div>
              
              {/* Internships List */}
              <div className="rounded-lg border p-4 bg-background">
                {ownerInternshipsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading internships…</p>
                ) : (
                  (() => {
                    const internshipsFromApi = getFilteredInternships();
                    if (!internshipsFromApi || internshipsFromApi.length === 0) {
                      return (
                        <div className="py-8 text-center">
                          <p className="text-sm text-muted-foreground">No internships found. Post your first internship to see it here.</p>
                        </div>
                      );
                    }
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {internshipsFromApi.map((internship: any) => (
                  <Card key={internship._id || internship.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <p className="text-base font-semibold truncate">{internship.title}</p>
                          <p className="text-sm text-muted-foreground truncate">{internship.company}</p>
                        </div>
                        <Badge variant="outline" className="shrink-0">{internship.status || 'active'}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {internship.location}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{(internship.applicants || 0)} applicants</span>
                        <span>{(internship.views || 0)} views</span>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewInternshipDetails(internship._id || internship.id)}>
                          Details
                        </Button>
                        <Button size="sm" className="flex-1" onClick={() => handleViewInternshipApplicants(internship._id || internship.id)}>
                          Applicants
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Applications View */}
          {currentView === "applications" && (
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentView("jobs")}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                  </Button>
                  <h1 className="text-3xl font-bold gradient-text">Applications Received</h1>
                </div>
              </div>
              <OwnerApplicationsView />
            </div>
          )}

          {/* Products View */}
          {currentView === "products" && (
            <div className="max-w-7xl mx-auto">
              {/* Top Section - Page Title and Action Buttons */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentView("jobs")}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                  </Button>
                  <h1 className="text-3xl font-bold gradient-text">Product Managing</h1>
                </div>
                <Button className="gap-2" onClick={() => setShowAddProductDialog(true)}>
                  <Plus className="h-4 w-4" />
                  Add Product
                </Button>
              </div>

              {/* Analytics Summary Section */}
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {renderProductAnalyticsCards()}
                </div>
              </div>

              {/* Horizontal Filters Section */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* Quick Action Tabs */}
                    <div className="flex flex-wrap gap-2 border-b pb-3">
                      <Button 
                        variant={selectedTab === "all-inventory" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => handleTabChange("all-inventory")}
                      >
                        All Inventory
                      </Button>
                      <Button 
                        variant={selectedTab === "suppressed-listings" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => handleTabChange("suppressed-listings")}
                      >
                        Suppressed Listings
                      </Button>
                      <Button 
                        variant={selectedTab === "potential-issues" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => handleTabChange("potential-issues")}
                      >
                        Potential Issues
                      </Button>
                      <Button 
                        variant={selectedTab === "request-catalog" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => handleTabChange("request-catalog")}
                      >
                        Request Catalog
                      </Button>
                      <Button 
                        variant={selectedTab === "out-of-stock" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => handleTabChange("out-of-stock")}
                      >
                        Out of Stock
                      </Button>
                    </div>

                                          {/* Search and Filter Row */}
                      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
                        {/* Search Dropdown and Input */}
                        <div className="lg:col-span-2 flex gap-2">
                          <Select value={searchField} onValueChange={handleSearchFieldChange}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="title">Product Title</SelectItem>
                              <SelectItem value="sku">SKU</SelectItem>
                              <SelectItem value="id">Product ID</SelectItem>
                              <SelectItem value="brand">Brand</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input 
                            placeholder="Search products..." 
                            className="flex-1"
                            value={productSearchQuery}
                            onChange={(e) => handleSearchQueryChange(e.target.value)}
                          />
                        </div>

                        {/* Sort Dropdown */}
                        <Select value={sortBy} onValueChange={handleSortChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="date">Date Created</SelectItem>
                            <SelectItem value="stock">Stock Level</SelectItem>
                            <SelectItem value="sales">Sales Rank</SelectItem>
                            <SelectItem value="views">Views</SelectItem>
                            <SelectItem value="price">Price</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Listing Status */}
                        <Select value={listingStatus} onValueChange={handleListingStatusChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Listing Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Fulfilled By */}
                        <Select value={fulfilledBy} onValueChange={handleFulfilledByChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Fulfilled By" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="self">Self-Ship</SelectItem>
                            <SelectItem value="vendor">Vendor-Ship</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={handleAllFilters}>
                            <Filter className="h-4 w-4 mr-2" />
                            All Filters
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleSettings}>
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                  </div>
                </CardContent>
              </Card>

      {/* Add New Product Dialog */}
      <Dialog open={showAddProductDialog} onOpenChange={setShowAddProductDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {t("addNewProduct") || "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Product Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t("basicInformation") || "Basic Information"}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="productName">{t("productName") || "Product Name"}</Label>
                  <Input
                    id="productName"
                    placeholder={t("enterProductName") || "Enter product name"}
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                </div>
                <div>
                  <Label htmlFor="brand">{t("brand") || "Brand"}</Label>
                  <Input
                    id="brand"
                    placeholder={t("enterBrand") || "Enter brand name"}
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})}
                  />
                </div>
              </div>



                      {/* Product Pricing and Stock */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">{t("price") || "Price"} (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0.00"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="originalPrice">{t("originalPrice") || "Original Price"} (₹)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    placeholder="0.00"
                    value={newProduct.originalPrice}
                    onChange={(e) => setNewProduct({...newProduct, originalPrice: e.target.value})}
                  />
                </div>
                
                <div>
                          <Label htmlFor="stock">{t("stock") || "Stock"}</Label>
                  <Input
                            id="stock"
                    type="number"
                    placeholder="0"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
                  />
                </div>
              </div>

                      {/* B2B Pricing Section */}
                      <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-4">
                          <Switch
                            id="isB2B"
                            checked={newProduct.isB2B}
                            onCheckedChange={(checked) => setNewProduct({...newProduct, isB2B: checked})}
                          />
                          <Label htmlFor="isB2B" className="font-medium">
                            {t("b2bPricing") || "B2B Quantity-based Pricing"}
                          </Label>
                        </div>

                        {newProduct.isB2B && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="quantityRange">{t("quantityRange") || "Quantity Range"}</Label>
                                <Select 
                                  value={newProduct.selectedQuantityRange} 
                                  onValueChange={(value) => setNewProduct({...newProduct, selectedQuantityRange: value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder={t("selectQuantityRange") || "Select quantity range"} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="1-5">Qty 1 – 5</SelectItem>
                                    <SelectItem value="5-10">Qty 5 – 10</SelectItem>
                                    <SelectItem value="10-20">Qty 10 – 20</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                          {/* Dynamic Pricing Fields */}
                          {newProduct.selectedQuantityRange && (
                            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                              <h4 className="font-medium text-sm">
                                {t("pricingFor") || "Pricing for"} Qty {newProduct.selectedQuantityRange}
                              </h4>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="sellerPrice">{t("sellerPrice") || "Seller Price"} (₹)</Label>
                                  <Input
                                    id="sellerPrice"
                                    type="number"
                                    placeholder="0.00"
                                    value={newProduct.quantityPricing[newProduct.selectedQuantityRange as keyof typeof newProduct.quantityPricing]?.sellerPrice || ""}
                                    onChange={(e) => updateMarketPrice(newProduct.selectedQuantityRange, e.target.value)}
                                  />
                                </div>
                                
                                <div>
                                  <Label htmlFor="marketPrice">{t("marketPrice") || "Market Price"} (₹)</Label>
                                  <Input
                                    id="marketPrice"
                                    type="number"
                                    placeholder="0.00"
                                    value={newProduct.quantityPricing[newProduct.selectedQuantityRange as keyof typeof newProduct.quantityPricing]?.marketPrice || ""}
                                    readOnly
                                    className="bg-muted"
                                  />
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Auto-calculated: Seller Price + 5% Commission + ₹20 Delivery + 18% GST
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* All Quantity Ranges Pricing Summary */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm">{t("allQuantityRanges") || "All Quantity Ranges"}</h4>
                            <div className="grid grid-cols-1 gap-3">
                              {Object.entries(newProduct.quantityPricing).map(([range, pricing]) => (
                                <div key={range} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                  <span className="font-medium">Qty {range}</span>
                                  <div className="flex items-center gap-4">
                                    <div className="text-sm">
                                      <span className="text-muted-foreground">Seller: </span>
                                      <span className="font-medium">₹{pricing.sellerPrice || "0.00"}</span>
                                    </div>
                                    <div className="text-sm">
                                      <span className="text-muted-foreground">Market: </span>
                                      <span className="font-medium">₹{pricing.marketPrice || "0.00"}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">{t("category") || "Category"}</Label>
                  <Select 
                    value={newProduct.category} 
                    onValueChange={(value) => setNewProduct({...newProduct, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectCategory") || "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">{t("electronics") || "Electronics"}</SelectItem>
                      <SelectItem value="books">{t("books") || "Books"}</SelectItem>
                      <SelectItem value="clothing">{t("clothing") || "Clothing"}</SelectItem>
                      <SelectItem value="accessories">{t("accessories") || "Accessories"}</SelectItem>
                      <SelectItem value="furniture">{t("furniture") || "Furniture"}</SelectItem>
                      <SelectItem value="stationery">{t("stationery") || "Stationery"}</SelectItem>
                      <SelectItem value="sports">{t("sports") || "Sports"}</SelectItem>
                      <SelectItem value="health">{t("health") || "Health"}</SelectItem>
                      <SelectItem value="beauty">{t("beauty") || "Beauty"}</SelectItem>
                      <SelectItem value="food">{t("food") || "Food"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="condition">{t("condition") || "Condition"}</Label>
                  <Select 
                    value={newProduct.condition} 
                    onValueChange={(value) => setNewProduct({...newProduct, condition: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">{t("new") || "New"}</SelectItem>
                      <SelectItem value="like-new">{t("likeNew") || "Like New"}</SelectItem>
                      <SelectItem value="good">{t("good") || "Good"}</SelectItem>
                      <SelectItem value="fair">{t("fair") || "Fair"}</SelectItem>
                      <SelectItem value="used">{t("used") || "Used"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Product Description */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t("productDetails") || "Product Details"}</h3>
              
              <div>
                <Label htmlFor="description">{t("description") || "Description"}</Label>
                <Textarea
                  id="description"
                  placeholder={t("enterProductDescription") || "Enter detailed product description"}
                  rows={4}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="features">{t("features") || "Key Features"}</Label>
                <Textarea
                  id="features"
                  placeholder={t("enterKeyFeatures") || "Enter key features (one per line)"}
                  rows={3}
                  value={newProduct.features}
                  onChange={(e) => setNewProduct({...newProduct, features: e.target.value})}
                />
              </div>
            </div>

            {/* Product Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t("productImages") || "Product Images"}</h3>
              
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  {t("clickToUploadImages") || "Click to upload images or drag and drop"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("supportedFormats") || "PNG, JPG, GIF up to 10MB"}
                </p>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  className="mt-4"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setNewProduct({...newProduct, images: files});
                  }}
                />
              </div>
              
              {newProduct.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {newProduct.images.map((file, index) => (
                    <div key={index} className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          const newImages = newProduct.images.filter((_, i) => i !== index);
                          setNewProduct({...newProduct, images: newImages});
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t("availability") || "Availability"}</h3>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="inStock"
                  checked={newProduct.inStock}
                  onCheckedChange={(checked) => setNewProduct({...newProduct, inStock: checked})}
                />
                <Label htmlFor="inStock">
                  {newProduct.inStock ? (t("inStock") || "In Stock") : (t("outOfStock") || "Out of Stock")}
                </Label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowAddProductDialog(false)}
              >
                {t("cancel") || "Cancel"}
              </Button>
              <Button 
                className="flex-1 bg-gradient-primary"
                onClick={() => {
                  // Here you would typically save the product
                  toast({
                    title: t("productAdded") || "Product Added",
                    description: t("productAddedSuccessfully") || "Your product has been added successfully!"
                  });
                  setShowAddProductDialog(false);
                  // Reset form
                  setNewProduct({
                    name: "",
                    price: "",
                    originalPrice: "",
                    category: "",
                    description: "",
                    features: "",
                    images: [],
                    inStock: true,
                    quantity: "",
                    brand: "",
                            condition: "new",
                            // B2B Quantity-based pricing
                            isB2B: false,
                            selectedQuantityRange: "",
                            quantityPricing: {
                              "1-5": { sellerPrice: "", marketPrice: "" },
                              "5-10": { sellerPrice: "", marketPrice: "" },
                              "10-20": { sellerPrice: "", marketPrice: "" }
                            }
                  });
                }}
              >
                {t("addProduct") || "Add Product"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

              {/* Add Variation Dialog */}
              <Dialog open={showAddVariationDialog} onOpenChange={setShowAddVariationDialog}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                      Add Product Variation
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="variationName">Variation Name</Label>
                        <Input
                          id="variationName"
                          placeholder="Enter variation name"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="variationType">Variation Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="size">Size</SelectItem>
                            <SelectItem value="color">Color</SelectItem>
                            <SelectItem value="material">Material</SelectItem>
                            <SelectItem value="style">Style</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                        <Label htmlFor="variationPrice">Price (₹)</Label>
                        <Input
                          id="variationPrice"
                          type="number"
                          placeholder="0.00"
                        />
                        </div>
                        
                      <div>
                        <Label htmlFor="variationStock">Stock Quantity</Label>
                        <Input
                          id="variationStock"
                          type="number"
                          placeholder="0"
                        />
                          </div>
                      
                      <div>
                        <Label htmlFor="variationSku">SKU</Label>
                        <Input
                          id="variationSku"
                          placeholder="Enter SKU"
                        />
                          </div>
                        </div>
                        
                    <div>
                      <Label htmlFor="variationDescription">Description</Label>
                      <Textarea
                        id="variationDescription"
                        placeholder="Enter variation description"
                        rows={3}
                      />
                    </div>
                        </div>
                        
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddVariationDialog(false)}>
                      Cancel
                            </Button>
                    <Button onClick={() => {
                      setShowAddVariationDialog(false);
                      toast({
                        title: "Variation Added",
                        description: "Product variation has been added successfully.",
                      });
                    }}>
                      Add Variation
                            </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* All Filters Dialog */}
              <Dialog open={showAllFiltersDialog} onOpenChange={setShowAllFiltersDialog}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                      Advanced Filters
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Price Range</Label>
                        <div className="flex gap-2">
                          <Input placeholder="Min" type="number" />
                          <Input placeholder="Max" type="number" />
                        </div>
                      </div>
                        
                      <div>
                        <Label>Stock Range</Label>
                        <div className="flex gap-2">
                          <Input placeholder="Min" type="number" />
                          <Input placeholder="Max" type="number" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Date Range</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select date range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="quarter">This Quarter</SelectItem>
                            <SelectItem value="year">This Year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Performance</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select performance" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High Performing</SelectItem>
                            <SelectItem value="medium">Medium Performing</SelectItem>
                            <SelectItem value="low">Low Performing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>


                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAllFiltersDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => {
                      setShowAllFiltersDialog(false);
                      toast({
                        title: "Filters Applied",
                        description: "Advanced filters have been applied successfully.",
                      });
                    }}>
                      Apply Filters
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Settings Dialog */}
              <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                      View Customization Settings
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-6">


                    <div>
                      <Label className="text-base font-medium">Display Options</Label>
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center space-x-2">
                          <Switch id="show-images" defaultChecked />
                          <Label htmlFor="show-images">Show Product Images</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="show-ratings" defaultChecked />
                          <Label htmlFor="show-ratings">Show Ratings</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="compact-view" />
                          <Label htmlFor="compact-view">Compact View</Label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-medium">Default Sort</Label>
                      <Select defaultValue="date">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="date">Date Created</SelectItem>
                          <SelectItem value="name">Product Name</SelectItem>
                          <SelectItem value="price">Price</SelectItem>
                          <SelectItem value="stock">Stock Level</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => {
                      setShowSettingsDialog(false);
                      toast({
                        title: "Settings Saved",
                        description: "View customization settings have been saved.",
                      });
                    }}>
                      Save Settings
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              {/* Main Data Table Section */}
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox 
                              checked={selectedProducts.length === getFilteredProducts().length && getFilteredProducts().length > 0}
                              onCheckedChange={handleSelectAllProducts}
                            />
                          </TableHead>
                          <TableHead>Listing Status</TableHead>
                          <TableHead>Product Details</TableHead>
                          <TableHead>Estimated Fees</TableHead>
                          <TableHead className="w-20">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getFilteredProducts().map((product) => (
                          <TableRow key={product.id} className="hover:bg-muted/50">
                            <TableCell>
                              <Checkbox 
                                checked={selectedProducts.includes(product.id)}
                                onCheckedChange={(checked) => handleProductSelection(product.id, checked as boolean)}
                              />
                            </TableCell>
                            <TableCell>
                              <Badge variant={product.inStock ? "default" : "secondary"}>
                                {product.inStock ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <img 
                                  src={product.image} 
                                  alt={product.name} 
                                  className="w-12 h-12 object-cover rounded"
                                />
                                <div className="space-y-1">
                                  <p className="font-medium text-sm">{product.name}</p>
                                  <p className="text-xs text-muted-foreground">SKU: {product.id}</p>
                                  <p className="text-xs text-muted-foreground">{product.category}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span>Fees:</span>
                                  <span className="font-medium">₹{Math.floor(parseFloat(product.price.replace('₹', '').replace(',', '')) * 0.15)}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span>Profit:</span>
                                  <span className="font-medium text-green-600">₹{Math.floor(parseFloat(product.price.replace('₹', '').replace(',', '')) * 0.85)}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEditProduct(product.id)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleViewProduct(product.id)}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleMoreActions(product.id)}
                                >
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                      </div>
                    </CardContent>
                  </Card>
            </div>
          )}

          {/* Buy Products View */}
          {currentView === "buy-products" && (
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentView("jobs")}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                  </Button>
                  <h1 className="text-3xl font-bold gradient-text">Buy Products</h1>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                </Button>
                </div>
              </div>
              
              {/* Search and Filter Bar */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="search">Search Products</Label>
                      <Input
                        id="search"
                        placeholder="Search by name, category..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="electronics">Electronics</SelectItem>
                          <SelectItem value="books">Books</SelectItem>
                          <SelectItem value="clothing">Clothing</SelectItem>
                          <SelectItem value="accessories">Accessories</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="price">Price Range</Label>
                      <Select>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="All Prices" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-500">₹0 - ₹500</SelectItem>
                          <SelectItem value="500-1000">₹500 - ₹1,000</SelectItem>
                          <SelectItem value="1000-5000">₹1,000 - ₹5,000</SelectItem>
                          <SelectItem value="5000+">₹5,000+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="seller">Seller</Label>
                      <Select>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="All Sellers" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="verified">Verified Sellers</SelectItem>
                          <SelectItem value="premium">Premium Sellers</SelectItem>
                          <SelectItem value="local">Local Sellers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    id: 1,
                    name: "Wireless Bluetooth Earbuds",
                    seller: "TechMart Electronics",
                    price: "₹1,299",
                    originalPrice: "₹1,999",
                    category: "Electronics",
                    rating: 4.5,
                    reviews: 128,
                    image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400",
                    inStock: true,
                    isVerified: true
                  },
                  {
                    id: 2,
                    name: "Premium Study Desk Lamp",
                    seller: "HomeEssentials",
                    price: "₹899",
                    originalPrice: "₹1,299",
                    category: "Home & Garden",
                    rating: 4.2,
                    reviews: 89,
                    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
                    inStock: true,
                    isVerified: true
                  },
                  {
                    id: 3,
                    name: "Laptop Backpack with USB Charging",
                    seller: "TravelGear Pro",
                    price: "₹1,599",
                    originalPrice: "₹2,199",
                    category: "Accessories",
                    rating: 4.7,
                    reviews: 256,
                    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
                    inStock: true,
                    isVerified: true
                  },
                  {
                    id: 4,
                    name: "Smart Fitness Watch",
                    seller: "HealthTech Solutions",
                    price: "₹2,999",
                    originalPrice: "₹3,999",
                    category: "Electronics",
                    rating: 4.3,
                    reviews: 167,
                    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
                    inStock: false,
                    isVerified: true
                  },
                  {
                    id: 5,
                    name: "Bluetooth Mechanical Keyboard",
                    seller: "GamingZone",
                    price: "₹3,499",
                    originalPrice: "₹4,299",
                    category: "Electronics",
                    rating: 4.6,
                    reviews: 94,
                    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400",
                    inStock: true,
                    isVerified: false
                  },
                  {
                    id: 6,
                    name: "Ergonomic Office Chair",
                    seller: "FurnitureHub",
                    price: "₹4,999",
                    originalPrice: "₹6,999",
                    category: "Furniture",
                    rating: 4.4,
                    reviews: 73,
                    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
                    inStock: true,
                    isVerified: true
                  }
                ].map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                      {!product.inStock && (
                        <Badge className="absolute top-2 right-2" variant="destructive">
                          Out of Stock
                        </Badge>
                      )}
                      {product.isVerified && (
                        <Badge className="absolute top-2 left-2" variant="default">
                          Verified
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">{product.seller}</p>
                          <p className="text-xs text-muted-foreground">{product.category}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-primary">{product.price}</span>
                          {product.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              {product.originalPrice}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < product.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">({product.reviews})</span>
                        </div>
                        
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewProductDetails(product)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button 
                              className="flex-1" 
                              disabled={!product.inStock}
                              onClick={() => handleBuyNow({
                                id: product.id,
                                name: product.name,
                                image: product.image,
                                price: parseInt(product.price.replace('₹', '').replace(',', '')),
                                originalPrice: parseInt(product.originalPrice.replace('₹', '').replace(',', '')),
                                seller: product.seller,
                                sellerId: `seller-${product.id}`
                              })}
                            >
                              {product.inStock ? "Buy Now" : "Out of Stock"}
                            </Button>
                            <Button variant="outline" size="sm">
                              <MessageCircle className="h-4 w-4" />
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
          {currentView === "my-orders" && (
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentView("jobs")}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                  </Button>
                  <h1 className="text-3xl font-bold gradient-text">My Orders</h1>
                </div>
                <Badge>{myOrders.length} Total Orders</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myOrders.map((order) => (
                  <Card key={order.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewOrderDetails(order)}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <img src={order.product.image} alt={order.product.name} className="w-12 h-12 object-cover rounded" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{order.product.name}</h3>
                          <p className="text-xs text-muted-foreground">Order #{order.id}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Seller:</span>
                          <span className="font-medium">{order.product.seller}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Amount:</span>
                          <span className="font-semibold text-primary">₹{order.totalAmount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Order Date:</span>
                          <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge variant={
                            order.status === "Delivered" ? "default" :
                            order.status === "In Transit" ? "secondary" :
                            order.status === "Processing" ? "outline" :
                            "destructive"
                          }>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContactSeller(order.product.sellerId);
                          }}
                        >
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Contact
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                            setShowTrackDialog(true);
                          }}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Track
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Analytics View */}
          {currentView === "analytics" && (
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentView("jobs")}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
                <h1 className="text-3xl font-bold gradient-text">Analytics</h1>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                        <p className="text-2xl font-bold">₹45,231</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Orders</p>
                        <p className="text-2xl font-bold">127</p>
                      </div>
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Job Applications</p>
                        <p className="text-2xl font-bold">89</p>
                      </div>
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                        <p className="text-2xl font-bold">₹38,450</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Profile View - Editable Form */}
          {currentView === "profile" && (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentView("jobs")}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                  </Button>
                  <h1 className="text-3xl font-bold gradient-text">Profile</h1>
                </div>
                <Button 
                  onClick={() => editingProfile ? saveProfile() : setEditingProfile(true)}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  {editingProfile ? "Save Profile" : "Edit Profile"}
                </Button>
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
                    <p className="text-muted-foreground">{profile.businessName}</p>
                    {editingProfile && (
                      <Button variant="outline" className="mt-4">
                        <Camera className="w-4 h-4 mr-2" />
                        Change Photo
                      </Button>
                    )}
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
                          value={profile.name} 
                          onChange={(e) => setProfile({...profile, name: e.target.value})}
                          readOnly={!editingProfile} 
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input 
                          value={profile.email} 
                          onChange={(e) => setProfile({...profile, email: e.target.value})}
                          readOnly={!editingProfile} 
                        />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input 
                          value={profile.phone} 
                          onChange={(e) => setProfile({...profile, phone: e.target.value})}
                          readOnly={!editingProfile} 
                        />
                      </div>
                      <div>
                        <Label>City</Label>
                        <Input 
                          value={profile.city} 
                          onChange={(e) => setProfile({...profile, city: e.target.value})}
                          readOnly={!editingProfile} 
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Bio</Label>
                      <Textarea 
                        value={profile.bio} 
                        onChange={(e) => setProfile({...profile, bio: e.target.value})}
                        readOnly={!editingProfile} 
                      />
                    </div>
                  </div>
                </Card>

                {/* Business Information */}
                <Card className="p-6 lg:col-span-3">
                  <h3 className="text-lg font-semibold mb-4">Business Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Business Name</Label>
                        <Input 
                          value={profile.businessName} 
                          onChange={(e) => setProfile({...profile, businessName: e.target.value})}
                          readOnly={!editingProfile} 
                        />
                      </div>
                      <div>
                        <Label>Business Type</Label>
                        {editingProfile ? (
                          <Select value={profile.businessType} onValueChange={(value) => setProfile({...profile, businessType: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="retail">Retail</SelectItem>
                              <SelectItem value="manufacturing">Manufacturing</SelectItem>
                              <SelectItem value="services">Services</SelectItem>
                              <SelectItem value="technology">Technology</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input value={profile.businessType} readOnly />
                        )}
                      </div>
                      <div>
                        <Label>GST Number</Label>
                        <Input 
                          value={profile.gst} 
                          onChange={(e) => setProfile({...profile, gst: e.target.value})}
                          readOnly={!editingProfile} 
                        />
                      </div>
                      <div>
                        <Label>PAN Number</Label>
                        <Input 
                          value={profile.pan} 
                          onChange={(e) => setProfile({...profile, pan: e.target.value})}
                          readOnly={!editingProfile} 
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label>Business Address</Label>
                        <Textarea 
                          value={profile.businessAddress} 
                          onChange={(e) => setProfile({...profile, businessAddress: e.target.value})}
                          readOnly={!editingProfile} 
                        />
                      </div>
                      <div>
                        <Label>Business Hours</Label>
                        <Input 
                          value={profile.businessHours} 
                          onChange={(e) => setProfile({...profile, businessHours: e.target.value})}
                          readOnly={!editingProfile} 
                        />
                      </div>
                      <div>
                        <Label>Business Description</Label>
                        <Textarea 
                          value={profile.businessDescription} 
                          onChange={(e) => setProfile({...profile, businessDescription: e.target.value})}
                          readOnly={!editingProfile} 
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Portfolio Links */}
                <Card className="p-6 lg:col-span-3">
                  <h3 className="text-lg font-semibold mb-4">Portfolio & Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Website</Label>
                      <Input 
                        value={profile.website} 
                        onChange={(e) => setProfile({...profile, website: e.target.value})}
                        readOnly={!editingProfile} 
                      />
                    </div>
                    <div>
                      <Label>LinkedIn</Label>
                      <Input 
                        value={profile.linkedin} 
                        onChange={(e) => setProfile({...profile, linkedin: e.target.value})}
                        readOnly={!editingProfile} 
                      />
                    </div>
                  </div>
                </Card>
                
                {/* Logout Button Section */}
                <Card className="p-6 lg:col-span-3">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-4 text-destructive">Account Actions</h3>
                    <Button 
                      variant="destructive" 
                      size="lg" 
                      onClick={handleLogout}
                      className="gap-2"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      Click to securely log out of your account
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Notifications View */}
          {currentView === "notifications" && (
            <OwnerNotifications />
          )}

          {/* Messages View */}
          {currentView === "messages" && (
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentView("jobs")}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
                <h1 className="text-3xl font-bold gradient-text">Messages</h1>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Message Threads */}
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        Message Threads
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Search */}
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            placeholder="Search messages..."
                            className="pl-10"
                          />
                        </div>

                        {/* Filter Tabs */}
                        <Tabs defaultValue="all" className="w-full">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="internships">Internships</TabsTrigger>
                            <TabsTrigger value="jobs">Jobs</TabsTrigger>
                          </TabsList>
                        </Tabs>

                        {/* Thread List */}
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                          {[
                            {
                              id: 1,
                              studentName: "Alex Johnson",
                              type: "internship",
                              subject: "Digital Marketing Intern Application",
                              lastMessage: "Thank you for considering my application...",
                              timestamp: "2 hours ago",
                              unread: true,
                              avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
                            },
                            {
                              id: 2,
                              studentName: "Priya Sharma",
                              type: "job",
                              subject: "Sales Associate Position",
                              lastMessage: "I'm very interested in this opportunity...",
                              timestamp: "1 day ago",
                              unread: false,
                              avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face"
                            },
                            {
                              id: 3,
                              studentName: "Rahul Kumar",
                              type: "internship",
                              subject: "UI/UX Design Intern",
                              lastMessage: "When can I expect to hear back?",
                              timestamp: "3 days ago",
                              unread: false,
                              avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                            }
                          ].map((thread) => (
                            <Card
                              key={thread.id}
                              className="p-3 cursor-pointer hover:bg-accent transition-colors"
                            >
                              <div className="flex items-start gap-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={thread.avatar} />
                                  <AvatarFallback>{thread.studentName[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-medium text-sm truncate">{thread.studentName}</h4>
                                    {thread.unread && (
                                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground mb-1">{thread.subject}</p>
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {thread.lastMessage}
                                  </p>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-muted-foreground">{thread.timestamp}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {thread.type}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Message Content */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Conversation with Alex Johnson</CardTitle>
                      <CardDescription>Digital Marketing Intern Application</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                        {/* Messages */}
                        {[
                          {
                            id: 1,
                            sender: "Alex Johnson",
                            message: "Hi! I'm very interested in the Digital Marketing Intern position. I have experience with social media marketing and content creation.",
                            timestamp: "2 hours ago",
                            isOwner: false
                          },
                          {
                            id: 2,
                            sender: "You",
                            message: "Thank you for your interest, Alex! Could you please share your portfolio or any previous work you've done?",
                            timestamp: "1 hour ago",
                            isOwner: true
                          },
                          {
                            id: 3,
                            sender: "Alex Johnson",
                            message: "Of course! I've attached my portfolio and some sample campaigns I've worked on. I'm particularly proud of the social media campaign I ran for a local restaurant.",
                            timestamp: "30 minutes ago",
                            isOwner: false
                          }
                        ].map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.isOwner ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[70%] p-3 rounded-lg ${
                              message.isOwner 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted'
                            }`}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">{message.sender}</span>
                                <span className="text-xs opacity-70">{message.timestamp}</span>
                              </div>
                              <p className="text-sm">{message.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Message Input */}
                      <div className="mt-4 flex gap-2">
                        <Input
                          placeholder="Type your message..."
                          className="flex-1"
                        />
                        <Button>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Settings View */}
          {currentView === "settings" && (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentView("jobs")}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
                <h1 className="text-3xl font-bold gradient-text">Settings</h1>
              </div>
              <ScrollArea className="h-[80vh]">
                <div className="space-y-6 pr-4">
                  {/* Profile Settings */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input id="fullName" defaultValue="John Doe" />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" defaultValue="john@example.com" />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input id="phone" defaultValue="+91 9876543210" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input id="city" defaultValue="Chennai" />
                        </div>
                        <div>
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea id="bio" defaultValue="Experienced business owner..." />
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Business Settings */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Business Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="businessName">Business Name</Label>
                          <Input id="businessName" defaultValue="Tech Solutions Pvt Ltd" />
                        </div>
                        <div>
                          <Label htmlFor="businessType">Business Type</Label>
                          <Select defaultValue="retail">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="retail">Retail</SelectItem>
                              <SelectItem value="service">Service</SelectItem>
                              <SelectItem value="manufacturing">Manufacturing</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="gst">GST Number</Label>
                          <Input id="gst" defaultValue="22AAAAA0000A1Z5" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="businessAddress">Business Address</Label>
                          <Textarea id="businessAddress" defaultValue="123 Business Street, Chennai, TN" />
                        </div>
                        <div>
                          <Label htmlFor="businessHours">Business Hours</Label>
                          <Input id="businessHours" defaultValue="9 AM - 6 PM" />
                        </div>
                        <div>
                          <Label htmlFor="website">Website</Label>
                          <Input id="website" defaultValue="https://techsolutions.com" />
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Preferences */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Preferences</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Dark Mode</Label>
                          <p className="text-sm text-muted-foreground">Toggle dark/light theme</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto-save</Label>
                          <p className="text-sm text-muted-foreground">Automatically save changes</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div>
                        <Label>Language</Label>
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="hi">हिंदी</SelectItem>
                            <SelectItem value="ta">தமிழ்</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </Card>

                  {/* Notifications */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive updates via email</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Push Notifications</Label>
                          <p className="text-sm text-muted-foreground">Browser push notifications</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Order Updates</Label>
                          <p className="text-sm text-muted-foreground">Notifications for new orders</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </Card>

                  {/* Security */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input id="currentPassword" type="password" placeholder="Enter current password" />
                      </div>
                      <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" type="password" placeholder="Enter new password" />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input id="confirmPassword" type="password" placeholder="Confirm new password" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Two-Factor Authentication</Label>
                          <p className="text-sm text-muted-foreground">Add extra security to your account</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </Card>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline">Cancel</Button>
                    <Button onClick={() => {
                      toast({
                        title: "Settings Updated",
                        description: "Your settings have been saved successfully."
                      });
                    }}>Save Changes</Button>
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>

      {/* AI Chatbot */}
      {showChatbot && (
        <div className="fixed bottom-4 right-4 w-72 h-80 bg-card border rounded-lg shadow-lg flex flex-col z-50">
          <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">JBS Assistant</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowChatbot(false)}>
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="flex-1 p-3 overflow-y-auto space-y-2">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-2 rounded text-xs ${
                  msg.type === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {msg.message}
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-3 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Ask me anything..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                className="flex-1 text-xs"
              />
              <Button size="sm" onClick={sendChatMessage}>
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details - {selectedOrder.id}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Product Information */}
              <div className="flex items-start gap-4">
                <img src={selectedOrder.product.image} alt={selectedOrder.product.name} className="w-24 h-24 object-cover rounded" />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedOrder.product.name}</h3>
                  <p className="text-muted-foreground">Sold by {selectedOrder.product.seller}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant="outline">Qty: {selectedOrder.quantity}</Badge>
                    <Badge variant={selectedOrder.status === "Delivered" ? "default" : "secondary"}>
                      {selectedOrder.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Order Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedOrder.tracking.map((step, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step.status === "completed" ? "bg-green-500 text-white" :
                          step.status === "active" ? "bg-blue-500 text-white" :
                          "bg-gray-200 text-gray-500"
                        }`}>
                          {step.status === "completed" ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : step.status === "active" ? (
                            <Clock className="w-4 h-4" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{step.step}</p>
                          {step.time && (
                            <p className="text-sm text-muted-foreground">
                              {new Date(step.time).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Price Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Price Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Product Price (₹{selectedOrder.product.price} × {selectedOrder.quantity})</span>
                      <span>₹{selectedOrder.product.price * selectedOrder.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Charges</span>
                      <span>₹{selectedOrder.deliveryCharges}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total Amount</span>
                      <span>₹{selectedOrder.totalAmount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rate & Review */}
              {selectedOrder.status === "Delivered" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Rate & Review</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedOrder.rating ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Your Rating:</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className={`w-4 h-4 ${
                                star <= selectedOrder.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{selectedOrder.review}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <Label>Rating</Label>
                          <div className="flex gap-1 mt-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Button
                                key={star}
                                variant="ghost"
                                size="sm"
                                className="p-0 h-auto"
                                onClick={() => {
                                  const review = prompt("Please enter your review:");
                                  if (review !== null) {
                                    handleRateProduct(selectedOrder.id, star, review);
                                  }
                                }}
                              >
                                <Star className="w-5 h-5 text-gray-300 hover:text-yellow-400" />
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleDownloadInvoice(selectedOrder)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Invoice
                </Button>
                <Button variant="outline" onClick={() => handleReorder(selectedOrder)}>
                  <Package className="w-4 h-4 mr-2" />
                  Reorder
                </Button>
                <Button variant="outline" onClick={() => handleContactSeller(selectedOrder.product.sellerId)}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Seller
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Tracking Dialog */}
      {selectedOrder && (
        <Dialog open={showTrackDialog} onOpenChange={setShowTrackDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Track Order - {selectedOrder.id}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src={selectedOrder.product.image} alt={selectedOrder.product.name} className="w-12 h-12 object-cover rounded" />
                <div>
                  <h3 className="font-semibold">{selectedOrder.product.name}</h3>
                  <p className="text-sm text-muted-foreground">Order #{selectedOrder.id}</p>
                </div>
              </div>

              <div className="space-y-4">
                {selectedOrder.tracking.map((step, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.status === "completed" ? "bg-green-500 text-white" :
                      step.status === "active" ? "bg-blue-500 text-white" :
                      "bg-gray-200 text-gray-500"
                    }`}>
                      {step.status === "completed" ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : step.status === "active" ? (
                        <Clock className="w-4 h-4" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{step.step}</p>
                      {step.time && (
                        <p className="text-sm text-muted-foreground">
                          {new Date(step.time).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Applicants Dialog */}
      <Dialog open={showApplicantsDialog} onOpenChange={setShowApplicantsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Applicants for {selectedJob?.title}
            </DialogTitle>
            <DialogDescription>
              {applicants.length} total applicants • {getFilteredApplicants().length} showing
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search and Filter Bar */}
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search applicants by name or qualification..."
                    value={applicantSearchQuery}
                    onChange={(e) => setApplicantSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={applicantStatusFilter} onValueChange={setApplicantStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Applicants</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="selected">Selected</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Applicants List */}
            <div className="space-y-3">
              {getFilteredApplicants().map((applicant) => (
                <Card key={applicant.id} className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Applicant Avatar */}
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={applicant.profilePicture} alt={applicant.name} />
                      <AvatarFallback>{applicant.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>

                    {/* Applicant Details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{applicant.name}</h3>
                          <p className="text-sm text-muted-foreground">{applicant.education}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            applicant.status === 'selected' ? 'default' :
                            applicant.status === 'shortlisted' ? 'secondary' :
                            applicant.status === 'rejected' ? 'destructive' : 'outline'
                          }>
                            {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(applicant.applicationDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Contact</p>
                          <p className="text-muted-foreground">{applicant.email}</p>
                          <p className="text-muted-foreground">{applicant.phone}</p>
                        </div>
                        <div>
                          <p className="font-medium">Experience</p>
                          <p className="text-muted-foreground">{applicant.experience}</p>
                        </div>
                      </div>

                      <div>
                        <p className="font-medium text-sm">Skills</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {applicant.skills.map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMessageApplicant(applicant.id)}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                        
                        <Select
                          value={applicant.status}
                          onValueChange={(value) => handleApplicantStatusChange(applicant.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="applied">Applied</SelectItem>
                            <SelectItem value="shortlisted">Shortlist</SelectItem>
                            <SelectItem value="selected">Select</SelectItem>
                            <SelectItem value="rejected">Reject</SelectItem>
                          </SelectContent>
                        </Select>

                        {applicant.resume && (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Resume
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {getFilteredApplicants().length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No applicants found matching your criteria.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Job Details Dialog */}
      <Dialog open={showJobDetailsDialog} onOpenChange={setShowJobDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  {isEditingJob ? "Edit Job" : "Job Details"}
                </DialogTitle>
                <DialogDescription>
                  {selectedJob?.title} • {selectedJob?.company}
                </DialogDescription>
              </div>
              {!isEditingJob && (
                <Button
                  variant="outline"
                  onClick={() => setIsEditingJob(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Job
                </Button>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {isEditingJob ? (
              /* Edit Mode */
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Job Title</Label>
                    <Input
                      value={editingJob?.title || ""}
                      onChange={(e) => setEditingJob({...editingJob, title: e.target.value})}
                      placeholder="Enter job title"
                    />
                  </div>
                  <div>
                    <Label>Company</Label>
                    <Input
                      value={editingJob?.company || ""}
                      onChange={(e) => setEditingJob({...editingJob, company: e.target.value})}
                      placeholder="Company name"
                    />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input
                      value={editingJob?.location || ""}
                      onChange={(e) => setEditingJob({...editingJob, location: e.target.value})}
                      placeholder="Job location"
                    />
                  </div>
                  <div>
                    <Label>Pay</Label>
                    <Input
                      value={editingJob?.pay || ""}
                      onChange={(e) => setEditingJob({...editingJob, pay: e.target.value})}
                      placeholder="₹15,000/month"
                    />
                  </div>
                </div>

                <div>
                  <Label>Job Description</Label>
                  <Textarea
                    value={editingJob?.description || ""}
                    onChange={(e) => setEditingJob({...editingJob, description: e.target.value})}
                    placeholder="Enter detailed job description..."
                    rows={6}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Job Type</Label>
                    <Select
                      value={editingJob?.type || ""}
                      onValueChange={(value) => setEditingJob({...editingJob, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Duration</Label>
                    <Input
                      value={editingJob?.duration || ""}
                      onChange={(e) => setEditingJob({...editingJob, duration: e.target.value})}
                      placeholder="6 months"
                    />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={editingJob?.status || "active"}
                      onValueChange={(value) => setEditingJob({...editingJob, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSaveJobChanges}>
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={handleCancelJobEdit}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="space-y-6">
                {/* Job Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <img src={selectedJob?.image} alt={selectedJob?.title} className="w-8 h-8 rounded" />
                      {selectedJob?.title}
                    </CardTitle>
                    <CardDescription>{selectedJob?.company} • {selectedJob?.location}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Job Type</p>
                        <p className="font-medium">{selectedJob?.type}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Duration</p>
                        <p className="font-medium">{selectedJob?.duration}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Pay</p>
                        <p className="font-medium">{selectedJob?.pay}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Posted</p>
                        <p className="font-medium">{selectedJob?.posted}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                      <p className="text-sm leading-relaxed">
                        {selectedJob?.description || "No description available."}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Applicants Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Applicants Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{selectedJob?.applicants || 0}</p>
                        <p className="text-sm text-muted-foreground">Total Applicants</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{selectedJob?.views || 0}</p>
                        <p className="text-sm text-muted-foreground">Total Views</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{selectedJob?.applicants || 0}</p>
                        <p className="text-sm text-muted-foreground">Active Applications</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowJobDetailsDialog(false);
                          handleViewJobApplicants(selectedJob?.id);
                        }}
                        className="w-full"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        View All Applicants
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate Job
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share className="h-4 w-4 mr-2" />
                    Share Job
                  </Button>
                </div>
              </div>
            )}
          </div>
                 </DialogContent>
       </Dialog>

       {/* Internship Details Dialog */}
       <Dialog open={showInternshipDetailsDialog} onOpenChange={setShowInternshipDetailsDialog}>
         <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
           <DialogHeader>
             <div className="flex items-center justify-between">
               <div>
                 <DialogTitle className="flex items-center gap-2">
                   <GraduationCap className="h-5 w-5" />
                   Internship Details
                 </DialogTitle>
                 <DialogDescription>
                   {selectedInternship?.title} • {selectedInternship?.company}
                 </DialogDescription>
               </div>
               <Button
                 variant="outline"
                 onClick={() => handleEditInternship(selectedInternship?.id)}
               >
                 <Edit className="h-4 w-4 mr-2" />
                 Edit Internship
               </Button>
             </div>
           </DialogHeader>

           <div className="space-y-6">
             {/* Internship Overview */}
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <img src={selectedInternship?.image} alt={selectedInternship?.title} className="w-8 h-8 rounded" />
                   {selectedInternship?.title}
                 </CardTitle>
                 <CardDescription>{selectedInternship?.company} • {selectedInternship?.location}</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <p className="text-sm font-medium text-muted-foreground">Type</p>
                     <p className="font-medium">{selectedInternship?.type}</p>
                   </div>
                   <div>
                     <p className="text-sm font-medium text-muted-foreground">Duration</p>
                     <p className="font-medium">{selectedInternship?.duration}</p>
                   </div>
                   <div>
                     <p className="text-sm font-medium text-muted-foreground">Stipend</p>
                     <p className="font-medium">{selectedInternship?.stipend}</p>
                   </div>
                   <div>
                     <p className="text-sm font-medium text-muted-foreground">Posted</p>
                     <p className="font-medium">{selectedInternship?.posted}</p>
                   </div>
                 </div>

                 <div>
                   <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                   <p className="text-sm leading-relaxed">
                     {selectedInternship?.description || "No description available."}
                   </p>
                 </div>

                 {selectedInternship?.skills && selectedInternship.skills.length > 0 && (
                   <div>
                     <p className="text-sm font-medium text-muted-foreground mb-2">Required Skills</p>
                     <div className="flex flex-wrap gap-2">
                       {selectedInternship.skills.map((skill, index) => (
                         <Badge key={index} variant="outline" className="text-xs">
                           {skill}
                         </Badge>
                       ))}
                     </div>
                   </div>
                 )}
               </CardContent>
             </Card>

             {/* Applicants Summary */}
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Users className="h-5 w-5" />
                   Applicants Summary
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="grid grid-cols-3 gap-4">
                   <div className="text-center">
                     <p className="text-2xl font-bold text-blue-600">{selectedInternship?.applicants || 0}</p>
                     <p className="text-sm text-muted-foreground">Total Applicants</p>
                   </div>
                   <div className="text-center">
                     <p className="text-2xl font-bold text-green-600">{selectedInternship?.views || 0}</p>
                     <p className="text-sm text-muted-foreground">Total Views</p>
                   </div>
                   <div className="text-center">
                     <p className="text-2xl font-bold text-purple-600">{selectedInternship?.applicants || 0}</p>
                     <p className="text-sm text-muted-foreground">Active Applications</p>
                   </div>
                 </div>
                 
                 <div className="mt-4">
                   <Button
                     variant="outline"
                     onClick={() => {
                       setShowInternshipDetailsDialog(false);
                       handleViewInternshipApplicants(selectedInternship?.id);
                     }}
                     className="w-full"
                   >
                     <Users className="h-4 w-4 mr-2" />
                     View All Applicants
                   </Button>
                 </div>
               </CardContent>
             </Card>

             {/* Action Buttons */}
             <div className="flex gap-2">
               <Button variant="outline" className="flex-1">
                 <Copy className="h-4 w-4 mr-2" />
                 Duplicate Internship
               </Button>
               <Button variant="outline" className="flex-1">
                 <Share className="h-4 w-4 mr-2" />
                 Share Internship
               </Button>
             </div>
           </div>
         </DialogContent>
       </Dialog>

       {/* Product Details Dialog */}
       <Dialog open={showProductDetailsDialog} onOpenChange={setShowProductDetailsDialog}>
         <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
           <DialogHeader>
             <div className="flex items-center justify-between">
               <div>
                 <DialogTitle className="flex items-center gap-2">
                   <Package className="h-5 w-5" />
                   {isEditingProduct ? "Edit Product" : "Product Details"}
                 </DialogTitle>
                 <DialogDescription>
                   {selectedProduct?.name} • {selectedProduct?.category}
                 </DialogDescription>
               </div>
               {!isEditingProduct && (
                 <Button
                   variant="outline"
                   onClick={() => setIsEditingProduct(true)}
                 >
                   <Edit className="h-4 w-4 mr-2" />
                   Edit Product
                 </Button>
               )}
             </div>
           </DialogHeader>

           <div className="space-y-6">
             {isEditingProduct ? (
               /* Edit Mode */
               <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <Label>Product Name</Label>
                     <Input
                       value={editingProduct?.name || ""}
                       onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                       placeholder="Enter product name"
                     />
                   </div>
                   <div>
                     <Label>Category</Label>
                     <Select
                       value={editingProduct?.category || ""}
                       onValueChange={(value) => setEditingProduct({...editingProduct, category: value})}
                     >
                       <SelectTrigger>
                         <SelectValue placeholder="Select category" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="Electronics">Electronics</SelectItem>
                         <SelectItem value="Books">Books</SelectItem>
                         <SelectItem value="Clothing">Clothing</SelectItem>
                         <SelectItem value="Accessories">Accessories</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                   <div>
                     <Label>Price</Label>
                     <Input
                       value={editingProduct?.price || ""}
                       onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                       placeholder="₹999"
                     />
                   </div>
                   <div>
                     <Label>Stock</Label>
                     <Input
                       value={editingProduct?.stock || ""}
                       onChange={(e) => setEditingProduct({...editingProduct, stock: e.target.value})}
                       placeholder="50"
                     />
                   </div>
                 </div>

                 <div>
                   <Label>Description</Label>
                   <Textarea
                     value={editingProduct?.description || ""}
                     onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                     placeholder="Enter detailed product description..."
                     rows={4}
                   />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <Label>Status</Label>
                     <Select
                       value={editingProduct?.status || "active"}
                       onValueChange={(value) => setEditingProduct({...editingProduct, status: value})}
                     >
                       <SelectTrigger>
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="active">Active</SelectItem>
                         <SelectItem value="inactive">Inactive</SelectItem>
                         <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                   <div>
                     <Label>Brand</Label>
                     <Input
                       value={editingProduct?.brand || ""}
                       onChange={(e) => setEditingProduct({...editingProduct, brand: e.target.value})}
                       placeholder="Brand name"
                     />
                   </div>
                 </div>

                 <div className="flex gap-2 pt-4">
                   <Button onClick={handleSaveProductChanges}>
                     Save Changes
                   </Button>
                   <Button variant="outline" onClick={handleCancelProductEdit}>
                     Cancel
                   </Button>
                 </div>
               </div>
             ) : (
               /* View Mode */
               <div className="space-y-6">
                 {/* Product Overview */}
                 <Card>
                   <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                       <img src={selectedProduct?.image} alt={selectedProduct?.name} className="w-8 h-8 rounded" />
                       {selectedProduct?.name}
                     </CardTitle>
                     <CardDescription>{selectedProduct?.category} • {selectedProduct?.brand}</CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                       <div>
                         <p className="text-sm font-medium text-muted-foreground">Price</p>
                         <p className="font-medium">{selectedProduct?.price}</p>
                       </div>
                       <div>
                         <p className="text-sm font-medium text-muted-foreground">Stock</p>
                         <p className="font-medium">{selectedProduct?.stock} units</p>
                       </div>
                       <div>
                         <p className="text-sm font-medium text-muted-foreground">Status</p>
                         <Badge variant={
                           selectedProduct?.status === 'active' ? 'default' :
                           selectedProduct?.status === 'inactive' ? 'secondary' :
                           'destructive'
                         }>
                           {selectedProduct?.status?.replace('_', ' ')}
                         </Badge>
                       </div>
                       <div>
                         <p className="text-sm font-medium text-muted-foreground">Rating</p>
                         <div className="flex items-center gap-1">
                           <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                           <span className="font-medium">{selectedProduct?.rating}</span>
                           <span className="text-sm text-muted-foreground">({selectedProduct?.reviews} reviews)</span>
                         </div>
                       </div>
                     </div>

                     <div>
                       <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                       <p className="text-sm leading-relaxed">
                         {selectedProduct?.description || "No description available."}
                       </p>
                     </div>

                     {selectedProduct?.features && (
                       <div>
                         <p className="text-sm font-medium text-muted-foreground mb-2">Features</p>
                         <div className="flex flex-wrap gap-1">
                           {selectedProduct.features.map((feature: string, index: number) => (
                             <Badge key={index} variant="outline" className="text-xs">
                               {feature}
                             </Badge>
                           ))}
                         </div>
                       </div>
                     )}
                   </CardContent>
                 </Card>

                 {/* Sales Summary */}
                 <Card>
                   <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                       <TrendingUp className="h-5 w-5" />
                       Sales Summary
                     </CardTitle>
                   </CardHeader>
                   <CardContent>
                     <div className="grid grid-cols-3 gap-4">
                       <div className="text-center">
                         <p className="text-2xl font-bold text-blue-600">{selectedProduct?.sold || 0}</p>
                         <p className="text-sm text-muted-foreground">Total Sold</p>
                       </div>
                       <div className="text-center">
                         <p className="text-2xl font-bold text-green-600">{selectedProduct?.views || 0}</p>
                         <p className="text-sm text-muted-foreground">Total Views</p>
                       </div>
                       <div className="text-center">
                         <p className="text-2xl font-bold text-purple-600">{selectedProduct?.reviews || 0}</p>
                         <p className="text-sm text-muted-foreground">Total Reviews</p>
                       </div>
                     </div>
                   </CardContent>
                 </Card>

                 {/* Action Buttons */}
                 <div className="flex gap-2">
                   <Button variant="outline" className="flex-1">
                     <Copy className="h-4 w-4 mr-2" />
                     Duplicate Product
                   </Button>
                   <Button variant="outline" className="flex-1">
                     <Share className="h-4 w-4 mr-2" />
                     Share Product
                   </Button>
                 </div>
               </div>
             )}
           </div>
         </DialogContent>
       </Dialog>

       {/* Buy Product Dialog */}
       <Dialog open={showBuyProductDialog} onOpenChange={setShowBuyProductDialog}>
         <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
           <DialogHeader>
             <DialogTitle className="flex items-center gap-2">
               <Package className="h-5 w-5" />
               Buy Product
             </DialogTitle>
             <DialogDescription>
               {selectedProductForBuy?.name} • {selectedProductForBuy?.seller}
             </DialogDescription>
           </DialogHeader>

           <div className="space-y-6">
             {/* Product Summary */}
             <Card>
               <CardHeader>
                 <CardTitle className="text-lg">Product Details</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="flex items-center gap-4">
                   <img
                     src={selectedProductForBuy?.image}
                     alt={selectedProductForBuy?.name}
                     className="w-16 h-16 object-cover rounded-lg"
                   />
                   <div className="flex-1">
                     <h3 className="font-semibold">{selectedProductForBuy?.name}</h3>
                     <p className="text-sm text-muted-foreground">{selectedProductForBuy?.seller}</p>
                     <div className="flex items-center gap-4 mt-2">
                       <span className="font-medium text-primary">₹{selectedProductForBuy?.price}</span>
                       <span className="text-sm text-muted-foreground">Qty: {buyQuantity}</span>
                     </div>
                   </div>
                 </div>
               </CardContent>
             </Card>

             {/* Quantity Selection */}
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Package className="h-5 w-5" />
                   Quantity Selection
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="space-y-4">
                   <div>
                     <Label htmlFor="quantity">Quantity</Label>
                     <div className="flex items-center gap-4 mt-2">
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => setBuyQuantity(Math.max(1, buyQuantity - 1))}
                         disabled={buyQuantity <= 1}
                       >
                         -
                       </Button>
                       <Input
                         id="quantity"
                         type="number"
                         value={buyQuantity}
                         onChange={(e) => setBuyQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                         className="w-20 text-center"
                         min="1"
                       />
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => setBuyQuantity(buyQuantity + 1)}
                       >
                         +
                       </Button>
                     </div>
                   </div>
                   
                   <div className="text-sm text-muted-foreground">
                     <p>• Minimum order quantity: 1</p>
                     <p>• Bulk discounts available for orders above 10 units</p>
                     <p>• Free shipping on orders above ₹1,000</p>
                   </div>
                 </div>
               </CardContent>
             </Card>

             {/* Price Breakdown */}
             <Card>
               <CardHeader>
                 <CardTitle>Price Details</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="space-y-2">
                   <div className="flex justify-between">
                     <span>Product Price (₹{selectedProductForBuy?.price} × {buyQuantity})</span>
                     <span>₹{(selectedProductForBuy?.price || 0) * buyQuantity}</span>
                   </div>
                   <div className="flex justify-between">
                     <span>Delivery Charge</span>
                     <span>{(selectedProductForBuy?.price || 0) * buyQuantity > 1000 ? 'Free' : '₹50'}</span>
                   </div>
                   <Separator />
                   <div className="flex justify-between font-semibold text-lg">
                     <span>Total Amount</span>
                     <span>₹{((selectedProductForBuy?.price || 0) * buyQuantity) + ((selectedProductForBuy?.price || 0) * buyQuantity > 1000 ? 0 : 50)}</span>
                   </div>
                 </div>
               </CardContent>
             </Card>

             {/* Action Buttons */}
             <div className="flex gap-3 pt-4">
               <Button
                 variant="outline"
                 onClick={() => setShowBuyProductDialog(false)}
                 className="flex-1"
               >
                 Cancel
               </Button>
               <Button
                 onClick={() => {
                   const newOrder = {
                     id: `ORD-${Date.now()}`,
                     product: {
                       id: selectedProductForBuy?.id,
                       name: selectedProductForBuy?.name,
                       image: selectedProductForBuy?.image,
                       price: selectedProductForBuy?.price,
                       originalPrice: selectedProductForBuy?.originalPrice,
                       seller: selectedProductForBuy?.seller || "Unknown Seller",
                       sellerId: selectedProductForBuy?.sellerId || "seller-unknown"
                     },
                     quantity: buyQuantity,
                     orderDate: new Date().toISOString(),
                     status: "Processing",
                     totalAmount: ((selectedProductForBuy?.price || 0) * buyQuantity) + ((selectedProductForBuy?.price || 0) * buyQuantity > 1000 ? 0 : 50),
                     deliveryCharges: (selectedProductForBuy?.price || 0) * buyQuantity > 1000 ? 0 : 50,
                     buyerId: "buyer-001",
                     tracking: [
                       { step: "Order Placed", status: "completed", time: new Date().toISOString() },
                       { step: "Confirmed", status: "pending", time: null },
                       { step: "Shipped", status: "pending", time: null },
                       { step: "Out for Delivery", status: "pending", time: null },
                       { step: "Delivered", status: "pending", time: null }
                     ],
                     rating: null,
                     review: null
                   };
                   
                   setMyOrders(prev => [newOrder, ...prev]);
                   setShowBuyProductDialog(false);
                   setBuyQuantity(1);
                   toast({
                     title: "Order Placed Successfully!",
                     description: `Your order for ${selectedProductForBuy?.name} has been placed.`,
                   });
                 }}
                 className="flex-1"
               >
                 Place Order
               </Button>
             </div>
           </div>
         </DialogContent>
       </Dialog>

       {/* Product Details Dialog for Buy Products */}
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
                 onClick={() => {
                   setShowProductDetailsDialog(false);
                   handleBuyNow(selectedProductForView);
                 }}
                 className="flex-1"
                 disabled={!selectedProductForView?.inStock}
               >
                 <Package className="h-4 w-4 mr-2" />
                 Buy Now
               </Button>
               <Button variant="outline" className="flex-1">
                 <MessageCircle className="h-4 w-4 mr-2" />
                 Contact Seller
               </Button>
             </div>
           </div>
         </DialogContent>
       </Dialog>

       {/* Opportunity Form Dialog */}
       <Dialog open={showOpportunityForm} onOpenChange={setShowOpportunityForm}>
         <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
           <DialogHeader>
             <DialogTitle>
               Post New {selectedOpportunityType === 'job' ? 'Job' : 'Internship'}
             </DialogTitle>
             <DialogDescription>
               Create a new {selectedOpportunityType} posting to attract candidates.
             </DialogDescription>
           </DialogHeader>
           
           <div className="py-4">
             <OpportunityForm 
               opportunityType={selectedOpportunityType}
               onSuccess={() => {
                 setShowOpportunityForm(false);
                 // Refresh dashboard data
                 window.location.reload();
               }}
             />
           </div>
         </DialogContent>
       </Dialog>
     </div>
   );
 };

 export default OwnerDashboard;