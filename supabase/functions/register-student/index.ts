import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generates cryptographically secure ticket ID: TMI-2026-8F3A7C21
function generateTicketId(): string {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0").toUpperCase())
    .join("");
  return `TMI-2026-${hex}`;
}

// Generates random secure token and returns { token, hash }
async function generateVerificationToken(): Promise<{ token: string; hash: string }> {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const token = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  return { token, hash };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const {
      drive_id,
      full_name,
      phone,
      email,
      is_techmiya_student,
      techmiya_student_id,
      course_batch,
      discovery_source,
      discovery_source_other,
      degree,
      degree_other,
      passing_year,
      is_working,
      current_company,
      job_role,
      experience_range,
      resume_object_path,
    } = body;

    // Basic server-side sanity validation
    if (!drive_id || !full_name || !phone || !email || !degree || !passing_year || !resume_object_path) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required registration fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Phone validation (10 digits)
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10 || cleanPhone.length > 13) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid mobile phone number format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ticketId = generateTicketId();
    const { token, hash } = await generateVerificationToken();

    // Call atomic stored procedure
    const { data: result, error: rpcError } = await supabase.rpc("register_student_atomic", {
      p_drive_id: drive_id,
      p_full_name: full_name,
      p_phone: phone,
      p_email: email,
      p_is_techmiya_student: !!is_techmiya_student,
      p_techmiya_student_id: techmiya_student_id || null,
      p_course_batch: course_batch || null,
      p_discovery_source: discovery_source || "Other",
      p_discovery_source_other: discovery_source_other || null,
      p_degree: degree,
      p_degree_other: degree_other || null,
      p_passing_year: passing_year,
      p_is_working: !!is_working,
      p_current_company: current_company || null,
      p_job_role: job_role || null,
      p_experience_range: experience_range || null,
      p_resume_object_path: resume_object_path,
      p_ticket_id: ticketId,
      p_token_hash: hash,
    });

    if (rpcError) {
      throw rpcError;
    }

    if (!result.success) {
      return new Response(
        JSON.stringify({ success: false, error: result.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send confirmation email via Resend Edge Function
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey) {
      try {
        await fetch(`${supabaseUrl}/functions/v1/send-confirmation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            email,
            student_name: full_name,
            ticket_id: ticketId,
            drive_name: result.drive_name,
            event_date: result.event_date,
            event_location: result.event_location,
            token,
          }),
        });
      } catch (err) {
        console.error("Async email dispatch notice:", err);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        registration_id: result.registration_id,
        ticket_id: ticketId,
        verification_token: token,
        drive_name: result.drive_name,
        event_date: result.event_date,
        event_location: result.event_location,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
