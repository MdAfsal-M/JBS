// Mock data services for internship management (Frontend Only)
// This will be replaced with actual Firebase/backend integration later

// Mock data interfaces
export interface Internship {
  id?: string;
  title: string;
  companyName: string;
  companyId: string; // Owner's UID
  internshipType: 'Remote' | 'On-site' | 'Hybrid';
  duration: string; // e.g., "3 months", "6 weeks"
  location: string;
  numberOfOpenings: number;
  applicationDeadline: string;
  skillsRequired: string[];
  stipendOffered: string; // "Unpaid" or amount
  description: string;
  contactDetails: {
    phone: string;
    email: string;
  };
  companyLogo?: string;
  bannerImage?: string;
  status: 'Active' | 'Closed' | 'Deadline Passed';
  views: number;
  applicants: number;
  posted: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InternshipApplication {
  id?: string;
  internshipId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  resumeUrl: string;
  education: string;
  skills: string[];
  appliedDate: string;
  status: 'Applied' | 'Shortlisted' | 'Interview Scheduled' | 'Selected' | 'Rejected';
  messageHistory: Message[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'owner' | 'student';
  message: string;
  timestamp: Date;
  isRead: boolean;
}

// Mock data storage
let mockInternships: Internship[] = [
  {
    id: "1",
    title: "Frontend Developer Intern",
    companyName: "TechCorp Solutions",
    companyId: "owner-123",
    internshipType: "Remote",
    duration: "3 months",
    location: "Remote",
    numberOfOpenings: 2,
    applicationDeadline: "2024-12-31",
    skillsRequired: ["React", "JavaScript", "HTML", "CSS"],
    stipendOffered: "₹15,000/month",
    description: "Join our team as a frontend developer intern and gain hands-on experience with modern web technologies.",
    contactDetails: {
      phone: "9876543210",
      email: "hr@techcorp.com"
    },
    status: "Active",
    views: 45,
    applicants: 8,
    posted: "2024-01-15",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15")
  },
  {
    id: "2",
    title: "Data Science Intern",
    companyName: "DataFlow Analytics",
    companyId: "owner-123",
    internshipType: "Hybrid",
    duration: "6 months",
    location: "Mumbai, Maharashtra",
    numberOfOpenings: 1,
    applicationDeadline: "2024-11-30",
    skillsRequired: ["Python", "Machine Learning", "SQL", "Statistics"],
    stipendOffered: "₹25,000/month",
    description: "Work on real-world data science projects and learn from industry experts.",
    contactDetails: {
      phone: "8765432109",
      email: "careers@dataflow.com"
    },
    status: "Active",
    views: 32,
    applicants: 12,
    posted: "2024-01-10",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10")
  }
];

let mockApplications: InternshipApplication[] = [
  {
    id: "1",
    internshipId: "1",
    studentId: "student-123",
    studentName: "Alex Johnson",
    studentEmail: "alex.johnson@email.com",
    studentPhone: "+91-9876543210",
    resumeUrl: "https://drive.google.com/alex-resume.pdf",
    education: "B.Tech Computer Science",
    skills: ["React", "JavaScript", "Node.js", "MongoDB"],
    appliedDate: "2024-01-20",
    status: "Shortlisted",
    messageHistory: [
      {
        id: "1",
        senderId: "owner-123",
        senderName: "HR Manager",
        senderType: "owner",
        message: "Your application has been shortlisted! We'd like to schedule an interview.",
        timestamp: new Date("2024-01-22"),
        isRead: true
      },
      {
        id: "2",
        senderId: "student-123",
        senderName: "Alex Johnson",
        senderType: "student",
        message: "Thank you! I'm available for an interview anytime this week.",
        timestamp: new Date("2024-01-23"),
        isRead: true
      }
    ],
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-23")
  },
  {
    id: "2",
    internshipId: "1",
    studentId: "student-456",
    studentName: "Sarah Wilson",
    studentEmail: "sarah.wilson@email.com",
    studentPhone: "+91-8765432109",
    resumeUrl: "https://drive.google.com/sarah-resume.pdf",
    education: "B.Tech Information Technology",
    skills: ["React", "TypeScript", "CSS", "Git"],
    appliedDate: "2024-01-18",
    status: "Applied",
    messageHistory: [],
    createdAt: new Date("2024-01-18"),
    updatedAt: new Date("2024-01-18")
  }
];

// Mock Internship Service
export class InternshipService {
  // Get all internships
  async getAllInternships(): Promise<Internship[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockInternships]), 500);
    });
  }

  // Get internships by owner
  async getInternshipsByOwner(ownerId: string): Promise<Internship[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const ownerInternships = mockInternships.filter(internship => internship.companyId === ownerId);
        resolve(ownerInternships);
      }, 500);
    });
  }

  // Get active internships (for students to apply)
  async getActiveInternships(): Promise<Internship[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const activeInternships = mockInternships.filter(internship => internship.status === 'Active');
        resolve(activeInternships);
      }, 500);
    });
  }

  // Get internship by ID
  async getInternshipById(id: string): Promise<Internship | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const internship = mockInternships.find(i => i.id === id);
        resolve(internship || null);
      }, 500);
    });
  }

  // Create new internship
  async createInternship(internshipData: Omit<Internship, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newInternship: Internship = {
          ...internshipData,
          id: Date.now().toString(),
          views: 0,
          applicants: 0,
          posted: new Date().toLocaleDateString(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        mockInternships.push(newInternship);
        resolve(newInternship.id!);
      }, 500);
    });
  }

  // Update internship
  async updateInternship(id: string, updates: Partial<Internship>): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockInternships.findIndex(i => i.id === id);
        if (index !== -1) {
          mockInternships[index] = {
            ...mockInternships[index],
            ...updates,
            updatedAt: new Date()
          };
        }
        resolve();
      }, 500);
    });
  }

  // Update internship status
  async updateInternshipStatus(id: string, status: Internship['status']): Promise<void> {
    return this.updateInternship(id, { status });
  }

  // Delete internship
  async deleteInternship(id: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockInternships = mockInternships.filter(i => i.id !== id);
        resolve();
      }, 500);
    });
  }

  // Increment views
  async incrementViews(id: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const internship = mockInternships.find(i => i.id === id);
        if (internship) {
          internship.views += 1;
        }
        resolve();
      }, 500);
    });
  }

  // Get internship statistics for owner
  async getInternshipStatistics(ownerId: string): Promise<{
    totalPosted: number;
    totalApplications: number;
    mostAppliedInternship: string;
    shortlistedRatio: number;
    activeInternships: number;
    closedInternships: number;
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const ownerInternships = mockInternships.filter(i => i.companyId === ownerId);
        const ownerApplications = mockApplications.filter(app => 
          ownerInternships.some(internship => internship.id === app.internshipId)
        );
        
        const mostApplied = ownerInternships.reduce((prev, current) => 
          (current.applicants > prev.applicants) ? current : prev
        );
        
        const shortlisted = ownerApplications.filter(app => 
          app.status === 'Shortlisted' || app.status === 'Selected'
        ).length;
        const totalApplications = ownerApplications.length;
        
        resolve({
          totalPosted: ownerInternships.length,
          totalApplications,
          mostAppliedInternship: mostApplied.title,
          shortlistedRatio: totalApplications > 0 ? (shortlisted / totalApplications) * 100 : 0,
          activeInternships: ownerInternships.filter(internship => internship.status === 'Active').length,
          closedInternships: ownerInternships.filter(internship => internship.status === 'Closed').length
        });
      }, 500);
    });
  }
}

