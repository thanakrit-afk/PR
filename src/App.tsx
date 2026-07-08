import { useState, useEffect } from 'react';
import { Student, HomeVisitData } from './types';
import { INITIAL_MOCK_STUDENTS } from './mockData';
import { SyncPanel } from './components/SyncPanel';
import { StudentCard } from './components/StudentCard';
import { HomeVisitForm } from './components/HomeVisitForm';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { ParentMapPinning } from './components/ParentMapPinning';
import { StudentDetailsModal } from './components/StudentDetailsModal';
import { 
  Users, CheckCircle, Database, HelpCircle, RefreshCw, 
  Search, Shield, AlertCircle, Sparkles, SlidersHorizontal, BookOpen, Settings
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

  const [isSynced, setIsSynced] = useState<boolean>(() => {
    return localStorage.getItem('is_synced') === 'true';
  });

  const [activeRole, setActiveRole] = useState<'teacher' | 'executive' | 'parent' | 'settings'>('teacher');
  const [isLoading, setIsLoading] = useState(false);
  const [errorNotification, setErrorNotification] = useState('');
  const [successNotification, setSuccessNotification] = useState('');

  // Filtering / Search States for Student List
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Active form / modal triggers
  const [activeFormStudent, setActiveFormStudent] = useState<Student | null>(null);
  const [viewingDetailsStudent, setViewingDetailsStudent] = useState<Student | null>(null);

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
      localStorage.removeItem('student_visits_data');
      setSuccessNotification('รีเซ็ตข้อมูลเป็นค่าเริ่มต้นสำหรับการนำเสนอเรียบร้อยแล้ว');
    }
  };

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
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">TS</div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate text-slate-200">ครูสมชาย (T. Somchai)</p>
              <p className="text-[10px] text-slate-400">Consultant Teacher</p>
            </div>
          </div>
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
              {activeRole === 'settings' && 'การตั้งค่าฐานข้อมูลและการเชื่อมคลาวด์'}
            </h2>
            <p className="text-[11px] text-slate-400 font-medium">
              {activeRole === 'teacher' && 'ค้นหา คัดกรอง และบันทึกพิกัดเยี่ยมบ้าน พร้อมวิเคราะห์ความพร้อมครอบครัว'}
              {activeRole === 'executive' && 'รายงานวิเคราะห์อัตราความสำเร็จ และติดตามช่วยเหลือนักศึกษากลุ่มวิกฤต'}
              {activeRole === 'parent' && 'ประตูป้อนข้อมูลสำหรับผู้ปกครองเพื่อส่งพิกัดแผนที่ตำแหน่งบ้านให้ครูที่ปรึกษา'}
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
            <div className="mb-6 p-4 bg-rose-50 text-rose-800 border border-rose-100 rounded-2xl text-xs flex items-start gap-2.5 shadow-xs animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <div className="flex-1">
                <p className="font-semibold text-rose-900">แจ้งเตือนระบบ</p>
                <p className="text-rose-700/90 mt-0.5 leading-normal">{errorNotification}</p>
              </div>
            </div>
          )}

          {/* Dynamic Success Notification banner */}
          {successNotification && (
            <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-2xl text-xs flex items-start gap-2.5 shadow-xs animate-fadeIn">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
              <div className="flex-1">
                <p className="font-semibold text-emerald-900">ดำเนินการสำเร็จ</p>
                <p className="text-emerald-700/90 mt-0.5 leading-normal">{successNotification}</p>
              </div>
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
                <div className="space-y-6">
                  
                  {/* Search & Advanced Filters Panels */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-sm font-bold text-slate-800">ค้นหารายชื่อและคัดกรองนักศึกษา</h2>
                        <p className="text-xs text-slate-500">เลือกกรองตามระดับชั้น แผนกวิชา หรือเลือกสถานะการเยี่ยม</p>
                      </div>

                      {/* Filter stats block */}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400">ตัวเลือกการจัดกลุ่ม:</span>
                        <span className="font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                          พบตรงเงื่อนไข {filteredStudents.length} ราย
                        </span>
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
                          />
                        ))}
                      </div>
                    )}
                  </div>

                </div>
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
                />
              )}

              {/* Tab 4: Cloud Sync Settings - ตั้งค่าสคริปต์เชื่อมโยงชีต */}
              {activeRole === 'settings' && (
                <div className="space-y-6">
                  <SyncPanel
                    appsScriptUrl={appsScriptUrl}
                    setAppsScriptUrl={setAppsScriptUrl}
                    isSynced={isSynced}
                    setIsSynced={setIsSynced}
                    onFetchFromSheet={handleFetchFromSheet}
                    onPushToSheet={async () => {}} // dummy push
                    isLoading={isLoading}
                  />

                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
                    <h3 className="text-base font-bold text-slate-800 mb-2">ล้างข้อมูล Sandbox และเครื่องมือ</h3>
                    <p className="text-xs text-slate-500 mb-4">จัดพอร์ตทดสอบระบบใหม่ หรือ คืนสถานะค่าเริ่มต้นจำลองของเด็กทุกคนที่ยังไม่ได้ลงบันทึก</p>
                    
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleResetToDefaults}
                        className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        รีเซ็ตข้อมูลเป็น Sandbox เริ่มต้น
                      </button>
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
