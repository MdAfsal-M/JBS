import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { 
  Users, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Eye,
  MessageCircle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Search,
  Filter,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { ownerJobsAPI } from '@/services/api';

interface Applicant {
  _id: string;
  status: string;
  submittedDate: string;
  studentId: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
      phone?: string;
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
}

const JobApplicants: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (id) {
      fetchApplicants();
    }
  }, [id]);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const response = await ownerJobsAPI.getJobApplicants(id!);
      
      if (response.success) {
        setApplicants(response.data);
      } else {
        toast({
          title: "Error",
          description: response.message || 'Failed to fetch applicants',
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error fetching applicants:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to fetch applicants',
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
          <Clock className="h-3 w-3" />
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

  const handleViewApplication = (applicantId: string) => {
    navigate(`/owner/applicant-details/${applicantId}`);
  };

  const handleChat = (applicantId: string) => {
    navigate(`/owner/chat/${applicantId}`);
  };

  const getFilteredApplicants = () => {
    let filtered = applicants;

    if (searchTerm) {
      filtered = filtered.filter(applicant => 
        applicant.studentId.profile.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.studentId.profile.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.studentId.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(applicant => 
        applicant.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    return filtered;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const filteredApplicants = getFilteredApplicants();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/owner-dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold gradient-text">Job Applicants</h1>
        </div>
        <Badge variant="outline">{applicants.length} applicants</Badge>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search applicants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
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

      {/* Applicants List */}
      {filteredApplicants.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {applicants.length === 0 ? 'No applicants yet' : 'No applicants found'}
            </h3>
            <p className="text-gray-500 text-center">
              {applicants.length === 0 
                ? 'Students will appear here once they start applying for this job.'
                : 'Try adjusting your search criteria'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplicants.map((applicant) => (
            <Card key={applicant._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">
                          {applicant.studentId.profile.firstName} {applicant.studentId.profile.lastName}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-4 w-4" />
                            <span>{applicant.studentId.email}</span>
                          </div>
                          {applicant.studentId.profile.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="h-4 w-4" />
                              <span>{applicant.studentId.profile.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Applied: {format(new Date(applicant.submittedDate), 'MMM dd, yyyy')}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                          {getStatusBadge(applicant.status)}
                        </div>

                        {/* Education Summary */}
                        {applicant.applicationDetails.education && (
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            {applicant.applicationDetails.education.level && (
                              <div className="flex items-center space-x-1">
                                <span className="font-medium">Education:</span>
                                <span>{applicant.applicationDetails.education.level}</span>
                              </div>
                            )}
                            {applicant.applicationDetails.education.institution && (
                              <div className="flex items-center space-x-1">
                                <span className="font-medium">Institution:</span>
                                <span>{applicant.applicationDetails.education.institution}</span>
                              </div>
                            )}
                            {applicant.applicationDetails.education.cgpa && (
                              <div className="flex items-center space-x-1">
                                <span className="font-medium">CGPA:</span>
                                <span>{applicant.applicationDetails.education.cgpa}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Skills */}
                        {applicant.applicationDetails.skills && applicant.applicationDetails.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {applicant.applicationDetails.skills.slice(0, 5).map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {applicant.applicationDetails.skills.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{applicant.applicationDetails.skills.length - 5}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Cover Letter Preview */}
                        {applicant.applicationDetails.coverLetter && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {applicant.applicationDetails.coverLetter}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewApplication(applicant._id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleChat(applicant._id)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Select
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobApplicants;
