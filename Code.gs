/**
 * =========================================================================
 * TECHMIYA CAMPUS JOB DRIVE 2026 - GOOGLE APPS SCRIPT BACKEND (Code.gs)
 * =========================================================================
 * 
 * Instructions to Deploy:
 * 1. Open Google Sheets (create a new spreadsheet named "Job Drive 2026 Registrations").
 * 2. Click "Extensions" > "Apps Script".
 * 3. Replace all contents in Code.gs with this file.
 * 4. (Optional) Set FOLDER_ID if you want resumes stored in a specific Drive folder.
 * 5. Click "Deploy" > "New deployment".
 * 6. Select Type: "Web app".
 * 7. Set:
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (CRITICAL: MUST BE "Anyone" to allow web registration)
 * 8. Click "Deploy", authorize permissions, and copy the Web App URL.
 * 9. Paste the Web App URL into the Techmiya Portal settings or .env!
 * =========================================================================
 */

// CONFIGURATION (Leave blank to use root Drive folder)
const FOLDER_ID = ""; // e.g. "1a2b3c4d5e6f..." or leave empty for auto-created folder
const DRIVE_FOLDER_NAME = "Techmiya_Job_Drive_2026_Resumes";
const SHEET_NAME = "Registrations";

/**
 * Ensures the target sheet and columns exist with matching headers
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  const headers = [
    "Ticket ID",
    "Full Name",
    "Email Address",
    "Phone Number",
    "Placement Drive",
    "Degree / Stream",
    "Passing Year",
    "Techmiya Student?",
    "Student ID / Batch",
    "Discovery Source",
    "Employment Status",
    "Current Role / Company",
    "Resume Drive URL",
    "Resume File Name",
    "Attendance Status",
    "Registration Timestamp"
  ];

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#1e3a8a").setFontColor("#ffffff");
    sheet.setFrozenRows(1);
  } else {
    // If old mismatched headers exist, auto-align row 1 with current schema
    const firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    if (firstRow[4] === "College / Institution" || firstRow[7] === "CGPA / %") {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#1e3a8a").setFontColor("#ffffff");
    }
  }
  return sheet;
}

/**
 * Gets or creates dedicated Drive folder for student resumes
 */
function getResumeFolder() {
  if (FOLDER_ID && FOLDER_ID.trim() !== "") {
    try {
      return DriveApp.getFolderById(FOLDER_ID.trim());
    } catch (e) {
      Logger.log("Specified folder ID not found, falling back to root folder");
    }
  }

  const folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(DRIVE_FOLDER_NAME);
}

/**
 * Saves Base64 uploaded resume into Google Drive and returns viewable link
 */
