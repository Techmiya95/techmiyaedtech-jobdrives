import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "RESEND_API_KEY environment variable is not set." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const {
      email,
      student_name,
      ticket_id,
      drive_name,
      event_date,
      event_location,
      token,
    } = await req.json();

    const formattedDate = event_date ? new Date(event_date).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }) : "Drive Day";

    const formattedTime = event_date ? new Date(event_date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    }) : "09:00 AM Sharp";

    const appUrl = Deno.env.get("APP_URL") || "https://drive.techmiyaedtech.com";
    const ticketUrl = `${appUrl}/#/ticket/${ticket_id}`;
    const verifyUrl = `${appUrl}/#/verify/${token}`;

    const subject = `Registration Confirmed – ${drive_name} | Techmiya EdTech`;

    const htmlBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            <div style="background: linear-gradient(135deg, #0f172a, #1e1b4b); padding: 32px 24px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">TECHMIYA EDTECH</h1>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #94a3b8;">Official Placement &amp; Career Drive Portal</p>
            </div>
            
            <div style="padding: 32px 24px;">
              <p style="font-size: 16px; line-height: 24px; margin-top: 0;">Dear <strong>${student_name}</strong>,</p>
              
              <p style="font-size: 14px; line-height: 22px; color: #334155;">
                Thank you for registering with <strong>Techmiya EdTech</strong>.<br/>
                Your registration has been successfully confirmed.
              </p>

              <div style="background: #f1f5f9; border-radius: 12px; border-left: 4px solid #4f46e5; padding: 18px 20px; margin: 24px 0;">
                <h3 style="margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #4338ca;">Registration Details:</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                  <tr>
                    <td style="padding: 4px 0; color: #64748b; width: 140px;">Registration ID:</td>
                    <td style="padding: 4px 0; font-family: monospace; font-weight: bold; color: #1e1b4b;">${ticket_id}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #64748b;">Drive:</td>
                    <td style="padding: 4px 0; font-weight: 600; color: #0f172a;">${drive_name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #64748b;">Event Date:</td>
                    <td style="padding: 4px 0; color: #0f172a;">${formattedDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #64748b;">Event Time:</td>
                    <td style="padding: 4px 0; color: #0f172a;">${formattedTime}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #64748b;">Location:</td>
                    <td style="padding: 4px 0; color: #0f172a;">${event_location}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #64748b;">Registration Status:</td>
                    <td style="padding: 4px 0; color: #16a34a; font-weight: bold;">Confirmed</td>
                  </tr>
                </table>
              </div>

              <p style="font-size: 13px; line-height: 20px; color: #475569;">
                Your QR ticket is available through the portal. Please save this email and present your digital or printed QR code at the event for verification.
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${ticketUrl}" style="display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">
                  View My Ticket
                </a>
              </div>

              <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 10px; padding: 14px; margin-top: 24px; font-size: 12px; color: #92400e; line-height: 18px;">
                <strong>Notice:</strong> Please note that registration confirmation does not automatically guarantee selection, shortlisting, or employment. Additional eligibility criteria may apply.
              </div>

              <p style="font-size: 12px; color: #64748b; margin-top: 24px; line-height: 18px;">
                For assistance, contact <a href="mailto:support@techmiyaedtech.com" style="color: #4f46e5;">support@techmiyaedtech.com</a>.
              </p>

              <p style="font-size: 13px; color: #334155; margin-top: 24px;">
                Best regards,<br/>
                <strong>Techmiya EdTech Team</strong>
              </p>
            </div>
            
            <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center; font-size: 11px; color: #94a3b8;">
              &copy; ${new Date().getFullYear()} Techmiya EdTech. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `;

    const textBody = `
Dear ${student_name},

Thank you for registering with Techmiya EdTech.
Your registration has been successfully confirmed.

Registration Details:
- Registration ID: ${ticket_id}
- Drive: ${drive_name}
- Event Date: ${formattedDate}
- Event Time: ${formattedTime}
- Location: ${event_location}
- Registration Status: Confirmed

View your ticket online: ${ticketUrl}

Your QR ticket is included online. Please save this email and present your QR code at the event for verification.

Please note that registration confirmation does not automatically guarantee selection, shortlisting, or employment. Additional eligibility criteria may apply.

For assistance, contact support@techmiyaedtech.com.

Best regards,
Techmiya EdTech Team
    `;

    // Dispatch via Resend API
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Techmiya Drives <noreply@techmiyaedtech.com>",
        to: [email],
        subject,
        html: htmlBody,
        text: textBody,
      }),
    });

    const resendData = await resendRes.json();

    return new Response(
      JSON.stringify({ success: resendRes.ok, data: resendData }),
      { status: resendRes.ok ? 200 : 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
