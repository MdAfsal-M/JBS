import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Send, 
  Phone, 
  Mail, 
  MapPin, 
  Building,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Search,
  Filter,
  Users,
  UserPlus,
  UserCheck,
  AlertCircle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface MessagingProps {
  isOpen: boolean;
  onClose: () => void;
  selectedJob?: any;
}

const Messaging: React.FC<MessagingProps> = ({ isOpen, onClose, selectedJob }) => {
  const [activeTab, setActiveTab] = useState("jobs");
  const [selectedThread, setSelectedThread] = useState<any>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Define user role - since this is used in StudentDashboard, default to student
  // In a real app, this would come from context or props
  const isAdmin = false; // Default to false for student dashboard

  // Mock message threads for admin
  const adminJobThreads = [
    {
      id: 1,
      type: "job",
      title: "Sales Associate",
      company: "TechMart Electronics",
      applicant: {
        name: "Alex Johnson",
        position: "Student",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        phone: "+91 98765 43210",
        email: "alex.johnson@email.com",
        status: "Applied"
      },
      lastMessage: "Hi! I'm interested in the Sales Associate position. I have experience in customer service.",
      timestamp: "2 hours ago",
      unread: true,
      status: "Applied",
      messages: [
        {
          id: 1,
          sender: "Alex Johnson",
          message: "Hi! I'm interested in the Sales Associate position. I have experience in customer service.",
          timestamp: "2 hours ago",
          isFromApplicant: true
        },
        {
          id: 2,
          sender: "Admin",
          message: "Thank you for your application! We'll review it and get back to you soon.",
          timestamp: "1 hour ago",
          isFromApplicant: false
        }
      ]
    },
    {
      id: 2,
      type: "job",
      title: "Food Delivery Executive",
      company: "QuickBites Restaurant",
      applicant: {
        name: "Sarah Wilson",
        position: "Student",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        phone: "+91 98765 43211",
        email: "sarah.wilson@email.com",
        status: "Shortlisted"
      },
      lastMessage: "Your application has been shortlisted. Please confirm your availability for an interview.",
      timestamp: "1 day ago",
      unread: false,
      status: "Shortlisted",
      messages: [
        {
          id: 1,
          sender: "Sarah Wilson",
          message: "I'm applying for the Food Delivery Executive position. I'm available for immediate start.",
          timestamp: "2 days ago",
          isFromApplicant: true
        },
        {
          id: 2,
          sender: "Admin",
          message: "Your application has been shortlisted. Please confirm your availability for an interview.",
          timestamp: "1 day ago",
          isFromApplicant: false
        }
      ]
    }
  ];

  const adminInternshipThreads = [
    {
      id: 3,
      type: "internship",
      title: "Web Developer Intern",
      company: "CodeCrafters Solutions",
      applicant: {
        name: "Mike Chen",
        position: "Student",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        phone: "+91 98765 43212",
        email: "mike.chen@email.com",
        status: "Selected"
      },
      lastMessage: "Congratulations! You've been selected for the Web Developer Intern position.",
      timestamp: "3 hours ago",
      unread: true,
      status: "Selected",
      messages: [
        {
          id: 1,
          sender: "Mike Chen",
          message: "I'm applying for the Web Developer Intern position. I have experience with React and Node.js.",
          timestamp: "3 days ago",
          isFromApplicant: true
        },
        {
          id: 2,
          sender: "Admin",
          message: "Congratulations! You've been selected for the Web Developer Intern position.",
          timestamp: "3 hours ago",
          isFromApplicant: false
        }
      ]
    },
    {
      id: 4,
      type: "internship",
      title: "Marketing Intern",
      company: "GrowthHackers Agency",
      applicant: {
        name: "Priya Sharma",
        position: "Student",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        phone: "+91 98765 43213",
        email: "priya.sharma@email.com",
        status: "Under Review"
      },
      lastMessage: "We're currently reviewing your application. You should hear back from us by the end of this week.",
      timestamp: "2 days ago",
      unread: false,
      status: "Under Review",
      messages: [
        {
          id: 1,
          sender: "Priya Sharma",
          message: "I'm interested in the Marketing Intern position. I have a background in digital marketing.",
          timestamp: "4 days ago",
          isFromApplicant: true
        },
        {
          id: 2,
          sender: "Admin",
          message: "We're currently reviewing your application. You should hear back from us by the end of this week.",
          timestamp: "2 days ago",
          isFromApplicant: false
        }
      ]
    }
  ];

  // Original student message threads
  const jobThreads = [
    {
      id: 1,
      type: "job",
      title: "Frontend Developer at TechCorp",
      company: "TechCorp Solutions",
      sender: {
        name: "Sarah Johnson",
        position: "HR Manager",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        phone: "+91 98765 43210",
        email: "sarah.johnson@techcorp.com"
      },
      lastMessage: "Hi Alex! We've reviewed your application and would like to schedule an interview. Are you available this Friday at 2 PM?",
      timestamp: "2 hours ago",
      unread: true,
      status: "Shortlisted",
      messages: [
        {
          id: 1,
          sender: "Sarah Johnson",
          message: "Hi Alex! We've reviewed your application and would like to schedule an interview. Are you available this Friday at 2 PM?",
          timestamp: "2 hours ago",
          isFromEmployer: true
        },
        {
          id: 2,
          sender: "Alex Johnson",
          message: "Thank you for considering my application! Yes, I'm available on Friday at 2 PM. Looking forward to the interview.",
          timestamp: "1 hour ago",
          isFromEmployer: false
        }
      ]
    },
    {
      id: 2,
      type: "job",
      title: "Sales Associate at Fashion Forward",
      company: "Fashion Forward",
      sender: {
        name: "Mike Chen",
        position: "Store Manager",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        phone: "+91 98765 43211",
        email: "mike.chen@fashionforward.com"
      },
      lastMessage: "Your application has been received. We'll get back to you within 3-5 business days.",
      timestamp: "1 day ago",
      unread: false,
      status: "Applied",
      messages: [
        {
          id: 1,
          sender: "Mike Chen",
          message: "Your application has been received. We'll get back to you within 3-5 business days.",
          timestamp: "1 day ago",
          isFromEmployer: true
        }
      ]
    }
  ];

  const internshipThreads = [
    {
      id: 3,
      type: "internship",
      title: "Digital Marketing Intern at GrowthHackers",
      company: "GrowthHackers Agency",
      sender: {
        name: "Priya Sharma",
        position: "Marketing Director",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        phone: "+91 98765 43212",
        email: "priya.sharma@growthhackers.com"
      },
      lastMessage: "Congratulations! You've been selected for the Digital Marketing Intern position. Welcome to the team!",
      timestamp: "3 hours ago",
      unread: true,
      status: "Selected",
      messages: [
        {
          id: 1,
          sender: "Priya Sharma",
          message: "Congratulations! You've been selected for the Digital Marketing Intern position. Welcome to the team!",
          timestamp: "3 hours ago",
          isFromEmployer: true
        },
        {
          id: 2,
          sender: "Alex Johnson",
          message: "Thank you so much! I'm excited to join the team and learn from all of you.",
          timestamp: "2 hours ago",
          isFromEmployer: false
        },
        {
          id: 3,
          sender: "Priya Sharma",
          message: "Great! Your start date will be next Monday. I'll send you the onboarding details shortly.",
          timestamp: "1 hour ago",
          isFromEmployer: true
        }
      ]
    },
    {
      id: 4,
      type: "internship",
      title: "Web Development Intern at CodeCrafters",
      company: "CodeCrafters Solutions",
      sender: {
        name: "David Kim",
        position: "Tech Lead",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        phone: "+91 98765 43213",
        email: "david.kim@codecrafters.com"
      },
      lastMessage: "We're currently reviewing applications. You should hear back from us by the end of this week.",
      timestamp: "2 days ago",
      unread: false,
      status: "Under Review",
      messages: [
        {
          id: 1,
          sender: "David Kim",
          message: "We're currently reviewing applications. You should hear back from us by the end of this week.",
          timestamp: "2 days ago",
          isFromEmployer: true
        }
      ]
    }
  ];

  const getThreads = () => {
    return activeTab === "jobs" ? jobThreads : internshipThreads;
  };

  const allThreads = getThreads();

  const getFilteredThreads = () => {
    let threads = getThreads();
    
    if (searchQuery) {
      threads = threads.filter(thread => 
        thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thread.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thread.sender?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return threads;
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedThread) {
      const message = {
        id: Date.now(),
        sender: "You",
        message: newMessage,
        timestamp: "Just now",
        isFromEmployer: true
      };
      
      selectedThread.messages.push(message);
      selectedThread.lastMessage = newMessage;
      selectedThread.timestamp = "Just now";
      selectedThread.unread = false;
      
      setNewMessage("");
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully."
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Selected":
      case "Hired":
        return "bg-green-100 text-green-800";
      case "Shortlisted":
        return "bg-blue-100 text-blue-800";
      case "Under Review":
        return "bg-yellow-100 text-yellow-800";
      case "Applied":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Selected":
      case "Hired":
        return <CheckCircle className="w-4 h-4" />;
      case "Shortlisted":
        return <UserCheck className="w-4 h-4" />;
      case "Under Review":
        return <Clock className="w-4 h-4" />;
      case "Applied":
        return <UserPlus className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Messages
              {selectedJob && (
                <Badge variant="outline" className="ml-2">
                  {selectedJob.title}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
          {/* Message Threads */}
          <div className="lg:col-span-1 border-r border-border">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="jobs">
                    Job Applications
                  </TabsTrigger>
                  <TabsTrigger value="internships">
                    Internships
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Thread List */}
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {getFilteredThreads().map((thread) => (
                  <Card
                    key={thread.id}
                    className={`p-3 cursor-pointer hover:bg-accent transition-colors ${
                      selectedThread?.id === thread.id ? 'bg-accent border-primary' : ''
                    }`}
                    onClick={() => setSelectedThread(thread)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                                          <AvatarImage src={thread.sender?.avatar} />
                  <AvatarFallback>
                    {thread.sender?.name[0]}
                  </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm truncate">{thread.title}</h4>
                          {thread.unread && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{thread.company}</p>
                        <p className="text-xs text-muted-foreground mb-1">
                          {thread.sender?.name}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {thread.lastMessage}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">{thread.timestamp}</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getStatusColor(thread.status)} flex items-center gap-1`}
                          >
                            {getStatusIcon(thread.status)}
                            {thread.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Message Content */}
          <div className="lg:col-span-2 flex flex-col">
            {selectedThread ? (
              <>
                {/* Thread Header */}
                <div className="border-b border-border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={selectedThread.sender?.avatar} />
                        <AvatarFallback>
                          {selectedThread.sender?.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{selectedThread.title}</h3>
                        <p className="text-sm text-muted-foreground">{selectedThread.company}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedThread.sender?.name}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${getStatusColor(selectedThread.status)} flex items-center gap-1`}
                    >
                      {getStatusIcon(selectedThread.status)}
                      {selectedThread.status}
                    </Badge>
                  </div>
                  
                  {/* Contact Info */}
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        <span>{selectedThread.sender?.phone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        <span>{selectedThread.sender?.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {selectedThread.messages.map((message: any) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isFromEmployer ? 'justify-end' : 'justify-start'}`}
                    >
                                              <div className={`max-w-[70%] p-3 rounded-lg ${
                          message.isFromEmployer
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium">
                            {message.sender}
                          </span>
                          <span className="text-xs opacity-70">
                            {message.timestamp}
                          </span>
                        </div>
                        <p className="text-sm">{message.message}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="border-t border-border p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {isAdmin ? "No applicant selected" : "No conversation selected"}
                  </h3>
                  <p className="text-muted-foreground">
                    {isAdmin 
                      ? "Select an applicant from the list to start messaging" 
                      : "Select a conversation from the list to start messaging"
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Messaging; 