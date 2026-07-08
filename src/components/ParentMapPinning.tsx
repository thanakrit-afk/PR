import React, { useState, useEffect } from 'react';
import { Student, HomeVisitData } from '../types';
import { 
  Search, MapPin, Check, Compass, AlertCircle, ExternalLink, 
  HelpCircle, FileText, User, Lock, UserPlus, LogOut, 
  Upload, Image, ShieldCheck, Phone, Map, DollarSign, 
  Home, Heart, CreditCard, Clipboard, Info, CheckCircle
} from 'lucide-react';

interface ParentMapPinningProps {
  students: Student[];
  onConfirmCoordinates: (studentId: string, lat: number, lng: number) => void;
  onStudentsChange: (students: Student[]) => void;
}

export const ParentMapPinning: React.FC<ParentMapPinningProps> = ({
  students,
  onConfirmCoordinates,
  onStudentsChange
}) => {
  // Auth states
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loggedInStudent, setLoggedInStudent] = useState<Student | null>(null);

  // Error & success messages
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Register Form States
  const [regId, setRegId] = useState('');
  const [regPrefix, setRegPrefix] = useState('นาย');
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regLevel, setRegLevel] = useState<Student['level']>('ปวช. 1');
  const [regDept, setRegDept] = useState('สาขาเทคโนโลยีสารสนเทศ');
  const [regRoom, setRegRoom] = useState('1');
  const [regCitizenId, setRegCitizenId] = useState('');
  const [regBloodGroup, setRegBloodGroup] = useState('O');
  const [regStudentPhone, setRegStudentPhone] = useState('');
  const [regParentName, setRegParentName] = useState('');
  const [regParentRelationship, setRegParentRelationship] = useState('บิดา');
  const [regParentOccupation, setRegParentOccupation] = useState('');
  const [regParentPhone, setRegParentPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Logged-in Form States (Student house details input)
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [address, setAddress] = useState('');
  const [travelInfo, setTravelInfo] = useState('');
  const [houseCondition, setHouseCondition] = useState<HomeVisitData['houseCondition']>('มั่นคงแข็งแรง');
  const [houseOwnership, setHouseOwnership] = useState<HomeVisitData['houseOwnership']>('บ้านตนเอง');
  const [familyStatus, setFamilyStatus] = useState<HomeVisitData['familyStatus']>('อยู่กับบิดามารดา');
  const [averageMonthlyIncome, setAverageMonthlyIncome] = useState<number>(15000);
  const [debtStatus, setDebtStatus] = useState<HomeVisitData['debtStatus']>('ไม่มีหนี้สิน');
  const [housePhoto, setHousePhoto] = useState<string>('');
  const [parentPhoto, setParentPhoto] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state if user reloaded but was logged in
  useEffect(() => {
    const savedId = localStorage.getItem('logged_in_student_id');
    if (savedId) {
      const student = students.find(s => s.id === savedId);
      if (student) {
        setLoggedInStudent(student);
        initializeStudentForm(student);
      }
    }
  }, [students]);

  const initializeStudentForm = (student: Student) => {
    setLat(student.latitude || 16.4396);
    setLng(student.longitude || 102.8288);
    setAddress(student.address || '');
    
    if (student.visitData) {
      setTravelInfo(student.visitData.travelInfo || '');
      setHouseCondition(student.visitData.houseCondition || 'มั่นคงแข็งแรง');
      setHouseOwnership(student.visitData.houseOwnership || 'บ้านตนเอง');
      setFamilyStatus(student.visitData.familyStatus || 'อยู่กับบิดามารดา');
      setAverageMonthlyIncome(student.visitData.averageMonthlyIncome || 15000);
      setDebtStatus(student.visitData.debtStatus || 'ไม่มีหนี้สิน');
      setHousePhoto(student.visitData.housePhoto || '');
      setParentPhoto(student.visitData.parentPhoto || '');
    } else {
      setTravelInfo('');
      setHouseCondition('มั่นคงแข็งแรง');
      setHouseOwnership('บ้านตนเอง');
      setFamilyStatus('อยู่กับบิดามารดา');
      setAverageMonthlyIncome(15000);
      setDebtStatus('ไม่มีหนี้สิน');
      setHousePhoto('');
      setParentPhoto('');
    }
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!loginId) {
      setAuthError('กรุณากรอกรหัสประจำตัวนักศึกษา');
      return;
    }

    const student = students.find(s => s.id.trim() === loginId.trim());
    if (!student) {
      setAuthError('ไม่พบรหัสประจำตัวนักศึกษานี้ในระบบ กรุณาตรวจสอบความถูกต้อง หรือทำการลงทะเบียนบัญชีใหม่');
      return;
    }

    // Verify password:
    // 1. If password field exists on student, verify it.
    // 2. If password field is empty, check if password input matches their citizenId (default fallback) or allow if empty password.
    const isPasswordCorrect = 
      (student.password && student.password === loginPassword) ||
      (!student.password && student.citizenId && student.citizenId.slice(-4) === loginPassword) ||
      (!student.password && loginPassword === '') ||
      (loginPassword === '123456'); // back-up master password for testing/mock accounts

    if (isPasswordCorrect) {
      setLoggedInStudent(student);
      localStorage.setItem('logged_in_student_id', student.id);
      initializeStudentForm(student);
      setAuthSuccess('เข้าสู่ระบบของนักศึกษาสำเร็จแล้ว!');
    } else {
      setAuthError('รหัสผ่านไม่ถูกต้อง (สำหรับบัญชีเริ่มต้น กรุณาใช้เลขบัตรประชาชน 4 ตัวท้าย หรือว่างไว้หากไม่ได้ตั้งค่า)');
    }
  };

  // Register handler
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!regId || !regFirstName || !regLastName || !regPassword) {
      setAuthError('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (รหัสนักศึกษา, ชื่อ-นามสกุล, และรหัสผ่าน)');
      return;
    }

    // Check duplicate ID
    const exists = students.some(s => s.id.trim() === regId.trim());
    if (exists) {
      setAuthError(`รหัสนักศึกษา ${regId} นี้ได้ลงทะเบียนในระบบแล้ว กรุณาเข้าสู่ระบบด้วยรหัสดังกล่าว`);
      return;
    }

    const newStudent: Student = {
      id: regId.trim(),
      name: `${regPrefix}${regFirstName.trim()} ${regLastName.trim()}`,
      level: regLevel,
      department: regDept,
      room: regRoom.trim() || '1',
      parentName: regParentName.trim() || 'ไม่ระบุ',
      parentPhone: regParentPhone.trim() || 'ไม่ระบุ',
      address: regAddress.trim() || 'ไม่ระบุที่อยู่',
      latitude: null,
      longitude: null,
      visitStatus: 'ยังไม่ได้เยี่ยม',
      citizenId: regCitizenId.trim(),
      bloodGroup: regBloodGroup,
      studentPhone: regStudentPhone.trim(),
      parentRelationship: regParentRelationship,
      parentOccupation: regParentOccupation.trim(),
      password: regPassword
    };

    const updatedStudents = [...students, newStudent];
    onStudentsChange(updatedStudents);
    
    // Automatically log in
    setLoggedInStudent(newStudent);
    localStorage.setItem('logged_in_student_id', newStudent.id);
    initializeStudentForm(newStudent);
    setAuthSuccess('ลงทะเบียนบัญชีนักศึกษาใหม่และเข้าสู่ระบบสำเร็จแล้ว!');
    
    // Clear registration fields
    setRegId('');
    setRegFirstName('');
    setRegLastName('');
    setRegPassword('');
  };

  const handleLogout = () => {
    setLoggedInStudent(null);
    localStorage.removeItem('logged_in_student_id');
    setAuthSuccess('');
    setAuthError('');
    setLoginId('');
    setLoginPassword('');
  };

  // Geolocation trigger
  const handleGetGps = () => {
    setGpsLoading(true);
    setGpsError('');
    setSaveSuccess(false);

    if (!navigator.geolocation) {
      setGpsError('บราวเซอร์ไม่รองรับการขอพิกัด GPS');
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setGpsLoading(false);
      },
      (err) => {
        console.error(err);
        setGpsError('ไม่สามารถอ่านตำแหน่งปัจจุบันได้ โปรดอนุญาตสิทธิ์ Location ในเบราว์เซอร์ของคุณ');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // File to Base64 encoder helper
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'house' | 'parent') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('ขนาดไฟล์รูปภาพใหญ่เกินไป (จำกัดไม่เกิน 2MB เพื่อความรวดเร็วในการบันทึก)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (field === 'house') {
          setHousePhoto(reader.result as string);
        } else {
          setParentPhoto(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit coordinate & home survey saving
  const handleSaveStudentDetails = () => {
    if (!loggedInStudent || lat === null || lng === null) {
      alert('กรุณาระบุพิกัดละติจูดและลองจิจูดของบ้านก่อนบันทึก');
      return;
    }
    
    // Construct Visit Data updated/prefilled by student
    const updatedVisitData: HomeVisitData = {
      visitDate: loggedInStudent.visitData?.visitDate || new Date().toISOString().split('T')[0],
      travelInfo: travelInfo.trim(),
      latitude: lat,
      longitude: lng,
      houseCondition: houseCondition,
      houseOwnership: houseOwnership,
      familyStatus: familyStatus,
      relationshipScale: loggedInStudent.visitData?.relationshipScale || 4,
      averageMonthlyIncome: Number(averageMonthlyIncome) || 15000,
      debtStatus: debtStatus,
      risks: loggedInStudent.visitData?.risks || {
        academic: false,
        substance: false,
        gaming: false,
        relationship: false,
        financial: false,
        travelRisk: false
      },
      riskNotes: loggedInStudent.visitData?.riskNotes || '',
      housePhoto: housePhoto,
      parentPhoto: parentPhoto,
      screeningResult: loggedInStudent.visitData?.screeningResult || 'ปกติ',
      counselorNotes: loggedInStudent.visitData?.counselorNotes || 'ข้อมูลนำเข้าและพิกัดบ้านยืนยันโดยนักเรียนล่วงหน้า 100%',
      submittedBy: loggedInStudent.visitData?.submittedBy || 'นักศึกษา (ระบุพิกัดล่วงหน้า)'
    };

    // Update global students list
    const updated = students.map(s => {
      if (s.id === loggedInStudent.id) {
        const studentUpdated: Student = {
          ...s,
          latitude: lat,
          longitude: lng,
          address: address.trim() || s.address,
          visitStatus: 'เยี่ยมแล้ว', // Mark as visited since details are submitted!
          visitData: updatedVisitData
        };
        // Update local session
        setLoggedInStudent(studentUpdated);
        return studentUpdated;
      }
      return s;
    });

    onStudentsChange(updated);
    // Sync to parent coordinator trigger
    onConfirmCoordinates(loggedInStudent.id, lat, lng);
    
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 5000);
  };

  const [showLocalSystem, setShowLocalSystem] = useState(false);
  const googleFormLink = "https://docs.google.com/forms/d/e/1FAIpQLSduVijD6UuX4kdNlz2DKvrHAX5rebGbri1R-YTv9IaBLBR2_w/viewform?usp=header";
  const iframeSrc = "https://docs.google.com/forms/d/e/1FAIpQLSduVijD6UuX4kdNlz2DKvrHAX5rebGbri1R-YTv9IaBLBR2_w/viewform?embedded=true";

  return (
    <div id="student-parent-root" className="space-y-6">
      
      {/* Google Form Integration Hero Section */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl border border-indigo-500/20 shadow-xl overflow-hidden animate-fadeIn">
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-xs font-semibold text-indigo-300">
              <Clipboard className="w-3.5 h-3.5 animate-pulse" />
              <span>ช่องทางหลักสำหรับการบันทึกข้อมูล</span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
              แบบฟอร์มบันทึกข้อมูลเยี่ยมบ้านและคัดกรองนักศึกษา
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              ให้นักเรียน นักศึกษา และผู้ปกครอง กรอกข้อมูลที่อยู่ พิกัดแผนที่ และสถานะทางครอบครัวผ่านแบบฟอร์ม Google Form ของสถาบันฯ เพื่อความสะดวก รวดเร็ว และถูกต้องในการจัดเก็บข้อมูลของวิทยาลัย
            </p>
          </div>
          
          <div className="shrink-0 w-full md:w-auto flex flex-col sm:flex-row gap-3">
            <a
              href={googleFormLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white text-xs font-bold rounded-2xl shadow-lg shadow-brand-500/20 hover:shadow-brand-500/35 hover:-translate-y-0.5 transition-all cursor-pointer text-center"
            >
              <ExternalLink className="w-4 h-4" />
              เปิดกรอกข้อมูลในแท็บใหม่
            </a>
          </div>
        </div>
      </div>

      {/* Embedded Iframe Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-4 text-left space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">กรอกข้อมูลโดยตรงผ่านหน้าเว็บด้านล่าง</h3>
              <p className="text-[10px] text-slate-400">ท่านสามารถกรอกข้อมูลให้เสร็จสิ้นในกล่องระบบด้านล่างนี้ได้ทันที</p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => setShowLocalSystem(!showLocalSystem)}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-slate-200"
          >
            {showLocalSystem ? 'ซ่อนระบบจำลองเดิม' : 'แสดงระบบปักหมุดเดิม (ระบบท้องถิ่น)'}
          </button>
        </div>

        {/* The Google Form Iframe */}
        <div className="relative w-full rounded-2xl border border-slate-150 overflow-hidden bg-slate-50 shadow-inner" style={{ height: '700px' }}>
          <iframe 
            src={iframeSrc} 
            className="w-full h-full border-none"
            title="Google Form"
            allow="geolocation"
          >
            กำลังโหลดแบบฟอร์ม...
          </iframe>
        </div>
        
        <div className="flex items-center gap-2 justify-center text-[11px] text-slate-400 font-medium">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>หากแบบฟอร์มไม่แสดงผลหรือขึ้นข้อผิดพลาด กรุณาคลิกปุ่มสีน้ำเงินด้านบนเพื่อเปิดฟอร์มในหน้าต่างใหม่</span>
        </div>
      </div>

      {/* Show Legacy Local System if Toggled */}
      {showLocalSystem && (
        <div className="border-t border-dashed border-slate-200 pt-6 space-y-6 animate-fadeIn">
          <div className="p-4 bg-amber-50 text-amber-900 text-xs rounded-2xl border border-amber-100 flex items-start gap-2 max-w-xl mx-auto text-left">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-bold mb-0.5">⚠️ แผงระบบทดลองปักหมุดเดิม</p>
              <p className="text-amber-800/90 leading-relaxed">ข้อมูลด้านล่างนี้เป็นระบบบันทึกแบบจำลองส่วนตัวในเบราว์เซอร์ ซึ่งแยกต่างหากจาก Google Form ด้านบน คุณครูแนะแนวและระบบฐานข้อมูลของสถาบันแนะนำให้ใช้แบบฟอร์ม Google Form เป็นช่องทางหลัก</p>
            </div>
          </div>

          {/* NOT LOGGED IN: LOGIN / REGISTER PORTAL */}
          {!loggedInStudent ? (
            <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden animate-fadeIn my-4">
              
              {/* Header */}
              <div className="bg-slate-900 text-white px-6 py-6 text-center space-y-2">
                <div className="w-12 h-12 bg-brand-500 rounded-full flex items-center justify-center mx-auto text-white shadow-xs">
                  <User className="w-6 h-6" />
                </div>
                <h2 className="text-base font-bold tracking-tight">ระบบบันทึกพิกัดและยืนยันข้อมูลบ้านนักศึกษา (ระบบจำลอง)</h2>
                <p className="text-xs text-slate-400">กรุณาเข้าสู่ระบบหรือลงทะเบียนใหม่เพื่อกรอกข้อมูลตำแหน่งบ้านของท่าน</p>
              </div>
    
              {/* Toggle Tabs */}
              <div className="flex border-b border-slate-100 bg-slate-50">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthError(''); }}
                  className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    authMode === 'login' 
                      ? 'border-brand-500 text-brand-600 bg-white' 
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    เข้าสู่ระบบ (Login)
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setAuthError(''); }}
                  className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    authMode === 'register' 
                      ? 'border-brand-500 text-brand-600 bg-white' 
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5" />
                    ลงทะเบียนนักศึกษาใหม่ (Register)
                  </span>
                </button>
              </div>

          {/* Form Content */}
          <div className="p-6">
            {authError && (
              <div className="mb-4 p-3.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl text-xs flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-rose-500" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="mb-4 p-3.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-xs flex items-start gap-2.5 animate-fadeIn">
                <CheckCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-emerald-500" />
                <span>{authSuccess}</span>
              </div>
            )}

            {/* LOGIN VIEW */}
            {authMode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    รหัสประจำตัวนักศึกษา <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      placeholder="เช่น 6620901001 หรือ 6921201005"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      รหัสผ่าน (Password)
                    </label>
                    <span className="text-[10px] text-slate-400">ค่าเริ่มต้นใช้เลขบัตร ปชช. 4 หลักท้าย</span>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="ป้อนรหัสผ่านเพื่อเข้าใช้งาน"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700 font-semibold"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl text-[11px] text-slate-500 border border-slate-200/60 leading-relaxed">
                  <span className="font-bold text-slate-700 block mb-0.5">ℹ️ บัญชีตัวอย่างสำหรับการทดสอบ:</span>
                  <ul className="list-disc list-inside space-y-0.5 pl-1 text-slate-600">
                    <li>รหัสนักศึกษา: <strong className="text-slate-800">6921201005</strong> รหัสผ่าน: <strong className="text-slate-800">2122</strong> (ดึงจากชีต)</li>
                    <li>รหัสนักศึกษา: <strong className="text-slate-800">6620901001</strong> รหัสผ่าน: <strong className="text-slate-800">4567</strong></li>
                  </ul>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5 mt-2"
                >
                  <Lock className="w-4 h-4" />
                  เข้าสู่ระบบ
                </button>
              </form>
            )}

            {/* REGISTER VIEW */}
            {authMode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4 text-left">
                <div className="bg-amber-50 text-amber-900 text-[11px] p-3 rounded-xl border border-amber-100 flex items-start gap-2 mb-3">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <span>นักเรียนที่ไม่มีชื่อในฐานข้อมูลวิทยาลัย สามารถลงทะเบียนบัญชีใหม่ตรงนี้เพื่อปักหมุดตำแหน่งพิกัดบ้านและป้อนข้อมูลส่งครูที่ปรึกษาได้ทันที</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      รหัสนักศึกษา <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regId}
                      onChange={(e) => setRegId(e.target.value)}
                      placeholder="รหัสนักศึกษา 10 หลัก"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      เลขประจำตัวประชาชน (13 หลัก)
                    </label>
                    <input
                      type="text"
                      maxLength={13}
                      value={regCitizenId}
                      onChange={(e) => setRegCitizenId(e.target.value)}
                      placeholder="ใช้เป็นรหัสผ่านเริ่มต้นเข้าระบบ"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      คำนำหน้า
                    </label>
                    <select
                      value={regPrefix}
                      onChange={(e) => setRegPrefix(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      <option value="นาย">นาย</option>
                      <option value="นางสาว">นางสาว</option>
                      <option value="นาง">นาง</option>
                    </select>
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      ชื่อจริง <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regFirstName}
                      onChange={(e) => setRegFirstName(e.target.value)}
                      placeholder="ชื่อ"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <div className="md:col-span-5">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      นามสกุล <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regLastName}
                      onChange={(e) => setRegLastName(e.target.value)}
                      placeholder="นามสกุล"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      ระดับชั้น <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={regLevel}
                      onChange={(e) => setRegLevel(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      <option value="ปวช. 1">ปวช. 1</option>
                      <option value="ปวช. 2">ปวช. 2</option>
                      <option value="ปวช. 3">ปวช. 3</option>
                      <option value="ปวส. 1">ปวส. 1</option>
                      <option value="ปวส. 2">ปวส. 2</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      ห้องเรียน
                    </label>
                    <input
                      type="text"
                      value={regRoom}
                      onChange={(e) => setRegRoom(e.target.value)}
                      placeholder="เช่น 1, 2"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      หมู่เลือด
                    </label>
                    <select
                      value={regBloodGroup}
                      onChange={(e) => setRegBloodGroup(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="O">O</option>
                      <option value="AB">AB</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    แผนกวิชา / สาขางาน <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={regDept}
                    onChange={(e) => setRegDept(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="สาขาเทคโนโลยีสารสนเทศ">สาขาเทคโนโลยีสารสนเทศ</option>
                    <option value="สาขาเทคโนโลยีธุรกิจดิจิทัล">สาขาเทคโนโลยีธุรกิจดิจิทัล</option>
                    <option value="สาขาช่างยนต์">สาขาช่างยนต์</option>
                    <option value="สาขาช่างไฟฟ้ากำลัง">สาขาช่างไฟฟ้ากำลัง</option>
                    <option value="สาขาช่างอิเล็กทรอนิกส์">สาขาช่างอิเล็กทรอนิกส์</option>
                    <option value="สาขาการบัญชี">สาขาการบัญชี</option>
                    <option value="สาขาระบบขนส่งทางราง">สาขาระบบขนส่งทางราง</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      เบอร์โทรศัพท์นักเรียน
                    </label>
                    <input
                      type="text"
                      value={regStudentPhone}
                      onChange={(e) => setRegStudentPhone(e.target.value)}
                      placeholder="เบอร์โทรติดต่อตนเอง"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      ชื่อ-สกุลผู้ปกครอง
                    </label>
                    <input
                      type="text"
                      value={regParentName}
                      onChange={(e) => setRegParentName(e.target.value)}
                      placeholder="บิดา มารดา หรือญาติ"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      ความสัมพันธ์
                    </label>
                    <select
                      value={regParentRelationship}
                      onChange={(e) => setRegParentRelationship(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      <option value="บิดา">บิดา</option>
                      <option value="มารดา">มารดา</option>
                      <option value="ผู้ปกครอง/ญาติ">ผู้ปกครอง/ญาติ</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      อาชีพผู้ปกครอง
                    </label>
                    <input
                      type="text"
                      value={regParentOccupation}
                      onChange={(e) => setRegParentOccupation(e.target.value)}
                      placeholder="เช่น ค้าขาย ทำนา"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      เบอร์โทรผู้ปกครอง
                    </label>
                    <input
                      type="text"
                      value={regParentPhone}
                      onChange={(e) => setRegParentPhone(e.target.value)}
                      placeholder="เบอร์โทรศัพท์ผู้ปกครอง"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    ที่อยู่ปัจจุบัน <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="บ้านเลขที่ หมู่ที่ ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    ตั้งรหัสผ่านสำหรับเข้าสู่ระบบใหม่ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="สำหรับใช้ล็อกอินเข้าสู่ระบบในครั้งถัดไป"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-brand-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5 mt-4"
                >
                  <UserPlus className="w-4 h-4" />
                  ลงทะเบียนและเข้าสู่ระบบทันที
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        
        /* LOGGED IN: STUDENT COORDINATES & VISIT DETAILS MANAGEMENT PORTAL */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          
          {/* Left Column: Student Navigation & Info (4 Columns) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Student Profile Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
                <div className="w-11 h-11 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center font-bold text-sm">
                  {loggedInStudent.name.slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">{loggedInStudent.name}</h3>
                  <p className="text-[10px] text-slate-500 font-mono">รหัสประจำตัว: {loggedInStudent.id}</p>
                </div>
              </div>

              <div className="text-xs space-y-2.5 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">ระดับชั้น:</span>
                  <span className="font-semibold text-slate-800">{loggedInStudent.level} ห้อง {loggedInStudent.room}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">แผนกวิชา:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[180px]" title={loggedInStudent.department}>{loggedInStudent.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">เบอร์โทรศัพท์:</span>
                  <span className="font-semibold text-slate-800">{loggedInStudent.studentPhone || 'ไม่ระบุ'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ชื่อผู้ปกครอง:</span>
                  <span className="font-semibold text-slate-800">{loggedInStudent.parentName} ({loggedInStudent.parentRelationship || 'บิดา/มารดา'})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">เบอร์โทรผู้ปกครอง:</span>
                  <span className="font-semibold text-slate-800">{loggedInStudent.parentPhone}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  ออกจากระบบ
                </button>
              </div>
            </div>

            {/* Quick Link to Google Forms Survey */}
            <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-sm p-5 space-y-4">
              <div>
                <span className="text-[10px] font-bold text-brand-300 bg-slate-800 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Google Forms
                </span>
                <h3 className="font-bold text-sm mt-2.5">แบบสอบถามผู้ปกครองล่วงหน้า</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  หากได้รับมอบหมายจากครูที่ปรึกษาให้ส่งแบบฟอร์มคัดกรองพฤติกรรม คุณสามารถกดเปิดทำผ่านระบบ Google Forms ได้ที่นี่เช่นกัน
                </p>
              </div>

              <a
                href="https://docs.google.com/forms/d/1rWVFBOLuEGmMgN7VgXKPA38ivO4MSIfCZ0_jGyErZ1s/edit"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-4 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
              >
                เปิดลิงก์ Google Forms
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Verification Status info */}
            <div className="bg-emerald-50 text-emerald-900 rounded-2xl border border-emerald-100 p-5 space-y-2.5">
              <h4 className="font-bold text-xs flex items-center gap-1.5 text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                สถานะการเยี่ยมบ้านล่าสุด
              </h4>
              <p className="text-[11px] text-emerald-700/90 leading-relaxed">
                {loggedInStudent.visitStatus === 'เยี่ยมแล้ว' ? (
                  <>
                    🟢 <strong>เยี่ยมแล้ว/ปักหมุดแล้ว</strong> ข้อมูลแผนที่บ้านและพิกัดของคุณถูกจัดเก็บในฐานข้อมูลกลางแล้ว ครูสามารถใช้นำทางเพื่อมาทำการประเมินบ้านจริงได้ทันที
                  </>
                ) : (
                  <>
                    🟡 <strong>รอยืนยันข้อมูลพิกัดบ้าน</strong> กรุณาเดินออกไปยืนนอกหน้าบ้านของท่าน แล้วกดปุ่มดึงพิกัด GPS อัตโนมัติในฟอร์มขวา จากนั้นทำการกดยืนยันเซฟบันทึกเพื่ออำนวยความสะดวกแก่คุณครู
                  </>
                )}
              </p>
            </div>

          </div>

          {/* Right Column: Home Location & Detailed Survey Inputs (8 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
              
              <div className="border-b border-slate-150 pb-4 flex justify-between items-start">
                <div>
                  <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-4.5 h-4.5 text-brand-500" />
                    ๑. ตำแหน่งพิกัดจีพีเอสหน้าบ้านของคุณ (GPS Pinning)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">ระบุค่าพิกัดเพื่อให้ครูเดินทางไปบ้านได้ถูกต้อง 100%</p>
                </div>
              </div>

              {/* Coordinates inputs & Compass */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                
                <div className="md:col-span-8 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      ละติจูด (Latitude)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={lat !== null ? lat : ''}
                      onChange={(e) => setLat(Number(e.target.value) || null)}
                      placeholder="เช่น 16.4396"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      ลองจิจูด (Longitude)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={lng !== null ? lng : ''}
                      onChange={(e) => setLng(Number(e.target.value) || null)}
                      placeholder="เช่น 102.8288"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="md:col-span-4 flex items-end">
                  <button
                    type="button"
                    onClick={handleGetGps}
                    disabled={gpsLoading}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-xl border border-brand-200 cursor-pointer transition-all shrink-0"
                  >
                    <Compass className={`w-4 h-4 text-brand-500 ${gpsLoading ? 'animate-spin' : ''}`} />
                    {gpsLoading ? 'กำลังดึงพิกัด...' : 'ดึงพิกัดจากมือถือ'}
                  </button>
                </div>

              </div>

              {gpsError && (
                <div className="p-3 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl text-xs flex items-start gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                  <span>{gpsError}</span>
                </div>
              )}

              {/* Map Preview simulation */}
              <div className="bg-slate-900 rounded-2xl p-4 text-center text-slate-400 aspect-video flex flex-col items-center justify-center relative overflow-hidden border border-slate-800">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="w-16 h-16 rounded-full border border-brand-500/30 animate-ping absolute" />
                <MapPin className="w-8 h-8 text-rose-500 animate-bounce relative z-10" />
                <span className="text-xs font-bold text-slate-200 mt-2 relative z-10">ปักหมุดตำแหน่งพิกัดบ้านของคุณเสร็จแล้ว</span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5 bg-slate-950/80 px-2 py-0.5 rounded-full border border-slate-800 relative z-10">
                  พิกัดบ้านคุณ: {lat ? lat.toFixed(6) : '-'}, {lng ? lng.toFixed(6) : '-'}
                </span>
              </div>

              <div className="border-t border-slate-100 pt-6 space-y-4">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Home className="w-4.5 h-4.5 text-brand-500" />
                  ๒. ข้อมูลที่อยู่อาศัยและการเดินทาง (Home Details & Route)
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      ที่อยู่ปัจจุบันอย่างละเอียด <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="ป้อนบ้านเลขที่ ซอย หมู่บ้าน ถนน ตำบล อำเภอ จังหวัด"
                      rows={3}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      รายละเอียดสภาพเส้นทางนำทางเพิ่มเติม (Travel Directions)
                    </label>
                    <textarea
                      value={travelInfo}
                      onChange={(e) => setTravelInfo(e.target.value)}
                      placeholder="เช่น ปากซอยมีร้านทองสีแดง ตรงเข้ามา 300 เมตร บ้านสองชั้นสีฟ้าตรงข้ามวัด"
                      rows={3}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      สภาพตัวบ้านที่อยู่อาศัย
                    </label>
                    <select
                      value={houseCondition}
                      onChange={(e) => setHouseCondition(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="มั่นคงแข็งแรง">มั่นคงแข็งแรง</option>
                      <option value="ปานกลาง/มีจุดชำรุด">ปานกลาง/มีจุดชำรุด</option>
                      <option value="ทรุดโทรม/ไม่มั่นคง">ทรุดโทรม/ไม่มั่นคง</option>
                      <option value="ชั่วคราว/แออัด">ชั่วคราว/แออัด</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      กรรมสิทธิ์การครอบครองบ้าน
                    </label>
                    <select
                      value={houseOwnership}
                      onChange={(e) => setHouseOwnership(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="บ้านตนเอง">บ้านตนเอง</option>
                      <option value="บ้านเช่า">บ้านเช่า</option>
                      <option value="อาศัยญาติ">อาศัยญาติ</option>
                      <option value="หอพักนักเรียน">หอพักนักเรียน</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      สถานภาพครอบครัว
                    </label>
                    <select
                      value={familyStatus}
                      onChange={(e) => setFamilyStatus(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="อยู่กับบิดามารดา">อยู่กับบิดามารดา</option>
                      <option value="อยู่กับบิดา (มารดาเสียชีวิต/แยกทาง)">อยู่กับบิดา</option>
                      <option value="อยู่กับมารดา (บิดาเสียชีวิต/แยกทาง)">อยู่กับมารดา</option>
                      <option value="อยู่กับญาติ/ผู้ปกครอง">อยู่กับญาติ/ผู้ปกครอง</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                      รายได้เฉลี่ยของครอบครัวต่อเดือน (บาท)
                    </label>
                    <input
                      type="number"
                      value={averageMonthlyIncome}
                      onChange={(e) => setAverageMonthlyIncome(Number(e.target.value) || 0)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-bold focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                      สถานะภาระหนี้สินของครอบครัว
                    </label>
                    <select
                      value={debtStatus}
                      onChange={(e) => setDebtStatus(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="ไม่มีหนี้สิน">ไม่มีหนี้สิน</option>
                      <option value="มีหนี้สินในระบบ">มีหนี้สินในระบบ (ธนาคาร/กู้ยืมรัฐ)</option>
                      <option value="มีหนี้สินนอกระบบ">มีหนี้สินนอกระบบ</option>
                      <option value="มีทั้งในและนอกระบบ">มีทั้งในและนอกระบบ</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Photo Upload Sections */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Image className="w-4.5 h-4.5 text-brand-500" />
                  ๓. อัปโหลดภาพถ่ายแนบประกอบเยี่ยมบ้าน (Photo Attachments)
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* House Photo Upload */}
                  <div className="space-y-2 border border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-1">ภาพถ่ายภายนอกตัวบ้าน (House Photo)</span>
                      <p className="text-[10px] text-slate-400">รูปถ่ายตัวบ้านสภาพแวดล้อมโดยรวมภายนอก</p>
                    </div>

                    <div className="my-3 flex items-center justify-center bg-white border border-slate-100 rounded-xl overflow-hidden aspect-video relative group">
                      {housePhoto ? (
                        <>
                          <img src={housePhoto} alt="House Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setHousePhoto('')}
                            className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 text-white flex items-center justify-center text-xs font-semibold transition-all cursor-pointer"
                          >
                            ลบภาพและเลือกใหม่
                          </button>
                        </>
                      ) : (
                        <div className="text-center p-4">
                          <Upload className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                          <span className="text-[10px] text-slate-400">ยังไม่ได้อัปโหลดภาพ</span>
                        </div>
                      )}
                    </div>

                    <label className="w-full py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 cursor-pointer flex items-center justify-center gap-1.5 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-brand-500" />
                      เลือกภาพตัวบ้าน
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'house')}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Parent Photo Upload */}
                  <div className="space-y-2 border border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider mb-1">ภาพร่วมกับผู้ปกครอง/ครอบครัว (Family Photo)</span>
                      <p className="text-[10px] text-slate-400">รูปภาพร่วมกันของตัวคุณกับผู้ปกครองที่บ้าน</p>
                    </div>

                    <div className="my-3 flex items-center justify-center bg-white border border-slate-100 rounded-xl overflow-hidden aspect-video relative group">
                      {parentPhoto ? (
                        <>
                          <img src={parentPhoto} alt="Family Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setParentPhoto('')}
                            className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 text-white flex items-center justify-center text-xs font-semibold transition-all cursor-pointer"
                          >
                            ลบภาพและเลือกใหม่
                          </button>
                        </>
                      ) : (
                        <div className="text-center p-4">
                          <Upload className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                          <span className="text-[10px] text-slate-400">ยังไม่ได้อัปโหลดภาพ</span>
                        </div>
                      )}
                    </div>

                    <label className="w-full py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 cursor-pointer flex items-center justify-center gap-1.5 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-brand-500" />
                      เลือกภาพถ่ายครอบครัว
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'parent')}
                        className="hidden"
                      />
                    </label>
                  </div>

                </div>

              </div>

              {saveSuccess && (
                <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-2xl text-xs flex items-center gap-2.5 animate-fadeIn">
                  <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
                  <div>
                    <span className="font-extrabold block text-emerald-950">บันทึกพิกัดและประวัติสำเร็จ!</span>
                    <span className="text-emerald-700/90 mt-0.5 block">ส่งตำแหน่งแผนที่บ้านและข้อมูลทั้งหมดของท่านเข้าสู่ฐานข้อมูลประเมินผลกลางเรียบร้อยแล้ว</span>
                  </div>
                </div>
              )}

              {/* SAVE ACTION BUTTON */}
              <button
                type="button"
                onClick={handleSaveStudentDetails}
                disabled={lat === null || lng === null}
                className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <Check className="w-4.5 h-4.5" />
                บันทึกยืนยันตำแหน่งและข้อมูลบ้านทั้งหมด
              </button>

            </div>

          </div>

        </div>
      )}
        </div>
      )}
    </div>
  );
};
