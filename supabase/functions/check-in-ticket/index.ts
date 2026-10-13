import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify authorized organizer from Authorization header or bearer token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized organizer credentials" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { ticket_id, organizer_name } = await req.json();

    if (!ticket_id) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing ticket ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Query ticket
    const { data: registration, error: findError } = await supabase
      .from("registrations")
      .select("id, ticket_id, full_name, drive_id, drives(name)")
      .eq("ticket_id", ticket_id.trim().toUpperCase())
      .single();

    if (findError || !registration) {
      return new Response(
        JSON.stringify({ success: false, error: `Ticket "${ticket_id}" not found` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Query ticket status
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select("*")
      .eq("registration_id", registration.id)
      .single();

    if (ticketError || !ticket) {
      return new Response(
        JSON.stringify({ success: false, error: "Ticket record missing" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (ticket.ticket_status === "checked_in") {
      return new Response(
        JSON.stringify({
          success: false,
          already_checked_in: true,
          checked_in_at: ticket.checked_in_at,
          checked_in_by: ticket.checked_in_by,
          error: `Ticket was already checked in on ${ticket.checked_in_at} by ${ticket.checked_in_by || 'Organizer'}.`,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update ticket to checked_in
    const nowIso = new Date().toISOString();
    const actor = organizer_name || "Organizer Desk";

    await supabase
      .from("tickets")
      .update({
        ticket_status: "checked_in",
        checked_in_at: nowIso,
        checked_in_by: actor,
      })
      .eq("id", ticket.id);

    // Audit log
    await supabase.from("audit_logs").insert({
      actor,
      action: "TICKET_CHECKED_IN",
      target_type: "TICKET",
      target_id: ticket.id,
      metadata: { ticket_id, candidate: registration.full_name },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Check-in successful",
        candidate_name: registration.full_name,
        ticket_id,
        checked_in_at: nowIso,
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
