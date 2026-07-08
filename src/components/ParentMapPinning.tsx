import React, { useState } from 'react';
import { Student } from '../types';
import { Search, MapPin, Check, Compass, AlertCircle, ExternalLink, HelpCircle, FileText } from 'lucide-react';

interface ParentMapPinningProps {
  students: Student[];
  onConfirmCoordinates: (studentId: string, lat: number, lng: number) => void;
}

export const ParentMapPinning: React.FC<ParentMapPinningProps> = ({
  students,
  onConfirmCoordinates
}) => {
  const [studentIdInput, setStudentIdInput] = useState('');
  const [foundStudent, setFoundStudent] = useState<Student | null>(null);
  const [searchError, setSearchError] = useState('');

  // Local map pin states
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    setSaveSuccess(false);
    
    if (!studentIdInput) {
      setSearchError('กรุณากรอกรหัสประจำตัวนักเรียน');
      return;
    }

    const s = students.find(item => item.id.trim() === studentIdInput.trim());
    if (s) {
      setFoundStudent(s);
      setLat(s.latitude || 16.4396);
      setLng(s.longitude || 102.8288);
    } else {
      setSearchError('ไม่พบข้อมูลรหัสนักศึกษาในระบบ โปรดตรวจสอบความถูกต้องอีกครั้ง');
      setFoundStudent(null);
    }
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
        setGpsError('ไม่สามารถอ่านตำแหน่งได้ โปรดเปิดสิทธิ์ Location ในบราวเซอร์ของท่าน');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  // Submit coordinate saving
  const handleSavePin = () => {
    if (!foundStudent || lat === null || lng === null) return;
    
    onConfirmCoordinates(foundStudent.id, lat, lng);
    setSaveSuccess(true);
    
    // Auto clear success after 3 seconds
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  return (
    <div id="parent-portal" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Search & Map Pinning Side (7 Columns) */}
      <div className="lg:col-span-7 space-y-5">
        
        {/* Search Panel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
          <div className="border-b border-slate-150 pb-4 mb-4">
            <span className="text-[11px] font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Student / Parent Portal
            </span>
            <h2 className="text-sm font-bold text-slate-800 mt-2">ยืนยันพิกัดที่ตั้งบ้านล่วงหน้า</h2>
            <p className="text-xs text-slate-500 mt-0.5">ค้นหารายชื่อของตนเองเพื่อทำปักหมุด GPS ช่วยในการนำทางสำหรับครูที่ปรึกษา</p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={studentIdInput}
                onChange={(e) => setStudentIdInput(e.target.value)}
                placeholder="ป้อนรหัสประจำตัวนักศึกษา (เช่น 6620901001)"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700 font-semibold"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1"
            >
              ค้นหาชื่อ
            </button>
          </form>

          {searchError && (
            <div className="mt-3 p-3 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl text-xs flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{searchError}</span>
            </div>
          )}
        </div>

        {/* Found Student Coordination Panel */}
        {foundStudent && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 animate-fadeIn">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-150 pb-2">
              ข้อมูลผู้ยืนยันพิกัด
            </h3>
            
            <div className="bg-brand-50/40 p-4 rounded-xl border border-brand-100/30 text-xs text-slate-700 space-y-2 mb-5">
              <div className="grid grid-cols-2 gap-2">
                <div>ชื่อ-สกุลนักศึกษา: <strong className="text-slate-800">{foundStudent.name}</strong></div>
                <div>ระดับชั้น: <strong className="text-slate-800">{foundStudent.level} ห้อง {foundStudent.room}</strong></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>แผนกวิชา: <strong className="text-slate-800">{foundStudent.department}</strong></div>
                <div>ผู้ปกครอง: <strong className="text-slate-800">{foundStudent.parentName}</strong></div>
              </div>
              <div className="border-t border-brand-100/50 pt-2 mt-1 text-slate-500">
                ที่อยู่ตามทะเบียนนักเรียน: <span>{foundStudent.address}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  ปักตำแหน่งแผนที่บ้าน (GPS Coordinates)
                </label>
                
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200/60 rounded-xl mb-3.5">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">ละติจูด (Latitude)</span>
                    <span className="text-xs font-mono font-bold text-slate-700">{lat?.toFixed(6) || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">ลองจิจูด (Longitude)</span>
                    <span className="text-xs font-mono font-bold text-slate-700">{lng?.toFixed(6) || '-'}</span>
                  </div>
                </div>

                {gpsError && (
                  <div className="mb-3.5 p-3 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{gpsError}</span>
                  </div>
                )}

                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={handleGetGps}
                    disabled={gpsLoading}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 cursor-pointer transition-colors"
                  >
                    <Compass className={`w-4 h-4 text-brand-500 ${gpsLoading ? 'animate-spin' : ''}`} />
                    {gpsLoading ? 'กำลังจับพิกัด...' : 'ใช้ตำแหน่งปัจจุบันของฉัน'}
                  </button>
                </div>
              </div>

              {/* Map Preview Simulation */}
              <div className="bg-slate-900 rounded-xl p-4 text-center text-slate-400 aspect-video flex flex-col items-center justify-center relative overflow-hidden border border-slate-850">
                {/* Simulated Radar & Pin */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="w-16 h-16 rounded-full border border-brand-500/30 animate-ping absolute" />
                <MapPin className="w-8 h-8 text-rose-500 animate-bounce relative z-10" />
                <span className="text-xs font-semibold text-slate-300 mt-2 relative z-10">ระบบรับพิกัดตำแหน่งบ้านแล้ว</span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 relative z-10">พิกัดชี้เฉพาะจุด: ({lat?.toFixed(4)}, {lng?.toFixed(4)})</span>
              </div>

              {saveSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>บันทึกพิกัดบ้านล่วงหน้าเสร็จสิ้น! ครูจะได้รับแผนที่ตำแหน่งนี้ทันทีเมื่อทำการเยี่ยมบ้าน</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleSavePin}
                className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                บันทึกยืนยันพิกัดบ้าน
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pre-Visit Parents Survey Form Section (5 Columns) */}
      <div className="lg:col-span-5 space-y-5">
        
        {/* Google Form Link Container */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between h-full min-h-[350px]">
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Google Forms Survey
              </span>
              <h2 className="text-sm font-bold text-slate-800 mt-2.5">กรอกแบบสอบถามสำหรับผู้ปกครองล่วงหน้า</h2>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                แบบสำรวจความพร้อมและการดูแลครอบครัวนักเรียนนักศึกษาอาชีวศึกษา โดยสมาคมผู้ปกครองและวิทยาลัย
              </p>
            </div>

            <div className="bg-brand-50/50 rounded-xl p-4 border border-brand-100 text-xs text-brand-900 leading-normal space-y-2">
              <p className="font-bold flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-brand-600 shrink-0" />
                ลิงก์ส่งตรงระบบจัดเก็บทางการ:
              </p>
              <p className="text-slate-600">
                หากท่านต้องการแก้ไขข้อมูลความประพฤติและพฤติกรรมในแบบฟอร์มหลัก โปรดกรอกข้อมูลผ่าน Google Form ของผู้ปกครองด้านล่างเพื่อส่งผลเข้าสู่ Google Sheets โดยตรง
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {/* Direct CTA button to the requested Google Forms */}
            <a
              href="https://docs.google.com/forms/d/1rWVFBOLuEGmMgN7VgXKPA38ivO4MSIfCZ0_jGyErZ1s/edit"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-xs hover:shadow"
            >
              เปิดแบบฟอร์ม Google Form
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            
            <p className="text-[10px] text-slate-400 text-center">
              * ลิงก์ปลายทาง: docs.google.com/forms/d/1rWVFBOLuEGmMgN7VgXKPA38ivO4MSIfCZ0_jGyErZ1s
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