// Mock Internship Application Service
export class InternshipApplicationService {
  // Get all applications
  async getAllApplications(): Promise<InternshipApplication[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockApplications]), 500);
    });
  }

  // Get applications by internship
  async getApplicationsByInternship(internshipId: string): Promise<InternshipApplication[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const applications = mockApplications.filter(app => app.internshipId === internshipId);
        resolve(applications);
      }, 500);
    });
  }

  // Get applications by owner (all internships by owner)
  async getApplicationsByOwner(ownerId: string): Promise<InternshipApplication[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const ownerInternships = mockInternships.filter(i => i.companyId === ownerId);
        const internshipIds = ownerInternships.map(internship => internship.id);
        const applications = mockApplications.filter(app => internshipIds.includes(app.internshipId));
        resolve(applications);
      }, 500);
    });
  }

  // Get applications by student
  async getApplicationsByStudent(studentId: string): Promise<InternshipApplication[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const applications = mockApplications.filter(app => app.studentId === studentId);
        resolve(applications);
      }, 500);
    });
  }

  // Create new application
  async createApplication(applicationData: Omit<InternshipApplication, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newApplication: InternshipApplication = {
          ...applicationData,
          id: Date.now().toString(),
          appliedDate: new Date().toISOString(),
          messageHistory: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        mockApplications.push(newApplication);
        
        // Increment applicants count for the internship
        const internship = mockInternships.find(i => i.id === applicationData.internshipId);
        if (internship) {
          internship.applicants += 1;
        }
        
        resolve(newApplication.id!);
      }, 500);
    });
  }

  // Update application status
  async updateApplicationStatus(id: string, status: InternshipApplication['status']): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const application = mockApplications.find(app => app.id === id);
        if (application) {
          application.status = status;
          application.updatedAt = new Date();
        }
        resolve();
      }, 500);
    });
  }

  // Add message to application
  async addMessage(applicationId: string, message: Omit<Message, 'id'>): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const application = mockApplications.find(app => app.id === applicationId);
        if (application) {
          const newMessage: Message = {
            ...message,
            id: Date.now().toString(),
            timestamp: new Date()
          };
          application.messageHistory.push(newMessage);
          application.updatedAt = new Date();
        }
        resolve();
      }, 500);
    });
  }

  // Mark message as read
  async markMessageAsRead(applicationId: string, messageId: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const application = mockApplications.find(app => app.id === applicationId);
        if (application) {
          const message = application.messageHistory.find(msg => msg.id === messageId);
          if (message) {
            message.isRead = true;
          }
        }
        resolve();
      }, 500);
    });
  }

  // Get application by ID
  async getApplicationById(id: string): Promise<InternshipApplication | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const application = mockApplications.find(app => app.id === id);
        resolve(application || null);
      }, 500);
    });
  }
}

// Export singleton instances
export const internshipService = new InternshipService();
export const applicationService = new InternshipApplicationService();

// Example usage:
/*
// Create new internship
const newInternship = await internshipService.createInternship({
  title: "Frontend Developer Intern",
  companyName: "Tech Corp",
  companyId: "owner-uid",
  internshipType: "Remote",
  duration: "3 months",
  location: "Remote",
  numberOfOpenings: 2,
  applicationDeadline: "2024-12-31",
  skillsRequired: ["React", "JavaScript", "HTML", "CSS"],
  stipendOffered: "₹15,000/month",
  description: "Join our team as a frontend developer intern...",
  contactDetails: {
    phone: "9876543210",
    email: "hr@techcorp.com"
  },
  status: "Active"
});

// Get applications for an internship
const applications = await applicationService.getApplicationsByInternship("internship-id");

// Update application status
await applicationService.updateApplicationStatus("application-id", "Shortlisted");

// Add message to application
await applicationService.addMessage("application-id", {
  senderId: "owner-uid",
  senderName: "HR Manager",
  senderType: "owner",
  message: "Your application has been shortlisted!",
  isRead: false
});
*/ 