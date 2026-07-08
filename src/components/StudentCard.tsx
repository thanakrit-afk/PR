import React from 'react';
import { Student } from '../types';
import { MapPin, Phone, User, CheckCircle2, AlertTriangle, XCircle, FileText, ChevronRight, Edit3 } from 'lucide-react';

interface StudentCardProps {
  student: Student;
  onRecordVisit: (student: Student) => void;
  onViewDetails: (student: Student) => void;
  onEditProfile?: (student: Student) => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  onRecordVisit,
  onViewDetails,
  onEditProfile
}) => {
  const isVisited = student.visitStatus === 'เยี่ยมแล้ว';
  
  // Risk screening badge style mapping
  const getScreeningBadge = () => {
    if (!isVisited || !student.visitData) return null;
    const result = student.visitData.screeningResult;
    
    switch (result) {
      case 'ปกติ':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            กลุ่มปกติ
          </span>
        );
      case 'เสี่ยง':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3" />
            กลุ่มเสี่ยง
          </span>
        );
      case 'มีปัญหา':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 rounded-full">
            <XCircle className="w-3 h-3" />
            กลุ่มมีปัญหา
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div id={`student-card-${student.id}`} className="bg-white rounded-xl border border-slate-200/80 hover:border-brand-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group shadow-xs">
      {/* Top Banner / Color Accent */}
      <div className={`h-1.5 w-full ${
        isVisited 
          ? student.visitData?.screeningResult === 'มีปัญหา' ? 'bg-rose-500' : student.visitData?.screeningResult === 'เสี่ยง' ? 'bg-amber-500' : 'bg-emerald-500'
          : 'bg-slate-300'
      }`} />
      
      <div className="p-5 flex-1 flex flex-col justify-between">
        {/* Header: Student ID & Level Badge */}
        <div>
          <div className="flex justify-between items-start gap-2 mb-2">
            <span className="text-xs font-mono font-semibold text-slate-400">รหัส {student.id}</span>
            <div className="flex gap-1.5 items-center">
              {getScreeningBadge()}
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-brand-50 text-brand-700 border border-brand-100/60">
                {student.level}/{student.room}
              </span>
              {onEditProfile && (
                <button
                  type="button"
                  onClick={() => onEditProfile(student)}
                  className="p-1 hover:bg-slate-100 hover:text-brand-600 rounded text-slate-400 transition-all cursor-pointer border border-transparent hover:border-slate-200"
                  title="แก้ไขประวัตินักศึกษา"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Name & Department */}
          <h3 className="text-base font-bold text-slate-800 group-hover:text-brand-600 transition-colors">
            {student.name}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            แผนกวิชา{student.department}
          </p>

          <hr className="my-3.5 border-slate-150" />

          {/* Details list */}
          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex items-center gap-2.5">
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">ผู้ปกครอง: <strong className="text-slate-700">{student.parentName}</strong></span>
            </div>
            
            <div className="flex items-center gap-2.5">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>โทร: <a href={`tel:${student.parentPhone}`} className="text-brand-600 hover:underline font-semibold">{student.parentPhone}</a></span>
            </div>
            
            <div className="flex items-start gap-2.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span className="line-clamp-2 text-slate-500 leading-normal" title={student.address}>
                ที่อยู่: {student.address}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-150 flex gap-2.5">
          {isVisited ? (
            <>
              <button
                type="button"
                onClick={() => onViewDetails(student)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-all cursor-pointer border border-brand-100/80"
              >
                <FileText className="w-3.5 h-3.5" />
                ดูข้อมูลเยี่ยมบ้าน
              </button>
              <button
                type="button"
                onClick={() => onRecordVisit(student)}
                className="inline-flex items-center justify-center p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 border border-slate-200 rounded-lg transition-all cursor-pointer"
                title="แก้ไขข้อมูลการเยี่ยมบ้าน"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onRecordVisit(student)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 hover:shadow-xs rounded-lg transition-all cursor-pointer group"
            >
              บันทึกการเยี่ยมบ้าน
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
