import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RecoveryRequest {
  phone: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone }: RecoveryRequest = await req.json();

    if (!phone || phone.length < 10) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid phone number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Look up user by phone number
    const { data: requests, error: dbError } = await supabase
      .from("swap_requests")
      .select("secret_code, name")
      .eq("phone", phone)
      .limit(1);

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Database lookup failed");
    }

    if (!requests || requests.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "No account found with this phone number" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const secretCode = requests[0].secret_code;
    const userName = requests[0].name;

    // Send SMS via Termii
    const termiiApiKey = Deno.env.get("TERMII_API_KEY");
    if (!termiiApiKey) {
      console.error("TERMII_API_KEY not configured");
      throw new Error("SMS service not configured");
    }

    const smsResponse = await fetch("https://api.ng.termii.com/api/sms/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: phone,
        from: "NYSC-Swap",
        sms: `Hi ${userName}! Your SwapSavvy secret code is: ${secretCode}`,
        type: "plain",
        channel: "dnd",
        api_key: termiiApiKey,
      }),
    });

    const smsData = await smsResponse.json();
    console.log("Termii response:", smsData);

    if (!smsResponse.ok || smsData.code !== "ok") {
      console.error("Termii error:", smsData);
      throw new Error("Failed to send SMS");
    }

    return new Response(
      JSON.stringify({ success: true, message: "Secret code sent via SMS" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in recover-secret-code function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
