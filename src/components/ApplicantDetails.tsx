import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  MessageCircle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Send,
  GraduationCap,
  Briefcase,
  Clock,
  MapPin,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import { ownerApplicationsAPI } from '@/services/api';

interface ApplicantDetails {
  _id: string;
  status: string;
  submittedDate: string;
  opportunityId: {
    _id: string;
    title: string;
    company: string;
    location: string;
    opportunityType: string;
  };
  studentId: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
      phone?: string;
      city?: string;
      address?: string;
    };
    email: string;
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
  ownerNotes?: string;
}

const ApplicantDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [applicant, setApplicant] = useState<ApplicantDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    notes: ''
  });
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);

  useEffect(() => {
    if (id) {
      fetchApplicantDetails();
    }
  }, [id]);

  const fetchApplicantDetails = async () => {
    try {
      setLoading(true);
      const response = await ownerApplicationsAPI.getApplicationById(id!);
      
      if (response.success) {
        setApplicant(response.data);
        setStatusUpdate({
          status: response.data.status,
          notes: response.data.ownerNotes || ''
        });
      } else {
        toast({
          title: "Error",
          description: response.message || 'Failed to fetch applicant details',
          variant: "destructive"
        });
        navigate('/owner/job-management');
      }
    } catch (error: any) {
      console.error('Error fetching applicant details:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to fetch applicant details',
        variant: "destructive"
      });
      navigate('/owner/job-management');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      const response = await ownerApplicationsAPI.updateApplicationStatus(id!, statusUpdate);
      
      if (response.success) {
        setApplicant(prev => prev ? { ...prev, status: statusUpdate.status, ownerNotes: statusUpdate.notes } : null);
        setShowStatusUpdate(false);
        toast({
          title: "Success",
          description: "Application status updated successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || 'Failed to update status',
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to update status',
        variant: "destructive"
      });
    }
  };

  const handleChat = () => {
    navigate(`/owner/chat/${applicant?.studentId._id}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'reviewed':
        return <Badge variant="secondary">Reviewed</Badge>;
      case 'accepted':
        return <Badge variant="default">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-600 mb-4">Applicant not found</h2>
          <Button onClick={() => navigate('/owner/job-management')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Job Management
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/owner/job-management')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Job Management
          </Button>
          <h1 className="text-3xl font-bold gradient-text">Applicant Details</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleChat}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat
          </Button>
          <Button
            onClick={() => setShowStatusUpdate(true)}
          >
            Update Status
          </Button>
        </div>
      </div>

      {/* Job Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Job Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Job Title</p>
              <p className="font-medium">{applicant.opportunityId.title}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Company</p>
              <p className="font-medium">{applicant.opportunityId.company}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Location</p>
              <p className="font-medium">{applicant.opportunityId.location}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Type</p>
              <p className="font-medium capitalize">{applicant.opportunityId.opportunityType}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Student Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Full Name</p>
              <p className="font-medium">
                {applicant.studentId.profile.firstName} {applicant.studentId.profile.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="font-medium">{applicant.studentId.email}</p>
            </div>
            {applicant.studentId.profile.phone && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="font-medium">{applicant.studentId.profile.phone}</p>
              </div>
            )}
            {applicant.studentId.profile.city && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">City</p>
                <p className="font-medium">{applicant.studentId.profile.city}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Education Details */}
      {applicant.applicationDetails.education && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Education Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {applicant.applicationDetails.education.level && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Education Level</p>
                  <p className="font-medium">{applicant.applicationDetails.education.level}</p>
                </div>
              )}
              {applicant.applicationDetails.education.institution && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Institution</p>
                  <p className="font-medium">{applicant.applicationDetails.education.institution}</p>
                </div>
              )}
              {applicant.applicationDetails.education.graduationYear && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Graduation Year</p>
                  <p className="font-medium">{applicant.applicationDetails.education.graduationYear}</p>
                </div>
              )}
              {applicant.applicationDetails.education.currentSemester && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Semester</p>
                  <p className="font-medium">{applicant.applicationDetails.education.currentSemester}</p>
                </div>
              )}
              {applicant.applicationDetails.education.cgpa && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">CGPA</p>
                  <p className="font-medium">{applicant.applicationDetails.education.cgpa}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skills */}
      {applicant.applicationDetails.skills && applicant.applicationDetails.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {applicant.applicationDetails.skills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Application Details */}
      <Card>
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {applicant.applicationDetails.expectedSalary && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expected Salary</p>
                <p className="font-medium">₹{applicant.applicationDetails.expectedSalary.toLocaleString()}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Application Date</p>
              <p className="font-medium">{format(new Date(applicant.submittedDate), 'MMM dd, yyyy HH:mm')}</p>
            </div>
          </div>

          {applicant.applicationDetails.availability && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Availability</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Start Date</p>
                  <p className="text-sm font-medium">
                    {applicant.applicationDetails.availability.startDate 
                      ? format(new Date(applicant.applicationDetails.availability.startDate), 'MMM dd, yyyy')
                      : 'Not specified'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Hours per Week</p>
                  <p className="text-sm font-medium">
                    {applicant.applicationDetails.availability.hoursPerWeek || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {applicant.applicationDetails.coverLetter && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Cover Letter</p>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">
                  {applicant.applicationDetails.coverLetter}
                </p>
              </div>
            </div>
          )}

          {applicant.applicationDetails.portfolio && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Portfolio URL</p>
              <a 
                href={applicant.applicationDetails.portfolio} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline break-all"
              >
                {applicant.applicationDetails.portfolio}
              </a>
            </div>
          )}

          {applicant.applicationDetails.additionalNotes && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Additional Notes</p>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">
                  {applicant.applicationDetails.additionalNotes}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <div className="mt-1">{getStatusBadge(applicant.status)}</div>
            </div>
            {applicant.ownerNotes && (
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Your Notes</p>
                <p className="text-sm mt-1">{applicant.ownerNotes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Update Dialog */}
      {showStatusUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Update Application Status</h3>
            
            <div className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select value={statusUpdate.status} onValueChange={(value) => setStatusUpdate(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Reviewed">Reviewed</SelectItem>
                    <SelectItem value="Accepted">Accepted</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Notes (Optional)</Label>
                <Textarea
                  placeholder="Add any notes about this application..."
                  value={statusUpdate.notes}
                  onChange={(e) => setStatusUpdate(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowStatusUpdate(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleStatusUpdate} className="flex-1">
                  Update Status
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantDetails;
