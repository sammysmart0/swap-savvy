import { useState } from "react";
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
import { ForgotSecretCodeDialog } from "@/components/ForgotSecretCodeDialog";
import { 
  Loader2, Search, Edit3, Trash2, Users, Phone, 
  Eye, EyeOff, ArrowLeft, CheckCircle2, AlertCircle, Copy
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SwapRequest {
  id: string;
  name: string;
  phone: string;
  item_type: string;
  have_size: string;
  want_size: string;
  camp: string | null;
  created_at: string;
}

interface Match {
  id: string;
  name: string;
  phone: string;
  have_size: string;
  want_size: string;
  camp: string | null;
}

const ManageRequest = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showSecretCode, setShowSecretCode] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Auth state
  const [phone, setPhone] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Request state
  const [requests, setRequests] = useState<SwapRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<SwapRequest | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<SwapRequest>>({});
  
  // Matches state
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone.trim() || phone.length < 10) {
      toast({ title: "Please enter a valid phone number", variant: "destructive" });
      return;
    }
    if (!secretCode.trim()) {
      toast({ title: "Please enter your secret code", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("swap_requests")
        .select("*")
        .eq("phone", phone.trim())
        .eq("secret_code", secretCode)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({ 
          title: "No requests found", 
          description: "No requests match this phone number and secret code",
          variant: "destructive" 
        });
        return;
      }

      setRequests(data);
      setIsAuthenticated(true);
      toast({ title: `Found ${data.length} request${data.length > 1 ? "s" : ""}!` });
    } catch (error: any) {
      toast({
        title: "Error looking up request",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRequest = (request: SwapRequest) => {
    setSelectedRequest(request);
    setMatches([]);
  };

  const handleBackToList = () => {
    setSelectedRequest(null);
    setMatches([]);
    setIsEditing(false);
  };

  const handleEdit = () => {
    if (!selectedRequest) return;
    setEditData({
      name: selectedRequest.name,
      item_type: selectedRequest.item_type,
      have_size: selectedRequest.have_size,
      want_size: selectedRequest.want_size,
      camp: selectedRequest.camp,
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedRequest || !editData.name || !editData.item_type || !editData.have_size || !editData.want_size) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("swap_requests")
        .update({
          name: editData.name,
          item_type: editData.item_type,
          have_size: editData.have_size,
          want_size: editData.want_size,
          camp: editData.camp === "any" ? null : editData.camp || null,
        })
        .eq("id", selectedRequest.id);

      if (error) throw error;

      const updatedRequest = {
        ...selectedRequest,
        name: editData.name!,
        item_type: editData.item_type!,
        have_size: editData.have_size!,
        want_size: editData.want_size!,
        camp: editData.camp === "any" ? null : editData.camp || null,
      };
      setSelectedRequest(updatedRequest);
      setRequests(requests.map(r => r.id === updatedRequest.id ? updatedRequest : r));
      setIsEditing(false);
      setMatches([]);
      toast({ title: "Request updated successfully!" });
    } catch (error: any) {
      toast({
        title: "Error updating request",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRequest) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("swap_requests")
        .delete()
        .eq("id", selectedRequest.id);

      if (error) throw error;

      const remainingRequests = requests.filter(r => r.id !== selectedRequest.id);
      setRequests(remainingRequests);
      setSelectedRequest(null);
      setMatches([]);
      setShowDeleteDialog(false);
      
      if (remainingRequests.length === 0) {
        setIsAuthenticated(false);
        setPhone("");
        setSecretCode("");
      }
      
      toast({ title: "Request deleted successfully!" });
    } catch (error: any) {
      toast({
        title: "Error deleting request",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindMatches = async () => {
    if (!selectedRequest) return;

    setIsLoadingMatches(true);

    try {
      // Find matches where:
      // - Same item_type
      // - Their have_size = my want_size
      // - Their want_size = my have_size
      // - Not the same request
      // - Camp rule: both have camp -> must match, otherwise allow
      
      let query = supabase
        .from("swap_requests")
        .select("id, name, phone, have_size, want_size, camp")
        .eq("item_type", selectedRequest.item_type)
        .eq("have_size", selectedRequest.want_size)
        .eq("want_size", selectedRequest.have_size)
        .neq("id", selectedRequest.id);

      const { data, error } = await query;

      if (error) throw error;

      // Filter by camp rule
      const filteredMatches = (data || []).filter((match) => {
        // If current user has a camp and match has a camp, they must be the same
        if (selectedRequest.camp && match.camp) {
          return selectedRequest.camp === match.camp;
        }
        // Otherwise, match is allowed
        return true;
      });

      setMatches(filteredMatches);
      
      if (filteredMatches.length === 0) {
        toast({ 
          title: "No matches found", 
          description: "We'll keep looking! Check back later.",
        });
      } else {
        toast({ 
          title: `Found ${filteredMatches.length} match${filteredMatches.length > 1 ? "es" : ""}!`,
          description: "Contact them to arrange your swap.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error finding matches",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMatches(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setRequests([]);
    setSelectedRequest(null);
    setPhone("");
    setSecretCode("");
    setMatches([]);
    setIsEditing(false);
  };

  const sizeOptions = editData.item_type ? getSizesForItem(editData.item_type) : [];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex-1 container py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Manage Your Request
            </h1>
            <p className="text-muted-foreground">
              {isAuthenticated 
                ? "View, edit, delete your request or find matches"
                : "Enter your phone number and secret code to access your request"
              }
            </p>
          </div>

          {!isAuthenticated ? (
            /* Login Form */
            <Card variant="elevated" className="animate-slide-up">
              <CardHeader>
                <CardTitle>Access Your Requests</CardTitle>
                <CardDescription>
                  Enter the phone number and secret code you used when creating your requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLookup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="e.g., 08012345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secretCode">Secret Code</Label>
                    <div className="relative">
                      <Input
                        id="secretCode"
                        type={showSecretCode ? "text" : "password"}
                        placeholder="Enter your secret code"
                        value={secretCode}
                        onChange={(e) => setSecretCode(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowSecretCode(!showSecretCode)}
                      >
                        {showSecretCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Looking up...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Find My Requests
                      </>
                    )}
                  </Button>
                  
                  <div className="text-center">
                    <ForgotSecretCodeDialog />
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : isAuthenticated && !selectedRequest ? (
            /* Requests List */
            <div className="space-y-6 animate-slide-up">
              <Card variant="elevated">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle>Your Swap Requests ({requests.length})</CardTitle>
                    <CardDescription>
                      Select a request to view details, edit, delete, or find matches
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {requests.map((req) => (
                    <Card 
                      key={req.id} 
                      variant="interactive" 
                      className="cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => handleSelectRequest(req)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="font-semibold text-foreground">
                              {getItemLabel(req.item_type)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {getCampLabel(req.camp || "")}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                            <span className="text-sm font-medium text-destructive">{req.have_size}</span>
                            <span className="text-muted-foreground">→</span>
                            <span className="text-sm font-medium text-success">{req.want_size}</span>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Created {new Date(req.created_at).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : selectedRequest && !isEditing ? (
            /* Request Details View */
            <div className="space-y-6 animate-slide-up">
              <Card variant="elevated">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle>Swap Request Details</CardTitle>
                    <CardDescription>
                      Created on {new Date(selectedRequest.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={requests.length > 1 ? handleBackToList : handleLogout}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {requests.length > 1 ? "Back to List" : "Logout"}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Name</div>
                      <div className="font-medium">{selectedRequest.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div className="font-medium">{selectedRequest.phone}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Item</div>
                      <div className="font-medium">{getItemLabel(selectedRequest.item_type)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Camp</div>
                      <div className="font-medium">{getCampLabel(selectedRequest.camp || "")}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                        <div className="flex-1 text-center">
                          <div className="text-xs text-muted-foreground mb-1">I HAVE</div>
                          <div className="text-lg font-bold text-destructive">{selectedRequest.have_size}</div>
                        </div>
                        <div className="text-2xl text-muted-foreground">→</div>
                        <div className="flex-1 text-center">
                          <div className="text-xs text-muted-foreground mb-1">I WANT</div>
                          <div className="text-lg font-bold text-success">{selectedRequest.want_size}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleEdit} variant="outline" className="flex-1">
                      <Edit3 className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button onClick={() => setShowDeleteDialog(true)} variant="destructive" className="flex-1">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Find Matches Section */}
              <Card variant="gradient">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Find Matches
                  </CardTitle>
                  <CardDescription>
                    Search for corps members who have what you need and want what you have
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleFindMatches} 
                    variant="hero" 
                    className="w-full"
                    disabled={isLoadingMatches}
                  >
                    {isLoadingMatches ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Find Matches Now
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Matches List */}
              {matches.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-display font-bold text-xl text-foreground">
                    Matches Found ({matches.length})
                  </h3>
                {matches.map((match) => {
                  const handleCopyPhone = async () => {
                    try {
                      await navigator.clipboard.writeText(match.phone);
                      toast({ title: "Copied!", description: "Phone number copied to clipboard" });
                    } catch (err) {
                      toast({ title: "Failed to copy", variant: "destructive" });
                    }
                  };
                  
                  return (
                    <Card key={match.id} variant="interactive">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="font-semibold text-foreground">{match.name}</div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{match.phone}</span>
                              <button 
                                onClick={handleCopyPhone}
                                className="p-1 rounded hover:bg-muted transition-colors"
                                title="Copy phone number"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {match.camp ? getCampLabel(match.camp) : "Any Camp"}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-success/10 rounded-lg">
                            <CheckCircle2 className="h-4 w-4 text-success" />
                            <span className="text-sm font-medium text-success">Perfect Match</span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-border flex items-center gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">They have:</span>{" "}
                            <span className="font-medium">{match.have_size}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">They want:</span>{" "}
                            <span className="font-medium">{match.want_size}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
                }
                </div>
              )}
            </div>
          ) : selectedRequest && isEditing ? (
            /* Edit Form */
            <Card variant="elevated" className="animate-slide-up">
              <CardHeader>
                <CardTitle>Edit Request</CardTitle>
                <CardDescription>
                  Update your swap request details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="editName">Name</Label>
                    <Input
                      id="editName"
                      value={editData.name || ""}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Item Type</Label>
                    <Select 
                      value={editData.item_type || ""} 
                      onValueChange={(v) => setEditData({ 
                        ...editData, 
                        item_type: v,
                        have_size: "",
                        want_size: ""
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
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

                  {editData.item_type && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Size You HAVE</Label>
                        <Select 
                          value={editData.have_size || ""} 
                          onValueChange={(v) => setEditData({ ...editData, have_size: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
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
                        <Select 
                          value={editData.want_size || ""} 
                          onValueChange={(v) => setEditData({ ...editData, want_size: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
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

                  <div className="space-y-2">
                    <Label>Camp</Label>
                    <Select 
                      value={editData.camp || ""} 
                      onValueChange={(v) => setEditData({ ...editData, camp: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {NYSC_CAMPS.map((camp) => (
                          <SelectItem key={camp.value || "any"} value={camp.value}>
                            {camp.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="button" 
                      onClick={() => setIsEditing(false)} 
                      variant="outline" 
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="button" 
                      onClick={handleSaveEdit} 
                      className="flex-1"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </main>
      
      <Footer />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Delete Request?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Your swap request will be permanently deleted
              and you'll no longer appear in matching results.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageRequest;
