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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, KeyRound } from "lucide-react";

export const ForgotSecretCodeDialog = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("recover-secret-code", {
        body: { phone: phone.trim() },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Secret code sent!",
          description: "Check your SMS for your secret code",
        });
        setOpen(false);
        setPhone("");
      } else {
        throw new Error(data?.error || "Failed to send SMS");
      }
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            Enter your phone number and we'll send your secret code via SMS
          </DialogDescription>
        </DialogHeader>
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
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Secret Code via SMS"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
