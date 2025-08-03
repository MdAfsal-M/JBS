import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const StudentRegister = () => {
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    dob: undefined as Date | undefined,
    email: "",
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
    
    // Validation
    if (!formData.fullName || !formData.email || !formData.dob || !formData.gender || !formData.city) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
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

    // Simulate API call
    try {
      // POST /api/student/register
      console.log("Submitting student registration:", formData);
      
      toast({
        title: "Registration Successful!",
        description: "Welcome to JBS Platform. Redirecting to your dashboard..."
      });
      
      setTimeout(() => {
        navigate("/student-dashboard");
      }, 2000);
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Please try again later.",
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
                    <Label>{t("dateOfBirth")} *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.dob && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.dob ? format(formData.dob, "PPP") : t("pickDate")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.dob}
                          onSelect={(date) => setFormData({...formData, dob: date})}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
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