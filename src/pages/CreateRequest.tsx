import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ITEM_TYPES, NYSC_CAMPS, getSizesForItem, getItemLabel, getCampLabel } from "@/lib/constants";
import { Loader2, CheckCircle2, Copy, ArrowLeft, Eye, EyeOff } from "lucide-react";

const CreateRequest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showSecretCode, setShowSecretCode] = useState(false);
  const [success, setSuccess] = useState<{ id: string; secretCode: string } | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    itemType: "",
    haveSize: "",
    wantSize: "",
    camp: "",
    secretCode: "",
  });

  const sizeOptions = formData.itemType ? getSizesForItem(formData.itemType) : [];

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      // Reset sizes if item type changes
      if (field === "itemType") {
        newData.haveSize = "";
        newData.wantSize = "";
      }
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast({ title: "Please enter your name", variant: "destructive" });
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      toast({ title: "Please enter a valid phone number", variant: "destructive" });
      return;
    }
    if (!formData.itemType) {
      toast({ title: "Please select an item type", variant: "destructive" });
      return;
    }
    if (!formData.haveSize) {
      toast({ title: "Please select the size you have", variant: "destructive" });
      return;
    }
    if (!formData.wantSize) {
      toast({ title: "Please select the size you want", variant: "destructive" });
      return;
    }
    if (formData.haveSize === formData.wantSize) {
      toast({ title: "You already have the size you want!", variant: "destructive" });
      return;
    }
    if (!formData.secretCode.trim() || formData.secretCode.length < 4) {
      toast({ title: "Secret code must be at least 4 characters", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("swap_requests")
        .insert({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          item_type: formData.itemType,
          have_size: formData.haveSize,
          want_size: formData.wantSize,
          camp: formData.camp === "any" ? null : formData.camp || null,
          secret_code: formData.secretCode,
        })
        .select("id")
        .single();

      if (error) throw error;

      setSuccess({ id: data.id, secretCode: formData.secretCode });
      toast({ 
        title: "Request created successfully!", 
        description: "Save your secret code to manage your request later." 
      });
    } catch (error: any) {
      toast({
        title: "Error creating request",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied to clipboard!` });
  };

  if (success) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 container py-12">
          <Card variant="elevated" className="max-w-lg mx-auto animate-slide-up">
            <CardHeader className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <CardTitle className="text-2xl text-success">Request Created!</CardTitle>
              <CardDescription>
                Your swap request has been submitted successfully. Save the details below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted">
                <div className="text-sm text-muted-foreground mb-1">Request ID</div>
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono">{success.id.slice(0, 8)}...</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(success.id, "Request ID")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <div className="text-sm font-semibold text-warning-foreground mb-1">
                  ⚠️ Important: Save Your Secret Code
                </div>
                <div className="flex items-center justify-between">
                  <code className="text-lg font-mono font-bold">{success.secretCode}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(success.secretCode, "Secret code")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  You'll need your phone number and this code to edit, delete, or find matches for your request.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button onClick={() => navigate("/manage")} variant="hero">
                  Find Matches Now
                </Button>
                <Button onClick={() => navigate("/")} variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex-1 container py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Create Swap Request
            </h1>
            <p className="text-muted-foreground">
              Fill in your details to find someone to swap items with
            </p>
          </div>

          <Card variant="elevated" className="animate-slide-up">
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="e.g., 08012345678"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    This will be shared with your matches so they can contact you
                  </p>
                </div>

                {/* Item Type */}
                <div className="space-y-2">
                  <Label>Item Type</Label>
                  <Select value={formData.itemType} onValueChange={(v) => handleChange("itemType", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select item to swap" />
                    </SelectTrigger>
                    <SelectContent>
                      {ITEM_TYPES.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Size Selection - Only show when item type is selected */}
                {formData.itemType && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Size You HAVE</Label>
                      <Select value={formData.haveSize} onValueChange={(v) => handleChange("haveSize", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          {sizeOptions.map((size) => (
                            <SelectItem key={size.value} value={size.value}>
                              {size.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Size You WANT</Label>
                      <Select value={formData.wantSize} onValueChange={(v) => handleChange("wantSize", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          {sizeOptions.map((size) => (
                            <SelectItem key={size.value} value={size.value}>
                              {size.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Camp */}
                <div className="space-y-2">
                  <Label>Camp (Optional)</Label>
                  <Select value={formData.camp} onValueChange={(v) => handleChange("camp", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select camp or leave for global match" />
                    </SelectTrigger>
                    <SelectContent>
                      {NYSC_CAMPS.map((camp) => (
                        <SelectItem key={camp.value || "any"} value={camp.value}>
                          {camp.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Leave empty to match with corps members from any camp
                  </p>
                </div>

                {/* Secret Code */}
                <div className="space-y-2">
                  <Label htmlFor="secretCode">Secret Code</Label>
                  <div className="relative">
                    <Input
                      id="secretCode"
                      type={showSecretCode ? "text" : "password"}
                      placeholder="Create a secret code (min 4 characters)"
                      value={formData.secretCode}
                      onChange={(e) => handleChange("secretCode", e.target.value)}
                      required
                      minLength={4}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowSecretCode(!showSecretCode)}
                    >
                      {showSecretCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You'll need this to edit or delete your request later
                  </p>
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Swap Request"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CreateRequest;
