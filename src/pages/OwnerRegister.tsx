import { useState } from "react";
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
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/contexts/AuthContext";
import { uploadAPI } from "@/services/api";

const OwnerRegister = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { ownerRegister, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    ownerName: "",
    dob: undefined as Date | undefined,
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    city: "",
    phone: "",
    address: "",
    companyName: "",
    companyLocation: "",
    businessType: "",
    productCategories: [] as string[],
    companySize: "",
    foundedYear: "",
    website: "",
    description: "",
    gstNumber: "",
    panNumber: "",
    businessLicense: null as File | null
  });

  const businessTypes = [
    t("Retail Store"), t("Restaurant/Food Service"), t("Electronics Store"), t("Clothing Store"),
    t("Grocery Store"), t("Pharmacy"), t("Bookstore"), t("Hardware Store"), t("Beauty Salon"),
    t("Fitness Center"), t("Educational Institute"), t("Healthcare Service"), t("IT Services"),
    t("Manufacturing"), t("Trading"), t("E-commerce"), t("Consultancy"), t("Other")
  ];

  const productCategoriesList = [
    t("Electronics"), t("Clothing & Fashion"), t("Food & Beverages"), t("Books & Stationery"),
    t("Home & Garden"), t("Sports & Fitness"), t("Beauty & Personal Care"), t("Automotive"),
    t("Toys & Games"), t("Health & Medicine"), t("Jewelry & Accessories"), t("Art & Crafts"),
    t("Music & Instruments"), t("Pet Supplies"), t("Office Supplies"), t("Tools & Hardware")
  ];

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setFormData({...formData, productCategories: [...formData.productCategories, category]});
    } else {
      setFormData({...formData, productCategories: formData.productCategories.filter(c => c !== category)});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced validation
    if (!formData.ownerName || !formData.email || !formData.password || !formData.confirmPassword || !formData.dob || !formData.companyName) {
      toast({
        title: t("Missing Information"),
        description: t("Please fill in all required fields."),
        variant: "destructive"
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: t("Password Mismatch"),
        description: t("Passwords do not match. Please try again."),
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: t("Password Too Short"),
        description: t("Password must be at least 8 characters long."),
        variant: "destructive"
      });
      return;
    }

    if (formData.productCategories.length === 0) {
      toast({
        title: t("Product Categories Required"),
        description: t("Please select at least one product category."),
        variant: "destructive"
      });
      return;
    }

    try {
      // Prepare registration data to match backend validation (flat structure)
      const registrationData: any = {
        ownerName: formData.ownerName,
        email: formData.email,
        password: formData.password,
        dob: formData.dob ? formData.dob.toISOString().split('T')[0] : undefined,
        gender: formData.gender,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
        companyName: formData.companyName,
        companyLocation: formData.companyLocation,
        businessType: formData.businessType,
        productCategories: formData.productCategories,
        companySize: formData.companySize,
        foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : undefined,
        website: formData.website,
        description: formData.description,
        gstNumber: formData.gstNumber,
        panNumber: formData.panNumber,
      };

      // Optional: Upload business license and include URL if backend supports it
      if (formData.businessLicense) {
        try {
          const uploadResponse: any = await uploadAPI.uploadBusinessLicense(formData.businessLicense);
          (registrationData as any).businessLicense = uploadResponse.url;
        } catch (uploadError) {
          console.error('Business license upload failed:', uploadError);
          // Continue without business license
        }
      }

      // Register owner and get redirect path
      const redirectPath = await ownerRegister(registrationData);
      
      toast({
        title: t("Registration Successful!"),
        description: t("Welcome to JBS Platform. Redirecting to your dashboard...")
      });
      
      // Navigate to the appropriate dashboard
      if (redirectPath) {
        navigate(redirectPath);
      } else {
        navigate("/owner-dashboard");
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
        title: t("Registration Failed"),
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Language Switcher - unified and improved */}
        <div className="flex justify-end mb-4">
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
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("back")}
        </Button>

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="text-2xl text-center bg-gradient-secondary bg-clip-text text-transparent">
              {t("Business Owner Registration")}
            </CardTitle>
            <p className="text-center text-muted-foreground">
              {t("Join JBS as a business owner and connect with talented students")}
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-secondary">{t("Personal Information")}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ownerName">{t("Owner Name")} *</Label>
                    <Input
                      id="ownerName"
                      value={formData.ownerName}
                      onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                      placeholder={t("Enter your full name")}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">{t("Email")} *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder={t("Enter your email")}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">{t("Password")} *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder={t("Enter your password")}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword">{t("Confirm Password")} *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      placeholder={t("Confirm your password")}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <DateOfBirth
                      value={formData.dob}
                      onChange={(date) => setFormData({...formData, dob: date})}
                      label={t("Date of Birth")}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="gender">{t("Gender")} *</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("Select gender")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">{t("Male")}</SelectItem>
                        <SelectItem value="female">{t("Female")}</SelectItem>
                        <SelectItem value="other">{t("Other")}</SelectItem>
                        <SelectItem value="prefer-not-to-say">{t("Prefer not to say")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">{t("Phone Number")} *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder={t("Enter your phone number")}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="city">{t("City")} *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      placeholder={t("Enter your city")}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">{t("Address")}</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder={t("Enter your complete address")}
                    rows={3}
                  />
                </div>
              </div>

              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-secondary">{t("Business Information")}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">{t("Company Name")} *</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      placeholder={t("Enter your company name")}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="companyLocation">{t("Company Location")} *</Label>
                    <Input
                      id="companyLocation"
                      value={formData.companyLocation}
                      onChange={(e) => setFormData({...formData, companyLocation: e.target.value})}
                      placeholder={t("Enter company location")}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessType">{t("Business Type")} *</Label>
                    <Select value={formData.businessType} onValueChange={(value) => setFormData({...formData, businessType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("Select business type")} />
                      </SelectTrigger>
                      <SelectContent>
                        {businessTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="companySize">{t("Company Size")}</Label>
                    <Select value={formData.companySize} onValueChange={(value) => setFormData({...formData, companySize: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("Select company size")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">{t("1-10 employees")}</SelectItem>
                        <SelectItem value="11-50">{t("11-50 employees")}</SelectItem>
                        <SelectItem value="51-200">{t("51-200 employees")}</SelectItem>
                        <SelectItem value="200+">{t("200+ employees")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="foundedYear">{t("Founded Year")}</Label>
                    <Input
                      id="foundedYear"
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={formData.foundedYear}
                      onChange={(e) => setFormData({...formData, foundedYear: e.target.value})}
                      placeholder={t("Enter founding year")}
                    />
                  </div>

                  <div>
                    <Label htmlFor="website">{t("Website URL")}</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                      placeholder={t("https://yourcompany.com")}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">{t("Business Description")}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder={t("Describe your business, what you do, and what you're looking for in students...")}
                    rows={4}
                  />
                </div>
              </div>

              {/* Product Categories */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-secondary">{t("Product Categories")} *</h3>
                <p className="text-sm text-muted-foreground">{t("Select all categories that apply to your business")}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {productCategoriesList.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={formData.productCategories.includes(category)}
                        onCheckedChange={(checked) => handleCategoryChange(category, !!checked)}
                      />
                      <Label htmlFor={category} className="text-sm">{category}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-secondary">{t("Legal Information (Optional)")}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gstNumber">{t("GST Number")}</Label>
                    <Input
                      id="gstNumber"
                      value={formData.gstNumber}
                      onChange={(e) => setFormData({...formData, gstNumber: e.target.value})}
                      placeholder={t("Enter GST number")}
                    />
                  </div>

                  <div>
                    <Label htmlFor="panNumber">{t("PAN Number")}</Label>
                    <Input
                      id="panNumber"
                      value={formData.panNumber}
                      onChange={(e) => setFormData({...formData, panNumber: e.target.value})}
                      placeholder={t("Enter PAN number")}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="businessLicense">{t("Business License/Registration Certificate")}</Label>
                  <Input
                    id="businessLicense"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setFormData({...formData, businessLicense: e.target.files?.[0] || null})}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("Upload business license or registration certificate (PDF, JPG, PNG - Max 10MB)")}
                  </p>
                </div>
              </div>

              <Button type="submit" className="w-full bg-gradient-secondary shadow-glow">
                {t("Complete Registration")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OwnerRegister;