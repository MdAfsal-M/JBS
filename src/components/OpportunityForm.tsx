import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ownerOpportunitiesAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface OpportunityFormProps {
  opportunityType: 'Job' | 'Internship';
  onSuccess?: () => void;
}

interface FormData {
  opportunityType: 'Job' | 'Internship';
  title: string;
  companyName: string;
  location: string;
  description: string;
  applicationDeadline: Date | null;
  // Job-specific fields
  jobType: string;
  salary: string;
  payType: string;
  experience: string;
  // Internship-specific fields
  duration: string;
  stipend: string;
  stipendType: string;
  startDate: Date | null;
  endDate: Date | null;
  // Common fields
  requirements: string[];
  benefits: string[];
  isRemote: boolean;
  isUrgent: boolean;
  maxApplicants: number | null;
  tags: string[];
  contactInfo: {
    email: string;
    phone: string;
    website: string;
  };
  applicationInstructions: string;
}

const OpportunityForm: React.FC<OpportunityFormProps> = ({ opportunityType, onSuccess }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    opportunityType,
    title: '',
    companyName: user?.business?.businessName || '',
    location: '',
    description: '',
    applicationDeadline: null,
    // Job-specific fields
    jobType: 'full-time',
    salary: '',
    payType: 'monthly',
    experience: '',
    // Internship-specific fields
    duration: '',
    stipend: '',
    stipendType: 'paid',
    startDate: null,
    endDate: null,
    // Common fields
    requirements: [''],
    benefits: [''],
    isRemote: false,
    isUrgent: false,
    maxApplicants: null,
    tags: [],
    contactInfo: {
      email: user?.email || '',
      phone: user?.profile?.phone || '',
      website: user?.business?.website || ''
    },
    applicationInstructions: ''
  });

  const [newRequirement, setNewRequirement] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    setFormData(prev => ({ ...prev, opportunityType }));
  }, [opportunityType]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContactInfoChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [field]: value
      }
    }));
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()]
      }));
      setNewBenefit('');
    }
  };

  const removeBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast({ title: "Error", description: "Title is required", variant: "destructive" });
      return false;
    }
         if (!formData.companyName.trim()) {
       toast({ title: "Error", description: "Company name is required", variant: "destructive" });
       return false;
     }
    if (!formData.location.trim()) {
      toast({ title: "Error", description: "Location is required", variant: "destructive" });
      return false;
    }
    if (!formData.description.trim()) {
      toast({ title: "Error", description: "Description is required", variant: "destructive" });
      return false;
    }
    if (!formData.applicationDeadline) {
      toast({ title: "Error", description: "Application deadline is required", variant: "destructive" });
      return false;
    }
    if (formData.applicationDeadline <= new Date()) {
      toast({ title: "Error", description: "Application deadline must be in the future", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Prepare the data for the API - include all fields that match the Mongoose schema
      const apiData = {
        title: formData.title,
        companyName: formData.companyName,
        location: formData.location,
        description: formData.description,
        opportunityType: formData.opportunityType,
        applicationDeadline: formData.applicationDeadline?.toISOString(),
        // Job-specific fields
        salary: formData.salary || null,
        jobType: formData.jobType,
        payType: formData.payType,
        experience: formData.experience,
        // Internship-specific fields
        duration: formData.duration,
        stipend: formData.stipend,
        stipendType: formData.stipendType,
        startDate: formData.startDate?.toISOString() || null,
        endDate: formData.endDate?.toISOString() || null,
        // Common fields
        requirements: formData.requirements.filter(req => req.trim() !== ''),
        benefits: formData.benefits.filter(benefit => benefit.trim() !== ''),
        isRemote: formData.isRemote,
        isUrgent: formData.isUrgent,
        maxApplicants: formData.maxApplicants,
        tags: formData.tags,
        contactInfo: formData.contactInfo,
        applicationInstructions: formData.applicationInstructions
      };

      console.log('Submitting opportunity data:', apiData);

      const response = await ownerOpportunitiesAPI.create(apiData);

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || `${opportunityType} posted successfully!`,
        });
        
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/owner-dashboard');
        }
      } else {
        toast({
          title: "Error",
          description: response.message || 'Failed to post opportunity',
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error posting opportunity:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to post opportunity. Please try again.',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
                         Post New {opportunityType}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder={`Enter ${opportunityType} title`}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="Enter company name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Enter location"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="applicationDeadline">Application Deadline *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="applicationDeadline"
                        name="applicationDeadline"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.applicationDeadline && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.applicationDeadline ? format(formData.applicationDeadline, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.applicationDeadline}
                        onSelect={(date) => handleInputChange('applicationDeadline', date)}
                        disabled={(date) => date <= new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={`Describe the ${opportunityType} in detail`}
                  rows={4}
                  required
                />
              </div>
            </div>

            {/* Type-specific fields */}
            <Tabs defaultValue="common" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="common">Common Fields</TabsTrigger>
                                 <TabsTrigger value={opportunityType === 'Job' ? 'job' : 'internship'}>
                   {opportunityType} Specific
                 </TabsTrigger>
                <TabsTrigger value="additional">Additional</TabsTrigger>
              </TabsList>

              <TabsContent value="common" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="isRemote">Remote Work</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Checkbox
                        id="isRemote"
                        name="isRemote"
                        checked={formData.isRemote}
                        onCheckedChange={(checked) => handleInputChange('isRemote', checked)}
                      />
                      <Label htmlFor="isRemote">This is a remote position</Label>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="isUrgent">Urgent</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Checkbox
                        id="isUrgent"
                        name="isUrgent"
                        checked={formData.isUrgent}
                        onCheckedChange={(checked) => handleInputChange('isUrgent', checked)}
                      />
                      <Label htmlFor="isUrgent">Mark as urgent</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="maxApplicants">Maximum Applicants (Optional)</Label>
                  <Input
                    id="maxApplicants"
                    name="maxApplicants"
                    type="number"
                    min="1"
                    value={formData.maxApplicants || ''}
                    onChange={(e) => handleInputChange('maxApplicants', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="Leave empty for unlimited"
                  />
                </div>

                <div>
                  <Label>Requirements</Label>
                  <div className="space-y-2">
                    {formData.requirements.map((req, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          name={`requirements[${index}]`}
                          value={req}
                          onChange={(e) => {
                            const newReqs = [...formData.requirements];
                            newReqs[index] = e.target.value;
                            handleInputChange('requirements', newReqs);
                          }}
                          placeholder="Enter requirement"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeRequirement(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2">
                      <Input
                        name="newRequirement"
                        value={newRequirement}
                        onChange={(e) => setNewRequirement(e.target.value)}
                        placeholder="Add new requirement"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={addRequirement}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Benefits</Label>
                  <div className="space-y-2">
                    {formData.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          name={`benefits[${index}]`}
                          value={benefit}
                          onChange={(e) => {
                            const newBenefits = [...formData.benefits];
                            newBenefits[index] = e.target.value;
                            handleInputChange('benefits', newBenefits);
                          }}
                          placeholder="Enter benefit"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeBenefit(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2">
                      <Input
                        name="newBenefit"
                        value={newBenefit}
                        onChange={(e) => setNewBenefit(e.target.value)}
                        placeholder="Add new benefit"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={addBenefit}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

                             <TabsContent value={opportunityType === 'Job' ? 'job' : 'internship'} className="space-y-4">
                 {opportunityType === 'Job' ? (
                  // Job-specific fields
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="jobType">Job Type</Label>
                        <Select value={formData.jobType} onValueChange={(value) => handleInputChange('jobType', value)}>
                          <SelectTrigger id="jobType" name="jobType">
                            <SelectValue placeholder="Select job type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full-time">Full-time</SelectItem>
                            <SelectItem value="part-time">Part-time</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                            <SelectItem value="freelance">Freelance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="payType">Pay Type</Label>
                        <Select value={formData.payType} onValueChange={(value) => handleInputChange('payType', value)}>
                          <SelectTrigger id="payType" name="payType">
                            <SelectValue placeholder="Select pay type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">Hourly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                            <SelectItem value="project-based">Project-based</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="salary">Pay/Salary</Label>
                        <Input
                          id="salary"
                          name="salary"
                          value={formData.salary}
                          onChange={(e) => handleInputChange('salary', e.target.value)}
                          placeholder="e.g., $50,000/year or $25/hour"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="experience">Experience Required</Label>
                        <Input
                          id="experience"
                          name="experience"
                          value={formData.experience}
                          onChange={(e) => handleInputChange('experience', e.target.value)}
                          placeholder="e.g., 2+ years, Entry level"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  // Internship-specific fields
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="duration">Duration</Label>
                        <Input
                          id="duration"
                          name="duration"
                          value={formData.duration}
                          onChange={(e) => handleInputChange('duration', e.target.value)}
                          placeholder="e.g., 3 months, 6 months"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="stipendType">Stipend Type</Label>
                        <Select value={formData.stipendType} onValueChange={(value) => handleInputChange('stipendType', value)}>
                          <SelectTrigger id="stipendType" name="stipendType">
                            <SelectValue placeholder="Select stipend type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="unpaid">Unpaid</SelectItem>
                            <SelectItem value="performance-based">Performance-based</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="stipend">Stipend</Label>
                        <Input
                          id="stipend"
                          name="stipend"
                          value={formData.stipend}
                          onChange={(e) => handleInputChange('stipend', e.target.value)}
                          placeholder="e.g., $2000/month or Unpaid"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="startDate">Start Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              id="startDate"
                              name="startDate"
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !formData.startDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.startDate ? format(formData.startDate, "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={formData.startDate}
                              onSelect={(date) => handleInputChange('startDate', date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="endDate"
                            name="endDate"
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.endDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.endDate ? format(formData.endDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.endDate}
                            onSelect={(date) => handleInputChange('endDate', date)}
                            disabled={(date) => formData.startDate ? date <= formData.startDate : false}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="additional" className="space-y-4">
                <div>
                  <Label>Tags</Label>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-primary text-primary-foreground px-2 py-1 rounded-md text-sm flex items-center space-x-1"
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:bg-primary/80 rounded"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        name="newTag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add new tag"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={addTag}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      value={formData.contactInfo.email}
                      onChange={(e) => handleContactInfoChange('email', e.target.value)}
                      placeholder="Contact email"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      name="contactPhone"
                      value={formData.contactInfo.phone}
                      onChange={(e) => handleContactInfoChange('phone', e.target.value)}
                      placeholder="Contact phone"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="contactWebsite">Website</Label>
                    <Input
                      id="contactWebsite"
                      name="contactWebsite"
                      value={formData.contactInfo.website}
                      onChange={(e) => handleContactInfoChange('website', e.target.value)}
                      placeholder="Company website"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="applicationInstructions">Application Instructions</Label>
                  <Textarea
                    id="applicationInstructions"
                    name="applicationInstructions"
                    value={formData.applicationInstructions}
                    onChange={(e) => handleInputChange('applicationInstructions', e.target.value)}
                    placeholder="Provide specific instructions for applicants"
                    rows={3}
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/owner-dashboard')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                                 {isSubmitting ? 'Posting...' : `Post ${opportunityType}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OpportunityForm;
