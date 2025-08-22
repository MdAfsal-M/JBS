import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { studentViewAPI, studentApplicationsAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { 
  Briefcase, 
  GraduationCap, 
  MapPin, 
  Clock, 
  DollarSign,
  Users,
  Calendar,
  Building,
  Globe,
  AlertTriangle,
  CheckCircle,
  X,
  Search,
  Filter,
  Eye,
  Send,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import ApplicationConfirmation from './ApplicationConfirmation';

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  status: string;
  isRemote: boolean;
  isUrgent: boolean;
  applicants: number;
  views: number;
  createdAt: string;
  owner: {
    profile: {
      firstName: string;
      lastName: string;
    };
    business?: {
      businessName?: string;
    };
  };
  jobType?: string;
  pay?: string;
  payType?: string;
  experience?: string;
  category?: string;
  requirements: string[];
  contactInfo?: {
    email?: string;
    phone?: string;
    website?: string;
  };
  deadline?: string;
}

interface Internship {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  status: string;
  isRemote: boolean;
  isUrgent: boolean;
  applicants: number;
  views: number;
  createdAt: string;
  owner: {
    profile: {
      firstName: string;
      lastName: string;
    };
    business?: {
      businessName?: string;
    };
  };
  duration?: string;
  stipend?: string;
  stipendType?: string;
  startDate?: string;
  endDate?: string;
  applicationDeadline?: string;
  requirements: string[];
  contactInfo?: {
    email?: string;
    phone?: string;
    website?: string;
  };
}

type Opportunity = Job | Internship;

interface StudentOpportunitiesViewProps {
  opportunityType: 'jobs' | 'internships';
}

const StudentOpportunitiesView: React.FC<StudentOpportunitiesViewProps> = ({ opportunityType }) => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [submittedApplication, setSubmittedApplication] = useState<any>(null);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    portfolio: '',
    availability: {
      startDate: '',
      hoursPerWeek: ''
    },
    salary: {
      expected: '',
      currency: 'INR'
    },
    notes: {
      student: ''
    }
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOpportunities();
  }, [opportunityType, searchTerm, locationFilter]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (locationFilter) params.location = locationFilter;

      let response;
      if (opportunityType === 'jobs') {
        response = await studentViewAPI.getJobs(params);
      } else {
        response = await studentViewAPI.getInternships(params);
      }

      if (response.success) {
        setOpportunities(response.data);
      } else {
        console.error('Failed to fetch opportunities');
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowApplicationDialog(true);
  };

  const handleApplicationSubmit = async () => {
    if (!selectedOpportunity) return;

    setSubmitting(true);

    try {
      // Prepare application data for the new API
      const applicationDataForAPI = {
        coverLetter: applicationData.coverLetter,
        portfolio: applicationData.portfolio,
        availability: {
          startDate: applicationData.availability.startDate,
          hoursPerWeek: parseInt(applicationData.availability.hoursPerWeek) || 0
        },
        expectedSalary: applicationData.salary.expected ? parseInt(applicationData.salary.expected) : null,
        additionalNotes: applicationData.notes.student
      };

      const response = await studentApplicationsAPI.submitApplication(selectedOpportunity._id, applicationDataForAPI);

      if (response.success) {
        // Store the submitted application data
        setSubmittedApplication({
          _id: response.data.id,
          status: response.data.status,
          submittedDate: response.data.submittedDate,
          opportunityTitle: response.data.opportunityTitle,
          companyName: response.data.companyName,
          applicationDetails: {
            name: user?.profile?.firstName && user?.profile?.lastName ? 
              `${user.profile.firstName} ${user.profile.lastName}` : user?.username || '',
            email: user?.email || '',
            phone: user?.profile?.phone || '',
            coverLetter: applicationData.coverLetter,
            portfolio: applicationData.portfolio,
            availability: applicationData.availability,
            expectedSalary: applicationData.salary.expected ? parseInt(applicationData.salary.expected) : null,
            additionalNotes: applicationData.notes.student,
            // Include education details from user profile
            education: {
              level: user?.student?.education || '',
              institution: user?.student?.institution || '',
              graduationYear: user?.student?.graduationYear || null,
              currentSemester: user?.student?.currentSemester || null,
              cgpa: user?.student?.cgpa || null
            },
            skills: user?.student?.skills || []
          }
        });
        
        // Show confirmation dialog
        setShowConfirmationDialog(true);
        setShowApplicationDialog(false);
        setSelectedOpportunity(null);
        setApplicationData({
          coverLetter: '',
          portfolio: '',
          availability: { startDate: '', hoursPerWeek: '' },
          salary: { expected: '', currency: 'INR' },
          notes: { student: '' }
        });
        // Refresh opportunities to update applicant count
        fetchOpportunities();
      } else {
        toast({
          title: "Error",
          description: response.message || 'Failed to submit application',
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to submit application. Please try again.',
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (opportunity: Opportunity) => {
    if (opportunity.isUrgent) {
      return <Badge variant="destructive">Urgent</Badge>;
    }
    if (opportunity.status === 'expired') {
      return <Badge variant="outline">Expired</Badge>;
    }
    if (opportunity.status === 'inactive') {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  const getOpportunityIcon = () => {
    return opportunityType === 'jobs' ? <Briefcase className="h-5 w-5" /> : <GraduationCap className="h-5 w-5" />;
  };

  const getOpportunityTypeLabel = () => {
    return opportunityType === 'jobs' ? 'Jobs' : 'Internships';
  };

  const getCompanyName = (opportunity: Opportunity) => {
    if (opportunity.owner?.business?.businessName) {
      return opportunity.owner.business.businessName;
    }
    return opportunity.company;
  };

  const getApplicationDeadline = (opportunity: Opportunity) => {
    if (opportunityType === 'jobs') {
      return (opportunity as Job).deadline;
    } else {
      return (opportunity as Internship).applicationDeadline;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getOpportunityIcon()}
          <h1 className="text-2xl font-bold">{getOpportunityTypeLabel()}</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => {
              // This will be handled by the parent component to show MyApplications
              window.dispatchEvent(new CustomEvent('showMyApplications'));
            }}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            My Applications
          </Button>
          <Badge variant="outline">{opportunities.length} opportunities</Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={`Search ${opportunityType}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Filter by location"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="w-48"
          />
        </div>
      </div>

      {/* Opportunities Grid */}
      {opportunities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No {opportunityType} found</h3>
            <p className="text-gray-500 text-center">
              {searchTerm || locationFilter 
                ? 'Try adjusting your search criteria'
                : `No ${opportunityType} are currently available. Check back later!`
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opportunity) => (
            <Card key={opportunity._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2 mb-2">
                      {opportunity.title}
                    </CardTitle>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                      <Building className="h-4 w-4" />
                      <span className="line-clamp-1">{getCompanyName(opportunity)}</span>
                    </div>
                  </div>
                  {getStatusBadge(opportunity)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{opportunity.location}</span>
                  {opportunity.isRemote && (
                    <Badge variant="outline" className="ml-2">
                      <Globe className="h-3 w-3 mr-1" />
                      Remote
                    </Badge>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Posted: {format(new Date(opportunity.createdAt), 'MMM dd, yyyy')}</span>
                </div>

                {opportunityType === 'jobs' && (opportunity as Job).pay && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span>{(opportunity as Job).pay}</span>
                  </div>
                )}

                {opportunityType === 'internships' && (opportunity as Internship).stipend && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span>{(opportunity as Internship).stipend}</span>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>
                    {opportunity.applicants || 0} applicant{(opportunity.applicants || 0) !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Eye className="h-4 w-4" />
                  <span>{opportunity.views} view{opportunity.views !== 1 ? 's' : ''}</span>
                </div>

                <p className="text-sm text-gray-600 line-clamp-3">
                  {opportunity.description}
                </p>

                {opportunity.requirements && opportunity.requirements.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {opportunity.requirements.slice(0, 3).map((req, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {req}
                      </Badge>
                    ))}
                    {opportunity.requirements.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{opportunity.requirements.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedOpportunity(opportunity);
                      setShowApplicationDialog(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleApply(opportunity)}
                    disabled={opportunity.status !== 'active'}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Apply Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Application Dialog */}
      <Dialog open={showApplicationDialog} onOpenChange={setShowApplicationDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Apply for {selectedOpportunity?.title}</DialogTitle>
            <DialogDescription>
              Submit your application for this {opportunityType === 'jobs' ? 'job' : 'internship'} position.
            </DialogDescription>
          </DialogHeader>

          {selectedOpportunity && (
            <div className="space-y-6">
              {/* Opportunity Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedOpportunity.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4" />
                    <span>{getCompanyName(selectedOpportunity)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedOpportunity.location}</span>
                  </div>
                  {getApplicationDeadline(selectedOpportunity) && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Deadline: {format(new Date(getApplicationDeadline(selectedOpportunity)!), 'MMM dd, yyyy')}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Application Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="coverLetter">Cover Letter</Label>
                  <Textarea
                    id="coverLetter"
                    placeholder="Explain why you're interested in this position and why you'd be a great fit..."
                    value={applicationData.coverLetter}
                    onChange={(e) => setApplicationData(prev => ({
                      ...prev,
                      coverLetter: e.target.value
                    }))}
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="portfolio">Portfolio URL (Optional)</Label>
                  <Input
                    id="portfolio"
                    type="url"
                    placeholder="https://your-portfolio.com"
                    value={applicationData.portfolio}
                    onChange={(e) => setApplicationData(prev => ({
                      ...prev,
                      portfolio: e.target.value
                    }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Available Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={applicationData.availability.startDate}
                      onChange={(e) => setApplicationData(prev => ({
                        ...prev,
                        availability: { ...prev.availability, startDate: e.target.value }
                      }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hoursPerWeek">Hours per Week</Label>
                    <Input
                      id="hoursPerWeek"
                      type="number"
                      min="1"
                      max="168"
                      placeholder="e.g., 20"
                      value={applicationData.availability.hoursPerWeek}
                      onChange={(e) => setApplicationData(prev => ({
                        ...prev,
                        availability: { ...prev.availability, hoursPerWeek: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expectedSalary">Expected Salary (Optional)</Label>
                    <Input
                      id="expectedSalary"
                      type="number"
                      min="0"
                      placeholder="e.g., 50000"
                      value={applicationData.salary.expected}
                      onChange={(e) => setApplicationData(prev => ({
                        ...prev,
                        salary: { ...prev.salary, expected: e.target.value }
                      }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional information you'd like to share..."
                    value={applicationData.notes.student}
                    onChange={(e) => setApplicationData(prev => ({
                      ...prev,
                      notes: { ...prev.notes, student: e.target.value }
                    }))}
                    rows={3}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowApplicationDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApplicationSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Application Confirmation Dialog */}
      <ApplicationConfirmation
        isOpen={showConfirmationDialog}
        onClose={() => setShowConfirmationDialog(false)}
        application={submittedApplication}
      />
    </div>
  );
};

export default StudentOpportunitiesView;
