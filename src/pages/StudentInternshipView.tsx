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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  DollarSign, 
  GraduationCap,
  Users,
  Calendar,
  FileText,
  Send,
  Eye,
  Bookmark,
  Heart,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  ArrowLeft
} from 'lucide-react';
import { 
  Internship, 
  InternshipApplication, 
  Message, 
  internshipService, 
  applicationService 
} from '@/services/firebase';

const StudentInternshipView = () => {
  const { toast } = useToast();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [myApplications, setMyApplications] = useState<InternshipApplication[]>([]);
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [showApplicationDetailDialog, setShowApplicationDetailDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [stipendFilter, setStipendFilter] = useState("all");
  const [messageText, setMessageText] = useState("");
  const [savedInternships, setSavedInternships] = useState<string[]>([]);
  const [likedInternships, setLikedInternships] = useState<string[]>([]);

  // Form states for application
  const [applicationForm, setApplicationForm] = useState({
    studentName: "",
    studentEmail: "",
    studentPhone: "",
    education: "",
    skills: [] as string[],
    resumeUrl: "",
    coverLetter: ""
  });

  // Mock student ID (replace with actual authentication)
  const studentId = "student-123";

  useEffect(() => {
    loadInternships();
    loadMyApplications();
  }, []);

  const loadInternships = async () => {
    try {
      setLoading(true);
      const activeInternships = await internshipService.getActiveInternships();
      setInternships(activeInternships);
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

  const loadMyApplications = async () => {
    try {
      const studentApplications = await applicationService.getApplicationsByStudent(studentId);
      setMyApplications(studentApplications);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load your applications",
        variant: "destructive"
      });
    }
  };

  const handleApply = async () => {
    if (!selectedInternship) return;

    try {
      setLoading(true);
      await applicationService.createApplication({
        internshipId: selectedInternship.id!,
        studentId,
        studentName: applicationForm.studentName,
        studentEmail: applicationForm.studentEmail,
        studentPhone: applicationForm.studentPhone,
        resumeUrl: applicationForm.resumeUrl,
        education: applicationForm.education,
        skills: applicationForm.skills,
        appliedDate: new Date().toISOString(),
        status: "Applied",
        messageHistory: []
      });

      toast({
        title: "Success",
        description: "Application submitted successfully!"
      });

      setShowApplyDialog(false);
      setApplicationForm({
        studentName: "",
        studentEmail: "",
        studentPhone: "",
        education: "",
        skills: [],
        resumeUrl: "",
        coverLetter: ""
      });

      loadMyApplications();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit application",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (applicationId: string) => {
    if (!messageText.trim()) return;

    try {
      await applicationService.addMessage(applicationId, {
        senderId: studentId,
        senderName: "Student",
        senderType: "student",
        message: messageText,
        isRead: false
      });

      toast({
        title: "Success",
        description: "Message sent successfully!"
      });

      setMessageText("");
      setShowMessageDialog(false);
      loadMyApplications();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const toggleSaved = (internshipId: string) => {
    setSavedInternships(prev => 
      prev.includes(internshipId) 
        ? prev.filter(id => id !== internshipId)
        : [...prev, internshipId]
    );
  };

  const toggleLiked = (internshipId: string) => {
    setLikedInternships(prev => 
      prev.includes(internshipId) 
        ? prev.filter(id => id !== internshipId)
        : [...prev, internshipId]
    );
  };

  const getFilteredInternships = () => {
    let filtered = internships;

    if (searchQuery) {
      filtered = filtered.filter(internship =>
        internship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        internship.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        internship.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(internship => 
        internship.skillsRequired.some(skill => 
          skill.toLowerCase().includes(categoryFilter.toLowerCase())
        )
      );
    }

    if (locationFilter !== "all") {
      filtered = filtered.filter(internship => 
        internship.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    if (stipendFilter !== "all") {
      filtered = filtered.filter(internship => {
        if (stipendFilter === "paid" && internship.stipendOffered !== "Unpaid") {
          return true;
        }
        if (stipendFilter === "unpaid" && internship.stipendOffered === "Unpaid") {
          return true;
        }
        return false;
      });
    }

    return filtered;
  };

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case "Selected":
        return "default";
      case "Shortlisted":
        return "secondary";
      case "Interview Scheduled":
        return "outline";
      case "Rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getApplicationStatusIcon = (status: string) => {
    switch (status) {
      case "Selected":
        return <CheckCircle className="w-4 h-4" />;
      case "Shortlisted":
        return <TrendingUp className="w-4 h-4" />;
      case "Interview Scheduled":
        return <Calendar className="w-4 h-4" />;
      case "Rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const getCategories = () => {
    const allSkills = internships.flatMap(internship => internship.skillsRequired);
    const uniqueSkills = [...new Set(allSkills)];
    return uniqueSkills.slice(0, 10);
  };

  const getLocations = () => {
    const locations = internships.map(internship => internship.location);
    return [...new Set(locations)];
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
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
            <h1 className="text-3xl font-bold">Internships</h1>
            <p className="text-muted-foreground">Browse and apply for internships</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="browse">Browse Internships</TabsTrigger>
          <TabsTrigger value="applications">My Applications</TabsTrigger>
          <TabsTrigger value="saved">Saved Internships</TabsTrigger>
        </TabsList>

        {/* Browse Internships Tab */}
        <TabsContent value="browse" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search internships..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {getCategories().map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Location</Label>
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {getLocations().map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Stipend</Label>
                  <Select value={stipendFilter} onValueChange={setStipendFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Stipends" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stipends</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Internships Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFilteredInternships().map((internship) => (
              <Card key={internship.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={internship.bannerImage || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400"} 
                    alt={internship.title}
                    className="w-full h-32 object-cover cursor-pointer"
                    onClick={() => setSelectedInternship(internship)}
                  />
                  <Badge className="absolute top-2 right-2" variant="default">
                    {internship.internshipType}
                  </Badge>
                  <div className="absolute top-2 left-2 flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 bg-white/80 hover:bg-white"
                      onClick={() => toggleLiked(internship.id!)}
                    >
                      <Heart className={`w-3 h-3 ${likedInternships.includes(internship.id!) ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 bg-white/80 hover:bg-white"
                      onClick={() => toggleSaved(internship.id!)}
                    >
                      <Bookmark className={`w-3 h-3 ${savedInternships.includes(internship.id!) ? 'fill-blue-500 text-blue-500' : ''}`} />
                    </Button>
                  </div>
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

                  <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                    {internship.description}
                  </p>

                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      <span>{internship.views} views</span>
                      <span className="mx-2">•</span>
                      <span>{internship.applicants} applicants</span>
                    </div>
                                      <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedInternship(internship)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        // Redirect to Messages section
                        window.location.href = '/student-dashboard?view=messaging';
                      }}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => {
                        setSelectedInternship(internship);
                        setShowApplyDialog(true);
                      }}
                    >
                      Apply Now
                    </Button>
                  </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* My Applications Tab */}
        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                My Applications
              </CardTitle>
              <CardDescription>
                Track your internship applications and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Internship</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myApplications.map((application) => {
                    const internship = internships.find(i => i.id === application.internshipId);
                    return (
                      <TableRow key={application.id}>
                        <TableCell>
                          <div className="font-medium">{internship?.title}</div>
                          <div className="text-sm text-muted-foreground">{internship?.location}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{internship?.companyName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(application.appliedDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getApplicationStatusColor(application.status)}>
                            <div className="flex items-center gap-1">
                              {getApplicationStatusIcon(application.status)}
                              {application.status}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedInternship(internship || null);
                                setShowApplicationDetailDialog(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {application.messageHistory.length > 0 && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setShowMessageDialog(true)}
                              >
                                <MessageSquare className="w-4 h-4" />
                              </Button>
                            )}
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

        {/* Saved Internships Tab */}
        <TabsContent value="saved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bookmark className="w-5 h-5" />
                Saved Internships
              </CardTitle>
              <CardDescription>
                Internships you've saved for later
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {internships
                  .filter(internship => savedInternships.includes(internship.id!))
                  .map((internship) => (
                    <Card key={internship.id} className="overflow-hidden">
                      <div className="relative">
                        <img 
                          src={internship.bannerImage || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400"} 
                          alt={internship.title}
                          className="w-full h-32 object-cover cursor-pointer"
                          onClick={() => setSelectedInternship(internship)}
                        />
                        <Badge className="absolute top-2 right-2" variant="default">
                          {internship.internshipType}
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
                          <DollarSign className="w-4 h-4" />
                          {internship.stipendOffered}
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <Button 
                            size="sm"
                            onClick={() => {
                              setSelectedInternship(internship);
                              setShowApplyDialog(true);
                            }}
                          >
                            Apply Now
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => toggleSaved(internship.id!)}
                          >
                            Remove
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Apply Dialog */}
      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Apply for Internship</DialogTitle>
            <DialogDescription>
              Submit your application for {selectedInternship?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  value={applicationForm.studentName}
                  onChange={(e) => setApplicationForm({...applicationForm, studentName: e.target.value})}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={applicationForm.studentEmail}
                  onChange={(e) => setApplicationForm({...applicationForm, studentEmail: e.target.value})}
                  placeholder="your.email@example.com"
                  type="email"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone Number</Label>
                <Input
                  value={applicationForm.studentPhone}
                  onChange={(e) => setApplicationForm({...applicationForm, studentPhone: e.target.value})}
                  placeholder="Your phone number"
                />
              </div>
              <div>
                <Label>Education</Label>
                <Input
                  value={applicationForm.education}
                  onChange={(e) => setApplicationForm({...applicationForm, education: e.target.value})}
                  placeholder="e.g., B.Tech Computer Science"
                />
              </div>
            </div>

            <div>
              <Label>Skills (comma-separated)</Label>
              <Input
                value={applicationForm.skills.join(", ")}
                onChange={(e) => setApplicationForm({
                  ...applicationForm, 
                  skills: e.target.value.split(",").map(s => s.trim()).filter(s => s)
                })}
                placeholder="e.g., React, JavaScript, Python"
              />
            </div>

            <div>
              <Label>Resume URL</Label>
              <Input
                value={applicationForm.resumeUrl}
                onChange={(e) => setApplicationForm({...applicationForm, resumeUrl: e.target.value})}
                placeholder="Link to your resume (Google Drive, Dropbox, etc.)"
              />
            </div>

            <div>
              <Label>Cover Letter</Label>
              <Textarea
                value={applicationForm.coverLetter}
                onChange={(e) => setApplicationForm({...applicationForm, coverLetter: e.target.value})}
                placeholder="Tell us why you're interested in this internship..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApplyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={loading}>
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Application Detail Dialog */}
      <Dialog open={showApplicationDetailDialog} onOpenChange={setShowApplicationDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedInternship && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">{selectedInternship.title}</h3>
                <p className="text-muted-foreground">{selectedInternship.companyName}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <p className="text-sm">{selectedInternship.location}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Duration</Label>
                  <p className="text-sm">{selectedInternship.duration}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Stipend</Label>
                  <p className="text-sm">{selectedInternship.stipendOffered}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p className="text-sm">{selectedInternship.internshipType}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm mt-1">{selectedInternship.description}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Required Skills</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedInternship.skillsRequired.map((skill, index) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Contact Information</Label>
                <p className="text-sm mt-1">
                  Email: {selectedInternship.contactDetails.email}<br />
                  Phone: {selectedInternship.contactDetails.phone}
                </p>
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
              Send a message to the company about your application
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
            <Button onClick={() => handleSendMessage("application-id")} disabled={!messageText.trim()}>
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </DialogFooter>
                 </DialogContent>
       </Dialog>
       </div>
     </div>
   );
 };

export default StudentInternshipView; 