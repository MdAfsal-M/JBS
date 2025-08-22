import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiCall } from "@/services/api";
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Calendar,
  MapPin,
  GraduationCap,
  DollarSign,
  Clock,
  FileText,
  Send,
  Download,
  Filter,
  Search,
  BarChart3,
  PieChart,
  Activity,
  ArrowLeft
} from 'lucide-react';

interface Internship {
  _id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  category: string;
  duration: string;
  stipend: string;
  stipendType: 'paid' | 'unpaid' | 'performance-based';
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  status: 'active' | 'inactive' | 'draft' | 'expired';
  views: number;
  applicants: number;
  isRemote: boolean;
  isUrgent: boolean;
  startDate: string;
  endDate: string;
  applicationDeadline: string;
  maxApplicants: number;
  tags: string[];
  contactInfo: {
    email: string;
    phone: string;
    website: string;
  };
  applicationInstructions: string;
  createdAt: string;
  updatedAt: string;
}

interface InternshipApplication {
  _id: string;
  internship: string;
  applicant: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
    email: string;
  };
  status: 'pending' | 'reviewed' | 'shortlisted' | 'interviewed' | 'accepted' | 'rejected' | 'withdrawn';
  appliedAt: string;
  coverLetter?: string;
  resume?: string;
  portfolio?: string;
  notes?: string;
}

const InternshipManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<InternshipApplication | null>(null);
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [messageText, setMessageText] = useState("");

  // Form states for new internship
  const [newInternship, setNewInternship] = useState({
    title: "",
    description: "",
    company: "",
    location: "",
    category: "",
    duration: "",
    stipend: "",
    stipendType: "paid" as const,
    requirements: [] as string[],
    responsibilities: [] as string[],
    benefits: [] as string[],
    isRemote: false,
    isUrgent: false,
    startDate: "",
    endDate: "",
    applicationDeadline: "",
    maxApplicants: 1,
    tags: [] as string[],
    contactInfo: {
      email: "",
      phone: "",
      website: ""
    },
    applicationInstructions: ""
  });

  useEffect(() => {
    if (user) {
      loadInternships();
      loadApplications();
    }
  }, [user]);

  const loadInternships = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setInternships([]);
        return;
      }
      
      const response = await apiCall('GET', '/internships', undefined, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response && response.data) {
        setInternships(response.data);
      } else if (response && Array.isArray(response)) {
        setInternships(response);
      } else {
        setInternships([]);
      }
    } catch (error) {
      console.error('Error loading internships:', error);
      toast({
        title: "Error",
        description: "Failed to load internships",
        variant: "destructive"
      });
      setInternships([]);
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      // For now, set empty applications
      setApplications([]);
    } catch (error) {
      console.error('Error loading applications:', error);
      setApplications([]);
    }
  };

  const handlePostInternship = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!newInternship.title || !newInternship.description || !newInternship.company || 
          !newInternship.location || !newInternship.category || !newInternship.duration || 
          !newInternship.stipend || !newInternship.startDate || !newInternship.endDate || 
          !newInternship.applicationDeadline) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      const internshipData = {
        ...newInternship,
        requirements: newInternship.requirements.filter(r => r.trim()),
        responsibilities: newInternship.responsibilities.filter(r => r.trim()),
        benefits: newInternship.benefits.filter(b => b.trim()),
        tags: newInternship.tags.filter(t => t.trim())
      };

      await apiCall('POST', '/internships', internshipData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      toast({
        title: "Success",
        description: "Internship posted successfully!"
      });
      
      setShowPostDialog(false);
      resetForm();
      loadInternships();
    } catch (error) {
      console.error('Error posting internship:', error);
      toast({
        title: "Error",
        description: "Failed to post internship",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewInternship({
      title: "",
      description: "",
      company: "",
      location: "",
      category: "",
      duration: "",
      stipend: "",
      stipendType: "paid",
      requirements: [],
      responsibilities: [],
      benefits: [],
      isRemote: false,
      isUrgent: false,
      startDate: "",
      endDate: "",
      applicationDeadline: "",
      maxApplicants: 1,
      tags: [],
      contactInfo: {
        email: "",
        phone: "",
        website: ""
      },
      applicationInstructions: ""
    });
  };

  const getFilteredInternships = () => {
    let filtered = internships;

    if (searchQuery) {
      filtered = filtered.filter(internship =>
        internship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        internship.company.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(internship => internship.status === statusFilter);
    }

    return filtered;
  };

  const getAnalyticsData = () => {
    const totalPosted = internships.length;
    const totalApplications = applications.length;
    const activeInternships = internships.filter(i => i.status === "active").length;
    const shortlisted = applications.filter(app => 
      app.status === "shortlisted" || app.status === "accepted"
    ).length;
    const shortlistedRatio = totalApplications > 0 ? (shortlisted / totalApplications) * 100 : 0;

    return {
      totalPosted,
      totalApplications,
      activeInternships,
      shortlistedRatio
    };
  };

  const analytics = getAnalyticsData();

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Please log in to access this page</h1>
          <p className="text-muted-foreground">You need to be authenticated to manage internships.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Internship Management</h1>
            <p className="text-muted-foreground">Manage your internship postings and applications</p>
          </div>
        </div>
        
        <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Post New Internship
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Post New Internship</DialogTitle>
              <DialogDescription>
                Create a new internship posting to attract talented students
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Internship Title *</Label>
                  <Input
                    value={newInternship.title}
                    onChange={(e) => setNewInternship({...newInternship, title: e.target.value})}
                    placeholder="e.g., Frontend Developer Intern"
                  />
                </div>
                <div>
                  <Label>Company Name *</Label>
                  <Input
                    value={newInternship.company}
                    onChange={(e) => setNewInternship({...newInternship, company: e.target.value})}
                    placeholder="Your company name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category *</Label>
                  <Input
                    value={newInternship.category}
                    onChange={(e) => setNewInternship({...newInternship, category: e.target.value})}
                    placeholder="e.g., Technology, Marketing, Finance"
                  />
                </div>
                <div>
                  <Label>Duration *</Label>
                  <Input
                    value={newInternship.duration}
                    onChange={(e) => setNewInternship({...newInternship, duration: e.target.value})}
                    placeholder="e.g., 3 months"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Location *</Label>
                  <Input
                    value={newInternship.location}
                    onChange={(e) => setNewInternship({...newInternship, location: e.target.value})}
                    placeholder="e.g., Remote or City, State"
                  />
                </div>
                <div>
                  <Label>Number of Openings</Label>
                  <Input
                    type="number"
                    value={newInternship.maxApplicants}
                    onChange={(e) => setNewInternship({...newInternship, maxApplicants: parseInt(e.target.value)})}
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={newInternship.startDate}
                    onChange={(e) => setNewInternship({...newInternship, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label>End Date *</Label>
                  <Input
                    type="date"
                    value={newInternship.endDate}
                    onChange={(e) => setNewInternship({...newInternship, endDate: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label>Application Deadline *</Label>
                <Input
                  type="date"
                  value={newInternship.applicationDeadline}
                  onChange={(e) => setNewInternship({...newInternship, applicationDeadline: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Stipend Type</Label>
                  <Select 
                    value={newInternship.stipendType} 
                    onValueChange={(value) => setNewInternship({...newInternship, stipendType: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                      <SelectItem value="performance-based">Performance-based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Stipend Amount *</Label>
                  <Input
                    value={newInternship.stipend}
                    onChange={(e) => setNewInternship({...newInternship, stipend: e.target.value})}
                    placeholder="e.g., ₹15,000/month or Unpaid"
                  />
                </div>
              </div>

              <div>
                <Label>Requirements (comma-separated)</Label>
                <Input
                  value={newInternship.requirements.join(", ")}
                  onChange={(e) => setNewInternship({
                    ...newInternship, 
                    requirements: e.target.value.split(",").map(s => s.trim()).filter(s => s)
                  })}
                  placeholder="e.g., React, JavaScript, HTML, CSS"
                />
              </div>

              <div>
                <Label>Responsibilities (comma-separated)</Label>
                <Input
                  value={newInternship.responsibilities.join(", ")}
                  onChange={(e) => setNewInternship({
                    ...newInternship, 
                    responsibilities: e.target.value.split(",").map(s => s.trim()).filter(s => s)
                  })}
                  placeholder="e.g., Develop features, Code review, Testing"
                />
              </div>

              <div>
                <Label>Benefits (comma-separated)</Label>
                <Input
                  value={newInternship.benefits.join(", ")}
                  onChange={(e) => setNewInternship({
                    ...newInternship, 
                    benefits: e.target.value.split(",").map(s => s.trim()).filter(s => s)
                  })}
                  placeholder="e.g., Flexible hours, Learning opportunities, Certificate"
                />
              </div>

              <div>
                <Label>Tags (comma-separated)</Label>
                <Input
                  value={newInternship.tags.join(", ")}
                  onChange={(e) => setNewInternship({
                    ...newInternship, 
                    tags: e.target.value.split(",").map(s => s.trim()).filter(s => s)
                  })}
                  placeholder="e.g., Frontend, React, Internship"
                />
              </div>

              <div>
                <Label>Description *</Label>
                <Textarea
                  value={newInternship.description}
                  onChange={(e) => setNewInternship({...newInternship, description: e.target.value})}
                  placeholder="Detailed description of the internship..."
                  rows={4}
                />
              </div>

              <div>
                <Label>Application Instructions</Label>
                <Textarea
                  value={newInternship.applicationInstructions}
                  onChange={(e) => setNewInternship({...newInternship, applicationInstructions: e.target.value})}
                  placeholder="Instructions for applicants..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Contact Phone</Label>
                  <Input
                    value={newInternship.contactInfo.phone}
                    onChange={(e) => setNewInternship({
                      ...newInternship, 
                      contactInfo: {...newInternship.contactInfo, phone: e.target.value}
                    })}
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <Label>Contact Email</Label>
                  <Input
                    value={newInternship.contactInfo.email}
                    onChange={(e) => setNewInternship({
                      ...newInternship, 
                      contactInfo: {...newInternship.contactInfo, email: e.target.value}
                    })}
                    placeholder="Email address"
                  />
                </div>
              </div>

              <div>
                <Label>Website (optional)</Label>
                <Input
                  value={newInternship.contactInfo.website}
                  onChange={(e) => setNewInternship({
                    ...newInternship, 
                    contactInfo: {...newInternship.contactInfo, website: e.target.value}
                  })}
                  placeholder="Company website"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isRemote"
                  checked={newInternship.isRemote}
                  onChange={(e) => setNewInternship({...newInternship, isRemote: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="isRemote">Remote Internship</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isUrgent"
                  checked={newInternship.isUrgent}
                  onChange={(e) => setNewInternship({...newInternship, isUrgent: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="isUrgent">Urgent Hiring</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPostDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handlePostInternship} disabled={loading}>
                {loading ? "Posting..." : "Post Internship"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading internships...</p>
        </div>
      )}

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posted</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalPosted}</div>
            <p className="text-xs text-muted-foreground">
              Internships created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              Applications received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Internships</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeInternships}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shortlisted Ratio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.shortlistedRatio.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Of total applications
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {!loading && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="internships">My Internships</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    {getFilteredInternships().slice(0, 5).map((internship) => (
                      <div key={internship._id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{internship.title}</h4>
                          <p className="text-sm text-muted-foreground">{internship.company}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={internship.status === "active" ? "default" : "secondary"}>
                            {internship.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {internship.applicants} applicants
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Applications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Recent Applications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {applications.slice(0, 5).map((application) => (
                      <div key={application._id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>{application.applicant.profile.firstName.charAt(0)}{application.applicant.profile.lastName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{application.applicant.profile.firstName} {application.applicant.profile.lastName}</h4>
                            <p className="text-sm text-muted-foreground">{application.applicant.email}</p>
                          </div>
                        </div>
                        <Badge variant={
                          application.status === "accepted" ? "default" :
                          application.status === "shortlisted" ? "secondary" :
                          application.status === "rejected" ? "destructive" : "outline"
                        }>
                          {application.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Internships Tab */}
          <TabsContent value="internships" className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Input
                  placeholder="Search internships..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredInternships().length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No internships found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || statusFilter !== "all" 
                      ? "Try adjusting your search or filters" 
                      : "Get started by posting your first internship"}
                  </p>
                  {!searchQuery && statusFilter === "all" && (
                    <Button onClick={() => setShowPostDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Post First Internship
                    </Button>
                  )}
                </div>
              ) : (
                getFilteredInternships().map((internship) => (
                  <Card key={internship._id} className="overflow-hidden">
                    <div className="relative">
                      <img 
                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400" 
                        alt={internship.title}
                        className="w-full h-32 object-cover"
                      />
                      <Badge className="absolute top-2 right-2" variant={
                        internship.status === "active" ? "default" : "secondary"
                      }>
                        {internship.status}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg">{internship.title}</h3>
                      <p className="text-sm text-muted-foreground">{internship.company}</p>
                      
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {internship.location}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {internship.duration}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <DollarSign className="w-4 h-4" />
                        {internship.stipend}
                      </div>

                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1">
                          {internship.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {internship.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{internship.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                          <span>{internship.views} views</span>
                          <span className="mx-2">•</span>
                          <span>{internship.applicants} applicants</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setSelectedInternship(internship)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Select 
                  value={selectedInternship?._id || "all"} 
                  onValueChange={(value) => {
                    if (value === "all") {
                      setSelectedInternship(null);
                    } else {
                      setSelectedInternship(internships.find(i => i._id === value) || null);
                    }
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by internship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Internships</SelectItem>
                    {internships.map((internship) => (
                      <SelectItem key={internship._id} value={internship._id}>
                        {internship.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Search applicants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Applications</CardTitle>
                <CardDescription>
                  {applications.length} applications found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Internship</TableHead>
                      <TableHead>Skills</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">No applications found</p>
                          <p className="text-sm text-muted-foreground">
                            Applications will appear here when students apply to your internships
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      applications.map((application) => {
                        const internship = internships.find(i => i._id === application.internship);
                        return (
                          <TableRow key={application._id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback>{application.applicant.profile.firstName.charAt(0)}{application.applicant.profile.lastName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{application.applicant.profile.firstName} {application.applicant.profile.lastName}</div>
                                  <div className="text-sm text-muted-foreground">{application.applicant.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{internship?.title}</div>
                              <div className="text-sm text-muted-foreground">{internship?.company}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                <Badge variant="outline" className="text-xs">React</Badge>
                                <Badge variant="outline" className="text-xs">JavaScript</Badge>
                                <Badge variant="outline" className="text-xs">HTML</Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {new Date(application.appliedAt).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{application.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedApplication(application);
                                    setShowApplicationDialog(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedApplication(application);
                                    setShowMessageDialog(true);
                                  }}
                                >
                                  <MessageSquare className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Application Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Application Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['pending', 'reviewed', 'shortlisted', 'interviewed', 'accepted', 'rejected', 'withdrawn'].map((status) => {
                      const count = applications.filter(app => app.status === status).length;
                      const percentage = applications.length > 0 ? (count / applications.length) * 100 : 0;
                      return (
                        <div key={status} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{status}</span>
                            <span>{count} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Internship Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Internship Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {internships.slice(0, 5).map((internship) => (
                      <div key={internship._id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="truncate">{internship.title}</span>
                          <span>{internship.applicants} applicants</span>
                        </div>
                        <Progress 
                          value={internships.length > 0 ? (internship.applicants / Math.max(...internships.map(i => i.applicants))) * 100 : 0} 
                          className="h-2" 
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Application Detail Dialog */}
      <Dialog open={showApplicationDialog} onOpenChange={setShowApplicationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="text-lg">{selectedApplication.applicant.profile.firstName.charAt(0)}{selectedApplication.applicant.profile.lastName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedApplication.applicant.profile.firstName} {selectedApplication.applicant.profile.lastName}</h3>
                  <p className="text-muted-foreground">{selectedApplication.applicant.email}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Education</Label>
                  <p className="text-sm">Bachelor's in Computer Science</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Applied Date</Label>
                  <p className="text-sm">{new Date(selectedApplication.appliedAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Skills</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  <Badge variant="outline">React</Badge>
                  <Badge variant="outline">JavaScript</Badge>
                  <Badge variant="outline">HTML</Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Resume</Label>
                <div className="flex items-center gap-2 mt-1">
                  <FileText className="w-4 h-4" />
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download Resume
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
            <DialogDescription>
              Send a message to {selectedApplication?.applicant.profile.firstName} {selectedApplication?.applicant.profile.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Message</Label>
              <Textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({
                title: "Message Sent",
                description: "Your message has been sent successfully!"
              });
              setMessageText("");
              setShowMessageDialog(false);
            }} disabled={!messageText.trim()}>
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InternshipManagement;
