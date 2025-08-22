import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { 
  Briefcase, 
  Building, 
  MapPin, 
  Clock, 
  DollarSign,
  Users,
  Eye,
  Calendar,
  Globe,
  ArrowLeft,
  Edit,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { ownerJobsAPI } from '@/services/api';

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  status: string;
  jobType: string;
  pay: string;
  payType: string;
  experience: string;
  category: string;
  requirements: string[];
  benefits: string[];
  isRemote: boolean;
  isUrgent: boolean;
  views: number;
  applicants: number;
  deadline: string;
  createdAt: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    website?: string;
  };
  applicationInstructions?: string;
}

const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchJobDetails();
    }
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await ownerJobsAPI.getJobById(id!);
      
      if (response.success) {
        setJob(response.data);
      } else {
        toast({
          title: "Error",
          description: response.message || 'Failed to fetch job details',
          variant: "destructive"
        });
        navigate('/owner/job-management');
      }
    } catch (error: any) {
      console.error('Error fetching job details:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to fetch job details',
        variant: "destructive"
      });
      navigate('/owner/job-management');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleEditJob = () => {
    navigate(`/owner/edit-job/${id}`);
  };

  const handleViewApplicants = () => {
    navigate(`/owner/job-applicants/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-600 mb-4">Job not found</h2>
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
            onClick={() => navigate('/owner-dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold gradient-text">Job Details</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleEditJob}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Job
          </Button>
          <Button
            onClick={handleViewApplicants}
          >
            <Users className="h-4 w-4 mr-2" />
            View Applicants ({job.applicants})
          </Button>
        </div>
      </div>

      {/* Job Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
              <div className="flex items-center gap-2 text-lg text-muted-foreground">
                <Building className="h-5 w-5" />
                <span>{job.company}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(job.status)}
              {job.isUrgent && <Badge variant="destructive">Urgent</Badge>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{job.location}</span>
              {job.isRemote && (
                <Badge variant="outline">
                  <Globe className="h-3 w-3 mr-1" />
                  Remote
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="capitalize">{job.jobType}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>{job.pay} ({job.payType})</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{job.experience} experience</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Posted: {format(new Date(job.createdAt), 'MMM dd, yyyy')}</span>
            </div>
            {job.deadline && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Deadline: {format(new Date(job.deadline), 'MMM dd, yyyy')}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Job Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">{job.description}</p>
        </CardContent>
      </Card>

      {/* Requirements */}
      {job.requirements && job.requirements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1">
              {job.requirements.map((req, index) => (
                <li key={index} className="text-sm">{req}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Benefits */}
      {job.benefits && job.benefits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1">
              {job.benefits.map((benefit, index) => (
                <li key={index} className="text-sm">{benefit}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Application Instructions */}
      {job.applicationInstructions && (
        <Card>
          <CardHeader>
            <CardTitle>Application Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{job.applicationInstructions}</p>
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      {job.contactInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {job.contactInfo.email && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm">{job.contactInfo.email}</p>
                </div>
              )}
              {job.contactInfo.phone && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-sm">{job.contactInfo.phone}</p>
                </div>
              )}
              {job.contactInfo.website && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Website</p>
                  <a 
                    href={job.contactInfo.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm"
                  >
                    {job.contactInfo.website}
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Job Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{job.views}</p>
              <p className="text-sm text-muted-foreground">Total Views</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{job.applicants}</p>
              <p className="text-sm text-muted-foreground">Total Applicants</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{job.category}</p>
              <p className="text-sm text-muted-foreground">Category</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobDetails;
