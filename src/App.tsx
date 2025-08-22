import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/hooks/useLanguage";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import StudentRegister from "./pages/StudentRegister";
import OwnerRegister from "./pages/OwnerRegister";
import StudentDashboard from "./pages/StudentDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import OrderManagement from "./pages/OrderManagement";
import InternshipManagement from "./pages/InternshipManagement";
import StudentInternshipView from "./pages/StudentInternshipView";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import JobDetails from "@/components/JobDetails";
import JobApplicants from "@/components/JobApplicants";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <LanguageProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/student-register" element={<StudentRegister />} />
              <Route path="/owner-register" element={<OwnerRegister />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Protected Owner Routes */}
              <Route 
                path="/owner-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['owner']} redirectTo="/">
                    <OwnerDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/owner/job-details/:id" 
                element={
                  <ProtectedRoute allowedRoles={['owner']} redirectTo="/">
                    <JobDetails />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/owner/job-applicants/:id" 
                element={
                  <ProtectedRoute allowedRoles={['owner']} redirectTo="/">
                    <JobApplicants />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/order-management" 
                element={
                  <ProtectedRoute allowedRoles={['owner']} redirectTo="/">
                    <OrderManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/internship-management" 
                element={
                  <ProtectedRoute allowedRoles={['owner']} redirectTo="/">
                    <InternshipManagement />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected Student Routes */}
              <Route 
                path="/student-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['student']} redirectTo="/">
                    <StudentDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student-internship-view" 
                element={
                  <ProtectedRoute allowedRoles={['student']} redirectTo="/">
                    <StudentInternshipView />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </LanguageProvider>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
