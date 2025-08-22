import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  CheckCircle, 
  Clock, 
  Phone, 
  Mail, 
  MapPin, 
  Building,
  MessageSquare,
  ArrowRight,
  FileText,
  User,
  Calendar
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface JobApplicationProps {
  job: any;
  isOpen: boolean;
  onClose: () => void;
  onApply: (jobId: number) => void;
  onMessage: (jobId: number) => void;
}

const JobApplication: React.FC<JobApplicationProps> = ({
  job,
  isOpen,
  onClose,
  onApply,
  onMessage
}) => {
  const [step, setStep] = useState(1);
  const [applicationStatus, setApplicationStatus] = useState("Applied");

  const handleApply = () => {
    onApply(job.id);
    setStep(2);
    toast({
      title: "Application Submitted!",
      description: `Your application for ${job.title} has been submitted successfully.`
    });
  };

  const handleMessage = () => {
    onMessage(job.id);
    toast({
      title: "Message Sent",
      description: "Your message has been sent to the job poster."
    });
  };

  const mockJobPoster = {
    name: "Sarah Johnson",
    position: "HR Manager",
    company: job.company,
    phone: "+91 98765 43210",
    email: "sarah.johnson@" + job.company.toLowerCase().replace(/\s+/g, '') + ".com",
    location: job.location,
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
  };

  const applicationSteps = [
    { step: 1, title: "Applied", description: "Application submitted", icon: FileText },
    { step: 2, title: "Under Review", description: "Application being reviewed", icon: Clock },
    { step: 3, title: "Shortlisted", description: "Selected for next round", icon: CheckCircle },
    { step: 4, title: "Interview", description: "Interview scheduled", icon: Calendar },
    { step: 5, title: "Hired", description: "Job offer received", icon: CheckCircle }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Job Application</span>
            <Badge variant="secondary">{applicationStatus}</Badge>
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6">
            {/* Job Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{job.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={job.image}
                    alt={job.company}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold">{job.company}</h3>
                    <p className="text-sm text-muted-foreground">{job.location}</p>
                    <p className="text-primary font-medium">{job.pay}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Job Description</h4>
                  <p className="text-sm text-muted-foreground">{job.description}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Requirements</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {job.requirements.map((req: string, index: number) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Application Form */}
            <Card>
              <CardHeader>
                <CardTitle>Application Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input defaultValue="Alex Johnson" className="mt-1" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input defaultValue="alex.johnson@email.com" className="mt-1" />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input defaultValue="+91-9876543210" className="mt-1" />
                  </div>
                  <div>
                    <Label>Experience</Label>
                    <Input defaultValue="1-2 years" className="mt-1" />
                  </div>
                </div>
                
                <div>
                  <Label>Why are you interested in this position?</Label>
                  <textarea
                    className="w-full mt-1 p-3 border border-input rounded-md resize-none"
                    rows={4}
                    placeholder="Tell us why you're a great fit for this role..."
                  />
                </div>

                <div>
                  <Label>Resume</Label>
                  <div className="mt-1 p-3 border border-input rounded-md bg-muted/50">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">alex_resume.pdf</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleApply} className="flex-1">
                Submit Application
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {/* Success Message */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-800">Application Submitted Successfully!</h3>
                    <p className="text-sm text-green-600">Your application has been sent to the employer.</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Application ID:</span>
                    <span className="font-medium">#{(Date.now() % 1000000).toString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Submitted:</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge variant="secondary">Under Review</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>What's Next?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-xs text-primary-foreground">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Application Review</h4>
                      <p className="text-sm text-muted-foreground">
                        The employer will review your application within 2-3 business days.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Interview Invitation</h4>
                      <p className="text-sm text-muted-foreground">
                        If shortlisted, you'll receive an interview invitation via email.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Final Decision</h4>
                      <p className="text-sm text-muted-foreground">
                        You'll be notified of the final decision within 1-2 weeks.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={mockJobPoster.avatar} />
                    <AvatarFallback>{mockJobPoster.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{mockJobPoster.name}</h4>
                    <p className="text-sm text-muted-foreground">{mockJobPoster.position}</p>
                    <p className="text-sm text-muted-foreground">{mockJobPoster.company}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{mockJobPoster.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{mockJobPoster.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{mockJobPoster.location}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleMessage}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Close
              </Button>
              <Button onClick={() => setStep(1)} className="flex-1">
                <ArrowRight className="w-4 h-4 mr-2" />
                Track Application
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default JobApplication; 