import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import Messaging from "@/components/Messaging";
import { 
  LayoutDashboard,
  Package,
  Briefcase,
  GraduationCap,
  CreditCard,
  Users,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  UserCheck,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  MessageSquare,
  Phone,
  Mail,
  Building,
  Calendar,
  User,
  FileText
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [adminEmail, setAdminEmail] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const [selectedJobForMessaging, setSelectedJobForMessaging] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  useEffect(() => {
    // Check if admin is logged in
    const isLoggedIn = localStorage.getItem("adminLoggedIn");
    const email = localStorage.getItem("adminEmail");
    
    console.log("AdminDashboard: Checking authentication...");
    console.log("isLoggedIn:", isLoggedIn);
    console.log("email:", email);
    
    if (!isLoggedIn || !email) {
      console.log("AdminDashboard: Not authenticated, redirecting to login");
      navigate("/admin-login");
      return;
    }
    
    console.log("AdminDashboard: Authentication successful, setting email");
    setAdminEmail(email);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminEmail");
    toast({
      title: t("loggedOut"),
      description: t("loggedOutSuccessfully"),
    });
    navigate("/");
  };

  const handleViewItem = (item: any, type: string) => {
    setSelectedItem({ ...item, type });
    setIsViewDialogOpen(true);
  };

  const handleMessageJob = (job: any) => {
    setSelectedJobForMessaging(job);
    setIsMessagingOpen(true);
  };

  const handleEditItem = (item: any, type: string) => {
    setSelectedItem({ ...item, type });
    setIsEditDialogOpen(true);
  };

  const handleDeleteItem = (item: any, type: string) => {
    setItemToDelete({ ...item, type });
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      // Here you would typically make an API call to delete the item
      toast({
        title: "Item Deleted",
        description: `${itemToDelete.type} has been deleted successfully.`,
      });
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  // Mock data for dashboard
  const productStats = [
    { title: t("totalProducts"), value: "2", icon: Package, color: "text-blue-600" },
    { title: t("totalSold"), value: "40", icon: ShoppingCart, color: "text-green-600" },
    { title: t("paidProducts"), value: "1", icon: CheckCircle, color: "text-purple-600" },
    { title: t("unpaidProducts"), value: "1", icon: AlertCircle, color: "text-orange-600" },
  ];

  const jobStats = [
    { title: t("totalJobInternshipJoins"), value: "24", icon: Users, color: "text-blue-600" },
    { title: t("paidJoins"), value: "20", icon: CheckCircle, color: "text-green-600" },
    { title: t("unpaidJoins"), value: "4", icon: AlertCircle, color: "text-orange-600" },
  ];

  const jobData = [
    { 
      title: "Sales Associate", 
      type: "Job", 
      totalJoined: 12, 
      paid: 10, 
      unpaid: 2 
    },
    { 
      title: "Web Developer Intern", 
      type: "Internship", 
      totalJoined: 7, 
      paid: 7, 
      unpaid: 0 
    },
    { 
      title: "Marketing Internship", 
      type: "Internship", 
      totalJoined: 5, 
      paid: 3, 
      unpaid: 2 
    },
  ];

  // Mock owner data with their posted items
  const ownerData = [
    {
      id: 1,
      name: "Priya Patel",
      email: "priya@email.com",
      dateJoined: "2024-05-02",
      status: "Active",
      phone: "+91 98765 43210",
      company: "TechMart Electronics",
      postedItems: {
        products: [
          { id: 1, name: "Wireless Earbuds", type: "Electronics", price: "₹2999", status: "active", sold: 32 },
          { id: 2, name: "Smart Fitness Watch", type: "Electronics", price: "₹3999", status: "active", sold: 12 }
        ],
        jobs: [
          { id: 1, title: "Sales Associate", company: "TechMart Electronics", type: "Job", totalJoined: 12, paid: 10, unpaid: 2 },
          { id: 2, title: "Customer Service Rep", company: "TechMart Electronics", type: "Job", totalJoined: 8, paid: 6, unpaid: 2 }
        ],
        internships: [
          { id: 1, title: "Marketing Intern", company: "TechMart Electronics", type: "Internship", totalJoined: 5, paid: 3, unpaid: 2 }
        ]
      }
    },
    {
      id: 2,
      name: "Suresh Singh",
      email: "suresh@email.com",
      dateJoined: "2024-05-04",
      status: "Blocked",
      phone: "+91 98765 43211",
      company: "QuickBites Restaurant",
      postedItems: {
        products: [
          { id: 3, name: "Desk Lamp", type: "Stationery", price: "₹1299", status: "pending", sold: 8 }
        ],
        jobs: [
          { id: 3, title: "Food Delivery Executive", company: "QuickBites Restaurant", type: "Job", totalJoined: 8, paid: 6, unpaid: 2 }
        ],
        internships: []
      }
    },
    {
      id: 3,
      name: "Amit Kumar",
      email: "amit@email.com",
      dateJoined: "2024-05-01",
      status: "Active",
      phone: "+91 98765 43212",
      company: "CodeCrafters Solutions",
      postedItems: {
        products: [
          { id: 4, name: "Laptop Backpack", type: "Accessories", price: "₹1999", status: "active", sold: 15 }
        ],
        jobs: [
          { id: 4, title: "Web Developer Intern", company: "CodeCrafters Solutions", type: "Internship", totalJoined: 14, paid: 14, unpaid: 0 }
        ],
        internships: [
          { id: 2, title: "Software Development Intern", company: "CodeCrafters Solutions", type: "Internship", totalJoined: 10, paid: 8, unpaid: 2 }
        ]
      }
    },
    {
      id: 4,
      name: "Neha Sharma",
      email: "neha@email.com",
      dateJoined: "2024-05-03",
      status: "Active",
      phone: "+91 98765 43213",
      company: "GrowthHackers Agency",
      postedItems: {
        products: [],
        jobs: [
          { id: 5, title: "Digital Marketing Specialist", company: "GrowthHackers Agency", type: "Job", totalJoined: 15, paid: 12, unpaid: 3 }
        ],
        internships: [
          { id: 3, title: "Digital Marketing Intern", company: "GrowthHackers Agency", type: "Internship", totalJoined: 12, paid: 10, unpaid: 2 }
        ]
      }
    },
    {
      id: 5,
      name: "Rajesh Verma",
      email: "rajesh@email.com",
      dateJoined: "2024-05-05",
      status: "Blocked",
      phone: "+91 98765 43214",
      company: "Creative Studio Hub",
      postedItems: {
        products: [],
        jobs: [],
        internships: [
          { id: 4, title: "Graphic Design Intern", company: "Creative Studio Hub", type: "Internship", totalJoined: 8, paid: 6, unpaid: 2 }
        ]
      }
    }
  ];

  const renderViewDialog = () => (
    <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {selectedItem?.type === 'product' ? 'Product Details' : 
             selectedItem?.type === 'job' ? 'Job Details' : 
             selectedItem?.type === 'internship' ? 'Internship Details' : 'Item Details'}
          </DialogTitle>
        </DialogHeader>
        
        {selectedItem && (
          <div className="space-y-6">
            {selectedItem.type === 'product' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Product Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">{selectedItem.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <Badge variant="outline">{selectedItem.type}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-semibold text-primary">{selectedItem.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Quantity:</span>
                        <span>{selectedItem.qty}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sold:</span>
                        <span className="text-green-600 font-semibold">{selectedItem.sold}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Status Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment:</span>
                        <Badge variant={selectedItem.payment === 'Paid' ? 'default' : 'secondary'}>
                          {selectedItem.payment}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={selectedItem.status === 'active' ? 'default' : 'secondary'}>
                          {selectedItem.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Seller:</span>
                        <span>{selectedItem.seller}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span>{selectedItem.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-muted-foreground">{selectedItem.description}</p>
                </div>
              </>
            )}

            {(selectedItem.type === 'job' || selectedItem.type === 'internship') && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Position Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Title:</span>
                        <span className="font-medium">{selectedItem.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Company:</span>
                        <span>{selectedItem.company}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <Badge variant={selectedItem.type === 'Job' ? 'default' : 'secondary'}>
                          {selectedItem.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Application Statistics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Joined:</span>
                        <span className="font-semibold">{selectedItem.totalJoined}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Paid:</span>
                        <span className="text-green-600 font-semibold">{selectedItem.paid}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Unpaid:</span>
                        <span className="text-orange-600 font-semibold">{selectedItem.unpaid}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleMessageJob(selectedItem)}
                    className="flex-1"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message Applicants
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleEditItem(selectedItem, selectedItem.type)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </>
            )}

            {selectedItem.type === 'owner' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Owner Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">{selectedItem.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span>{selectedItem.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span>{selectedItem.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Company:</span>
                        <span>{selectedItem.company}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Account Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date Joined:</span>
                        <span>{selectedItem.dateJoined}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={selectedItem.status === 'Active' ? 'default' : 'destructive'}>
                          {selectedItem.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Posted Items */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Posted Items</h4>
                  
                  {/* Products */}
                  {selectedItem.postedItems?.products?.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2 text-primary">Products ({selectedItem.postedItems.products.length})</h5>
                      <div className="space-y-2">
                        {selectedItem.postedItems.products.map((product: any) => (
                          <div key={product.id} className="flex justify-between items-center p-2 bg-muted rounded">
                            <div>
                              <span className="font-medium">{product.name}</span>
                              <Badge variant="outline" className="ml-2">{product.type}</Badge>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-primary">{product.price}</div>
                              <div className="text-sm text-muted-foreground">Sold: {product.sold}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Jobs */}
                  {selectedItem.postedItems?.jobs?.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2 text-primary">Jobs ({selectedItem.postedItems.jobs.length})</h5>
                      <div className="space-y-2">
                        {selectedItem.postedItems.jobs.map((job: any) => (
                          <div key={job.id} className="flex justify-between items-center p-2 bg-muted rounded">
                            <div>
                              <span className="font-medium">{job.title}</span>
                              <Badge variant={job.type === 'Job' ? 'default' : 'secondary'} className="ml-2">
                                {job.type}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">Joined: {job.totalJoined}</div>
                              <div className="text-sm text-green-600">Paid: {job.paid}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Internships */}
                  {selectedItem.postedItems?.internships?.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2 text-primary">Internships ({selectedItem.postedItems.internships.length})</h5>
                      <div className="space-y-2">
                        {selectedItem.postedItems.internships.map((internship: any) => (
                          <div key={internship.id} className="flex justify-between items-center p-2 bg-muted rounded">
                            <div>
                              <span className="font-medium">{internship.title}</span>
                              <Badge variant="secondary" className="ml-2">
                                {internship.type}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">Joined: {internship.totalJoined}</div>
                              <div className="text-sm text-green-600">Paid: {internship.paid}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(!selectedItem.postedItems?.products?.length && 
                    !selectedItem.postedItems?.jobs?.length && 
                    !selectedItem.postedItems?.internships?.length) && (
                    <div className="text-center py-4 text-muted-foreground">
                      No items posted yet
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Product Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {productStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Job Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {jobStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Job/Internship Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("jobInternshipDetails")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("jobInternship")}</TableHead>
                <TableHead>{t("type")}</TableHead>
                <TableHead>{t("totalJoined")}</TableHead>
                <TableHead>{t("paid")}</TableHead>
                <TableHead>{t("unpaid")}</TableHead>
                <TableHead>{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobData.map((job, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell>
                    <Badge variant={job.type === "Job" ? "default" : "secondary"}>
                      {job.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{job.totalJoined}</TableCell>
                  <TableCell className="text-green-600 font-semibold">{job.paid}</TableCell>
                  <TableCell className="text-orange-600 font-semibold">{job.unpaid}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleViewItem(job, job.type.toLowerCase())}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleMessageJob(job)}
                      >
                        <MessageSquare className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("manageProducts")}</h2>
        <Button className="bg-gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          {t("addProduct")}
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("image")}</TableHead>
                <TableHead>{t("name")}</TableHead>
                <TableHead>{t("type")}</TableHead>
                <TableHead>{t("description")}</TableHead>
                <TableHead>{t("price")}</TableHead>
                <TableHead>{t("qty")}</TableHead>
                <TableHead>{t("sold")}</TableHead>
                <TableHead>{t("payment")}</TableHead>
                <TableHead>{t("seller")}</TableHead>
                <TableHead>{t("date")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead>{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                {
                  id: 1,
                  name: "Wireless Earbuds",
                  type: "Electronics",
                  description: "High quality earbuds.",
                  price: "₹2999",
                  qty: 50,
                  sold: 32,
                  payment: "Paid",
                  seller: "owner1",
                  date: "2024-06-01",
                  status: "active"
                },
                {
                  id: 2,
                  name: "Desk Lamp",
                  type: "Stationery",
                  description: "LED desk lamp.",
                  price: "₹1299",
                  qty: 20,
                  sold: 8,
                  payment: "Unpaid",
                  seller: "owner2",
                  date: "2024-06-02",
                  status: "pending"
                },
                {
                  id: 3,
                  name: "Laptop Backpack",
                  type: "Accessories",
                  description: "Water-resistant laptop backpack.",
                  price: "₹1999",
                  qty: 30,
                  sold: 15,
                  payment: "Paid",
                  seller: "owner3",
                  date: "2024-06-03",
                  status: "active"
                },
                {
                  id: 4,
                  name: "Smart Fitness Watch",
                  type: "Electronics",
                  description: "Track your fitness goals.",
                  price: "₹3999",
                  qty: 25,
                  sold: 12,
                  payment: "Paid",
                  seller: "owner1",
                  date: "2024-06-04",
                  status: "active"
                }
              ].map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                      <Package className="h-5 w-5 text-gray-500" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.type}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{product.description}</TableCell>
                  <TableCell className="font-semibold text-primary">{product.price}</TableCell>
                  <TableCell>{product.qty}</TableCell>
                  <TableCell className="text-green-600 font-semibold">{product.sold}</TableCell>
                  <TableCell>
                    <Badge variant={product.payment === 'Paid' ? 'default' : 'secondary'}>
                      {product.payment}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{product.seller}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{product.date}</TableCell>
                  <TableCell>
                    <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        title={t("edit")}
                        onClick={() => handleEditItem(product, 'product')}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        title={t("view")}
                        onClick={() => handleViewItem(product, 'product')}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        title={t("delete")}
                        onClick={() => handleDeleteItem(product, 'product')}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderJobs = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("manageJobs")}</h2>
        <Button className="bg-gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          {t("addJob")}
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("title")}</TableHead>
                <TableHead>{t("company")}</TableHead>
                <TableHead>{t("type")}</TableHead>
                <TableHead>{t("totalJoined")}</TableHead>
                <TableHead>{t("paid")}</TableHead>
                <TableHead>{t("unpaid")}</TableHead>
                <TableHead>{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                {
                  id: 1,
                  title: "Sales Associate",
                  company: "TechMart Electronics",
                  type: "Job",
                  totalJoined: 12,
                  paid: 10,
                  unpaid: 2
                },
                {
                  id: 2,
                  title: "Food Delivery Executive",
                  company: "QuickBites Restaurant",
                  type: "Job",
                  totalJoined: 8,
                  paid: 6,
                  unpaid: 2
                },
                {
                  id: 3,
                  title: "Tutor Assistant",
                  company: "BrightMinds Coaching",
                  type: "Job",
                  totalJoined: 15,
                  paid: 12,
                  unpaid: 3
                },
                {
                  id: 4,
                  title: "Marketing Intern",
                  company: "GrowthHackers Agency",
                  type: "Internship",
                  totalJoined: 20,
                  paid: 18,
                  unpaid: 2
                },
                {
                  id: 5,
                  title: "Web Developer Intern",
                  company: "CodeCrafters Solutions",
                  type: "Internship",
                  totalJoined: 14,
                  paid: 14,
                  unpaid: 0
                }
              ].map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell>{job.company}</TableCell>
                  <TableCell>
                    <Badge variant={job.type === 'Job' ? 'default' : 'secondary'}>
                      {job.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{job.totalJoined}</TableCell>
                  <TableCell className="text-green-600 font-semibold">{job.paid}</TableCell>
                  <TableCell className="text-orange-600 font-semibold">{job.unpaid}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditItem(job, 'job')}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewItem(job, 'job')}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleMessageJob(job)}
                      >
                        <MessageSquare className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteItem(job, 'job')}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderInternships = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("manageInternships")}</h2>
        <Button className="bg-gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          {t("addInternship")}
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("title")}</TableHead>
                <TableHead>{t("company")}</TableHead>
                <TableHead>{t("type")}</TableHead>
                <TableHead>{t("totalJoined")}</TableHead>
                <TableHead>{t("paid")}</TableHead>
                <TableHead>{t("unpaid")}</TableHead>
                <TableHead>{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                {
                  id: 1,
                  title: "Web Developer Intern",
                  company: "CodeCrafters Solutions",
                  type: "Internship",
                  totalJoined: 7,
                  paid: 7,
                  unpaid: 0
                },
                {
                  id: 2,
                  title: "Marketing Internship",
                  company: "GrowthHackers Agency",
                  type: "Internship",
                  totalJoined: 5,
                  paid: 3,
                  unpaid: 2
                },
                {
                  id: 3,
                  title: "Digital Marketing Intern",
                  company: "GrowthHackers Agency",
                  type: "Internship",
                  totalJoined: 12,
                  paid: 10,
                  unpaid: 2
                },
                {
                  id: 4,
                  title: "Graphic Design Intern",
                  company: "Creative Studio Hub",
                  type: "Internship",
                  totalJoined: 8,
                  paid: 6,
                  unpaid: 2
                },
                {
                  id: 5,
                  title: "Data Science Intern",
                  company: "Analytics Pro",
                  type: "Internship",
                  totalJoined: 15,
                  paid: 12,
                  unpaid: 3
                }
              ].map((internship) => (
                <TableRow key={internship.id}>
                  <TableCell className="font-medium">{internship.title}</TableCell>
                  <TableCell>{internship.company}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {internship.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{internship.totalJoined}</TableCell>
                  <TableCell className="text-green-600 font-semibold">{internship.paid}</TableCell>
                  <TableCell className="text-orange-600 font-semibold">{internship.unpaid}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditItem(internship, 'internship')}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewItem(internship, 'internship')}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleMessageJob(internship)}
                      >
                        <MessageSquare className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteItem(internship, 'internship')}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("paymentDetails")}</h2>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("totalProductPayments")}</p>
                <p className="text-2xl font-bold text-primary">₹95968</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <ShoppingCart className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("totalJobPayments")}</p>
                <p className="text-2xl font-bold text-primary">10</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <Briefcase className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("totalInternshipPayments")}</p>
                <p className="text-2xl font-bold text-primary">10</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <GraduationCap className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Payments Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("type")}</TableHead>
                <TableHead>{t("title")}/{t("name")}</TableHead>
                <TableHead>{t("company")}</TableHead>
                <TableHead>{t("amount")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead>{t("date")}</TableHead>
                <TableHead>{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                {
                  id: 1,
                  type: "Product",
                  title: "Wireless Earbuds",
                  company: "owner1",
                  amount: "₹2999",
                  status: "Paid",
                  date: "2024-06-01"
                },
                {
                  id: 2,
                  type: "Product",
                  title: "Desk Lamp",
                  company: "owner2",
                  amount: "₹1299",
                  status: "Unpaid",
                  date: "2024-06-02"
                },
                {
                  id: 3,
                  type: "Job",
                  title: "Sales Associate",
                  company: "TechMart Electronics",
                  amount: "10",
                  status: "Paid",
                  date: "-"
                },
                {
                  id: 4,
                  type: "Internship",
                  title: "Web Developer Intern",
                  company: "CodeCrafters Solutions",
                  amount: "7",
                  status: "Paid",
                  date: "-"
                },
                {
                  id: 5,
                  type: "Internship",
                  title: "Marketing Internship",
                  company: "GrowthHackers Agency",
                  amount: "3",
                  status: "Paid",
                  date: "-"
                },
                {
                  id: 6,
                  type: "Product",
                  title: "Laptop Backpack",
                  company: "owner3",
                  amount: "₹1999",
                  status: "Paid",
                  date: "2024-06-03"
                },
                {
                  id: 7,
                  type: "Job",
                  title: "Food Delivery Executive",
                  company: "QuickBites Restaurant",
                  amount: "8",
                  status: "Paid",
                  date: "-"
                }
              ].map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <Badge variant={
                      payment.type === 'Product' ? 'default' : 
                      payment.type === 'Job' ? 'secondary' : 'outline'
                    }>
                      {payment.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{payment.title}</TableCell>
                  <TableCell>{payment.company}</TableCell>
                  <TableCell className="font-semibold text-primary">{payment.amount}</TableCell>
                  <TableCell>
                    <Badge variant={payment.status === 'Paid' ? 'default' : 'secondary'}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{payment.date}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewItem(payment, 'payment')}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditItem(payment, 'payment')}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderOwners = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("businessOwners")}</h2>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("name")}</TableHead>
                <TableHead>{t("email")}</TableHead>
                <TableHead>{t("company")}</TableHead>
                <TableHead>{t("dateJoined")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead>{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ownerData.map((owner) => (
                <TableRow key={owner.id}>
                  <TableCell className="font-medium">{owner.name}</TableCell>
                  <TableCell>{owner.email}</TableCell>
                  <TableCell>{owner.company}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{owner.dateJoined}</TableCell>
                  <TableCell>
                    <Badge variant={owner.status === 'Active' ? 'default' : 'destructive'}>
                      {owner.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewItem(owner, 'owner')}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        {t("viewProfile")}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditItem(owner, 'owner')}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        {t("edit")}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteItem(owner, 'owner')}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        {t("delete")}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Dark Sidebar */}
      <div className="w-64 bg-gray-900 text-white">
        <div className="p-6">
          <h1 className="text-2xl font-bold gradient-text">JBS Admin</h1>
        </div>
        
        <nav className="px-4 space-y-2">
          <Button 
            variant={activeTab === "dashboard" ? "default" : "ghost"}
            className={`w-full justify-start transition-all duration-200 ${
              activeTab === "dashboard" 
                ? "bg-blue-600 text-white shadow-md" 
                : "text-gray-300 hover:text-white hover:bg-gray-800"
            }`}
            onClick={() => setActiveTab("dashboard")}
          >
            <LayoutDashboard className="h-4 w-4 mr-3" />
            {t("dashboard")}
          </Button>
          
          <Button 
            variant={activeTab === "products" ? "default" : "ghost"}
            className={`w-full justify-start transition-all duration-200 ${
              activeTab === "products" 
                ? "bg-blue-600 text-white shadow-md" 
                : "text-gray-300 hover:text-white hover:bg-gray-800"
            }`}
            onClick={() => setActiveTab("products")}
          >
            <Package className="h-4 w-4 mr-3" />
            {t("products")}
          </Button>
          
          <Button 
            variant={activeTab === "jobs" ? "default" : "ghost"}
            className={`w-full justify-start transition-all duration-200 ${
              activeTab === "jobs" 
                ? "bg-blue-600 text-white shadow-md" 
                : "text-gray-300 hover:text-white hover:bg-gray-800"
            }`}
            onClick={() => setActiveTab("jobs")}
          >
            <Briefcase className="h-4 w-4 mr-3" />
            {t("jobs")}
          </Button>
          
          <Button 
            variant={activeTab === "internships" ? "default" : "ghost"}
            className={`w-full justify-start transition-all duration-200 ${
              activeTab === "internships" 
                ? "bg-blue-600 text-white shadow-md" 
                : "text-gray-300 hover:text-white hover:bg-gray-800"
            }`}
            onClick={() => setActiveTab("internships")}
          >
            <GraduationCap className="h-4 w-4 mr-3" />
            {t("internships")}
          </Button>
          
          <Button 
            variant={activeTab === "payments" ? "default" : "ghost"}
            className={`w-full justify-start transition-all duration-200 ${
              activeTab === "payments" 
                ? "bg-blue-600 text-white shadow-md" 
                : "text-gray-300 hover:text-white hover:bg-gray-800"
            }`}
            onClick={() => setActiveTab("payments")}
          >
            <CreditCard className="h-4 w-4 mr-3" />
            {t("payments")}
          </Button>
          
          <Button 
            variant={activeTab === "owners" ? "default" : "ghost"}
            className={`w-full justify-start transition-all duration-200 ${
              activeTab === "owners" 
                ? "bg-blue-600 text-white shadow-md" 
                : "text-gray-300 hover:text-white hover:bg-gray-800"
            }`}
            onClick={() => setActiveTab("owners")}
          >
            <Users className="h-4 w-4 mr-3" />
            {t("owners")}
          </Button>
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4">
          <Button 
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-3" />
            {t("logout")}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">
            {activeTab === "dashboard" && t("dashboard")}
            {activeTab === "products" && t("products")}
            {activeTab === "jobs" && t("jobs")}
            {activeTab === "internships" && t("internships")}
            {activeTab === "payments" && t("payments")}
            {activeTab === "owners" && t("owners")}
          </h2>
          <p className="text-muted-foreground">
            {t("welcomeBack")}, {adminEmail}
          </p>
        </div>

        {activeTab === "dashboard" && renderDashboard()}
        {activeTab === "products" && renderProducts()}
        {activeTab === "jobs" && renderJobs()}
        {activeTab === "internships" && renderInternships()}
        {activeTab === "payments" && renderPayments()}
        {activeTab === "owners" && renderOwners()}
      </div>

      {/* View Dialog */}
      {renderViewDialog()}

      {/* Messaging Dialog */}
      <Messaging 
        isOpen={isMessagingOpen} 
        onClose={() => setIsMessagingOpen(false)}
        selectedJob={selectedJobForMessaging}
        isAdmin={true}
      />

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit {selectedItem?.type}
            </DialogTitle>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              <div className="text-center py-8">
                <Edit className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Edit Functionality</h3>
                <p className="text-muted-foreground">
                  This would open an edit form for the selected {selectedItem.type}.
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setIsEditDialogOpen(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    toast({
                      title: "Item Updated",
                      description: `${selectedItem.type} has been updated successfully.`,
                    });
                    setIsEditDialogOpen(false);
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Confirm Delete
            </DialogTitle>
          </DialogHeader>
          
          {itemToDelete && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <Trash2 className="w-16 h-16 mx-auto text-destructive mb-4" />
                <h3 className="text-lg font-semibold mb-2">Delete {itemToDelete.type}</h3>
                <p className="text-muted-foreground">
                  Are you sure you want to delete this {itemToDelete.type.toLowerCase()}? 
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={confirmDelete}
                  className="flex-1"
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard; 