import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { 
  Briefcase, 
  Building, 
  MapPin, 
  Clock, 
  Calendar, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock as ClockIcon,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { studentApplicationsAPI } from '@/services/api';

interface Application {
  _id: string;
  status: string;
  submittedDate: string;
  opportunityId: {
    _id: string;
    title: string;
    companyName: string;
    location: string;
    opportunityType: string;
    description: string;
  };
  applicationDetails: {
    name: string;
    email: string;
    phone: string;
    coverLetter: string;
    portfolio: string;
    availability: {
      startDate: string;
      hoursPerWeek: number;
    };
    expectedSalary: number;
    additionalNotes: string;
    education: {
      level: string;
      institution: string;
      graduationYear: number;
      currentSemester: number;
      cgpa: number;
    };
    skills: string[];
  };
}

const MyApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await studentApplicationsAPI.getApplications();
      
      if (response.success) {
        setApplications(response.data);
      } else {
        toast({
          title: "Error",
          description: response.message || 'Failed to fetch applications',
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to fetch applications',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge variant="outline" className="flex items-center gap-1">
          <ClockIcon className="h-3 w-3" />
          Pending
        </Badge>;
      case 'reviewed':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          Reviewed
        </Badge>;
      case 'accepted':
        return <Badge variant="default" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Accepted
        </Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'text-yellow-600';
      case 'reviewed':
        return 'text-blue-600';
      case 'accepted':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getFilteredApplications = () => {
    let filtered = applications;

    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.opportunityId.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.opportunityId.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.opportunityId.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status.toLowerCase() === statusFilter.toLowerCase());
    }

    return filtered;
  };

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setShowDetailsDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const filteredApplications = getFilteredApplications();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Briefcase className="h-6 w-6" />
          <h1 className="text-2xl font-bold">My Applications</h1>
        </div>
        <Badge variant="outline">{applications.length} applications</Badge>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {applications.length === 0 ? 'No applications yet' : 'No applications found'}
            </h3>
            <p className="text-gray-500 text-center">
              {applications.length === 0 
                ? 'Start applying for jobs and internships to see them here!'
                : 'Try adjusting your search criteria'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <Card key={application._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">
                          {application.opportunityId.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-1">
                            <Building className="h-4 w-4" />
                            <span>{application.opportunityId.companyName}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{application.opportunityId.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Applied: {format(new Date(application.submittedDate), 'MMM dd, yyyy')}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className="text-xs">
                            {application.opportunityId.opportunityType}
                          </Badge>
                          {getStatusBadge(application.status)}
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-2">
                          {application.opportunityId.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(application)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Application Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Application Details
            </DialogTitle>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              {/* Application Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedApplication.opportunityId.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Company</p>
                      <p className="font-medium">{selectedApplication.opportunityId.companyName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Location</p>
                      <p className="font-medium">{selectedApplication.opportunityId.location}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Position Type</p>
                      <p className="font-medium">{selectedApplication.opportunityId.opportunityType}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Application Status</p>
                      <div className="mt-1">
                        {getStatusBadge(selectedApplication.status)}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Applied Date</p>
                      <p className="font-medium">
                        {format(new Date(selectedApplication.submittedDate), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Application ID</p>
                      <p className="font-medium text-sm font-mono">{selectedApplication._id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Your Application Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Application Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                      <p className="font-medium">{selectedApplication.applicationDetails.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedApplication.applicationDetails.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Phone</p>
                      <p className="font-medium">
                        {selectedApplication.applicationDetails.phone || 'Not provided'}
                      </p>
                    </div>
                    {selectedApplication.applicationDetails.expectedSalary && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Expected Salary</p>
                        <p className="font-medium">
                          ₹{selectedApplication.applicationDetails.expectedSalary.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {selectedApplication.applicationDetails.availability && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Availability</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Start Date</p>
                          <p className="text-sm font-medium">
                            {selectedApplication.applicationDetails.availability.startDate 
                              ? format(new Date(selectedApplication.applicationDetails.availability.startDate), 'MMM dd, yyyy')
                              : 'Not specified'
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Hours per Week</p>
                          <p className="text-sm font-medium">
                            {selectedApplication.applicationDetails.availability.hoursPerWeek || 'Not specified'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Education Details */}
                  {selectedApplication.applicationDetails.education && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Education Details</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedApplication.applicationDetails.education.level && (
                          <div>
                            <p className="text-xs text-muted-foreground">Education Level</p>
                            <p className="text-sm font-medium">{selectedApplication.applicationDetails.education.level}</p>
                          </div>
                        )}
                        {selectedApplication.applicationDetails.education.institution && (
                          <div>
                            <p className="text-xs text-muted-foreground">Institution</p>
                            <p className="text-sm font-medium">{selectedApplication.applicationDetails.education.institution}</p>
                          </div>
                        )}
                        {selectedApplication.applicationDetails.education.graduationYear && (
                          <div>
                            <p className="text-xs text-muted-foreground">Graduation Year</p>
                            <p className="text-sm font-medium">{selectedApplication.applicationDetails.education.graduationYear}</p>
                          </div>
                        )}
                        {selectedApplication.applicationDetails.education.currentSemester && (
                          <div>
                            <p className="text-xs text-muted-foreground">Current Semester</p>
                            <p className="text-sm font-medium">{selectedApplication.applicationDetails.education.currentSemester}</p>
                          </div>
                        )}
                        {selectedApplication.applicationDetails.education.cgpa && (
                          <div>
                            <p className="text-xs text-muted-foreground">CGPA</p>
                            <p className="text-sm font-medium">{selectedApplication.applicationDetails.education.cgpa}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {selectedApplication.applicationDetails.skills && selectedApplication.applicationDetails.skills.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedApplication.applicationDetails.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedApplication.applicationDetails.coverLetter && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Cover Letter</p>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">
                          {selectedApplication.applicationDetails.coverLetter}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedApplication.applicationDetails.portfolio && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Portfolio URL</p>
                      <a 
                        href={selectedApplication.applicationDetails.portfolio} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline break-all"
                      >
                        {selectedApplication.applicationDetails.portfolio}
                      </a>
                    </div>
                  )}

                  {selectedApplication.applicationDetails.additionalNotes && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Additional Notes</p>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">
                          {selectedApplication.applicationDetails.additionalNotes}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Status Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Status Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        selectedApplication.status === 'pending' ? 'bg-yellow-500' :
                        selectedApplication.status === 'reviewed' ? 'bg-blue-500' :
                        selectedApplication.status === 'accepted' ? 'bg-green-500' :
                        'bg-red-500'
                      }`}></div>
                      <div>
                        <p className="font-medium text-sm">
                          Current Status: {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedApplication.status === 'pending' && 'Your application is under review by the employer'}
                          {selectedApplication.status === 'reviewed' && 'Your application has been reviewed and is being considered'}
                          {selectedApplication.status === 'accepted' && 'Congratulations! Your application has been accepted'}
                          {selectedApplication.status === 'rejected' && 'Your application was not selected for this position'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyApplications;
