import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { 
  Briefcase, 
  Building, 
  MapPin, 
  Clock, 
  DollarSign,
  Users,
  Eye,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Globe,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ownerJobsAPI } from '@/services/api';
import { useNavigate } from 'react-router-dom';

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
}

interface Internship {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  status: string;
  duration: string;
  stipend: string;
  stipendType: string;
  requirements: string[];
  benefits: string[];
  isRemote: boolean;
  isUrgent: boolean;
  views: number;
  applicants: number;
  startDate: string;
  endDate: string;
  applicationDeadline: string;
  createdAt: string;
}

const OwnerJobManagement: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('jobs');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const fetchOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = { 
        page: currentPage, 
        limit: 10,
        _t: Date.now() // Add timestamp to prevent caching
      };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;

      console.log('=== FRONTEND DEBUG START ===');
      console.log('Fetching opportunities with params:', params);
              console.log('Current user token:', localStorage.getItem('token'));
        console.log('Token length:', localStorage.getItem('token')?.length);
        console.log('Token starts with Bearer:', localStorage.getItem('token')?.startsWith('Bearer'));
        console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api');
        console.log('Type filter:', typeFilter);

      if (typeFilter === 'jobs') {
        console.log('Fetching jobs...');
        console.log('Calling ownerJobsAPI.getJobs with params:', params);
        console.log('API endpoint being called:', '/owner-jobs/jobs');
        console.log('Full API URL:', `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/owner-jobs/jobs`);
        
        const response = await ownerJobsAPI.getJobs(params);
        console.log('Jobs API response:', response);
        console.log('Response success:', response.success);
        console.log('Response data:', response.data);
        console.log('Response data length:', response.data?.length);
        console.log('Response data type:', typeof response.data);
        console.log('Is response.data an array?', Array.isArray(response.data));
        
        // Additional debugging for response structure
        if (response && typeof response === 'object') {
          console.log('Response keys:', Object.keys(response));
          console.log('Response has data property:', 'data' in response);
          console.log('Response data property type:', typeof response.data);
        }
        
        if (response.success) {
          console.log('Setting jobs state with:', response.data);
          
          // Validate response data structure
          if (!response.data) {
            console.error('Response data is undefined or null');
            setError('Invalid response: No data received');
            return;
          }
          
          if (!Array.isArray(response.data)) {
            console.error('Response data is not an array:', typeof response.data);
            setError('Invalid response: Data is not an array');
            return;
          }
          
          // Log each job's structure for debugging
          response.data.forEach((job, index) => {
            console.log(`Job ${index}:`, {
              _id: job._id,
              title: job.title,
              company: job.company,
              location: job.location,
              status: job.status,
              hasRequiredFields: !!(job._id && job.title && job.company)
            });
          });
          
          setJobs(response.data);
          console.log('Jobs state set successfully. Current jobs state:', response.data);
        } else {
          console.error('Jobs API failed:', response);
          setError(response.message || 'Failed to fetch jobs');
        }
      } else {
        console.log('Fetching internships...');
        const response = await ownerJobsAPI.getInternships(params);
        console.log('Internships API response:', response);
        if (response.success) {
          console.log('Setting internships state with:', response.data);
          
          // Validate response data structure
          if (!response.data) {
            console.error('Response data is undefined or null');
            setError('Invalid response: No data received');
            return;
          }
          
          if (!Array.isArray(response.data)) {
            console.error('Response data is not an array:', typeof response.data);
            setError('Invalid response: Data is not an array');
            return;
          }
          
          // Log each internship's structure for debugging
          response.data.forEach((internship, index) => {
            console.log(`Internship ${index}:`, {
              _id: internship._id,
              title: internship.title,
              company: internship.company,
              location: internship.location,
              status: internship.status,
              hasRequiredFields: !!(internship._id && internship.title && internship.company)
            });
          });
          
          setInternships(response.data);
          console.log('Internships set:', response.data);
        } else {
          console.error('Internships API failed:', response);
          setError(response.message || 'Failed to fetch internships');
        }
      }
      console.log('=== FRONTEND DEBUG END ===');
    } catch (error: any) {
      console.error('Error fetching opportunities:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch opportunities';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter, currentPage, searchTerm]);

  // Main effect to fetch opportunities
  useEffect(() => {
    console.log('Main useEffect triggered - fetching opportunities');
    fetchOpportunities();
  }, [fetchOpportunities]);

  // Effect to refresh when typeFilter changes
  useEffect(() => {
    console.log('Type filter changed to:', typeFilter);
    // Clear existing data when switching between jobs and internships
    if (typeFilter === 'jobs') {
      setInternships([]);
    } else {
      setJobs([]);
    }
    // Fetch new data
    fetchOpportunities();
  }, [typeFilter]);

  // Add debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '') {
        fetchOpportunities();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchOpportunities]);

  const handleViewDetails = (opportunityId: string) => {
    if (typeFilter === 'jobs') {
      navigate(`/owner/job-details/${opportunityId}`);
    } else {
      navigate(`/owner/internship-details/${opportunityId}`);
    }
  };

  const handleViewApplicants = (opportunityId: string) => {
    if (typeFilter === 'jobs') {
      navigate(`/owner/job-applicants/${opportunityId}`);
    } else {
      navigate(`/owner/internship-applicants/${opportunityId}`);
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

  const getOpportunities = () => {
    const opportunities = typeFilter === 'jobs' ? jobs : internships;
    console.log('getOpportunities called:');
    console.log('typeFilter:', typeFilter);
    console.log('jobs state:', jobs);
    console.log('internships state:', internships);
    console.log('returned opportunities:', opportunities);
    return opportunities;
  };

  const getOpportunityTypeLabel = () => {
    return typeFilter === 'jobs' ? 'Jobs' : 'Internships';
  };

  if (loading) {
    console.log('Rendering loading state');
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const opportunities = getOpportunities();
  console.log('Final opportunities for rendering:', opportunities);
  console.log('Opportunities length:', opportunities.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Briefcase className="h-6 w-6" />
          <h1 className="text-2xl font-bold">My {getOpportunityTypeLabel()}</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate('/owner/post-opportunity')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Post New {typeFilter === 'jobs' ? 'Job' : 'Internship'}
          </Button>
          <Badge variant="outline">{opportunities.length} {getOpportunityTypeLabel().toLowerCase()}</Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/owner-jobs/debug-jobs`, {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  }
                });
                const data = await response.json();
                console.log('Debug response:', data);
                alert(`Debug Info:\nTotal jobs in DB: ${data.totalJobsInDB}\nJobs for this owner: ${data.ownerJobsCount}\nCurrent user ID: ${data.currentUserId}`);
              } catch (error) {
                console.error('Debug error:', error);
                alert('Debug failed: ' + error.message);
              }
            }}
          >
            Debug Jobs
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/owner-jobs/test-auth`, {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  }
                });
                const data = await response.json();
                console.log('Test auth response:', data);
                alert(`Auth Test:\nUser ID: ${data.user.id}\nEmail: ${data.user.email}\nRole: ${data.user.role}`);
              } catch (error) {
                console.error('Test auth error:', error);
                alert('Auth test failed: ' + error.message);
              }
            }}
          >
            Test Auth
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                console.log('Testing direct API call...');
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/owner-jobs/jobs`, {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  }
                });
                const data = await response.json();
                console.log('Direct API response:', data);
                alert(`Direct API Test:\nSuccess: ${data.success}\nJobs found: ${data.data?.length || 0}\nMessage: ${data.message || 'No message'}`);
              } catch (error) {
                console.error('Direct API test error:', error);
                alert('Direct API test failed: ' + error.message);
              }
            }}
          >
            Test Direct API
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log('Manual refresh clicked');
              // Force refresh by clearing state first
              setJobs([]);
              setInternships([]);
              setError(null);
              // Add a small delay to ensure state is cleared
              setTimeout(() => {
                fetchOpportunities();
              }, 100);
            }}
          >
            Refresh Jobs
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                console.log('Direct fetch test...');
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/owner-jobs/jobs?_t=${Date.now()}`, {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                  }
                });
                const data = await response.json();
                console.log('Direct fetch response:', data);
                
                if (data.success && Array.isArray(data.data)) {
                  setJobs(data.data);
                  console.log('Jobs set via direct fetch:', data.data);
                  alert(`Direct fetch successful! Found ${data.data.length} jobs.`);
                } else {
                  alert('Direct fetch failed: ' + (data.message || 'Unknown error'));
                }
              } catch (error) {
                console.error('Direct fetch error:', error);
                alert('Direct fetch error: ' + error.message);
              }
            }}
          >
            Direct Fetch Test
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={`Search ${typeFilter}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Button
            variant="outline"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 px-2"
            onClick={() => fetchOpportunities()}
          >
            Search
          </Button>
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="jobs">Jobs</SelectItem>
            <SelectItem value="internships">Internships</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Error: {error}</span>
            </div>
            <p className="text-sm text-red-600 mt-1">
              Please check your connection and try again. If the problem persists, contact support.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => {
                setError(null);
                fetchOpportunities();
              }}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Debug Section - Remove this after fixing */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="space-y-2">
            <h3 className="font-medium text-blue-700">Debug Information</h3>
            <div className="text-sm text-blue-600">
              <p><strong>Type Filter:</strong> {typeFilter}</p>
              <p><strong>Jobs State Length:</strong> {jobs.length}</p>
              <p><strong>Internships State Length:</strong> {internships.length}</p>
              <p><strong>Opportunities Length:</strong> {opportunities.length}</p>
              <p><strong>Loading:</strong> {loading.toString()}</p>
              <p><strong>Error:</strong> {error || 'None'}</p>
            </div>
            <div className="text-xs text-blue-500">
              <p><strong>Jobs State:</strong> {JSON.stringify(jobs, null, 2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opportunities List */}
      {opportunities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No {getOpportunityTypeLabel().toLowerCase()} found
            </h3>
            <p className="text-gray-500 text-center">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search criteria'
                : `You haven't posted any ${getOpportunityTypeLabel().toLowerCase()} yet. Start by posting your first opportunity!`
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {opportunities.map((opportunity) => (
            <Card key={opportunity._id} className="hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-gray-300">
              <CardHeader className="pb-3 bg-gray-50/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold line-clamp-2 mb-2 text-gray-900">
                      {opportunity.title}
                    </CardTitle>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                      <Building className="h-4 w-4 flex-shrink-0 text-gray-500" />
                      <span className="line-clamp-1 font-medium">{opportunity.company}</span>
                    </div>
                  </div>
                  {getStatusBadge(opportunity.status)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3 pt-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-gray-500" />
                  <span className="line-clamp-1">{opportunity.location}</span>
                  {opportunity.isRemote && (
                    <Badge variant="outline" className="ml-2 text-xs border-blue-200 text-blue-700">
                      <Globe className="h-3 w-3 mr-1" />
                      Remote
                    </Badge>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4 flex-shrink-0 text-gray-500" />
                  <span>Posted: {format(new Date(opportunity.createdAt), 'MMM dd, yyyy')}</span>
                </div>

                {typeFilter === 'jobs' && (opportunity as Job).pay && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 flex-shrink-0 text-gray-500" />
                    <span className="font-medium text-gray-900">{(opportunity as Job).pay}</span>
                  </div>
                )}

                {typeFilter === 'internships' && (opportunity as Internship).stipend && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 flex-shrink-0 text-gray-500" />
                    <span className="font-medium text-gray-900">{(opportunity as Internship).stipend}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>{(opportunity.applicants || 0)} applicant{(opportunity.applicants || 0) !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4 text-gray-500" />
                    <span>{opportunity.views} view{opportunity.views !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                {opportunity.requirements && opportunity.requirements.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {opportunity.requirements.slice(0, 2).map((req, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                        {req}
                      </Badge>
                    ))}
                    {opportunity.requirements.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{opportunity.requirements.length - 2}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex space-x-2 pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 hover:bg-gray-50"
                    onClick={() => handleViewDetails(opportunity._id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Details
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleViewApplicants(opportunity._id)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Applicants
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerJobManagement;
