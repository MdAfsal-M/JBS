import { useState } from "react";
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
import { useLanguage } from "@/hooks/useLanguage";

const OwnerRegister = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [formData, setFormData] = useState({
    ownerName: "",
    dob: undefined as Date | undefined,
    email: "",
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
    
    // Validation
    if (!formData.ownerName || !formData.email || !formData.dob || !formData.companyName) {
      toast({
        title: t("Missing Information"),
        description: t("Please fill in all required fields."),
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

    // Simulate API call
    try {
      // POST /api/owner/register
      console.log("Submitting owner registration:", formData);
      
      toast({
        title: t("Registration Successful!"),
        description: t("Welcome to JBS Platform. Redirecting to your dashboard...")
      });
      
      setTimeout(() => {
        navigate("/owner-dashboard");
      }, 2000);
    } catch (error) {
      toast({
        title: t("Registration Failed"),
        description: t("Please try again later."),
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
                    <Label>{t("Date of Birth")} *</Label>
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
                          {formData.dob ? format(formData.dob, "PPP") : t("Pick a date")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.dob}
                          onSelect={(date) => setFormData({...formData, dob: date})}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1940-01-01")
                          }
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
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