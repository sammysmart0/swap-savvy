import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, KeyRound, Copy, Check } from "lucide-react";
import { SECURITY_QUESTIONS } from "@/lib/constants";

export const ForgotSecretCodeDialog = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recoveredCode, setRecoveredCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone.trim() || phone.length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    if (!securityQuestion) {
      toast({
        title: "Security question required",
        description: "Please select your security question",
        variant: "destructive",
      });
      return;
    }

    if (!securityAnswer.trim()) {
      toast({
        title: "Security answer required",
        description: "Please enter your security answer",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Look up user by phone number and verify security question/answer
      const { data: requests, error } = await supabase
        .from("swap_requests")
        .select("secret_code, security_question, security_answer")
        .eq("phone", phone.trim())
        .limit(1);

      if (error) throw error;

      if (!requests || requests.length === 0) {
        toast({
          title: "No account found",
          description: "No account found with this phone number",
          variant: "destructive",
        });
        return;
      }

      const request = requests[0];

      // Verify security question and answer
      if (request.security_question !== securityQuestion) {
        toast({
          title: "Incorrect security question",
          description: "The security question does not match our records",
          variant: "destructive",
        });
        return;
      }

      if (request.security_answer?.toLowerCase() !== securityAnswer.toLowerCase().trim()) {
        toast({
          title: "Incorrect security answer",
          description: "The security answer does not match our records",
          variant: "destructive",
        });
        return;
      }

      // Show the secret code
      setRecoveredCode(request.secret_code);
      toast({
        title: "Secret code recovered!",
        description: "Your secret code is displayed below",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to recover secret code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (recoveredCode) {
      navigator.clipboard.writeText(recoveredCode);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Secret code copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Reset form when closing
      setPhone("");
      setSecurityQuestion("");
      setSecurityAnswer("");
      setRecoveredCode(null);
      setCopied(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button variant="link" className="px-0 text-sm text-muted-foreground">
          <KeyRound className="mr-1 h-3 w-3" />
          Forgot Secret Code?
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Recover Your Secret Code</DialogTitle>
          <DialogDescription>
            Enter your phone number and security question to recover your secret code
          </DialogDescription>
        </DialogHeader>
        
        {recoveredCode ? (
          <div className="space-y-4">
            <div className="p-4 bg-primary/10 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-2">Your Secret Code:</p>
              <p className="text-2xl font-bold font-mono text-primary">{recoveredCode}</p>
            </div>
            <Button onClick={handleCopy} className="w-full" variant="outline">
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Secret Code
                </>
              )}
            </Button>
            <Button onClick={() => handleClose(false)} className="w-full">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recoveryPhone">Phone Number</Label>
              <Input
                id="recoveryPhone"
                type="tel"
                placeholder="e.g., 08012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="securityQuestion">Security Question</Label>
              <Select value={securityQuestion} onValueChange={setSecurityQuestion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your security question" />
                </SelectTrigger>
                <SelectContent>
                  {SECURITY_QUESTIONS.map((question) => (
                    <SelectItem key={question.value} value={question.value}>
                      {question.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="securityAnswer">Security Answer</Label>
              <Input
                id="securityAnswer"
                type="text"
                placeholder="Enter your answer"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Recover Secret Code"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
