import React, { useState } from 'react';
import { Student } from '../types';
import { 
  Lock, ShieldCheck, UserCheck, LogOut, Trash2, Edit, Plus, 
  Search, AlertCircle, X, Check, Save, UserPlus, Phone, MapPin, Layers
} from 'lucide-react';

interface AdminDashboardProps {
  students: Student[];
  onStudentsChange: (students: Student[]) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  students,
  onStudentsChange
}) => {
  // Login State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('admin_authenticated') === 'true';
  });
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Search & Filters inside Admin Panel
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');

  // Modals for CRUD
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);

  // Form States for Adding/Editing
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formLevel, setFormLevel] = useState<Student['level']>('ปวช. 1');
  const [formDepartment, setFormDepartment] = useState('');
  const [formRoom, setFormRoom] = useState('');
  const [formParentName, setFormParentName] = useState('');
  const [formParentPhone, setFormParentPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formNickname, setFormNickname] = useState('');
  const [formCitizenId, setFormCitizenId] = useState('');
  const [formBloodGroup, setFormBloodGroup] = useState('O');
  const [formStudentPhone, setFormStudentPhone] = useState('');
  const [formParentRelationship, setFormParentRelationship] = useState('ผู้ปกครอง');
  const [formParentOccupation, setFormParentOccupation] = useState('');
  const [formError, setFormError] = useState('');

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (loginId.trim() === 'admin' && loginPassword === '44120') {
      setIsAdminLoggedIn(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      setLoginId('');
      setLoginPassword('');
    } else {
      setLoginError('รหัสผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง โปรดระบุใหม่อีกครั้ง');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('admin_authenticated');
  };

  // Delete Student
  const handleDeleteStudent = (studentId: string, studentName: string) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลของ "${studentName}" (รหัส ${studentId}) ออกจากฐานข้อมูลถาวร? การลบนี้จะไม่สามารถย้อนกลับได้`)) {
      const updated = students.filter(s => s.id !== studentId);
      onStudentsChange(updated);
    }
  };

  // Open Edit Modal
  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormId(student.id);
    setFormName(student.name);
    setFormLevel(student.level);
    setFormDepartment(student.department);
    setFormRoom(student.room);
    setFormParentName(student.parentName);
    setFormParentPhone(student.parentPhone);
    setFormAddress(student.address);
    setFormNickname(student.nickname || '');
    setFormCitizenId(student.citizenId || '');
    setFormBloodGroup(student.bloodGroup || 'O');
    setFormStudentPhone(student.studentPhone || '');
    setFormParentRelationship(student.parentRelationship || 'ผู้ปกครอง');
    setFormParentOccupation(student.parentOccupation || '');
    setFormError('');
  };

  // Open Add Modal
  const openAddModal = () => {
    setIsAddingStudent(true);
    setFormId('');
    setFormName('');
    setFormLevel('ปวช. 1');
    setFormDepartment('ระบบขนส่งทางราง');
    setFormRoom('1');
    setFormParentName('');
    setFormParentPhone('');
    setFormAddress('');
    setFormNickname('');
    setFormCitizenId('');
    setFormBloodGroup('O');
    setFormStudentPhone('');
    setFormParentRelationship('บิดา');
    setFormParentOccupation('');
    setFormError('');
  };

  // Close form/modals
  const closeModals = () => {
    setEditingStudent(null);
    setIsAddingStudent(false);
    setFormError('');
  };

  // Handle Add/Edit Form Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Basic Validation
    if (!formId.trim()) {
      setFormError('กรุณากรอกรหัสประจำตัวนักเรียน');
      return;
    }
    if (!formName.trim()) {
      setFormError('กรุณากรอกชื่อ-นามสกุลนักเรียน');
      return;
    }
    if (!formDepartment.trim()) {
      setFormError('กรุณากรอกแผนกวิชา');
      return;
    }
    if (!formRoom.trim()) {
      setFormError('กรุณากรอกห้องเรียน');
      return;
    }
    if (!formParentName.trim()) {
      setFormError('กรุณากรอกชื่อผู้ปกครอง');
      return;
    }
    if (!formParentPhone.trim()) {
      setFormError('กรุณากรอกเบอร์โทรศัพท์ผู้ปกครอง');
      return;
    }
    if (!formAddress.trim()) {
      setFormError('กรุณากรอกที่อยู่ปัจจุบัน');
      return;
    }

    if (isAddingStudent) {
      // Check duplicate ID
      const isDuplicate = students.some(s => s.id === formId.trim());
      if (isDuplicate) {
        setFormError(`รหัสนักเรียน ${formId} ซ้ำกับในระบบ มีนักเรียนรหัสนี้อยู่แล้ว`);
        return;
      }

      const newStudent: Student = {
        id: formId.trim(),
        name: formName.trim(),
        level: formLevel,
        department: formDepartment.trim(),
        room: formRoom.trim(),
        parentName: formParentName.trim(),
        parentPhone: formParentPhone.trim(),
        address: formAddress.trim(),
        latitude: null,
        longitude: null,
        visitStatus: 'ยังไม่ได้เยี่ยม',
        nickname: formNickname.trim(),
        citizenId: formCitizenId.trim(),
        bloodGroup: formBloodGroup.trim(),
        studentPhone: formStudentPhone.trim(),
        parentRelationship: formParentRelationship.trim(),
        parentOccupation: formParentOccupation.trim()
      };

      onStudentsChange([...students, newStudent]);
      closeModals();
    } else if (editingStudent) {
      // If student ID changed, check duplicate for other records
      if (formId.trim() !== editingStudent.id) {
        const isDuplicate = students.some(s => s.id === formId.trim() && s.id !== editingStudent.id);
        if (isDuplicate) {
          setFormError(`รหัสนักเรียน ${formId} ซ้ำกับนักเรียนท่านอื่นในฐานข้อมูล`);
          return;
        }
      }

      // Map to update student, preserving their visitStatus & visitData
      const updated = students.map(s => {
        if (s.id === editingStudent.id) {
          return {
            ...s,
            id: formId.trim(),
            name: formName.trim(),
            level: formLevel,
            department: formDepartment.trim(),
            room: formRoom.trim(),
            parentName: formParentName.trim(),
            parentPhone: formParentPhone.trim(),
            address: formAddress.trim(),
            nickname: formNickname.trim(),
            citizenId: formCitizenId.trim(),
            bloodGroup: formBloodGroup.trim(),
            studentPhone: formStudentPhone.trim(),
            parentRelationship: formParentRelationship.trim(),
            parentOccupation: formParentOccupation.trim()
          };
        }
        return s;
      });

      onStudentsChange(updated);
      closeModals();
    }
  };

  // Filter students based on search inside admin panel
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.id.includes(searchQuery) ||
      student.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLevel = selectedLevel === 'all' || student.level === selectedLevel;

    return matchesSearch && matchesLevel;
  });

  // If not logged in as Admin, show login UI
  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-base font-extrabold text-slate-800 uppercase tracking-tight">เข้าสู่ระบบผู้ดูแลระบบ (Admin)</h2>
          <p className="text-xs text-slate-400 mt-1">จำเป็นต้องระบุบัญชีผู้มีสิทธิ์เพื่อลบหรือแก้ไขฐานข้อมูลนักเรียน</p>
        </div>

        {loginError && (
          <div className="mb-4 p-3.5 bg-rose-50 text-rose-800 border border-rose-100 rounded-lg text-xs flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <span className="font-medium">{loginError}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              บัญชีผู้ใช้ (ID)
            </label>
            <input
              type="text"
              required
              placeholder="กรอก ID ของแอดมิน"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700 font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              รหัสผ่าน (Password)
            </label>
            <input
              type="password"
              required
              placeholder="กรอกรหัสผ่าน 5 หลัก"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700 font-medium"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 mt-2 shadow-xs"
          >
            <ShieldCheck className="w-4 h-4" />
            ยืนยันสิทธิ์เข้าใช้งาน
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-200/60 text-center text-[10px] text-slate-400 font-medium leading-relaxed">
          หมายเหตุผู้ทดสอบ: ID ทั่วไปคือ <span className="font-bold font-mono bg-slate-100 text-slate-600 px-1 rounded">admin</span> และรหัสผ่านคือ <span className="font-bold font-mono bg-slate-100 text-slate-600 px-1 rounded">44120</span>
        </div>
      </div>
    );
  }

  // Admin Logged-In UI
  return (
    <div className="space-y-6">
      
      {/* Admin Action Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">ระบบจัดการฐานข้อมูลนักเรียน (Admin Center)</h3>
            <p className="text-xs text-slate-500 font-medium">สิทธิ์การดำเนินการสูงสุด: เพิ่ม ลบ หรือแก้ไขประวัตินักเรียนและสถานะเยี่ยมบ้าน</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={openAddModal}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            เพิ่มรายชื่อนักเรียนใหม่
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-colors cursor-pointer border border-slate-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            ออกจากระบบ
          </button>
        </div>
      </div>

      {/* Database Quick Stats & Search Panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-tight">รายชื่อทั้งหมดในระบบคลาวด์/โลคอล ({filteredStudents.length} จาก {students.length} คน)</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">ค้นหา รหัสนักศึกษา หรือ ชื่อ เพื่อดำเนินการลบหรือแก้ไขข้อมูล</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            {/* Level Select filter */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white font-medium"
            >
              <option value="all">ทุกระดับชั้น</option>
              <option value="ปวช. 1">ปวช. 1</option>
              <option value="ปวช. 2">ปวช. 2</option>
              <option value="ปวช. 3">ปวช. 3</option>
              <option value="ปวส. 1">ปวส. 1</option>
              <option value="ปวส. 2">ปวส. 2</option>
            </select>

            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ, รหัสนักเรียน, หรือแผนก..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Database Table view for precision control */}
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-xs text-left text-slate-600">
            <thead className="text-[10px] uppercase font-bold text-slate-400 bg-slate-50/70 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">รหัสนักศึกษา</th>
                <th className="px-4 py-3">ชื่อ-นามสกุล</th>
                <th className="px-4 py-3">ระดับชั้น</th>
                <th className="px-4 py-3">แผนกวิชา</th>
                <th className="px-4 py-3">เบอร์ผู้ปกครอง</th>
                <th className="px-4 py-3">สถานะเยี่ยมบ้าน</th>
                <th className="px-4 py-3 text-right">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400 font-medium">
                    ไม่พบข้อมูลนักเรียนที่ค้นหาในระบบฐานข้อมูล
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const isVisited = student.visitStatus === 'เยี่ยมแล้ว';
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-800">{student.id}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-700">{student.name}</td>
                      <td className="px-4 py-3.5">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold text-[10px]">
                          {student.level} ห้อง {student.room}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-medium">{student.department}</td>
                      <td className="px-4 py-3.5 font-mono text-slate-500">{student.parentPhone}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isVisited 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                            : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>
                          {student.visitStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(student)}
                          className="inline-flex items-center justify-center p-1.5 bg-slate-50 border border-slate-200 text-slate-600 hover:text-brand-600 hover:bg-brand-50 hover:border-brand-200 rounded-md transition-colors cursor-pointer"
                          title="แก้ไขข้อมูลนักเรียน"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStudent(student.id, student.name)}
                          className="inline-flex items-center justify-center p-1.5 bg-slate-50 border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 rounded-md transition-colors cursor-pointer"
                          title="ลบรายชื่อนักเรียน"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT DIALOG MODAL CONTAINER */}
      {(isAddingStudent || editingStudent) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-md border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-brand-500" />
                {isAddingStudent ? 'เพิ่มประวัตินักเรียนนักศึกษาใหม่' : 'แก้ไขข้อมูลประวัตินักเรียนนักศึกษา'}
              </h3>
              <button
                type="button"
                onClick={closeModals}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-200"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {formError && (
                <div className="p-3.5 bg-rose-50 text-rose-800 border border-rose-100 rounded-lg text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                  <span className="font-medium">{formError}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Section 1 title */}
                <div className="border-b border-slate-150 pb-1.5 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">๑. ข้อมูลส่วนตัวนักเรียน/นักศึกษา</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Student ID */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      รหัสประจำตัวนักศึกษา <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น 6620901001"
                      value={formId}
                      onChange={(e) => setFormId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700 font-mono font-bold"
                    />
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น นายปัญญา รักดี"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {/* Nickname */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      ชื่อเล่น
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น สม"
                      value={formNickname}
                      onChange={(e) => setFormNickname(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700"
                    />
                  </div>

                  {/* Citizen ID */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      เลขประจำตัวประชาชน
                    </label>
                    <input
                      type="text"
                      maxLength={13}
                      placeholder="เลข 13 หลัก"
                      value={formCitizenId}
                      onChange={(e) => setFormCitizenId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700 font-mono"
                    />
                  </div>

                  {/* Blood group */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      หมู่โลหิต
                    </label>
                    <select
                      value={formBloodGroup}
                      onChange={(e) => setFormBloodGroup(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="O">O</option>
                      <option value="AB">AB</option>
                      <option value="ไม่ระบุ">ไม่ระบุ</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {/* Level selection */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      ระดับชั้น <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formLevel}
                      onChange={(e) => setFormLevel(e.target.value as Student['level'])}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700 font-medium"
                    >
                      <option value="ปวช. 1">ปวช. 1</option>
                      <option value="ปวช. 2">ปวช. 2</option>
                      <option value="ปวช. 3">ปวช. 3</option>
                      <option value="ปวส. 1">ปวส. 1</option>
                      <option value="ปวส. 2">ปวส. 2</option>
                    </select>
                  </div>

                  {/* Room */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      ห้องเรียน <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น 1 หรือ 2"
                      value={formRoom}
                      onChange={(e) => setFormRoom(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700 font-medium"
                    />
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      แผนกวิชา <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formDepartment}
                      onChange={(e) => setFormDepartment(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700 font-medium"
                    >
                      <option value="ระบบขนส่งทางราง">ระบบขนส่งทางราง</option>
                      <option value="สาขาเทคโนโลยีธุรกิจดิจิทัล">สาขาเทคโนโลยีธุรกิจดิจิทัล</option>
                      <option value="ช่างยนต์">ช่างยนต์</option>
                      <option value="ช่างไฟฟ้า">ช่างไฟฟ้า</option>
                      <option value="ช่างอิเล็กทรอนิกส์">ช่างอิเล็กทรอนิกส์</option>
                      <option value="ช่างกล">ช่างกล</option>
                      <option value="ช่างเชื่อม">ช่างเชื่อม</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    เบอร์โทรศัพท์นักศึกษา
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น 089-XXX-XXXX"
                    value={formStudentPhone}
                    onChange={(e) => setFormStudentPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700 font-mono"
                  />
                </div>

                {/* Section 2 title */}
                <div className="border-b border-slate-150 pb-1.5 pt-2 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">๒. ข้อมูลผู้ปกครองและครอบครัว</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Parent Name */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        ชื่อผู้ปกครอง <span className="text-rose-500">*</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ชื่อ-สกุลผู้ปกครองหรือผู้ดูแล"
                      value={formParentName}
                      onChange={(e) => setFormParentName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700 font-medium"
                    />
                  </div>

                  {/* Relationship */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      ความเกี่ยวข้องกับนักเรียน
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น บิดา, มารดา, ปู่, ย่า, ตา, ยาย"
                      value={formParentRelationship}
                      onChange={(e) => setFormParentRelationship(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Parent Occupation */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      อาชีพผู้ปกครอง
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น ค้าขาย, ทำสวน, รับจ้างทั่วไป"
                      value={formParentOccupation}
                      onChange={(e) => setFormParentOccupation(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700"
                    />
                  </div>

                  {/* Parent Phone */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        เบอร์โทรศัพท์ติดต่อผู้ปกครอง <span className="text-rose-500">*</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น 081-XXX-XXXX"
                      value={formParentPhone}
                      onChange={(e) => setFormParentPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700 font-mono"
                    />
                  </div>
                </div>

                {/* Section 3 title */}
                <div className="border-b border-slate-150 pb-1.5 pt-2 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">๓. ข้อมูลสภาพแวดล้อมและที่พักอาศัย</span>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      ที่อยู่บ้านปัจจุบันของนักเรียน <span className="text-rose-500">*</span>
                    </span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="กรอกบ้านเลขที่ ซอย ถนน ตำบล อำเภอ จังหวัด"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700 leading-normal font-medium"
                  />
                </div>
              </div>

              {/* Save/Cancel footer actions inside modal */}
              <div className="pt-4 border-t border-slate-150 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  บันทึกข้อมูล
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
