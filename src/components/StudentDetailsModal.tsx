import React, { useRef, useState } from 'react';
import { Student } from '../types';
import { 
  X, MapPin, Calendar, Heart, ShieldAlert, Award, 
  UserCheck, DollarSign, ArrowRight, Printer, Phone, CheckCircle,
  FileDown
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface StudentDetailsModalProps {
  student: Student;
  onClose: () => void;
}

export const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({
  student,
  onClose
}) => {
  const d = student.visitData;
  const isVisited = student.visitStatus === 'เยี่ยมแล้ว';
  const printAreaRef = useRef<HTMLDivElement>(null);
  const lat = student.latitude || student.visitData?.latitude;
  const lng = student.longitude || student.visitData?.longitude;
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    const element = printAreaRef.current;
    if (!element) return;

    setIsDownloading(true);

    try {
      // Small delay to let rendering complete
      await new Promise((resolve) => setTimeout(resolve, 200));

      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true, // Crucial for external photo URLs
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1024,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const safeName = student.name.trim().replace(/\s+/g, '_');
      pdf.save(`รายงานการเยี่ยมบ้าน_${safeName}_${student.id}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    // Elegant printing of just this student details modal!
    const printContent = printAreaRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;
    
    if (printContent) {
      document.body.innerHTML = printContent;
      window.print();
      // Restore page
      window.location.reload();
    }
  };

  const getRiskLabel = (result: string | undefined) => {
    switch (result) {
      case 'ปกติ':
        return <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold rounded-md text-[11px] uppercase tracking-wider">กลุ่มปกติ (ไม่ต้องติดตามพิเศษ)</span>;
      case 'เสี่ยง':
        return <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 font-extrabold rounded-md text-[11px] uppercase tracking-wider">กลุ่มเสี่ยง (เฝ้าระวังติดตามพฤติกรรม)</span>;
      case 'มีปัญหา':
        return <span className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 font-extrabold rounded-md text-[11px] uppercase tracking-wider">กลุ่มมีปัญหา (ช่วยเหลือเร่งด่วน)</span>;
      default:
        return <span className="px-3 py-1 bg-slate-50 text-slate-700 border border-slate-200 font-extrabold rounded-md text-[11px] uppercase tracking-wider">ไม่ได้เยี่ยมบ้าน</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl shadow-md border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">เอกสารสรุปผลการเยี่ยมบ้านนักเรียนนักศึกษา</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Student Visit Card Ref: #{student.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isDownloading}
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-1.5 text-xs px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-lg shadow-xs transition-all cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              {isDownloading ? 'กำลังสร้าง PDF...' : 'ดาวน์โหลดรายงานการเยี่ยมบ้าน'}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 text-xs px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              พิมพ์เอกสารนี้
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-200"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6" ref={printAreaRef}>
          {/* Outer frame styling optimized for both screen and printing */}
          <div className="space-y-6 print:p-8 print:text-black">
            
            {/* Print Header (Visible ONLY during print or PDF generation) */}
            <div className={`${isDownloading ? 'block mb-6' : 'hidden print:block'} text-center border-b-2 border-slate-300 pb-5`}>
              <h1 className="text-lg font-black uppercase tracking-tight">วิทยาลัยอาชีวศึกษา - ระบบบันทึกรายงานการเยี่ยมบ้านนักศึกษา</h1>
              <p className="text-xs font-bold mt-1">แบบสรุปผลการประเมินคัดกรองเบื้องต้น รายบุคคล</p>
              <p className="text-[10px] text-slate-400 mt-0.5">พิมพ์จากข้อมูลระบบส่วนกลาง วันที่: {new Date().toLocaleDateString('th-TH')}</p>
            </div>

            {/* Part 1: Student info block */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              <div className="md:col-span-8 space-y-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-extrabold text-slate-800 tracking-tight">{student.name}</h3>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-md font-bold bg-brand-50 text-brand-700 border border-brand-100 uppercase tracking-wide">
                    {student.level}/{student.room}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200/60">
                    <span className="text-slate-400 text-[10px] font-bold block mb-1 uppercase tracking-wider">รหัสประจำตัว</span>
                    <strong className="text-slate-800 font-mono font-extrabold">{student.id}</strong>
                  </div>
                  <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200/60">
                    <span className="text-slate-400 text-[10px] font-bold block mb-1 uppercase tracking-wider">แผนกวิชา</span>
                    <strong className="text-slate-800 font-extrabold">ช่าง/สาขา{student.department}</strong>
                  </div>
                  <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200/60">
                    <span className="text-slate-400 text-[10px] font-bold block mb-1 uppercase tracking-wider">เบอร์ติดต่อผู้ปกครอง</span>
                    <strong className="text-slate-800 font-extrabold">{student.parentPhone}</strong>
                  </div>
                  <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200/60">
                    <span className="text-slate-400 text-[10px] font-bold block mb-1 uppercase tracking-wider">ชื่อผู้ปกครองผู้ดูแล</span>
                    <strong className="text-slate-800 font-extrabold">{student.parentName}</strong>
                  </div>
                </div>

                <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-200/60 text-xs">
                  <span className="text-slate-400 text-[10px] font-bold block mb-1 uppercase tracking-wider">ที่อยู่นักเรียนปัจจุบัน</span>
                  <p className="text-slate-700 leading-normal font-medium">{student.address}</p>
                </div>
              </div>

              {/* Photos Panel */}
              <div className="md:col-span-4 flex flex-col gap-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ผลการคัดกรองเบื้องต้น</span>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col gap-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">กลุ่มประเมิน:</span>
                  <div>{getRiskLabel(d?.screeningResult)}</div>
                </div>
                {isVisited && d?.visitDate && (
                  <div className="text-[10px] text-slate-500 flex items-center gap-1.5 font-bold">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>วันที่ลงเยี่ยมบ้าน: {d.visitDate}</span>
                  </div>
                )}
                {lat && lng && !isDownloading && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer text-center"
                  >
                    <MapPin className="w-4 h-4" />
                    เปิด Google Maps
                  </a>
                )}
              </div>

            </div>

            {isVisited && d ? (
              <>
                <hr className="border-slate-200 print:border-slate-300" />

                {/* Part 2: สภาพแวดล้อมที่อยู่อาศัย & ครอบครัว */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-l-2 border-brand-500 pl-2">สภาพแวดล้อมทางสังคม</h4>
                    <ul className="space-y-2 text-slate-600">
                      <li className="flex justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200/50">
                        <span className="font-medium">สภาพที่อยู่อาศัย:</span>
                        <strong className="text-slate-800 font-bold">{d.houseCondition}</strong>
                      </li>
                      <li className="flex justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200/50">
                        <span className="font-medium">สิทธิ์ครอบครองที่อยู่:</span>
                        <strong className="text-slate-800 font-bold">{d.houseOwnership}</strong>
                      </li>
                      <li className="flex justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200/50">
                        <span className="font-medium">สถานภาพครอบครัว:</span>
                        <strong className="text-slate-800 font-bold">{d.familyStatus}</strong>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-l-2 border-brand-500 pl-2">สถานะทางเศรษฐกิจและความสัมพันธ์</h4>
                    <ul className="space-y-2 text-slate-600">
                      <li className="flex justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200/50">
                        <span className="font-medium">รายได้ครอบครัวเฉลี่ยต่อเดือน:</span>
                        <strong className="text-slate-800 font-mono font-extrabold">{d.averageMonthlyIncome.toLocaleString()} บาท</strong>
                      </li>
                      <li className="flex justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200/50">
                        <span className="font-medium">ภาระหนี้สินครอบครัว:</span>
                        <strong className="text-slate-800 font-bold">{d.debtStatus}</strong>
                      </li>
                      <li className="flex justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200/50">
                        <span className="font-medium">ระดับความอบอุ่นครอบครัว:</span>
                        <strong className="text-brand-600 font-extrabold">{d.relationshipScale} / 5 คะแนน</strong>
                      </li>
                    </ul>
                  </div>
                </div>

                <hr className="border-slate-200 print:border-slate-300" />

                {/* Part 3: ปัจจัยเสี่ยงที่ตรวจพบ */}
                <div className="space-y-3 text-xs">
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-l-2 border-brand-500 pl-2">ปัจจัยเสี่ยงและพฤติกรรมที่ครูคัดกรอง</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { key: d.risks.academic, label: 'ด้านการเรียน/ขาดเรียน' },
                      { key: d.risks.substance, label: 'ด้านเกี่ยวข้องสารเสพติด' },
                      { key: d.risks.gaming, label: 'ด้านเล่นเกมดึก/ติดโทรศัพท์' },
                      { key: d.risks.relationship, label: 'ด้านความเสี่ยงชู้สาววัยรุ่น' },
                      { key: d.risks.financial, label: 'ด้านการเงินขัดสนอย่างหนัก' },
                      { key: d.risks.travelRisk, label: 'ด้านการเดินทางมีระยะทางเสี่ยง' }
                    ].map((item, index) => (
                      <div key={index} className={`p-2.5 rounded-lg border flex items-center justify-between ${
                        item.key ? 'bg-rose-50 border-rose-200 text-rose-800 font-bold' : 'bg-slate-50/55 border-slate-200 text-slate-400'
                      }`}>
                        <span>{item.label}</span>
                        <span>{item.key ? '🔴 เสี่ยง' : '🟢 ปกติ'}</span>
                      </div>
                    ))}
                  </div>
                  {d.riskNotes && (
                    <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-lg leading-normal text-slate-600 font-medium">
                      <strong>รายละเอียดความเสี่ยงเพิ่มเติม:</strong> {d.riskNotes}
                    </div>
                  )}
                </div>

                <hr className="border-slate-200 print:border-slate-300" />

                {/* Part 4: หลักฐานรูปถ่าย (House & Parent photos) */}
                {(d.housePhoto || d.parentPhoto) && (
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-l-2 border-brand-500 pl-2">หลักฐานพยานรูปถ่ายเยี่ยมบ้าน</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {d.housePhoto && (
                        <div className="space-y-1.5 text-xs">
                          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">รูปถ่ายที่อยู่อาศัย:</span>
                          <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50 aspect-video max-h-48">
                            <img src={d.housePhoto} alt="รูปสภาพบ้าน" className="w-full h-full object-cover" />
                          </div>
                        </div>
                      )}
                      {d.parentPhoto && (
                        <div className="space-y-1.5 text-xs">
                          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">รูปถ่ายครูร่วมกับผู้ปกครอง:</span>
                          <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50 aspect-video max-h-48">
                            <img src={d.parentPhoto} alt="รูปเยี่ยมบ้าน" className="w-full h-full object-cover" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <hr className="border-slate-200 print:border-slate-300" />

                {/* Part 5: แผนที่ GPS พิกัดนำทาง */}
                {d.latitude && d.longitude && (
                  <div className="space-y-3 text-xs">
                    <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-l-2 border-brand-500 pl-2">พิกัดทางภูมิศาสตร์บ้าน</h4>
                    <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                        <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>ปักหมุด GPS ที่ละติจูด {d.latitude.toFixed(6)}, ลองจิจูด {d.longitude.toFixed(6)}</span>
                      </div>
                      {!isDownloading && (
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${d.latitude},${d.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-700 hover:text-brand-800 text-xs font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          นำทางบน Google Maps
                          <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <hr className="border-slate-200 print:border-slate-300" />

                {/* Part 6: ความเห็นครูที่ปรึกษา และลายมือชื่อพยาน */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start text-xs pt-2">
                  <div className="md:col-span-8 space-y-2">
                    <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">ข้อเสนอแนะความเห็นเพิ่มเติมของครูที่ปรึกษา</span>
                    <p className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-700 leading-normal font-medium">
                      {d.counselorNotes || 'ไม่มีข้อมูลเพิ่มเติม'}
                    </p>
                  </div>

                  <div className="md:col-span-4 text-center space-y-4 py-4 border border-slate-200 bg-slate-50/50 rounded-lg">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ลายมือชื่อผู้ลงบันทึกข้อมูล</div>
                    <div className="font-extrabold text-slate-800 border-b border-dashed border-slate-400 w-3/4 mx-auto pb-1 mt-6">
                      {d.submittedBy}
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">ครูที่ปรึกษา / ครูผู้ลงบันทึกเยี่ยมบ้าน</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-16 bg-slate-50 border border-slate-200 rounded-lg">
                <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">ยังไม่ได้รับการเยี่ยมบ้าน</h4>
                <p className="text-[11px] text-slate-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
                  นักศึกษารายนี้ยังไม่มีประวัติการเยี่ยมบ้านในระบบ โปรดคลิกที่ "บันทึกการเยี่ยมบ้าน" หน้าข้อมูลครูที่ปรึกษาเพื่อทำการบันทึก
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-lg cursor-pointer transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};

