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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
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
import { 
  Internship, 
  InternshipApplication, 
  Message, 
  internshipService, 
  applicationService 
} from '@/services/firebase';

const InternshipManagement = () => {
  const { toast } = useToast();
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
    companyName: "",
    internshipType: "Remote" as const,
    duration: "",
    location: "",
    numberOfOpenings: 1,
    applicationDeadline: "",
    skillsRequired: [] as string[],
    stipendOffered: "",
    description: "",
    contactDetails: {
      phone: "",
      email: ""
    }
  });

  // Mock owner ID (replace with actual authentication)
  const ownerId = "owner-123";

  useEffect(() => {
    loadInternships();
    loadApplications();
  }, []);

  const loadInternships = async () => {
    try {
      setLoading(true);
      const ownerInternships = await internshipService.getInternshipsByOwner(ownerId);
      setInternships(ownerInternships);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load internships",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      const ownerApplications = await applicationService.getApplicationsByOwner(ownerId);
      setApplications(ownerApplications);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive"
      });
    }
  };

  const handlePostInternship = async () => {
    try {
      setLoading(true);
      await internshipService.createInternship({
        ...newInternship,
        companyId: ownerId,
        status: "Active"
      });
      
      toast({
        title: "Success",
        description: "Internship posted successfully!"
      });
      
      setShowPostDialog(false);
      setNewInternship({
        title: "",
        companyName: "",
        internshipType: "Remote",
        duration: "",
        location: "",
        numberOfOpenings: 1,
        applicationDeadline: "",
        skillsRequired: [],
        stipendOffered: "",
        description: "",
        contactDetails: {
          phone: "",
          email: ""
        }
      });
      
      loadInternships();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post internship",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateApplicationStatus = async (applicationId: string, status: InternshipApplication['status']) => {
    try {
      await applicationService.updateApplicationStatus(applicationId, status);
      toast({
        title: "Success",
        description: `Application status updated to ${status}`
      });
      loadApplications();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = async () => {
    if (!selectedApplication || !messageText.trim()) return;

    try {
      await applicationService.addMessage(selectedApplication.id!, {
        senderId: ownerId,
        senderName: "HR Manager",
        senderType: "owner",
        message: messageText,
        isRead: false
      });

      toast({
        title: "Success",
        description: "Message sent successfully!"
      });

      setMessageText("");
      setShowMessageDialog(false);
      loadApplications();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const getFilteredInternships = () => {
    let filtered = internships;

    if (searchQuery) {
      filtered = filtered.filter(internship =>
        internship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        internship.companyName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(internship => internship.status === statusFilter);
    }

    return filtered;
  };

  const getFilteredApplications = () => {
    let filtered = applications;

    if (selectedInternship) {
      filtered = filtered.filter(app => app.internshipId === selectedInternship.id);
    }

    if (searchQuery) {
      filtered = filtered.filter(app =>
        app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.studentEmail.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const getAnalyticsData = () => {
    const totalPosted = internships.length;
    const totalApplications = applications.length;
    const activeInternships = internships.filter(i => i.status === "Active").length;
    const shortlisted = applications.filter(app => 
      app.status === "Shortlisted" || app.status === "Selected"
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
                  <Label>Internship Title</Label>
                  <Input
                    value={newInternship.title}
                    onChange={(e) => setNewInternship({...newInternship, title: e.target.value})}
                    placeholder="e.g., Frontend Developer Intern"
                  />
                </div>
                <div>
                  <Label>Company Name</Label>
                  <Input
                    value={newInternship.companyName}
                    onChange={(e) => setNewInternship({...newInternship, companyName: e.target.value})}
                    placeholder="Your company name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Internship Type</Label>
                  <Select 
                    value={newInternship.internshipType} 
                    onValueChange={(value) => setNewInternship({...newInternship, internshipType: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Remote">Remote</SelectItem>
                      <SelectItem value="On-site">On-site</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Duration</Label>
                  <Input
                    value={newInternship.duration}
                    onChange={(e) => setNewInternship({...newInternship, duration: e.target.value})}
                    placeholder="e.g., 3 months"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Location</Label>
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
                    value={newInternship.numberOfOpenings}
                    onChange={(e) => setNewInternship({...newInternship, numberOfOpenings: parseInt(e.target.value)})}
                    min="1"
                  />
                </div>
              </div>

              <div>
                <Label>Application Deadline</Label>
                <Input
                  type="date"
                  value={newInternship.applicationDeadline}
                  onChange={(e) => setNewInternship({...newInternship, applicationDeadline: e.target.value})}
                />
              </div>

              <div>
                <Label>Skills Required (comma-separated)</Label>
                <Input
                  value={newInternship.skillsRequired.join(", ")}
                  onChange={(e) => setNewInternship({
                    ...newInternship, 
                    skillsRequired: e.target.value.split(",").map(s => s.trim()).filter(s => s)
                  })}
                  placeholder="e.g., React, JavaScript, HTML, CSS"
                />
              </div>

              <div>
                <Label>Stipend Offered</Label>
                <Input
                  value={newInternship.stipendOffered}
                  onChange={(e) => setNewInternship({...newInternship, stipendOffered: e.target.value})}
                  placeholder="e.g., ₹15,000/month or Unpaid"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={newInternship.description}
                  onChange={(e) => setNewInternship({...newInternship, description: e.target.value})}
                  placeholder="Detailed description of the internship..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Contact Phone</Label>
                  <Input
                    value={newInternship.contactDetails.phone}
                    onChange={(e) => setNewInternship({
                      ...newInternship, 
                      contactDetails: {...newInternship.contactDetails, phone: e.target.value}
                    })}
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <Label>Contact Email</Label>
                  <Input
                    value={newInternship.contactDetails.email}
                    onChange={(e) => setNewInternship({
                      ...newInternship, 
                      contactDetails: {...newInternship.contactDetails, email: e.target.value}
                    })}
                    placeholder="Email address"
                  />
                </div>
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
                    <div key={internship.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{internship.title}</h4>
                        <p className="text-sm text-muted-foreground">{internship.companyName}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={internship.status === "Active" ? "default" : "secondary"}>
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
                  {getFilteredApplications().slice(0, 5).map((application) => (
                    <div key={application.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>{application.studentName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{application.studentName}</h4>
                          <p className="text-sm text-muted-foreground">{application.studentEmail}</p>
                        </div>
                      </div>
                      <Badge variant={
                        application.status === "Selected" ? "default" :
                        application.status === "Shortlisted" ? "secondary" :
                        application.status === "Rejected" ? "destructive" : "outline"
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
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="Deadline Passed">Deadline Passed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFilteredInternships().map((internship) => (
              <Card key={internship.id} className="overflow-hidden">
                <div className="relative">
                  <img 
                    src={internship.bannerImage || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400"} 
                    alt={internship.title}
                    className="w-full h-32 object-cover"
                  />
                  <Badge className="absolute top-2 right-2" variant={
                    internship.status === "Active" ? "default" : "secondary"
                  }>
                    {internship.status}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg">{internship.title}</h3>
                  <p className="text-sm text-muted-foreground">{internship.companyName}</p>
                  
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
                    {internship.stipendOffered}
                  </div>

                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1">
                      {internship.skillsRequired.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {internship.skillsRequired.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{internship.skillsRequired.length - 3} more
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
            ))}
          </div>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Select 
                value={selectedInternship?.id || "all"} 
                onValueChange={(value) => {
                  if (value === "all") {
                    setSelectedInternship(null);
                  } else {
                    setSelectedInternship(internships.find(i => i.id === value) || null);
                  }
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by internship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Internships</SelectItem>
                  {internships.map((internship) => (
                    <SelectItem key={internship.id} value={internship.id!}>
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
                {getFilteredApplications().length} applications found
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
                  {getFilteredApplications().map((application) => {
                    const internship = internships.find(i => i.id === application.internshipId);
                    return (
                      <TableRow key={application.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>{application.studentName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{application.studentName}</div>
                              <div className="text-sm text-muted-foreground">{application.studentEmail}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{internship?.title}</div>
                          <div className="text-sm text-muted-foreground">{internship?.companyName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {application.skills.slice(0, 3).map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {application.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{application.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(application.appliedDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={application.status} 
                            onValueChange={(value) => handleUpdateApplicationStatus(application.id!, value as any)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Applied">Applied</SelectItem>
                              <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                              <SelectItem value="Interview Scheduled">Interview Scheduled</SelectItem>
                              <SelectItem value="Selected">Selected</SelectItem>
                              <SelectItem value="Rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
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
                            <Button size="sm" variant="outline">
                              <FileText className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
                  {['Applied', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'].map((status) => {
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
                    <div key={internship.id} className="space-y-2">
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
                  <AvatarFallback className="text-lg">{selectedApplication.studentName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedApplication.studentName}</h3>
                  <p className="text-muted-foreground">{selectedApplication.studentEmail}</p>
                  <p className="text-muted-foreground">{selectedApplication.studentPhone}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Education</Label>
                  <p className="text-sm">{selectedApplication.education}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Applied Date</Label>
                  <p className="text-sm">{new Date(selectedApplication.appliedDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Skills</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedApplication.skills.map((skill, index) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
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

              <Separator />

              <div>
                <Label className="text-sm font-medium">Message History</Label>
                <ScrollArea className="h-32 mt-2">
                  <div className="space-y-2">
                    {selectedApplication.messageHistory.map((message) => (
                      <div key={message.id} className={`p-2 rounded-lg ${
                        message.senderType === 'owner' ? 'bg-primary/10 ml-4' : 'bg-muted mr-4'
                      }`}>
                                                 <div className="flex justify-between items-start">
                           <span className="text-sm font-medium">{message.senderName}</span>
                           <span className="text-xs text-muted-foreground">
                             {message.timestamp.toLocaleString()}
                           </span>
                         </div>
                        <p className="text-sm mt-1">{message.message}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
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
              Send a message to {selectedApplication?.studentName}
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
            <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
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