function saveResumeToDrive(base64Data, fileName, regId) {
  try {
    if (!base64Data || !fileName) return "N/A";
    const folder = getResumeFolder();

    let cleanBase64 = base64Data;
    let contentType = "application/pdf";

    if (base64Data.indexOf(",") > -1) {
      const parts = base64Data.split(",");
      const meta = parts[0];
      cleanBase64 = parts[1];
      const match = meta.match(/data:(.*?);base64/);
      if (match && match[1]) {
        contentType = match[1];
      }
    }

    const decoded = Utilities.base64Decode(cleanBase64);
    const safeFileName = `${regId}_${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const blob = Utilities.newBlob(decoded, contentType, safeFileName);
    const file = folder.createFile(blob);
    
    // Set file sharing to anyone with link viewable
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (err) {
    Logger.log("Resume save error: " + err.toString());
    return "Upload failed: " + err.toString();
  }
}

/**
 * Handle HTTP GET Requests (Verification, Attendance, Status query, List)
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "verify";
    const regId = (e && e.parameter && e.parameter.id) ? e.parameter.id.trim() : "";

    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return createJsonResponse({ success: false, error: "No records found in database" });
    }

    const headers = data[0];
    const idColIdx = 0;           // Ticket / Registration ID
    const attendanceColIdx = 14;  // Attendance Status (col 15, 0-indexed: 14)

    // ACTION: LIST ALL (For Admin / Recruiter Overview)
    if (action === "list") {
      const candidates = [];
      for (let r = 1; r < data.length; r++) {
        const row = data[r];
        candidates.push({
          id: row[0],
          fullName: row[1],
          email: row[2],
          phone: row[3],
          driveName: row[4],
          degree: row[5],
          passingYear: row[6],
          isTechmiyaStudent: row[7],
          studentId: row[8],
          discoverySource: row[9],
          employmentStatus: row[10],
          currentRole: row[11],
          resumeUrl: row[12],
          resumeFileName: row[13],
          attendance: row[14] || "Confirmed",
          registeredAt: row[15] ? row[15].toString() : null,
        });
      }
      return createJsonResponse({ success: true, count: candidates.length, candidates: candidates });
    }

    // Must provide ID for verify or markAttendance
    if (!regId) {
      return createJsonResponse({ success: false, error: "Missing Registration ID" });
    }

    let foundRowIndex = -1;
    let candidateData = null;

    for (let i = 1; i < data.length; i++) {
      if (data[i][idColIdx] && data[i][idColIdx].toString().trim().toUpperCase() === regId.toUpperCase()) {
        foundRowIndex = i + 1; // 1-indexed for Sheet APIs
        candidateData = {
          id: data[i][0],
          fullName: data[i][1],
          email: data[i][2],
          phone: data[i][3],
          driveName: data[i][4],
          degree: data[i][5],
          passingYear: data[i][6],
          isTechmiyaStudent: data[i][7],
          studentId: data[i][8],
          discoverySource: data[i][9],
          employmentStatus: data[i][10],
          currentRole: data[i][11],
          resumeUrl: data[i][12],
          resumeFileName: data[i][13],
          attendance: data[i][14] || "Confirmed",
          registeredAt: data[i][15] ? data[i][15].toString() : null,
        };
        break;
      }
    }

    if (foundRowIndex === -1) {
      return createJsonResponse({ success: false, error: `Candidate with ID "${regId}" not found` });
    }

    // ACTION: MARK ATTENDANCE
    if (action === "markAttendance") {
      sheet.getRange(foundRowIndex, attendanceColIdx + 1).setValue("Present");
      candidateData.attendance = "Present";

      return createJsonResponse({
        success: true,
        message: "Attendance marked successfully! Candidate is verified.",
        candidate: candidateData
      });
    }

    // ACTION: VERIFY (Read only)
    return createJsonResponse({
      success: true,
      candidate: candidateData
    });

  } catch (err) {
    return createJsonResponse({ success: false, error: "Server error: " + err.toString() });
  }
}

/**
 * Handle HTTP POST Requests (Student Registration)
 */
function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    const action = payload.action || "register";
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();

    if (action === "register") {
      const regId = (payload.ticket_id || payload.id || payload.ticketId || ("TMI-2026-" + Utilities.getUuid().substring(0, 8).toUpperCase())).trim();
      const fullName = (payload.full_name || payload.fullName || "").trim();
      const email = (payload.email || "").trim().toLowerCase();
      const phone = (payload.phone || "").trim();
      const driveName = (payload.drive_name || payload.driveName || "Techmiya Campus Placement Drive 2026").trim();
      const degree = (payload.degree || payload.degreeBranch || "").trim();
      const passingYear = (payload.passing_year || payload.passingYear || "").toString().trim();
      const isTechmiyaStudent = payload.is_techmiya_student ? "Yes" : "No";
      const techmiyaId = payload.techmiya_student_id || payload.course_batch || "";
      const discoverySource = payload.discovery_source || payload.discovery_source_other || "";
      const isWorking = payload.is_working ? "Working" : "Student / Fresher";
      const currentRole = (payload.job_role || "") + (payload.current_company ? " at " + payload.current_company : "");

      if (!fullName || !email || !phone) {
        return createJsonResponse({ success: false, error: "Name, email, and phone are required" });
      }

      // Check duplicates by email or phone
      for (let r = 1; r < data.length; r++) {
        const existingEmail = (data[r][2] || "").toString().trim().toLowerCase();
        const existingPhone = (data[r][3] || "").toString().trim();
        if (existingEmail === email) {
          return createJsonResponse({
            success: false,
            error: `Email ${email} is already registered with ID: ${data[r][0]}`
          });
        }
        if (existingPhone === phone) {
          return createJsonResponse({
            success: false,
            error: `Phone number ${phone} is already registered with ID: ${data[r][0]}`
          });
        }
      }

      // Upload resume to Google Drive if provided
      let resumeDriveUrl = "Not Provided";
      let resumeName = payload.resume ? (payload.resume.fileName || payload.resume_file_name) : (payload.resume_file_name || "");
      const resumeBase64 = payload.resume ? payload.resume.base64Data : (payload.resume_base64 || null);
      if (resumeBase64) {
        resumeDriveUrl = saveResumeToDrive(resumeBase64, resumeName || "Resume.pdf", regId);
      }

      const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

      // Append row to Google Sheet
      sheet.appendRow([
        regId,
        fullName,
        email,
        phone,
        driveName,
        degree,
        passingYear,
        isTechmiyaStudent,
        techmiyaId,
        discoverySource,
        isWorking,
        currentRole,
        resumeDriveUrl,
        resumeName,
        "Confirmed",   // Status
        timestamp      // Registration timestamp
      ]);

      // Attempt to send email confirmation directly from Techmiya EdTech account
      try {
        MailApp.sendEmail({
          to: email,
          name: "Techmiya EdTech Placement Cell",
          subject: `Techmiya Placement Drive 2026 - Registration Confirmed (${regId})`,
          htmlBody: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background: #ffffff;">
              <div style="background: #060b13; padding: 24px 30px; text-align: center; border-bottom: 3px solid #f59e0b;">
                <h1 style="color: #f59e0b; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Techmiya Ed-Tech</h1>
                <p style="color: #94a3b8; margin: 4px 0 0; font-size: 13px;">Official Placement Drive & Career Gateway</p>
              </div>

              <div style="padding: 30px;">
                <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Registration Confirmed!</h2>
                <p style="font-size: 14px; color: #475569; line-height: 1.6;">
                  Dear <strong>${fullName}</strong>,<br/>
                  Thank you for registering for <strong>${driveName}</strong>. Your application has been recorded in the candidate roster.
                </p>

                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0;">
                  <p style="margin: 6px 0; font-size: 13px;"><strong>Ticket / Admit ID:</strong> <span style="font-family: monospace; font-size: 15px; color: #2563eb; font-weight: bold; background: #eff6ff; padding: 2px 8px; border-radius: 6px;">${regId}</span></p>
                  <p style="margin: 6px 0; font-size: 13px;"><strong>Degree / Stream:</strong> ${degree}</p>
                  <p style="margin: 6px 0; font-size: 13px;"><strong>Batch:</strong> Class of ${passingYear}</p>
                  <p style="margin: 6px 0; font-size: 13px;"><strong>Registered Phone:</strong> ${phone}</p>
                  <p style="margin: 6px 0; font-size: 13px;"><strong>Registration Time:</strong> ${timestamp}</p>
                </div>

                <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 14px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
                  <p style="margin: 0; font-size: 13px; color: #1e40af; line-height: 1.5;">
                    <strong>Next Steps:</strong> Please keep this Ticket ID handy. You can view, download, or print your digital QR entry pass anytime on the portal using your Ticket ID.
                  </p>
                </div>

                <p style="font-size: 13px; color: #64748b; margin-bottom: 4px;">For any queries or drive assistance, contact:</p>
                <p style="font-size: 13px; color: #334155; margin: 0; font-weight: 500;">
                  Email: <a href="mailto:hr@techmiyaedtech.com" style="color: #2563eb;">hr@techmiyaedtech.com</a> | Helpline: +91 6363760275
                </p>
              </div>

              <div style="background: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
                &copy; 2026 Techmiya Ed-Tech, Jayanagar 9th Block, Bangalore. All rights reserved.
              </div>
            </div>
          `
        });
      } catch (mailErr) {
        Logger.log("Email notification error: " + mailErr.toString());
      }

      return createJsonResponse({
        success: true,
        message: "Registration successful!",
        id: regId,
        resumeUrl: resumeDriveUrl
      });
    }

    return createJsonResponse({ success: false, error: "Invalid action" });
  } catch (err) {
    return createJsonResponse({ success: false, error: "Server error: " + err.toString() });
  }
}

/**
 * Creates formatted JSON output with CORS headers
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
