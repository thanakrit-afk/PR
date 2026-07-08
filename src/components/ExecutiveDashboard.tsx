import React, { useState } from 'react';
import { Student } from '../types';
import { 
  Users, CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle, 
  Printer, FileSpreadsheet, Filter, Search, Phone, MapPin, Eye, ExternalLink 
} from 'lucide-react';

interface ExecutiveDashboardProps {
  students: Student[];
  onViewStudentDetails: (student: Student) => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  students,
  onViewStudentDetails
}) => {
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<'all' | 'เสี่ยง' | 'มีปัญหา'>('all');
  const [printClassroom, setPrintClassroom] = useState<string>('all');

  // Calculations
  const totalCount = students.length;
  const visitedStudents = students.filter(s => s.visitStatus === 'เยี่ยมแล้ว');
  const visitedCount = visitedStudents.length;
  const remainingCount = totalCount - visitedCount;
  const completionRate = totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0;

  // Screening breakdowns
  const normalCount = visitedStudents.filter(s => s.visitData?.screeningResult === 'ปกติ').length;
  const riskCount = visitedStudents.filter(s => s.visitData?.screeningResult === 'เสี่ยง').length;
  const problemCount = visitedStudents.filter(s => s.visitData?.screeningResult === 'มีปัญหา').length;

  // List of unique classrooms (level/room combinations)
  const uniqueClassrooms = Array.from(
    new Set(students.map(s => `${s.level}/${s.room}`))
  ).sort();

  // List of unique departments
  const departments = Array.from(
    new Set(students.map(s => s.department))
  );

  // Department completion rates for visualization
  const departmentStats = departments.map(dept => {
    const deptStudents = students.filter(s => s.department === dept);
    const deptTotal = deptStudents.length;
    const deptVisited = deptStudents.filter(s => s.visitStatus === 'เยี่ยมแล้ว').length;
    const rate = deptTotal > 0 ? Math.round((deptVisited / deptTotal) * 100) : 0;
    return { name: dept, total: deptTotal, visited: deptVisited, rate };
  });

  // Urgent list (Risk / Problems)
  const urgentStudents = visitedStudents.filter(s => 
    s.visitData?.screeningResult === 'เสี่ยง' || s.visitData?.screeningResult === 'มีปัญหา'
  );

  // Filtered urgent list based on UI selections
  const filteredUrgent = urgentStudents.filter(s => {
    const matchesRisk = selectedRiskFilter === 'all' || s.visitData?.screeningResult === selectedRiskFilter;
    const matchesLevel = selectedLevel === 'all' || s.level === selectedLevel;
    return matchesRisk && matchesLevel;
  });

  // Export CSV handler
  const handleExportCSV = () => {
    const headers = [
      'รหัสนักศึกษา', 'ชื่อ-นามสกุล', 'ชื่อเล่น', 'เลขประจำตัวประชาชน', 'หมู่โลหิต', 'เบอร์โทรศัพท์นักศึกษา', 
      'ระดับชั้น', 'ห้อง', 'แผนกวิชา', 'ชื่อผู้ปกครอง', 'ความเกี่ยวข้อง', 'อาชีพผู้ปกครอง', 'เบอร์ผู้ปกครอง', 
      'ที่อยู่ปัจจุบัน', 'สถานะการเยี่ยม', 'วันที่เยี่ยม', 'ข้อมูลการเดินทาง', 'ละติจูด', 'ลองจิจูด',
      'สภาพที่อยู่อาศัย', 'กรรมสิทธิ์บ้าน', 'สถานะครอบครัว', 'คะแนนความสัมพันธ์ (1-5)', 'รายได้เฉลี่ยต่อเดือน',
      'ภาระหนี้สิน', 'ความเสี่ยงด้านการเรียน', 'ความเสี่ยงด้านสารเสพติด', 'ความเสี่ยงติดเกม', 'ความเสี่ยงด้านความสัมพันธ์',
      'ความเสี่ยงด้านการเงิน', 'ความเสี่ยงการเดินทาง', 'บันทึกความเสี่ยงเพิ่มเติม', 'ผลการคัดกรอง', 'ข้อเสนอแนะครู', 'ครูผู้บันทึก'
    ];
    
    const rows = students.map(s => [
      s.id,
      s.name,
      s.nickname || '-',
      s.citizenId || '-',
      s.bloodGroup || '-',
      s.studentPhone || '-',
      s.level,
      s.room,
      s.department,
      s.parentName,
      s.parentRelationship || '-',
      s.parentOccupation || '-',
      s.parentPhone,
      s.address,
      s.visitStatus,
      s.visitData?.visitDate || '-',
      s.visitData?.travelInfo || '-',
      s.visitData?.latitude !== undefined && s.visitData?.latitude !== null ? s.visitData.latitude : (s.latitude || '-'),
      s.visitData?.longitude !== undefined && s.visitData?.longitude !== null ? s.visitData.longitude : (s.longitude || '-'),
      s.visitData?.houseCondition || '-',
      s.visitData?.houseOwnership || '-',
      s.visitData?.familyStatus || '-',
      s.visitData?.relationshipScale || '-',
      s.visitData?.averageMonthlyIncome || '-',
      s.visitData?.debtStatus || '-',
      s.visitData?.risks?.academic ? 'ใช่' : 'ไม่ใช่',
      s.visitData?.risks?.substance ? 'ใช่' : 'ไม่ใช่',
      s.visitData?.risks?.gaming ? 'ใช่' : 'ไม่ใช่',
      s.visitData?.risks?.relationship ? 'ใช่' : 'ไม่ใช่',
      s.visitData?.risks?.financial ? 'ใช่' : 'ไม่ใช่',
      s.visitData?.risks?.travelRisk ? 'ใช่' : 'ไม่ใช่',
      s.visitData?.riskNotes || '-',
      s.visitData?.screeningResult || 'ยังไม่ได้ประเมิน',
      s.visitData?.counselorNotes || '-',
      s.visitData?.submittedBy || '-'
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `สรุปข้อมูลการเยี่ยมบ้าน_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open generic print layout
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div id="executive-dashboard" className="space-y-6">
      
      {/* 1. Header & Actions bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-800 uppercase tracking-tight">แผงรายงานสารสนเทศสำหรับผู้บริหาร (Executive Overview)</h2>
          <p className="text-xs text-slate-500">ติดตามรายงานความสำเร็จ อัตราการเยี่ยมบ้าน และนักศึกษากลุ่มสุ่มเสี่ยงช่วยเหลือเร่งด่วน</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 rounded-lg transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            ส่งออกข้อมูล CSV/Excel
          </button>
          
          <button
            type="button"
            onClick={handlePrintReport}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-brand-700 hover:text-brand-800 bg-brand-50 hover:bg-brand-100/80 border border-brand-200/80 rounded-lg transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            พิมพ์สรุปรายงาน
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards Block */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
        
        {/* KPI: Visit completion percentage ring (4 columns) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between md:col-span-1 lg:col-span-4 min-h-[220px]">
          <div>
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">สัดส่วนความคืบหน้า</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">ความสำเร็จของการเยี่ยมบ้านสะสม</p>
          </div>
          
          <div className="flex items-center justify-around gap-2 my-1">
            <div className="relative flex items-center justify-center">
              {/* Circular SVG Progress */}
              <svg className="w-28 h-28 transform -rotate-90">
                <circle 
                  cx="56" cy="56" r="48" 
                  className="stroke-slate-100 fill-none" 
                  strokeWidth="10"
                />
                <circle 
                  cx="56" cy="56" r="48" 
                  className="stroke-brand-500 fill-none transition-all duration-1000 ease-out" 
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 48}
                  strokeDashoffset={2 * Math.PI * 48 * (1 - completionRate / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-slate-800 font-mono leading-none">{completionRate}%</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">สำเร็จแล้ว</span>
              </div>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-brand-500" />
                <span className="text-slate-600">เยี่ยมแล้ว: <strong>{visitedCount} คน</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-slate-200" />
                <span className="text-slate-600">คงเหลือ: <strong>{remainingCount} คน</strong></span>
              </div>
              <div className="flex items-center gap-2 border-t border-slate-150 pt-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-700">ทั้งหมด: <strong>{totalCount} คน</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown of screening statuses (8 columns) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 md:col-span-1 lg:col-span-8 flex flex-col justify-between min-h-[220px]">
          <div>
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">ผลสัมฤทธิ์การประเมินคัดกรอง</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">จำแนกตามพฤติกรรม สภาพความเป็นอยู่ และความเดือดร้อน</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-2">
            {/* Normal */}
            <div className="bg-emerald-50/40 border border-emerald-100 p-4 rounded-xl flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500 text-white rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-slate-500 text-[11px] font-semibold block">กลุ่มปกติ</span>
                <span className="text-slate-800 text-xl font-bold font-mono leading-none">{normalCount}</span>
                <span className="text-slate-400 text-[10px] block font-medium mt-0.5">ความพร้อมทั่วไปดี</span>
              </div>
            </div>

            {/* Risk */}
            <div className="bg-amber-50/40 border border-amber-100 p-4 rounded-xl flex items-center gap-3">
              <div className="p-2.5 bg-amber-500 text-white rounded-lg">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-slate-500 text-[11px] font-semibold block">กลุ่มเสี่ยง</span>
                <span className="text-slate-800 text-xl font-bold font-mono leading-none">{riskCount}</span>
                <span className="text-slate-400 text-[10px] block font-medium mt-0.5">เฝ้าระวังความคุ้มครอง</span>
              </div>
            </div>

            {/* Problem */}
            <div className="bg-rose-50/40 border border-rose-100 p-4 rounded-xl flex items-center gap-3">
              <div className="p-2.5 bg-rose-500 text-white rounded-lg">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-slate-500 text-[11px] font-semibold block">กลุ่มมีปัญหา</span>
                <span className="text-slate-800 text-xl font-bold font-mono leading-none">{problemCount}</span>
                <span className="text-slate-400 text-[10px] block font-medium mt-0.5">ช่วยเหลือเยียวยาด่วน</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 leading-normal">
            * สถิติอ้างอิงจากการประเมินรายบุคคลของครูที่ปรึกษาที่กรอกในระบบจริง <strong>{visitedCount}/{totalCount} ราย</strong> (คิดเป็น {completionRate}%)
          </p>
        </div>

      </div>

      {/* 3. Department Progress & PDF Filter Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Department performance chart (7 columns) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 lg:col-span-7 space-y-4">
          <div>
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">ร้อยละความสำเร็จรายแผนกวิชา</h3>
            <p className="text-[11px] text-slate-400">สรุปความคืบหน้าการทำงานเยี่ยมบ้านของครูแผนกต่างๆ</p>
          </div>
          
          <div className="space-y-3.5">
            {departmentStats.map((dept) => (
              <div key={dept.name} className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-semibold">{dept.name}</span>
                  <div className="font-medium font-mono text-slate-500">
                    เยี่ยมแล้ว {dept.visited}/{dept.total} คน ({dept.rate}%)
                  </div>
                </div>
                {/* Custom CSS Bar Chart */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-500 rounded-full transition-all duration-1000"
                    style={{ width: `${dept.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PDF Print Filter Selection (5 columns) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 lg:col-span-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div>
              <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">จัดพิมพ์เอกสารแบบรายห้อง</h3>
              <p className="text-[11px] text-slate-400">กรองรหัสจัดส่งหรือพิมพ์สำเนารับรองของวิทยาลัย</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">เลือกห้องเรียนจัดพิมพ์รายงาน</label>
              <select
                value={printClassroom}
                onChange={(e) => setPrintClassroom(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-700"
              >
                <option value="all">-- ทุกห้องเรียน --</option>
                {uniqueClassrooms.map(room => (
                  <option key={room} value={room}>{room}</option>
                ))}
              </select>
            </div>

            <p className="text-[11px] text-slate-500 leading-normal bg-slate-50 p-2.5 rounded-lg border border-slate-150">
              สำหรับการออกรายงานนำเสนอผู้บริหาร แผนกแนะแนว หรือพิมพ์ไฟล์เก็บลงแฟ้มจัดระเบียบสารสนเทศส่วนบุคคล
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              window.print();
            }}
            className="w-full mt-4 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            เปิดหน้ารายงานพร้อมพิมพ์ (Print Report)
          </button>
        </div>

      </div>

      {/* 4. Filterable Risk & Problems Monitoring List (Urgent Care) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-150 pb-5 mb-5">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="flex w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              นักเรียนกลุ่มเฝ้าระวังที่ต้องการความช่วยเหลือเร่งด่วน ({urgentStudents.length} ราย)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">รายชื่อนักศึกษาที่ครูที่ปรึกษาประเมินว่าอยู่ร่วมในกลุ่มเสี่ยง หรือ มีปัญหา</p>
          </div>
          
          {/* Filters controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Level Filter */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none text-slate-600"
            >
              <option value="all">ระดับชั้น: ทั้งหมด</option>
              <option value="ปวช. 1">ปวช. 1</option>
              <option value="ปวช. 2">ปวช. 2</option>
              <option value="ปวช. 3">ปวช. 3</option>
              <option value="ปวส. 1">ปวส. 1</option>
              <option value="ปวส. 2">ปวส. 2</option>
            </select>

            {/* Risk Category Filter */}
            <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/50">
              <button
                onClick={() => setSelectedRiskFilter('all')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  selectedRiskFilter === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setSelectedRiskFilter('เสี่ยง')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  selectedRiskFilter === 'เสี่ยง' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                กลุ่มเสี่ยง
              </button>
              <button
                onClick={() => setSelectedRiskFilter('มีปัญหา')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  selectedRiskFilter === 'มีปัญหา' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                มีปัญหา
              </button>
            </div>
          </div>
        </div>

        {filteredUrgent.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm font-semibold">ไม่พบรายชื่อกลุ่มเฝ้าระวังตามหมวดหมู่ที่เลือก</p>
            <p className="text-xs text-slate-400 mt-0.5">นักเรียนทุกรายที่ประเมินแล้วยังคงอยู่ในความปลอดภัยหรือยังไม่มีข้อมูลเยี่ยม</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4 rounded-l-lg">รหัส / นักศึกษา</th>
                  <th className="py-3 px-4">ระดับชั้น/แผนก</th>
                  <th className="py-3 px-4">กลุ่มคัดกรอง</th>
                  <th className="py-3 px-4">ความสุ่มเสี่ยงที่พบ</th>
                  <th className="py-3 px-4">ติดต่อผู้ปกครอง</th>
                  <th className="py-3 px-4 rounded-r-lg text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUrgent.map((student) => {
                  const d = student.visitData!;
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Name & ID */}
                      <td className="py-3 px-4 font-semibold">
                        <div className="text-slate-800">{student.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">ID: {student.id}</div>
                      </td>
                      
                      {/* Class / Dept */}
                      <td className="py-3 px-4 text-slate-500">
                        <div>{student.level} ห้อง {student.room}</div>
                        <div className="text-[10px] font-semibold text-brand-600">แผนก{student.department}</div>
                      </td>

                      {/* Group */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 font-semibold px-2.5 py-0.5 rounded-full text-[10px] ${
                          d.screeningResult === 'มีปัญหา' 
                            ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {d.screeningResult === 'มีปัญหา' ? <AlertOctagon className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                          {d.screeningResult === 'มีปัญหา' ? 'กลุ่มมีปัญหา' : 'กลุ่มเสี่ยง'}
                        </span>
                      </td>

                      {/* Risks details */}
                      <td className="py-3 px-4 max-w-xs truncate" title={d.riskNotes || 'ไม่มีข้อมูลเพิ่มเติม'}>
                        <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                          {d.risks.academic && <span className="bg-slate-100 text-slate-600 text-[9px] px-1.5 py-0.2 rounded font-bold">ด้านการเรียน</span>}
                          {d.risks.substance && <span className="bg-rose-50 text-rose-700 text-[9px] px-1.5 py-0.2 rounded font-bold">สารเสพติด</span>}
                          {d.risks.gaming && <span className="bg-amber-50 text-amber-700 text-[9px] px-1.5 py-0.2 rounded font-bold">ติดเกม</span>}
                          {d.risks.relationship && <span className="bg-purple-50 text-purple-700 text-[9px] px-1.5 py-0.2 rounded font-bold">ชู้สาว</span>}
                          {d.risks.financial && <span className="bg-emerald-50 text-emerald-700 text-[9px] px-1.5 py-0.2 rounded font-bold">ขัดสนเงิน</span>}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-1">{d.riskNotes || 'ไม่มีบันทึกเพิ่มเติม'}</div>
                      </td>

                      {/* Parent Phone */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-700">{student.parentName}</div>
                        <a href={`tel:${student.parentPhone}`} className="text-brand-600 hover:underline inline-flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {student.parentPhone}
                        </a>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => onViewStudentDetails(student)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-brand-600 hover:text-white text-slate-700 text-[11px] font-semibold rounded-lg transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          ดูบันทึก
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
