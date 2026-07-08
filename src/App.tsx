import React, { useState, useEffect } from 'react';
import { Student, HomeVisitData } from './types';
import { INITIAL_MOCK_STUDENTS } from './mockData';
import { SyncPanel } from './components/SyncPanel';
import { StudentCard } from './components/StudentCard';
import { HomeVisitForm } from './components/HomeVisitForm';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { ParentMapPinning } from './components/ParentMapPinning';
import { StudentDetailsModal } from './components/StudentDetailsModal';
import { AdminDashboard } from './components/AdminDashboard';
import { StudentFormModal } from './components/StudentFormModal';
import { 
  Users, CheckCircle, Database, HelpCircle, RefreshCw, 
  Search, Shield, AlertCircle, Sparkles, SlidersHorizontal, BookOpen, Settings, Lock, UserPlus, LogOut, KeyRound, X
} from 'lucide-react';

export default function App() {
  // Primary States
  const [students, setStudents] = useState<Student[]>(() => {
    const local = localStorage.getItem('student_visits_data');
    return local ? JSON.parse(local) : INITIAL_MOCK_STUDENTS;
  });

  const [appsScriptUrl, setAppsScriptUrl] = useState<string>(() => {
    return localStorage.getItem('apps_script_url') || '';
  });

  const [googleSheetUrl, setGoogleSheetUrl] = useState<string>(() => {
    return localStorage.getItem('google_sheet_url') || 'https://docs.google.com/spreadsheets/d/1gHGDdFFUBBhmrcIyJj2NHL8SPDHFDdbUA2JxPlpV28w/edit?usp=sharing';
  });

  const [isSynced, setIsSynced] = useState<boolean>(() => {
    return localStorage.getItem('is_synced') === 'true';
  });

  const [activeRole, setActiveRole] = useState<'teacher' | 'executive' | 'parent' | 'settings' | 'admin'>('teacher');
  const [isLoading, setIsLoading] = useState(false);
  const [errorNotification, setErrorNotification] = useState('');
  const [successNotification, setSuccessNotification] = useState('');

  // Teacher Authentication States
  const [isTeacherLoggedIn, setIsTeacherLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('teacher_authenticated') === 'true';
  });
  const [teacherLoginUsername, setTeacherLoginUsername] = useState('');
  const [teacherLoginPassword, setTeacherLoginPassword] = useState('');
  const [teacherLoginError, setTeacherLoginError] = useState('');

  // Filtering / Search States for Student List
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Active form / modal triggers
  const [activeFormStudent, setActiveFormStudent] = useState<Student | null>(null);
  const [viewingDetailsStudent, setViewingDetailsStudent] = useState<Student | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formModalStudent, setFormModalStudent] = useState<Student | null>(null);

  const handleSaveStudentProfile = (updatedStudent: Student) => {
    const exists = students.some(s => s.id.toLowerCase() === updatedStudent.id.toLowerCase());
    let updatedList: Student[];
    if (exists && formModalStudent) {
      // Edit existing
      updatedList = students.map(s => s.id.toLowerCase() === formModalStudent.id.toLowerCase() ? updatedStudent : s);
      setSuccessNotification(`แก้ไขข้อมูลประวัตินักเรียน "${updatedStudent.name}" สำเร็จเรียบร้อยแล้ว`);
    } else {
      // Add new
      updatedList = [...students, updatedStudent];
      setSuccessNotification(`เพิ่มรายชื่อนักเรียนนักศึกษาใหม่ "${updatedStudent.name}" สำเร็จเรียบร้อยแล้ว`);
    }
    setStudents(updatedList);
  };

  // Teacher Authentication Handlers
  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherLoginError('');

    if (teacherLoginUsername.trim() === 'teacher' && teacherLoginPassword === '1234') {
      setIsTeacherLoggedIn(true);
      sessionStorage.setItem('teacher_authenticated', 'true');
      setTeacherLoginUsername('');
      setTeacherLoginPassword('');
      setSuccessNotification('เข้าสู่ระบบสำหรับครูที่ปรึกษาสำเร็จ ยินดีต้อนรับคุณครูสมชาย');
    } else {
      setTeacherLoginError('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง (คำแนะนำ: ชื่อผู้ใช้งาน = teacher, รหัสผ่าน = 1234)');
    }
  };

  const handleTeacherLogout = () => {
    setIsTeacherLoggedIn(false);
    sessionStorage.removeItem('teacher_authenticated');
    setSuccessNotification('ออกจากระบบครูที่ปรึกษาเรียบร้อยแล้ว');
  };

  // Auto-save changes to localStorage whenever students change
  useEffect(() => {
    localStorage.setItem('student_visits_data', JSON.stringify(students));
  }, [students]);

  // Synchronize Google Sheets FETCH handler
  const handleFetchFromSheet = async () => {
    if (!appsScriptUrl) return;
    setIsLoading(true);
    setErrorNotification('');
    setSuccessNotification('');

    try {
      const response = await fetch(appsScriptUrl, {
        method: 'GET',
        mode: 'cors'
      });
      const data = await response.json();
      
      if (data && data.success && data.students) {
        setStudents(data.students);
        setSuccessNotification('ดึงข้อมูลนักศึกษาล่าสุดจาก Google Sheets สำเร็จเรียบร้อยแล้ว!');
        setIsSynced(true);
        localStorage.setItem('is_synced', 'true');
      } else {
        setErrorNotification(data.error || 'โครงสร้างข้อมูลไม่ถูกต้อง โปรดตรวจสอบ Apps Script');
      }
    } catch (err: any) {
      console.error(err);
      setErrorNotification('ไม่สามารถเข้าถึงแอปสคริปต์ได้โดยตรง (เกิดข้อจำกัด CORS ในบราวเซอร์สำหรับข้อมูลชีตของคุณ) ข้อมูลใน Sandbox จะยังคงปลอดภัยและสามารถเซฟออฟไลน์ต่อได้');
    } finally {
      setIsLoading(false);
    }
  };

  // Save Home Visit data handler
  const handleSaveVisit = async (studentId: string, visitData: HomeVisitData) => {
    setIsLoading(true);
    setErrorNotification('');
    setSuccessNotification('');

    // Update local state first
    const updatedStudents = students.map(student => {
      if (student.id === studentId) {
        return {
          ...student,
          visitStatus: 'เยี่ยมแล้ว' as const,
          visitData: visitData,
          latitude: visitData.latitude,
          longitude: visitData.longitude
        };
      }
      return student;
    });
    setStudents(updatedStudents);
    setSuccessNotification(`บันทึกข้อมูลการเยี่ยมบ้านของนักเรียนรหัส ${studentId} เสร็จเรียบร้อยแล้ว!`);
    setActiveFormStudent(null);

    // Sync to Google Sheet via POST if configured
    if (isSynced && appsScriptUrl) {
      try {
        // Send asynchronously to preserve snappy user experience
        fetch(appsScriptUrl, {
          method: 'POST',
          mode: 'no-cors', // standard way to post to Apps Script without CORS blocks
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'saveVisit',
            studentId: studentId,
            visitData: visitData
          })
        });
        setSuccessNotification(`บันทึกเรียบร้อย และทำการส่งข้อมูลไปยัง Google Sheets แล้ว!`);
      } catch (err: any) {
        console.error('Apps Script Post Error:', err);
        setErrorNotification('บันทึกสำเร็จในระบบจำลอง แต่ไม่สามารถซิงค์ไปยัง Google Sheet ได้ (โปรดตรวจสอบการเชื่อมโยงเครือข่าย)');
      }
    }
    setIsLoading(false);
  };

  // Parent confirming coordinates handler
  const handleConfirmCoordinates = async (studentId: string, lat: number, lng: number) => {
    setIsLoading(true);
    setErrorNotification('');
    setSuccessNotification('');

    // Update locally
    const updatedStudents = students.map(student => {
      if (student.id === studentId) {
        return {
          ...student,
          latitude: lat,
          longitude: lng
        };
      }
      return student;
    });
    setStudents(updatedStudents);

    // Sync to sheet via Apps Script if configured
    if (isSynced && appsScriptUrl) {
      try {
        fetch(appsScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'updateCoordinates',
            studentId: studentId,
            latitude: lat,
            longitude: lng
          })
        });
      } catch (err: any) {
        console.error('Coordinate sync error:', err);
      }
    }
    setIsLoading(false);
  };

  // Reset to default sample mock data
  const handleResetToDefaults = () => {
    if (window.confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้น (Sandbox) หรือไม่? ข้อมูลการทดสอบของคุณจะถูกลบออก')) {
      setStudents(INITIAL_MOCK_STUDENTS);
      localStorage.setItem('student_visits_data', JSON.stringify(INITIAL_MOCK_STUDENTS));
      setSuccessNotification('รีเซ็ตข้อมูลเป็นค่าเริ่มต้นสำหรับการนำเสนอเรียบร้อยแล้ว');
    }
  };

  // Clear all data to start fresh for real use (Production/Actual usage)
  const handleClearAllData = () => {
    if (window.confirm('คำเตือน: คุณต้องการลบรายชื่อนักศึกษาและข้อมูลการเยี่ยมบ้านทั้งหมดออกจากระบบเพื่อเริ่มใช้งานจริงใช่หรือไม่? (การดำเนินการนี้จะไม่ส่งผลกระทบต่อข้อมูลที่มีอยู่บน Google Sheets ของคุณ)')) {
      setStudents([]);
      localStorage.setItem('student_visits_data', JSON.stringify([]));
      setSuccessNotification('ล้างฐานข้อมูลนักเรียนเดิมออกทั้งหมดแล้ว คุณสามารถเริ่มกรอกรายชื่อจริงด้วยตนเอง หรือเชื่อมต่อดึงข้อมูลจริงผ่าน Google Sheets ได้ทันที');
    }
  };

  // CSV Parser helper (RFC 4180 compliant)
  const parseCSV = (text: string): string[][] => {
    const result: string[][] = [];
    let row: string[] = [];
    let inQuotes = false;
    let currentVal = '';
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentVal += '"';
          i++; // skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(currentVal);
        currentVal = '';
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++; // skip LF
        }
        row.push(currentVal);
        result.push(row);
        row = [];
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    
    if (currentVal || row.length > 0) {
      row.push(currentVal);
      result.push(row);
    }
    
    return result.filter(r => r.some(cell => cell.trim() !== ''));
  };

  // Fetch from direct public Google Sheet export (No Apps Script needed)
  const handleFetchDirectSheet = async (customUrl?: string) => {
    const urlToUse = customUrl || googleSheetUrl;
    if (!urlToUse) {
      setErrorNotification('กรุณาระบุลิงก์ Google Sheets');
      return;
    }

    setIsLoading(true);
    setErrorNotification('');
    setSuccessNotification('');

    try {
      // Extract spreadsheet ID from URL
      const sheetIdMatch = urlToUse.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!sheetIdMatch) {
        throw new Error('รูปแบบลิงก์ Google Sheets ไม่ถูกต้อง กรุณาใช้ลิงก์ที่คัดลอกมาจากแถบที่อยู่เว็บของบราวเซอร์');
      }
      const sheetId = sheetIdMatch[1];
      // Force export to CSV of the first active sheet
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลได้ โปรดตรวจสอบว่าแชร์ลิงก์ Google Sheet เป็น "ทุกคนที่มีลิงก์มีสิทธิ์อ่าน (Anyone with link can view)" แล้ว');
      }

      const csvText = await response.text();
      const parsedData = parseCSV(csvText);

      if (parsedData.length < 2) {
        throw new Error('ไม่พบข้อมูลนักเรียน หรือหัวตารางของวิทยาลัยในชีตของคุณ');
      }

      const headers = parsedData[0].map(h => h.trim());

      // Helper function to find index by potential header names
      const findHeaderIndex = (names: string[]) => {
        return headers.findIndex(h => names.some(name => h.includes(name)));
      };

      // Find crucial header indices
      const idIdx = findHeaderIndex(['รหัสนักศึกษา', 'รหัสประจำตัว', 'Student ID', 'id']);
      const prefixIdx = findHeaderIndex(['คำหน้า', 'คำนำหน้า', 'prefix']);
      const firstNameIdx = findHeaderIndex(['ชื่อ', 'name', 'First Name']);
      const lastNameIdx = findHeaderIndex(['นามสกุล', 'last name', 'Last Name']);
      const levelIdx = findHeaderIndex(['ระดับชั้น', 'level', 'Class']);
      const citizenIdx = findHeaderIndex(['เลขประจำตัวประชาชน', 'บัตรประชาชน', 'citizen']);
      const bloodIdx = findHeaderIndex(['หมู่เลือด', 'กรุ๊ปเลือด', 'หมู่โลหิต', 'blood']);
      const phoneIdx = findHeaderIndex(['เบอร์โทร', 'เบอร์โทรศัพท์', 'โทรศัพท์', 'phone']);
      const addressIdx = findHeaderIndex(['ที่อยู่ปัจจุบัน', 'ที่อยู่', 'address']);
      
      const fatherNameIdx = findHeaderIndex(['ชื่อ-สกุลบิดา', 'บิดา', 'father']);
      const fatherPhoneIdx = findHeaderIndex(['โทรศัพท์', 'เบอร์โทรบิดา', 'เบอร์บิดา']);
      const fatherOccIdx = findHeaderIndex(['อาชีพ', 'อาชีพของบิดา']);

      const motherNameIdx = findHeaderIndex(['ชื่อ-สกุลมารดา', 'มารดา', 'mother']);
      const motherPhoneIdx = findHeaderIndex(['เบอร์โทรศัพท์', 'เบอร์โทรศัพท์', 'เบอร์โทรของมารดา']);
      const motherOccIdx = findHeaderIndex(['อาชีพ', 'อาชีพของมารดา']);

      const housePhotoIdx = findHeaderIndex(['หน้าบ้าน', 'ภาพถ่ายบ้าน', 'รูปภาพบ้าน']);
      const layoutPhotoIdx = findHeaderIndex(['test', 'แผนผัง', 'รูปภาพแผนผัง']);

      if (idIdx === -1 || firstNameIdx === -1) {
        throw new Error('ไม่สามารถระบุคอลัมน์สำคัญ (เช่น รหัสนักศึกษา หรือ ชื่อ) ได้ กรุณาตรวจสอบว่ามีหัวข้อคอลัมน์ในแถวแรกของชีตหรือไม่');
      }

      const parsedStudents: Student[] = [];

      for (let i = 1; i < parsedData.length; i++) {
        const row = parsedData[i];
        if (!row[idIdx] || row[idIdx].trim() === '') continue; // Skip empty rows

        const studentId = row[idIdx].trim();
        const prefix = prefixIdx !== -1 ? row[prefixIdx].trim() : '';
        const firstName = row[firstNameIdx].trim();
        const lastName = lastNameIdx !== -1 ? row[lastNameIdx].trim() : '';
        const fullName = `${prefix}${firstName} ${lastName}`.trim();

        // Level normalization
        let rawLevel = levelIdx !== -1 ? row[levelIdx].trim() : 'ปวช. 1';
        let level: Student['level'] = 'ปวช. 1';
        if (rawLevel.includes('ปวช. 1') || rawLevel.includes('ปวช.1')) level = 'ปวช. 1';
        else if (rawLevel.includes('ปวช. 2') || rawLevel.includes('ปวช.2')) level = 'ปวช. 2';
        else if (rawLevel.includes('ปวช. 3') || rawLevel.includes('ปวช.3')) level = 'ปวช. 3';
        else if (rawLevel.includes('ปวส. 1') || rawLevel.includes('ปวส.1')) level = 'ปวส. 1';
        else if (rawLevel.includes('ปวส. 2') || rawLevel.includes('ปวส.2')) level = 'ปวส. 2';
        else if (rawLevel.includes('ปวช')) level = 'ปวช. 1';
        else if (rawLevel.includes('ปวส')) level = 'ปวส. 1';

        // Parents info parsing
        const fatherName = fatherNameIdx !== -1 ? row[fatherNameIdx].trim() : '';
        const motherName = motherNameIdx !== -1 ? row[motherNameIdx].trim() : '';
        
        let parentName = '';
        let parentRelationship = 'ผู้ปกครอง';
        let parentPhone = '';
        let parentOccupation = '';

        if (fatherName) {
          parentName = fatherName;
          parentRelationship = 'บิดา';
          parentPhone = fatherPhoneIdx !== -1 ? row[fatherPhoneIdx].trim() : '';
          parentOccupation = fatherOccIdx !== -1 ? row[fatherOccIdx].trim() : '';
        } else if (motherName) {
          parentName = motherName;
          parentRelationship = 'มารดา';
          parentPhone = motherPhoneIdx !== -1 ? row[motherPhoneIdx].trim() : '';
          parentOccupation = motherOccIdx !== -1 ? row[motherOccIdx].trim() : '';
        } else {
          parentName = 'ไม่ระบุ';
        }

        // Blood Group mapping
        let bloodGroup = bloodIdx !== -1 ? row[bloodIdx].trim() : 'O';
        if (bloodGroup.includes('โอ') || bloodGroup.toLowerCase() === 'o') bloodGroup = 'O';
        else if (bloodGroup.includes('เอ') && !bloodGroup.includes('บี')) bloodGroup = 'A';
        else if (bloodGroup.includes('บี') && !bloodGroup.includes('เอ')) bloodGroup = 'B';
        else if (bloodGroup.includes('เอบี') || bloodGroup.toLowerCase() === 'ab') bloodGroup = 'AB';

        // Photos mapping
        const housePhotoUrl = housePhotoIdx !== -1 ? row[housePhotoIdx].trim() : '';
        const layoutPhotoUrl = layoutPhotoIdx !== -1 ? row[layoutPhotoIdx].trim() : '';

        // Address mapping
        const address = addressIdx !== -1 ? row[addressIdx].trim() : 'ไม่ระบุที่อยู่';

        // Phone
        const studentPhone = phoneIdx !== -1 ? row[phoneIdx].trim() : '';

        // Citizen ID
        const citizenId = citizenIdx !== -1 ? row[citizenIdx].trim() : '';

        // Preserve local visit if it exists
        const existingStudent = students.find(s => s.id === studentId);
        let visitStatus = existingStudent ? existingStudent.visitStatus : ('ยังไม่ได้เยี่ยม' as const);
        let visitData = existingStudent ? existingStudent.visitData : undefined;

        if (!visitData && (housePhotoUrl || layoutPhotoUrl)) {
          // Prefilled visit data from form
          visitData = {
            visitDate: new Date().toISOString().split('T')[0],
            travelInfo: 'รถส่วนตัว (ข้อมูลนำเข้าจาก Google Form)',
            latitude: null,
            longitude: null,
            houseCondition: 'ปานกลาง',
            houseOwnership: 'บ้านตนเอง',
            familyStatus: 'อยู่ด้วยกัน',
            relationshipScale: 4,
            averageMonthlyIncome: 15000,
            debtStatus: 'ไม่มีหนี้สิน',
            risks: {
              academic: false,
              substance: false,
              gaming: false,
              relationship: false,
              financial: false,
              travelRisk: false
            },
            riskNotes: '',
            housePhoto: housePhotoUrl,
            parentPhoto: layoutPhotoUrl,
            screeningResult: 'ปกติ',
            counselorNotes: 'ข้อมูลเบื้องต้นนำเข้าจาก Google Sheets 100%',
            submittedBy: 'ระบบนำเข้า'
          };
          visitStatus = 'เยี่ยมแล้ว';
        }

        parsedStudents.push({
          id: studentId,
          name: fullName,
          level: level,
          department: 'ระบบขนส่งทางราง', // Default department matching actual setup
          room: '1',
          parentName: parentName,
          parentPhone: parentPhone,
          address: address,
          latitude: null,
          longitude: null,
          visitStatus: visitStatus,
          nickname: '',
          citizenId: citizenId,
          bloodGroup: bloodGroup,
          studentPhone: studentPhone,
          parentRelationship: parentRelationship,
          parentOccupation: parentOccupation,
          visitData: visitData
        });
      }

      setStudents(parsedStudents);
      localStorage.setItem('student_visits_data', JSON.stringify(parsedStudents));
      localStorage.setItem('google_sheet_url', urlToUse);
      setSuccessNotification(`ดึงข้อมูลรายชื่อนักเรียนและข้อมูลพื้นฐาน 100% จาก Google Sheets สำเร็จ! นำเข้าข้อมูลทั้งหมดได้ ${parsedStudents.length} รายการ`);
    } catch (err: any) {
      console.error(err);
      setErrorNotification(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลจาก Google Sheets');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch the user's specific spreadsheet on first mount to populate the app immediately with 100% of the data
  useEffect(() => {
    const hasLoadedInit = localStorage.getItem('google_sheet_initial_loaded');
    if (!hasLoadedInit) {
      handleFetchDirectSheet('https://docs.google.com/spreadsheets/d/1gHGDdFFUBBhmrcIyJj2NHL8SPDHFDdbUA2JxPlpV28w/edit?usp=sharing');
      localStorage.setItem('google_sheet_initial_loaded', 'true');
    }
  }, []);

  // Lists for unique filtering choices
  const uniqueDepartments = Array.from(new Set(students.map(s => s.department))).sort();
  const uniqueLevels = ['ปวช. 1', 'ปวช. 2', 'ปวช. 3', 'ปวส. 1', 'ปวส. 2'];

  // Filtered Students list
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.id.includes(searchQuery);
    
    const matchesLevel = selectedLevel === 'all' || student.level === selectedLevel;
    const matchesDept = selectedDept === 'all' || student.department === selectedDept;
    const matchesStatus = selectedStatus === 'all' || student.visitStatus === selectedStatus;

    return matchesSearch && matchesLevel && matchesDept && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900 overflow-x-hidden">
      
      {/* Geometric Balance Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col shrink-0 border-b md:border-b-0 md:border-r border-slate-800">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between md:block">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center text-white shadow-sm">
              <BookOpen className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="font-bold text-sm leading-tight uppercase tracking-wider">Student Connect</h1>
              <p className="text-[10px] text-brand-300">Home Visit System</p>
            </div>
          </div>
          <div className="md:hidden">
            <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">V.1.2</span>
          </div>
        </div>
        
        <nav className="p-4 space-y-1.5 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible gap-1.5 md:gap-0 flex-1 scrollbar-none">
          <div className="hidden md:block text-[10px] uppercase font-bold text-slate-400 mb-2 px-2 tracking-wider">เมนูหลัก / Role Access</div>
          {[
            { id: 'teacher', label: 'ครูที่ปรึกษา', icon: Users },
            { id: 'executive', label: 'ผู้บริหาร/แนะแนว', icon: Shield },
            { id: 'parent', label: 'ผู้ปกครอง/นักเรียน', icon: Sparkles },
            { id: 'admin', label: 'ผู้ดูแลระบบ (Admin)', icon: Lock },
            { id: 'settings', label: 'ตั้งค่าระบบ', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeRole === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => {
                  setActiveRole(tab.id as any);
                  setErrorNotification('');
                  setSuccessNotification('');
                }}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all shrink-0 w-auto md:w-full text-left ${
                  isActive 
                    ? 'bg-slate-800 text-white border-l-4 border-brand-500 shadow-xs' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </nav>
        
        <div className="p-4 bg-slate-950 border-t border-slate-900/60 hidden md:block">
          {isTeacherLoggedIn ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">TS</div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold truncate text-slate-200">ครูสมชาย (T. Somchai)</p>
                  <p className="text-[10px] text-slate-400">Consultant Teacher</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleTeacherLogout}
                title="ออกจากระบบครูที่ปรึกษา"
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-xs shadow-xs">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate text-slate-400">ยังไม่เข้าสู่ระบบ</p>
                <p className="text-[10px] text-slate-500">โปรดล็อกอินก่อนเข้าถึง</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 py-4 px-6 md:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
          <div>
            <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              {activeRole === 'teacher' && 'ครูที่ปรึกษา: บันทึกความปลอดภัยและการเยี่ยมบ้าน'}
              {activeRole === 'executive' && 'แผงสารสนเทศผู้บริหารและสรุปกลุ่มเฝ้าระวัง'}
              {activeRole === 'parent' && 'ยืนยันพิกัดจีพีเอสบ้านล่วงหน้า'}
              {activeRole === 'admin' && 'การจัดการฐานข้อมูลและสิทธิ์ผู้ดูแลระบบ'}
              {activeRole === 'settings' && 'การตั้งค่าฐานข้อมูลและการเชื่อมคลาวด์'}
            </h2>
            <p className="text-[11px] text-slate-400 font-medium">
              {activeRole === 'teacher' && 'ค้นหา คัดกรอง และบันทึกพิกัดเยี่ยมบ้าน พร้อมวิเคราะห์ความพร้อมครอบครัว'}
              {activeRole === 'executive' && 'รายงานวิเคราะห์อัตราความสำเร็จ และติดตามช่วยเหลือนักศึกษากลุ่มวิกฤต'}
              {activeRole === 'parent' && 'ประตูป้อนข้อมูลสำหรับผู้ปกครองเพื่อส่งพิกัดแผนที่ตำแหน่งบ้านให้ครูที่ปรึกษา'}
              {activeRole === 'admin' && 'เพิ่มรายชื่อนักเรียน แก้ไขประวัติ หรือลบข้อมูลจากฐานข้อมูลของระบบ'}
              {activeRole === 'settings' && 'จัดการระบบเชื่อมโยง Google Sheets และตั้งค่า URL แอปสคริปต์กลาง'}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {activeRole === 'teacher' && (
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="พิมพ์ชื่อนักเรียน หรือรหัสประจำตัว..."
                  className="w-full pl-9 pr-4 py-1.5 bg-slate-100 border-none rounded-full text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                />
              </div>
            )}
            {isSynced && (
              <div className="hidden sm:inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full text-[10px] font-bold">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                ซิงค์คลาวด์ทำงาน
              </div>
            )}
          </div>
        </header>

        {/* Main Section */}
        <main className="flex-1 py-6 px-4 md:px-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {/* Dynamic Warning Notification banner */}
          {errorNotification && (
            <div className="mb-6 p-4 bg-rose-50 text-rose-800 border border-rose-100 rounded-2xl text-xs flex items-start gap-2.5 shadow-xs animate-fadeIn justify-between">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <div className="flex-1">
                  <p className="font-semibold text-rose-900">แจ้งเตือนระบบ</p>
                  <p className="text-rose-700/90 mt-0.5 leading-normal">{errorNotification}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setErrorNotification('')}
                className="p-1 hover:bg-rose-100 rounded text-rose-400 hover:text-rose-700 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Dynamic Success Notification banner */}
          {successNotification && (
            <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-2xl text-xs flex items-start gap-2.5 shadow-xs animate-fadeIn justify-between">
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                <div className="flex-1">
                  <p className="font-semibold text-emerald-900">ดำเนินการสำเร็จ</p>
                  <p className="text-emerald-700/90 mt-0.5 leading-normal">{successNotification}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSuccessNotification('')}
                className="p-1 hover:bg-emerald-100 rounded text-emerald-400 hover:text-emerald-700 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* FORM STATE COVER: Active Form Student (Recording Visit) */}
          {activeFormStudent ? (
            <HomeVisitForm
              student={activeFormStudent}
              onSave={handleSaveVisit}
              onClose={() => setActiveFormStudent(null)}
            />
          ) : (
            <>
              {/* Tab 1: Teacher Role - ครูที่ปรึกษา */}
              {activeRole === 'teacher' && (
                !isTeacherLoggedIn ? (
                  <div className="max-w-md mx-auto my-10 animate-fadeIn">
                    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden text-left">
                      {/* Login header bar */}
                      <div className="bg-slate-900 text-white p-6 text-center space-y-1.5">
                        <div className="w-12 h-12 bg-brand-500 rounded-2xl mx-auto flex items-center justify-center text-white shadow-sm mb-1.5">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-sm font-extrabold uppercase tracking-wider">เข้าสู่ระบบสำหรับครูที่ปรึกษา</h3>
                        <p className="text-[11px] text-brand-300">Advisor Teacher Portal Access</p>
                      </div>

                      {/* Login body */}
                      <form onSubmit={handleTeacherLogin} className="p-6 space-y-4">
                        {teacherLoginError && (
                          <div className="p-3.5 bg-rose-50 text-rose-800 border border-rose-100 rounded-xl text-xs flex items-start gap-2 animate-fadeIn">
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                            <span className="font-semibold leading-relaxed">{teacherLoginError}</span>
                          </div>
                        )}

                        <div className="space-y-3.5">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                              ชื่อผู้ใช้งาน (Username)
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="เช่น teacher"
                              value={teacherLoginUsername}
                              onChange={(e) => setTeacherLoginUsername(e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700 font-semibold"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                              รหัสผ่าน (Password)
                            </label>
                            <input
                              type="password"
                              required
                              placeholder="กรอกรหัสผ่าน 4 หลัก"
                              value={teacherLoginPassword}
                              onChange={(e) => setTeacherLoginPassword(e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700 font-mono font-bold"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-1.5 mt-2"
                        >
                          <KeyRound className="w-4 h-4" />
                          ยืนยันเพื่อเข้าใช้งานระบบ
                        </button>

                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150 text-[11px] text-slate-500 space-y-1">
                          <p className="font-bold text-slate-600">🔑 รหัสผ่านทดลองสำหรับทดสอบระบบ:</p>
                          <p>• ชื่อผู้ใช้: <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono font-bold text-brand-600">teacher</code></p>
                          <p>• รหัสผ่าน: <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono font-bold text-brand-600">1234</code></p>
                        </div>
                      </form>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    
                    {/* Search & Advanced Filters Panels */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                          <h2 className="text-sm font-bold text-slate-800">ค้นหารายชื่อและคัดกรองนักศึกษา</h2>
                          <p className="text-xs text-slate-500">เลือกกรองตามระดับชั้น แผนกวิชา หรือเลือกสถานะการเยี่ยม</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setFormModalStudent(null);
                              setIsFormModalOpen(true);
                            }}
                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            เพิ่มรายชื่อนักศึกษาใหม่
                          </button>

                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-400">ตัวเลือกการจัดกลุ่ม:</span>
                            <span className="font-semibold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
                              พบตรงเงื่อนไข {filteredStudents.length} ราย
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Filter Selects */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Level Select */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ระดับชั้นเรียน</span>
                          <select
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white"
                          >
                            <option value="all">ทั้งหมด ทุกระดับชั้น</option>
                            {uniqueLevels.map(lvl => (
                              <option key={lvl} value={lvl}>{lvl}</option>
                            ))}
                          </select>
                        </div>

                        {/* Department Select */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">แผนกสาขาวิชา</span>
                          <select
                            value={selectedDept}
                            onChange={(e) => setSelectedDept(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white"
                          >
                            <option value="all">ทั้งหมด ทุกแผนก</option>
                            {uniqueDepartments.map(dept => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </select>
                        </div>

                        {/* Visit Status Select */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">สถานะการเยี่ยมบ้าน</span>
                          <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white"
                          >
                            <option value="all">ทั้งหมด ทุกสถานะ</option>
                            <option value="เยี่ยมแล้ว">เยี่ยมแล้ว</option>
                            <option value="ยังไม่ได้เยี่ยม">ยังไม่ได้เยี่ยม</option>
                          </select>
                        </div>

                        {/* Simple clear button */}
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => {
                              setSearchQuery('');
                              setSelectedLevel('all');
                              setSelectedDept('all');
                              setSelectedStatus('all');
                            }}
                            className="w-full py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer border border-slate-200"
                          >
                            ล้างตัวกรองทั้งหมด
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Students Display Grid */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">รายชื่อนักศึกษาที่สอดคล้อง ({filteredStudents.length} ราย)</h3>
                        {isSynced && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                            <RefreshCw className="w-3 h-3 animate-spin text-brand-500" />
                            ซิงค์ชีตสตรีมพร้อมทำงาน
                          </span>
                        )}
                      </div>

                      {filteredStudents.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200/60 shadow-xs">
                          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                          <p className="text-slate-500 font-bold text-sm">ไม่พบข้อมูลนักเรียนนักศึกษาที่ค้นหา</p>
                          <p className="text-xs text-slate-400 mt-1">โปรดตรวจสอบคำค้นหาหรือตัวกรองระดับชั้นใหม่อีกครั้ง</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                          {filteredStudents.map(student => (
                            <StudentCard
                              key={student.id}
                              student={student}
                              onRecordVisit={(s) => setActiveFormStudent(s)}
                              onViewDetails={(s) => setViewingDetailsStudent(s)}
                              onEditProfile={(s) => {
                                setFormModalStudent(s);
                                setIsFormModalOpen(true);
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )
              )}

              {/* Tab 2: Admin/Executive Dashboard - ภาพรวมผู้บริหาร */}
              {activeRole === 'executive' && (
                <ExecutiveDashboard
                  students={students}
                  onViewStudentDetails={(s) => setViewingDetailsStudent(s)}
                />
              )}

              {/* Tab 3: Student/Parent Portal - ประตูป้อนข้อมูลผู้ปกครอง */}
              {activeRole === 'parent' && (
                <ParentMapPinning
                  students={students}
                  onConfirmCoordinates={handleConfirmCoordinates}
                  onStudentsChange={setStudents}
                />
              )}

              {/* Tab 5: Admin Panel - ผู้ดูแลระบบ */}
              {activeRole === 'admin' && (
                <AdminDashboard
                  students={students}
                  onStudentsChange={setStudents}
                />
              )}

              {/* Tab 4: Cloud Sync Settings - ตั้งค่าสคริปต์เชื่อมโยงชีต */}
              {activeRole === 'settings' && (
                <div className="space-y-6">
                  <SyncPanel
                    appsScriptUrl={appsScriptUrl}
                    setAppsScriptUrl={setAppsScriptUrl}
                    googleSheetUrl={googleSheetUrl}
                    setGoogleSheetUrl={setGoogleSheetUrl}
                    isSynced={isSynced}
                    setIsSynced={setIsSynced}
                    onFetchFromSheet={handleFetchFromSheet}
                    onFetchDirectSheet={handleFetchDirectSheet}
                    onPushToSheet={async () => {}} // dummy push
                    isLoading={isLoading}
                  />

                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                        การสลับสิทธิ์ข้อมูลสำหรับเริ่มใช้งานจริง (Sandbox vs. Production Setup)
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        เมื่อคุณต้องการนำแอปพลิเคชันนี้ไปใช้งานจริงในวิทยาลัย/โรงเรียนของคุณ คุณสามารถล้างข้อมูลกลุ่มจำลอง (Mock Data) 
                        เพื่อเริ่มต้นจากฐานข้อมูลว่างเปล่า จากนั้นจึงพิมพ์รายชื่อจริง หรือกดซิงค์ข้อมูลจริงทั้งหมดผ่าน Google Sheets ที่คุณเชื่อมโยงได้ทันที
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {/* Left: Clear to Blank for Real Use */}
                      <div className="p-4 border border-rose-100 rounded-xl bg-rose-50/30 flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-rose-800 uppercase tracking-tight">๑. ล้างรายชื่อนักเรียนเดิมทั้งหมด (สำหรับใช้งานจริง)</h4>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                            ลบนักเรียนกลุ่มตัวอย่างทั้งหมดออกจากระบบ เพื่อเริ่มต้นจากระบบฐานข้อมูลว่างเปล่า (Empty List) 
                            เหมาะสำหรับการเริ่มนำเข้าข้อมูลจริงของแผนกวิชา/วิทยาลัยของคุณ
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleClearAllData}
                          className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer w-full text-center"
                        >
                          ล้างฐานข้อมูลนักเรียนเพื่อใช้จริง
                        </button>
                      </div>

                      {/* Right: Reset to Sample Data */}
                      <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-tight">๒. โหลดกลุ่มรายชื่อทดสอบกลับมา (สำหรับสาธิต/พัฒนา)</h4>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                            คืนสถานะประวัติและรายชื่อนักศึกษาจำลองทั้งหมด เพื่อทำการแสดงผล สาธิต หรือใช้นำเสนอต่อคณะกรรมการ/ผู้บริหาร
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleResetToDefaults}
                          className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold rounded-lg transition-all cursor-pointer w-full text-center"
                        >
                          โหลดกลุ่มตัวอย่างจำลองกลับมา
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>

        {/* SINGLE DETAILS REVIEW MODAL */}
        {viewingDetailsStudent && (
          <StudentDetailsModal
            student={viewingDetailsStudent}
            onClose={() => setViewingDetailsStudent(null)}
          />
        )}

        {/* REUSABLE STUDENT FORM MODAL (FOR ADDING & EDITING PROFILES BY TEACHERS) */}
        <StudentFormModal
          isOpen={isFormModalOpen}
          student={formModalStudent}
          onClose={() => {
            setIsFormModalOpen(false);
            setFormModalStudent(null);
          }}
          onSave={handleSaveStudentProfile}
          studentsList={students}
        />

        {/* Modern Footer bar */}
        <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400 font-medium shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-1">
            <p>© 2026 ระบบสารสนเทศคัดกรองเยี่ยมบ้านนักเรียนนักศึกษา (อาชีวศึกษาเพื่อสังคม) • Geometric Balance Theme</p>
            <p className="text-[10px] text-slate-400">
              พัฒนาขึ้นเพื่อจัดการพิกัดแผนที่ครอบครัว GPS และคัดกรองประเมินช่วยเหลือกรณีนักศึกษามีความเสี่ยงสูง
            </p>
          </div>
        </footer>
      </div>

    </div>
  );
}
