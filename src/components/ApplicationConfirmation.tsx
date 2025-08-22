import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Briefcase, Building, MapPin, Clock, Calendar, FileText, User } from 'lucide-react';
import { format } from 'date-fns';

interface ApplicationConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  application: {
    _id: string;
    status: string;
    submittedDate: string;
    opportunityTitle: string;
    companyName: string;
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
  } | null;
}

const ApplicationConfirmation: React.FC<ApplicationConfirmationProps> = ({
  isOpen,
  onClose,
  application
}) => {
  if (!application) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-6 w-6" />
            Application Submitted Successfully!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Success Message */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-800 mb-2">
                Your application has been submitted successfully!
              </h3>
              <p className="text-green-700">
                The employer will review your application and get back to you soon.
                You can track your application status from your dashboard.
              </p>
            </CardContent>
          </Card>

          {/* Application Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Application Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Application ID</p>
                  <p className="font-medium">{application._id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant="outline" className="capitalize">
                    {application.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Submitted Date</p>
                  <p className="font-medium">
                    {format(new Date(application.submittedDate), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Position</p>
                  <p className="font-medium">{application.opportunityTitle}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Company</p>
                  <p className="font-medium">{application.companyName}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Your Application Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                  <p className="font-medium">{application.applicationDetails.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="font-medium">{application.applicationDetails.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="font-medium">{application.applicationDetails.phone || 'Not provided'}</p>
                </div>
                {application.applicationDetails.expectedSalary && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Expected Salary</p>
                    <p className="font-medium">₹{application.applicationDetails.expectedSalary.toLocaleString()}</p>
                  </div>
                )}
              </div>

              {application.applicationDetails.availability && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Availability</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Start Date</p>
                      <p className="text-sm font-medium">
                        {application.applicationDetails.availability.startDate 
                          ? format(new Date(application.applicationDetails.availability.startDate), 'MMM dd, yyyy')
                          : 'Not specified'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Hours per Week</p>
                      <p className="text-sm font-medium">
                        {application.applicationDetails.availability.hoursPerWeek || 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Education Details */}
              {application.applicationDetails.education && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Education Details</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {application.applicationDetails.education.level && (
                      <div>
                        <p className="text-xs text-muted-foreground">Education Level</p>
                        <p className="text-sm font-medium">{application.applicationDetails.education.level}</p>
                      </div>
                    )}
                    {application.applicationDetails.education.institution && (
                      <div>
                        <p className="text-xs text-muted-foreground">Institution</p>
                        <p className="text-sm font-medium">{application.applicationDetails.education.institution}</p>
                      </div>
                    )}
                    {application.applicationDetails.education.graduationYear && (
                      <div>
                        <p className="text-xs text-muted-foreground">Graduation Year</p>
                        <p className="text-sm font-medium">{application.applicationDetails.education.graduationYear}</p>
                      </div>
                    )}
                    {application.applicationDetails.education.currentSemester && (
                      <div>
                        <p className="text-xs text-muted-foreground">Current Semester</p>
                        <p className="text-sm font-medium">{application.applicationDetails.education.currentSemester}</p>
                      </div>
                    )}
                    {application.applicationDetails.education.cgpa && (
                      <div>
                        <p className="text-xs text-muted-foreground">CGPA</p>
                        <p className="text-sm font-medium">{application.applicationDetails.education.cgpa}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Skills */}
              {application.applicationDetails.skills && application.applicationDetails.skills.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {application.applicationDetails.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {application.applicationDetails.coverLetter && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Cover Letter</p>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">
                      {application.applicationDetails.coverLetter}
                    </p>
                  </div>
                </div>
              )}

              {application.applicationDetails.portfolio && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Portfolio URL</p>
                  <a 
                    href={application.applicationDetails.portfolio} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline break-all"
                  >
                    {application.applicationDetails.portfolio}
                  </a>
                </div>
              )}

              {application.applicationDetails.additionalNotes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Additional Notes</p>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">
                      {application.applicationDetails.additionalNotes}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                What Happens Next?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-sm">Application Review</p>
                  <p className="text-sm text-muted-foreground">
                    The employer will review your application within 1-2 weeks
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-sm">Status Updates</p>
                  <p className="text-sm text-muted-foreground">
                    You'll receive notifications about your application status
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-sm">Interview Process</p>
                  <p className="text-sm text-muted-foreground">
                    If selected, you'll be contacted for further steps
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button className="flex-1">
              View My Applications
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationConfirmation;
