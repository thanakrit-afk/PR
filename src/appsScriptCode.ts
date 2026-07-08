export const APPS_SCRIPT_CODE = `/**
 * Google Apps Script for Student Home Visit System (ระบบเยี่ยมบ้านนักเรียนนักศึกษา)
 * 
 * Instructions:
 * 1. Open your Google Sheet.
 * 2. Click Extensions > Apps Script.
 * 3. Delete any default code and paste this script.
 * 4. Click Save (Disk icon).
 * 5. Click "Deploy" > "New deployment".
 * 6. Click the gear icon next to "Select type" and select "Web app".
 * 7. Change "Execute as" to "Me (your email)".
 * 8. Change "Who has access" to "Anyone".
 * 9. Click "Deploy". Authorize permissions if prompted.
 * 10. Copy the "Web app URL" and paste it in the application's connection panel.
 */

// Configure Sheet names
const SHEET_STUDENTS = "Students";
const SHEET_VISITS = "HomeVisits";

function doGet(e) {
  try {
    const sheet = initSpreadsheet();
    const studentsSheet = sheet.getSheetByName(SHEET_STUDENTS);
    const visitsSheet = sheet.getSheetByName(SHEET_VISITS);
    
    // Read students
    const studentData = readSheetData(studentsSheet);
    // Read visits
    const visitData = readSheetData(visitsSheet);
    
    // Merge visits into student objects
    const mergedStudents = studentData.map(student => {
      const visit = visitData.find(v => v.id === student.id || v.studentId === student.id);
      if (visit) {
        student.visitStatus = "เยี่ยมแล้ว";
        student.visitData = {
          visitDate: visit.visitDate || "",
          travelInfo: visit.travelInfo || "",
          latitude: Number(visit.latitude) || null,
          longitude: Number(visit.longitude) || null,
          houseCondition: visit.houseCondition || "",
          houseOwnership: visit.houseOwnership || "",
          familyStatus: visit.familyStatus || "",
          relationshipScale: Number(visit.relationshipScale) || 3,
          averageMonthlyIncome: Number(visit.averageMonthlyIncome) || 0,
          debtStatus: visit.debtStatus || "",
          risks: {
            academic: visit.riskAcademic === "true" || visit.riskAcademic === true,
            substance: visit.riskSubstance === "true" || visit.riskSubstance === true,
            gaming: visit.riskGaming === "true" || visit.riskGaming === true,
            relationship: visit.riskRelationship === "true" || visit.riskRelationship === true,
            financial: visit.riskFinancial === "true" || visit.riskFinancial === true,
            travelRisk: visit.riskTravelRisk === "true" || visit.riskTravelRisk === true
          },
          riskNotes: visit.riskNotes || "",
          housePhoto: visit.housePhoto || "",
          parentPhoto: visit.parentPhoto || "",
          screeningResult: visit.screeningResult || "ปกติ",
          counselorNotes: visit.counselorNotes || "",
          submittedBy: visit.submittedBy || ""
        };
      } else {
        student.visitStatus = "ยังไม่ได้เยี่ยม";
      }
      return student;
    });
    
    return jsonResponse({ success: true, students: mergedStudents });
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}

function doPost(e) {
  try {
    let payload;
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else {
      payload = e.parameter;
    }
    
    const { action, studentId, visitData } = payload;
    
    const sheet = initSpreadsheet();
    
    if (action === "saveVisit") {
      const visitsSheet = sheet.getSheetByName(SHEET_VISITS);
      const studentsSheet = sheet.getSheetByName(SHEET_STUDENTS);
      
      // Remove existing visit for this student to avoid duplicates, or update it
      deleteExistingRow(visitsSheet, "studentId", studentId);
      
      // Append new visit row
      const newRow = [
        studentId,
        visitData.visitDate,
        visitData.travelInfo,
        visitData.latitude,
        visitData.longitude,
        visitData.houseCondition,
        visitData.houseOwnership,
        visitData.familyStatus,
        visitData.relationshipScale,
        visitData.averageMonthlyIncome,
        visitData.debtStatus,
        visitData.risks.academic,
        visitData.risks.substance,
        visitData.risks.gaming,
        visitData.risks.relationship,
        visitData.risks.financial,
        visitData.risks.travelRisk,
        visitData.riskNotes,
        visitData.housePhoto, // Supports base64 or URL
        visitData.parentPhoto, // Supports base64 or URL
        visitData.screeningResult,
        visitData.counselorNotes,
        visitData.submittedBy,
        new Date().toISOString() // timestamp
      ];
      
      visitsSheet.appendRow(newRow);
      
      // Update student's status on main students sheet if exists
      updateStudentStatusInSheet(studentsSheet, studentId, "เยี่ยมแล้ว");
      
      return jsonResponse({ success: true, message: "บันทึกข้อมูลการเยี่ยมบ้านเสร็จสิ้น" });
    }
    
    if (action === "updateCoordinates") {
      const { latitude, longitude } = payload;
      const studentsSheet = sheet.getSheetByName(SHEET_STUDENTS);
      updateStudentCoordinatesInSheet(studentsSheet, studentId, latitude, longitude);
      return jsonResponse({ success: true, message: "อัปเดตพิกัดบ้านนักเรียนเรียบร้อยแล้ว" });
    }
    
    return jsonResponse({ success: false, error: "Action not recognized" });
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}

// Ensure sheets exist with headers, and populate sample students if empty
function initSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Init Students Sheet
  let studentsSheet = ss.getSheetByName(SHEET_STUDENTS);
  if (!studentsSheet) {
    studentsSheet = ss.insertSheet(SHEET_STUDENTS);
    const headers = ["id", "name", "level", "department", "room", "parentName", "parentPhone", "address", "latitude", "longitude"];
    studentsSheet.appendRow(headers);
    
    // Add some sample students for vocational school (อาชีวศึกษา)
    const sampleStudents = [
      ["6620901001", "นายสมชาย ใจดี", "ปวช. 1", "เทคโนโลยีสารสนเทศ", "1", "นายสมบูรณ์ ใจดี", "081-234-5678", "12/3 ถ.มิตรภาพ อ.เมือง จ.ขอนแก่น", 16.4322, 102.8230],
      ["6620901002", "นางสาววิภาวดี เรียนเก่ง", "ปวช. 1", "เทคโนโลยีสารสนเทศ", "1", "นางรุ่งเรือง เรียนเก่ง", "089-876-5432", "45 หมู่ 5 ต.ศิลา อ.เมือง จ.ขอนแก่น", 16.4820, 102.8412],
      ["6520201005", "นายกิตติพงษ์ ยอดขยัน", "ปวช. 2", "ช่างยนต์", "2", "นายพงษ์ ยอดขยัน", "085-111-2222", "99/1 ต.ในเมือง อ.เมือง จ.ขอนแก่น", 16.4150, 102.8120],
      ["6420304012", "นางสาวมนัสวี แสนสุข", "ปวช. 3", "การบัญชี", "1", "นางดวงตา แสนสุข", "086-333-4444", "234 หมู่ 12 ต.บ้านเป็ด อ.เมือง จ.ขอนแก่น", 16.4385, 102.7845],
      ["6330901001", "นายธนกร วงศ์สมบูรณ์", "ปวส. 1", "คอมพิวเตอร์ธุรกิจ", "1", "นายธีรวัฒน์ วงศ์สมบูรณ์", "082-555-6666", "111 ต.โคกสี อ.เมือง จ.ขอนแก่น", 16.4710, 102.9150],
      ["6230901024", "นางสาวอนงค์นาฏ แก้วตา", "ปวส. 2", "คอมพิวเตอร์ธุรกิจ", "2", "นางกานดา แก้วตา", "083-777-8888", "88/2 หมู่ 3 ต.บึงเนียม อ.เมือง จ.ขอนแก่น", 16.4605, 102.9402]
    ];
    sampleStudents.forEach(row => studentsSheet.appendRow(row));
  }
  
  // 2. Init Visits Sheet
  let visitsSheet = ss.getSheetByName(SHEET_VISITS);
  if (!visitsSheet) {
    visitsSheet = ss.insertSheet(SHEET_VISITS);
    const headers = [
      "studentId", "visitDate", "travelInfo", "latitude", "longitude", 
      "houseCondition", "houseOwnership", "familyStatus", "relationshipScale", 
      "averageMonthlyIncome", "debtStatus", "riskAcademic", "riskSubstance", 
      "riskGaming", "riskRelationship", "riskFinancial", "riskTravelRisk", 
      "riskNotes", "housePhoto", "parentPhoto", "screeningResult", 
      "counselorNotes", "submittedBy", "timestamp"
    ];
    visitsSheet.appendRow(headers);
  }
  
  return ss;
}

// Convert sheet content to array of objects using first row as keys
function readSheetData(sheet) {
  if (!sheet) return [];
  const range = sheet.getDataRange();
  const values = range.getValues();
  if (values.length <= 1) return [];
  
  const headers = values[0];
  const data = [];
  
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const item = {};
    headers.forEach((header, index) => {
      if (header) {
        item[header] = row[index];
      }
    });
    data.push(item);
  }
  return data;
}

function deleteExistingRow(sheet, keyName, keyValue) {
  const range = sheet.getDataRange();
  const values = range.getValues();
  if (values.length <= 1) return;
  
  const headers = values[0];
  const colIndex = headers.indexOf(keyName);
  if (colIndex === -1) return;
  
  // Go backward to delete safely without shifting indices of remaining matches
  for (let i = values.length - 1; i >= 1; i--) {
    if (values[i][colIndex].toString() === keyValue.toString()) {
      sheet.deleteRow(i + 1);
    }
  }
}

function updateStudentStatusInSheet(sheet, studentId, status) {
  // Optional if you want to track status column in student sheet.
  // Not strictly needed since we look up presence in HomeVisits sheet,
  // but good for tracking.
}

function updateStudentCoordinatesInSheet(sheet, studentId, lat, lng) {
  const range = sheet.getDataRange();
  const values = range.getValues();
  const headers = values[0];
  
  const idCol = headers.indexOf("id");
  const latCol = headers.indexOf("latitude");
  const lngCol = headers.indexOf("longitude");
  
  if (idCol === -1 || latCol === -1 || lngCol === -1) return;
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][idCol].toString() === studentId.toString()) {
      sheet.getRange(i + 1, latCol + 1).setValue(lat);
      sheet.getRange(i + 1, lngCol + 1).setValue(lng);
      break;
    }
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
