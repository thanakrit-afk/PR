import React from 'react';
import { Student } from '../types';
import { Calendar, MapPin, Phone, Clock, ArrowRight, ClipboardCheck, Edit3 } from 'lucide-react';

interface UpcomingAppointmentsProps {
  students: Student[];
  onRecordVisit: (student: Student) => void;
  onViewDetails: (student: Student) => void;
  onEditProfile: (student: Student) => void;
}

export const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({
  students,
  onRecordVisit,
  onViewDetails,
  onEditProfile
}) => {
  // Filter students who are not visited yet and have an appointment date
  const upcomingVisits = students
    .filter(s => s.visitStatus === 'ยังไม่ได้เยี่ยม' && s.appointmentDate)
    .sort((a, b) => {
      return new Date(a.appointmentDate!).getTime() - new Date(b.appointmentDate!).getTime();
    });

  // Current date is 2026-07-10 as per metadata
  const TODAY_STR = '2026-07-10';
  const todayTime = new Date(TODAY_STR).getTime();

  const getDaysRemainingLabel = (dateStr: string) => {
    const apptTime = new Date(dateStr).getTime();
    const diffTime = apptTime - todayTime;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-rose-500 text-white px-2 py-0.5 rounded-full animate-pulse">
          <Clock className="w-3 h-3" />
          วันนี้
        </span>
      );
    } else if (diffDays === 1) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full">
          <Clock className="w-3 h-3" />
          พรุ่งนี้
        </span>
      );
    } else if (diffDays > 1) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-150 px-2 py-0.5 rounded-full">
          <Clock className="w-3 h-3" />
          อีก {diffDays} วัน
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-150 px-2 py-0.5 rounded-full">
          <Clock className="w-3 h-3" />
          เลยกำหนด {Math.abs(diffDays)} วัน
        </span>
      );
    }
  };

  const formatThaiDate = (dateStr: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
      const date = new Date(dateStr);
      // Format with Buddhist Era year (+543)
      const thaiMonths = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
      ];
      const day = date.getDate();
      const month = thaiMonths[date.getMonth()];
      const year = date.getFullYear() + 543;
      return `${day} ${month} ${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-indigo-100 shadow-xs overflow-hidden">
      {/* Panel Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-indigo-500/20 rounded-lg">
            <Calendar className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-indigo-200">การวางแผนงานเยี่ยมบ้าน</h3>
            <h4 className="text-sm font-extrabold text-white">การนัดหมายเยี่ยมบ้านที่จะถึงนี้ ({upcomingVisits.length} รายการ)</h4>
          </div>
        </div>
        <span className="text-[10px] font-bold bg-indigo-800 text-indigo-200 px-2.5 py-1 rounded-full border border-indigo-700/50">
          กำหนดการตามเวลา
        </span>
      </div>

      {/* Panel Body */}
      <div className="p-5">
        {upcomingVisits.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Calendar className="w-10 h-10 mx-auto text-slate-200 mb-2" />
            <p className="text-xs font-bold text-slate-500">ไม่มีรายการนัดหมายที่รอดำเนินการ</p>
            <p className="text-[11px] text-slate-400 mt-0.5">คุณครูสามารถเพิ่มวันนัดหมายได้โดยการกดแก้ไขข้อมูลนักศึกษา</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingVisits.map(student => (
              <div 
                key={student.id} 
                className="bg-slate-50 hover:bg-white rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs transition-all p-4 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex justify-between items-start gap-1.5 mb-2.5">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono font-bold text-slate-400">รหัส {student.id}</span>
                      <span className="text-xs font-bold text-slate-500">{student.level}/{student.room}</span>
                    </div>
                    {getDaysRemainingLabel(student.appointmentDate!)}
                  </div>

                  {/* Student Name */}
                  <h4 className="text-sm font-extrabold text-slate-800 leading-tight mb-1">{student.name}</h4>
                  <p className="text-[11px] text-slate-500 mb-3 truncate">แผนกวิชา{student.department}</p>

                  <div className="space-y-2 text-[11px] text-slate-600 border-t border-slate-150 pt-2.5">
                    {/* Date */}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>นัดวันที่: <strong className="text-slate-800">{formatThaiDate(student.appointmentDate!)}</strong></span>
                    </div>

                    {/* Parent Name */}
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">ผู้ปกครอง: {student.parentName} ({student.parentPhone})</span>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-1 text-slate-500" title={student.address}>ที่อยู่: {student.address}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="grid grid-cols-3 gap-1.5 mt-4 pt-3 border-t border-slate-150">
                  <button
                    type="button"
                    onClick={() => onViewDetails(student)}
                    className="py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 cursor-pointer text-center transition-colors"
                  >
                    ดูที่ตั้ง
                  </button>
                  <button
                    type="button"
                    onClick={() => onEditProfile(student)}
                    className="py-1.5 bg-white hover:bg-indigo-50 border border-indigo-100 rounded-lg text-[11px] font-bold text-indigo-600 cursor-pointer text-center transition-colors flex items-center justify-center gap-0.5"
                  >
                    <Edit3 className="w-3 h-3" />
                    เลื่อนวัน
                  </button>
                  <button
                    type="button"
                    onClick={() => onRecordVisit(student)}
                    className="py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-[11px] font-extrabold text-white cursor-pointer text-center transition-colors flex items-center justify-center gap-0.5"
                  >
                    <ClipboardCheck className="w-3 h-3" />
                    เยี่ยมแล้ว
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
