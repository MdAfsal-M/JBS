import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { DateOfBirth } from "@/components/ui/date-of-birth";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StudentRegister = () => {
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const { studentRegister, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    dob: undefined as Date | undefined,
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    city: "",
    education: "",
    hasExperience: false,
    experienceYears: "",
    companyName: "",
    skills: [] as string[],
    resume: null as File | null,
    portfolio: "",
    bio: "",
    phone: "",
    address: ""
  });

  const skillsList = [
    "JavaScript", "Python", "React", "Node.js", "Java", "C++", "HTML/CSS",
    "Graphic Design", "Digital Marketing", "Content Writing", "Data Analysis",
    "Excel", "Communication", "Leadership", "Project Management", "Sales",
    "Customer Service", "Social Media", "Photography", "Video Editing"
  ];

  const handleSkillChange = (skill: string, checked: boolean) => {
    if (checked) {
      setFormData({...formData, skills: [...formData.skills, skill]});
    } else {
      setFormData({...formData, skills: formData.skills.filter(s => s !== skill)});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced validation
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword || !formData.dob || !formData.gender || !formData.city) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive"
      });
      return;
    }

    if (formData.skills.length === 0) {
      toast({
        title: "Skills Required",
        description: "Please select at least one skill.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Prepare registration data to match backend validation
      const registrationData: any = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        dob: formData.dob ? formData.dob.toISOString().split('T')[0] : undefined,
        gender: formData.gender,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
        education: formData.education,
        institution: formData.companyName || 'N/A',
        graduationYear: formData.experienceYears ? parseInt(formData.experienceYears) : undefined,
        skills: formData.skills,
      };

      // Register student and get redirect path
      const redirectPath = await studentRegister(registrationData);
      
      toast({
        title: "Registration Successful!",
        description: "Welcome to JBS Platform. Redirecting to your dashboard..."
      });
      
      // Navigate to the appropriate dashboard
      if (redirectPath) {
        navigate(redirectPath);
      } else {
        navigate("/student-dashboard");
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again later.';
      
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 409:
            errorMessage = data.message || 'Email already registered';
            break;
          case 400:
            errorMessage = data.message || 'Invalid data provided';
            break;
          case 500:
            if (data.code === 'JWT_CONFIG_ERROR') {
              errorMessage = 'Server configuration error. Please contact administrator.';
            } else if (data.code === 'JWT_GENERATION_ERROR') {
              errorMessage = 'Authentication service error. Please try again later.';
            } else {
              errorMessage = data.message || 'Server error. Please try again later.';
            }
            break;
          default:
            errorMessage = data.message || `Error ${status}: ${data.message}`;
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Check your connection.';
      } else {
        errorMessage = error.message || 'An unexpected error occurred.';
      }
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{t("studentRegistration")}</CardTitle>
              {/* Language Switcher */}
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-32">
                  <SelectValue>{language === 'en' ? 'English' : language === 'hi' ? 'हिन्दी' : 'தமிழ்'}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिन्दी</SelectItem>
                  <SelectItem value="ta">தமிழ்</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-muted-foreground text-sm">{t("studentRegistrationDesc")}</p>
          </CardHeader>
          <CardContent>
            <form className="space-y-8" onSubmit={handleSubmit}>
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">{t("personalInformation")}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">{t("fullName")} *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      placeholder={t("enterFullName")}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">{t("email")} *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder={t("enterEmail")}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">{t("password")} *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder={t("enterPassword")}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword">{t("confirmPassword")} *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      placeholder={t("confirmPassword")}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <DateOfBirth
                      value={formData.dob}
                      onChange={(date) => setFormData({...formData, dob: date})}
                      label={t("dateOfBirth")}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="gender">{t("gender")} *</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectGender")}/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">{t("male")}</SelectItem>
                        <SelectItem value="female">{t("female")}</SelectItem>
                        <SelectItem value="other">{t("other")}</SelectItem>
                        <SelectItem value="prefer-not-to-say">{t("preferNotToSay")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">{t("phoneNumber")}</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder={t("enterPhoneNumber")}
                    />
                  </div>

                  <div>
                    <Label htmlFor="city">{t("city")} *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      placeholder={t("enterCity")}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">{t("address")}</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder={t("enterAddress")}
                    rows={3}
                  />
                </div>
              </div>

              {/* Education Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">{t("educationInformation")}</h3>
                
                <div>
                  <Label htmlFor="education">{t("educationLevel")} *</Label>
                  <Select value={formData.education} onValueChange={(value) => setFormData({...formData, education: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectEducationLevel")}/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12th-pass">{t("12thPass")}</SelectItem>
                      <SelectItem value="undergraduate">{t("undergraduate")}</SelectItem>
                      <SelectItem value="graduate">{t("graduate")}</SelectItem>
                      <SelectItem value="postgraduate">{t("postGraduate")}</SelectItem>
                      <SelectItem value="diploma">{t("diploma")}</SelectItem>
                      <SelectItem value="certificate">{t("certificateCourse")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="bio">{t("bioAboutYourself")}</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder={t("bioPlaceholder")}
                    rows={4}
                  />
                </div>
              </div>

              {/* Experience */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">{t("experience")}</h3>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasExperience"
                    checked={formData.hasExperience}
                    onCheckedChange={(checked) => setFormData({...formData, hasExperience: !!checked})}
                  />
                  <Label htmlFor="hasExperience">{t("iHaveWorkExperience")}</Label>
                </div>

                {formData.hasExperience && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="experienceYears">{t("yearsOfExperience")}</Label>
                      <Select value={formData.experienceYears} onValueChange={(value) => setFormData({...formData, experienceYears: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("selectYears")}/>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-1">{t("lessThan1Year")}</SelectItem>
                          <SelectItem value="1-2">1-2 {t("years")}</SelectItem>
                          <SelectItem value="2-3">2-3 {t("years")}</SelectItem>
                          <SelectItem value="3+">3+ {t("years")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="companyName">{t("companyName")}</Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                        placeholder={t("previousCurrentCompany")}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Skills */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">{t("skills")} *</h3>
                <p className="text-sm text-muted-foreground">{t("selectSkillsDesc")}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {skillsList.map((skill) => (
                    <div key={skill} className="flex items-center space-x-2">
                      <Checkbox
                        id={skill}
                        checked={formData.skills.includes(skill)}
                        onCheckedChange={(checked) => handleSkillChange(skill, !!checked)}
                      />
                      <Label htmlFor={skill} className="text-sm">{t(skill)}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">{t("additionalInformation")}</h3>
                
                <div>
                  <Label htmlFor="portfolio">{t("portfolioLinkedinUrl")}</Label>
                  <Input
                    id="portfolio"
                    value={formData.portfolio}
                    onChange={(e) => setFormData({...formData, portfolio: e.target.value})}
                    placeholder={t("portfolioPlaceholder")}
                  />
                </div>

                <div>
                  <Label htmlFor="resume">{t("resumeUpload")}</Label>
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setFormData({...formData, resume: e.target.files?.[0] || null})}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("resumeUploadDesc")}
                  </p>
                </div>
              </div>

              <Button type="submit" className="w-full bg-gradient-primary shadow-glow">
                {t("completeRegistration")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentRegister;