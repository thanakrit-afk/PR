import React, { useState, useEffect } from 'react';
import { Student, HomeVisitData } from '../types';
import { 
  X, MapPin, Camera, Save, RefreshCw, Check, AlertCircle, 
  Smile, ShieldAlert, Award, ArrowLeft, Image as ImageIcon
} from 'lucide-react';

interface HomeVisitFormProps {
  student: Student;
  onSave: (studentId: string, visitData: HomeVisitData) => void;
  onClose: () => void;
}

// Default presets for fast testing
const HOUSE_PHOTO_PRESETS = [
  { name: 'บ้านปูนแข็งแรง', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80' },
  { name: 'บ้านไม้ดั้งเดิม', url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=600&auto=format&fit=crop&q=80' },
  { name: 'บ้านไม้เก่าทรุดโทรม', url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&auto=format&fit=crop&q=80' }
];

const PARENT_PHOTO_PRESETS = [
  { name: 'รูปเยี่ยมบ้านอบอุ่น 1', url: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=600&auto=format&fit=crop&q=80' },
  { name: 'รูปเยี่ยมบ้านอบอุ่น 2', url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80' },
  { name: 'รูปคู่ผู้ปกครอง 3', url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&auto=format&fit=crop&q=80' }
];

export const HomeVisitForm: React.FC<HomeVisitFormProps> = ({
  student,
  onSave,
  onClose
}) => {
  // Initialize state with existing visit data or defaults
  const [visitDate, setVisitDate] = useState('');
  const [travelInfo, setTravelInfo] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');

  // House
  const [houseCondition, setHouseCondition] = useState<HomeVisitData['houseCondition']>('มั่นคงแข็งแรง');
  const [houseOwnership, setHouseOwnership] = useState<HomeVisitData['houseOwnership']>('บ้านตนเอง');

  // Family
  const [familyStatus, setFamilyStatus] = useState<HomeVisitData['familyStatus']>('อยู่กับบิดามารดา');
  const [relationshipScale, setRelationshipScale] = useState(5);
  const [averageMonthlyIncome, setAverageMonthlyIncome] = useState(15000);
  const [debtStatus, setDebtStatus] = useState<HomeVisitData['debtStatus']>('ไม่มีหนี้สิน');

  // Risks
  const [riskAcademic, setRiskAcademic] = useState(false);
  const [riskSubstance, setRiskSubstance] = useState(false);
  const [riskGaming, setRiskGaming] = useState(false);
  const [riskRelationship, setRiskRelationship] = useState(false);
  const [riskFinancial, setRiskFinancial] = useState(false);
  const [riskTravelRisk, setRiskTravelRisk] = useState(false);
  const [riskNotes, setRiskNotes] = useState('');

  // Photos
  const [housePhoto, setHousePhoto] = useState('');
  const [parentPhoto, setParentPhoto] = useState('');

  // Screening
  const [screeningResult, setScreeningResult] = useState<HomeVisitData['screeningResult']>('ปกติ');
  const [counselorNotes, setCounselorNotes] = useState('');
  const [submittedBy, setSubmittedBy] = useState('ครูแนะแนว ถิ่นไท');

  // Sync state if student already has visitData
  useEffect(() => {
    // Default date is today
    const today = new Date().toISOString().split('T')[0];
    setVisitDate(today);

    if (student.latitude && student.longitude) {
      setLatitude(student.latitude);
      setLongitude(student.longitude);
    } else {
      // Default to city coordinates
      setLatitude(16.4396);
      setLongitude(102.8288);
    }

    if (student.visitData) {
      const d = student.visitData;
      setVisitDate(d.visitDate);
      setTravelInfo(d.travelInfo);
      setLatitude(d.latitude);
      setLongitude(d.longitude);
      setHouseCondition(d.houseCondition);
      setHouseOwnership(d.houseOwnership);
      setFamilyStatus(d.familyStatus);
      setRelationshipScale(d.relationshipScale);
      setAverageMonthlyIncome(d.averageMonthlyIncome);
      setDebtStatus(d.debtStatus);
      
      setRiskAcademic(d.risks.academic);
      setRiskSubstance(d.risks.substance);
      setRiskGaming(d.risks.gaming);
      setRiskRelationship(d.risks.relationship);
      setRiskFinancial(d.risks.financial);
      setRiskTravelRisk(d.risks.travelRisk);
      
      setRiskNotes(d.riskNotes);
      setHousePhoto(d.housePhoto);
      setParentPhoto(d.parentPhoto);
      setScreeningResult(d.screeningResult);
      setCounselorNotes(d.counselorNotes);
      setSubmittedBy(d.submittedBy || 'ครูที่ปรึกษา');
    }
  }, [student]);

  // Handle auto screening recommendation based on selected risks
  useEffect(() => {
    // If any severe risk is ticked (substance, game addiction, relationship problems) -> Problem
    // If mild risk (academic, financial, distance) -> Risk
    // Else -> Normal
    const hasProblem = riskSubstance || riskGaming || riskRelationship;
    const hasRisk = riskAcademic || riskFinancial || riskTravelRisk;

    if (hasProblem) {
      setScreeningResult('มีปัญหา');
    } else if (hasRisk || houseCondition === 'ทรุดโทรม/ไม่มั่นคง' || debtStatus === 'มีหนี้สินนอกระบบ' || debtStatus === 'มีทั้งในและนอกระบบ') {
      setScreeningResult('เสี่ยง');
    } else {
      setScreeningResult('ปกติ');
    }
  }, [riskAcademic, riskSubstance, riskGaming, riskRelationship, riskFinancial, riskTravelRisk, houseCondition, debtStatus]);

  // Handle manual file uploads
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'house' | 'parent') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          if (target === 'house') setHousePhoto(reader.result);
          else setParentPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Get current coordinates
  const getCurrentLocation = () => {
    setGpsLoading(true);
    setGpsError('');
    if (!navigator.geolocation) {
      setGpsError('บราวเซอร์ของคุณไม่รองรับการดึงข้อมูลพิกัด GPS');
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setGpsLoading(false);
      },
      (error) => {
        console.error(error);
        setGpsError('ไม่สามารถเข้าถึงพิกัดได้ (กรุณาอนุญาตสิทธิ์ หรือป้อนพิกัดด้วยตนเอง)');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const visitData: HomeVisitData = {
      visitDate,
      travelInfo,
      latitude: latitude || 16.4396,
      longitude: longitude || 102.8288,
      houseCondition,
      houseOwnership,
      familyStatus,
      relationshipScale,
      averageMonthlyIncome,
      debtStatus,
      risks: {
        academic: riskAcademic,
        substance: riskSubstance,
        gaming: riskGaming,
        relationship: riskRelationship,
        financial: riskFinancial,
        travelRisk: riskTravelRisk
      },
      riskNotes,
      housePhoto,
      parentPhoto,
      screeningResult,
      counselorNotes,
      submittedBy
    };

    onSave(student.id, visitData);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header Bar */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            ย้อนกลับ
          </button>
          <div className="text-center">
            <span className="text-[11px] font-mono font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              บันทึกผลการคัดกรองเยี่ยมบ้าน
            </span>
            <h1 className="text-lg font-bold text-slate-800 mt-1">
              แบบฟอร์มบันทึกข้อมูล: {student.name}
            </h1>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <form onSubmit={handleFormSubmit} className="space-y-6">
          
          {/* Section 1: ข้อมูลทั่วไปของนักศึกษา */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h2 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center gap-2 pb-2.5 border-b border-slate-150 uppercase tracking-tight">
              <span className="flex items-center justify-center w-5 h-5 rounded-md bg-brand-50 text-brand-600 text-[11px] font-black border border-brand-100">1</span>
              ข้อมูลพื้นฐานของนักเรียนนักศึกษา
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200/60">
                <span className="text-slate-400 text-[10px] font-bold block mb-1">รหัสนักศึกษา</span>
                <span className="text-slate-800 font-extrabold">{student.id}</span>
              </div>
              <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200/60">
                <span className="text-slate-400 text-[10px] font-bold block mb-1">ชื่อ-นามสกุล</span>
                <span className="text-slate-800 font-extrabold">{student.name}</span>
              </div>
              <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200/60">
                <span className="text-slate-400 text-[10px] font-bold block mb-1">ระดับชั้น/ห้อง</span>
                <span className="text-slate-800 font-extrabold">{student.level} ห้อง {student.room}</span>
              </div>
              <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200/60">
                <span className="text-slate-400 text-[10px] font-bold block mb-1">แผนกวิชา</span>
                <span className="text-slate-800 font-extrabold">{student.department}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-3">
              <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200/60">
                <span className="text-slate-400 text-[10px] font-bold block mb-1">ชื่อผู้ปกครอง</span>
                <span className="text-slate-800 font-extrabold">{student.parentName}</span>
              </div>
              <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200/60">
                <span className="text-slate-400 text-[10px] font-bold block mb-1">เบอร์โทรศัพท์ติดต่อ</span>
                <span className="text-slate-800 font-extrabold">{student.parentPhone}</span>
              </div>
            </div>
          </div>

          {/* Section 2: ข้อมูลการเดินทางและแผนที่ (GPS) */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h2 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center gap-2 pb-2.5 border-b border-slate-150 uppercase tracking-tight">
              <span className="flex items-center justify-center w-5 h-5 rounded-md bg-brand-50 text-brand-600 text-[11px] font-black border border-brand-100">2</span>
              ข้อมูลการเดินทางและแผนที่บ้านนักเรียน
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    วันที่เยี่ยมบ้าน <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700 font-medium"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    วิธีการเดินทาง/เส้นทางเข้าบ้าน
                  </label>
                  <textarea
                    rows={3}
                    value={travelInfo}
                    onChange={(e) => setTravelInfo(e.target.value)}
                    placeholder="เช่น ทางเข้าเข้าซอยวัดป่าแสงอรุณ ซอยแคบรถจักรยานยนต์สัญจรได้เท่านั้น"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700 leading-normal"
                  />
                </div>
              </div>

              {/* GPS Selector */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="text-slate-700 text-[10px] font-bold uppercase block tracking-wider mb-1.5">
                    ปักหมุดพิกัด GPS แผนที่
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                    กดปุ่มเพื่อใช้ GPS จากอุปกรณ์เคลื่อนที่ของท่าน หรือป้อนละติจูด/ลองจิจูดด้านล่าง
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={latitude || ''}
                      onChange={(e) => setLatitude(Number(e.target.value))}
                      placeholder="เช่น 16.43"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={longitude || ''}
                      onChange={(e) => setLongitude(Number(e.target.value))}
                      placeholder="เช่น 102.82"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none text-slate-700"
                    />
                  </div>
                </div>

                {gpsError && (
                  <div className="mb-2 text-[11px] text-rose-600 bg-rose-50 border border-rose-100 p-2 rounded-lg flex gap-1 items-start">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{gpsError}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={gpsLoading}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    {gpsLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        กำลังค้นหาตำแหน่ง...
                      </>
                    ) : (
                      <>
                        <MapPin className="w-3.5 h-3.5" />
                        ดึงตำแหน่งปัจจุบัน
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: สภาพที่อยู่อาศัย และการครอบครอง */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h2 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center gap-2 pb-2.5 border-b border-slate-150 uppercase tracking-tight">
              <span className="flex items-center justify-center w-5 h-5 rounded-md bg-brand-50 text-brand-600 text-[11px] font-black border border-brand-100">3</span>
              สภาพที่อยู่อาศัยและการครอบครอง
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* สภาพที่อยู่อาศัย */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  สภาพตัวบ้าน <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-1.5">
                  {[
                    { key: 'มั่นคงแข็งแรง', label: 'มั่นคงแข็งแรง (คอนกรีต/โครงสร้างดี มีที่บังลมฝนครบถ้วน)' },
                    { key: 'ปานกลาง/มีจุดชำรุด', label: 'ปานกลาง (มีจุดชำรุดบางแห่ง ต้องได้รับการบูรณะ)' },
                    { key: 'ทรุดโทรม/ไม่มั่นคง', label: 'ทรุดโทรมมาก (โครงสร้างชำรุดหนัก ไม่มีความมั่นคงปลอดภัย)' },
                    { key: 'ชั่วคราว/แออัด', label: 'ที่อยู่ชั่วคราว/แออัด (หลังคาสังกะสีเก่า ผุพัง ป้องกันแดดฝนได้ยาก)' }
                  ].map((opt) => (
                    <label key={opt.key} className="flex items-start gap-2.5 p-2 bg-slate-50 rounded-lg hover:bg-brand-50/50 cursor-pointer text-xs text-slate-700 font-medium border border-slate-200/50 hover:border-slate-300">
                      <input
                        type="radio"
                        name="houseCondition"
                        checked={houseCondition === opt.key}
                        onChange={() => setHouseCondition(opt.key as any)}
                        className="mt-0.5 text-brand-500 focus:ring-brand-500"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* การครอบครอง */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  การครอบครองที่อยู่อาศัย <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-1.5">
                  {[
                    { key: 'บ้านตนเอง', label: 'บ้านของตนเอง (ครอบครัวเป็นเจ้าของ)' },
                    { key: 'บ้านเช่า', label: 'บ้านเช่า/ห้องพักรายเดือน' },
                    { key: 'อาศัยญาติ', label: 'อาศัยอยู่กับญาติพี่น้อง' },
                    { key: 'หอพักนักเรียน', label: 'หอพักนอกสถานศึกษา' }
                  ].map((opt) => (
                    <label key={opt.key} className="flex items-start gap-2.5 p-2 bg-slate-50 rounded-lg hover:bg-brand-50/50 cursor-pointer text-xs text-slate-700 font-medium border border-slate-200/50 hover:border-slate-300">
                      <input
                        type="radio"
                        name="houseOwnership"
                        checked={houseOwnership === opt.key}
                        onChange={() => setHouseOwnership(opt.key as any)}
                        className="mt-0.5 text-brand-500 focus:ring-brand-500"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: สถานะครอบครัวและความสัมพันธ์ */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h2 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center gap-2 pb-2.5 border-b border-slate-150 uppercase tracking-tight">
              <span className="flex items-center justify-center w-5 h-5 rounded-md bg-brand-50 text-brand-600 text-[11px] font-black border border-brand-100">4</span>
              สถานะครอบครัวและความสัมพันธ์
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* สถานะครอบครัว */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  สถานภาพครอบครัว <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-1.5">
                  {[
                    { key: 'อยู่กับบิดามารดา', label: 'บิดาและมารดาอยู่ร่วมกัน' },
                    { key: 'อยู่กับบิดา (มารดาเสียชีวิต/แยกทาง)', label: 'อยู่กับบิดาเท่านั้น (มารดาแยกทาง/เสียชีวิต)' },
                    { key: 'อยู่กับมารดา (บิดาเสียชีวิต/แยกทาง)', label: 'อยู่กับมารดาเท่านั้น (บิดาแยกทาง/เสียชีวิต)' },
                    { key: 'อยู่กับญาติ/ผู้ปกครอง', label: 'บิดามารดาแยกกันไป/อาศัยอยู่กับญาติปู่ย่าตายาย' }
                  ].map((opt) => (
                    <label key={opt.key} className="flex items-start gap-2.5 p-2 bg-slate-50 rounded-lg hover:bg-brand-50/50 cursor-pointer text-xs text-slate-700 font-medium border border-slate-200/50 hover:border-slate-300">
                      <input
                        type="radio"
                        name="familyStatus"
                        checked={familyStatus === opt.key}
                        onChange={() => setFamilyStatus(opt.key as any)}
                        className="mt-0.5 text-brand-500 focus:ring-brand-500"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* ความสัมพันธ์ */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    ความสุขและความสัมพันธ์ในครอบครัว: <span className="text-brand-600 font-extrabold">{relationshipScale} / 5</span>
                  </label>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={relationshipScale}
                      onChange={(e) => setRelationshipScale(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-bold px-1">
                      <span>1 (เหินห่าง/มีปากเสียงบ่อย)</span>
                      <span>3 (ปานกลาง)</span>
                      <span>5 (อบอุ่นรักใคร่)</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      รายได้ครอบครัวเฉลี่ย/เดือน (บาท)
                    </label>
                    <input
                      type="number"
                      value={averageMonthlyIncome}
                      onChange={(e) => setAverageMonthlyIncome(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700 font-mono font-bold"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      ภาระหนี้สินครอบครัว
                    </label>
                    <select
                      value={debtStatus}
                      onChange={(e) => setDebtStatus(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700"
                    >
                      <option value="ไม่มีหนี้สิน">ไม่มีหนี้สิน</option>
                      <option value="มีหนี้สินในระบบ">มีหนี้สินในระบบ</option>
                      <option value="มีหนี้สินนอกระบบ">มีหนี้สินนอกระบบ</option>
                      <option value="มีทั้งในและนอกระบบ">มีทั้งในและนอกระบบ</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: พฤติกรรมและความเสี่ยงของนักศึกษา */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h2 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center gap-2 pb-2.5 border-b border-slate-150 uppercase tracking-tight">
              <span className="flex items-center justify-center w-5 h-5 rounded-md bg-brand-50 text-brand-600 text-[11px] font-black border border-brand-100">5</span>
              พฤติกรรมและความเสี่ยงของนักเรียนนักศึกษา (ปัจจัยคัดกรอง)
            </h2>
            
            <p className="text-xs text-slate-500 mb-4 bg-amber-50/50 text-amber-800 border border-amber-100/60 p-3 rounded-lg flex items-start gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <span>
                <strong>คำแนะนำสำหรับครูที่ปรึกษา:</strong> โปรดตรวจสอบสภาพแวดล้อม พฤติกรรม หรือความสุ่มเสี่ยงของเด็ก เพื่อให้งานแนะแนวร่วมคัดกรองและประเมินสิทธิ์รับทุนช่วยเหลือพิเศษ
              </span>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100/70 rounded-lg cursor-pointer transition-colors border border-slate-200">
                  <input
                    type="checkbox"
                    checked={riskAcademic}
                    onChange={(e) => setRiskAcademic(e.target.checked)}
                    className="w-4 h-4 text-brand-500 border-slate-300 rounded focus:ring-brand-500"
                  />
                  <div className="text-xs">
                    <strong className="text-slate-800 block font-bold">ด้านการเรียนและพฤติกรรมในห้อง</strong>
                    <span className="text-slate-400 text-[11px]">ผลการเรียนเฉลี่ยต่ำ / ขาดเรียนบ่อย / ไม่ส่งงาน</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100/70 rounded-lg cursor-pointer transition-colors border border-slate-200">
                  <input
                    type="checkbox"
                    checked={riskSubstance}
                    onChange={(e) => setRiskSubstance(e.target.checked)}
                    className="w-4 h-4 text-brand-500 border-slate-300 rounded focus:ring-brand-500"
                  />
                  <div className="text-xs">
                    <strong className="text-slate-800 block font-bold">ด้านสารเสพติดและแหล่งอบายมุข</strong>
                    <span className="text-slate-400 text-[11px]">เสพหรือเกี่ยวพัน / ดื่มแอลกอฮอล์ / คบกลุ่มเพื่อนเสี่ยง</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100/70 rounded-lg cursor-pointer transition-colors border border-slate-200">
                  <input
                    type="checkbox"
                    checked={riskGaming}
                    onChange={(e) => setRiskGaming(e.target.checked)}
                    className="w-4 h-4 text-brand-500 border-slate-300 rounded focus:ring-brand-500"
                  />
                  <div className="text-xs">
                    <strong className="text-slate-800 block font-bold">ด้านติดเกม / ติดโทรศัพท์</strong>
                    <span className="text-slate-400 text-[11px]">เล่นเกมดึกจัด / ง่วงนอนในห้องเรียน / ควบคุมตนเองไม่ได้</span>
                  </div>
                </label>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100/70 rounded-lg cursor-pointer transition-colors border border-slate-200">
                  <input
                    type="checkbox"
                    checked={riskRelationship}
                    onChange={(e) => setRiskRelationship(e.target.checked)}
                    className="w-4 h-4 text-brand-500 border-slate-300 rounded focus:ring-brand-500"
                  />
                  <div className="text-xs">
                    <strong className="text-slate-800 block font-bold">ด้านชู้สาวและความสัมพันธ์เพศวัยรุ่น</strong>
                    <span className="text-slate-400 text-[11px]">ความสุ่มเสี่ยงพฤติกรรมทางเพศ / พักอาศัยร่วมกันโดยลำพัง</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100/70 rounded-lg cursor-pointer transition-colors border border-slate-200">
                  <input
                    type="checkbox"
                    checked={riskFinancial}
                    onChange={(e) => setRiskFinancial(e.target.checked)}
                    className="w-4 h-4 text-brand-500 border-slate-300 rounded focus:ring-brand-500"
                  />
                  <div className="text-xs">
                    <strong className="text-slate-800 block font-bold">ด้านสถานะการเงินขัดสน</strong>
                    <span className="text-slate-400 text-[11px]">เงินไม่พอจ่ายค่าอาหาร / ค้างค่าเทอม / ไม่มีค่าพาหนะ</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100/70 rounded-lg cursor-pointer transition-colors border border-slate-200">
                  <input
                    type="checkbox"
                    checked={riskTravelRisk}
                    onChange={(e) => setRiskTravelRisk(e.target.checked)}
                    className="w-4 h-4 text-brand-500 border-slate-300 rounded focus:ring-brand-500"
                  />
                  <div className="text-xs">
                    <strong className="text-slate-800 block font-bold">ด้านความเสี่ยงในการเดินทาง</strong>
                    <span className="text-slate-400 text-[11px]">ระยะทางไกลกว่า 20 กม. / ขับขี่หวาดเสียว / เปลี่ยว มืด</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                บันทึกเพิ่มเติมรายละเอียดความเสี่ยง
              </label>
              <textarea
                rows={2}
                value={riskNotes}
                onChange={(e) => setRiskNotes(e.target.value)}
                placeholder="อธิบายพฤติกรรม เช่น ค้างค่าเทอม และผู้ปกครองตกงานช่วงโควิด"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700 leading-normal"
              />
            </div>
          </div>

          {/* Section 6: อัปโหลดรูปภาพ */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h2 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center gap-2 pb-2.5 border-b border-slate-150 uppercase tracking-tight">
              <span className="flex items-center justify-center w-5 h-5 rounded-md bg-brand-50 text-brand-600 text-[11px] font-black border border-brand-100">6</span>
              อัปโหลดรูปภาพหลักฐานการเยี่ยมบ้าน
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* รูปถ่ายตัวบ้าน */}
              <div className="space-y-3">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  รูปถ่ายสภาพที่อยู่อาศัย / ตัวบ้าน
                </span>
                
                {housePhoto ? (
                  <div className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-video">
                    <img src={housePhoto} alt="สภาพบ้าน" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setHousePhoto('')}
                      className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white p-1.5 rounded-full shadow-xs cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-200 hover:border-brand-300 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50/50 aspect-video transition-colors group">
                    <ImageIcon className="w-8 h-8 text-slate-400 group-hover:text-brand-500 transition-colors mb-2" />
                    <p className="text-xs text-slate-500 mb-2 font-medium">ลากไฟล์มาวางที่นี่ หรือ เลือกไฟล์จากระบบ</p>
                    <label className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs transition-colors">
                      อัปโหลดรูปภาพ
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'house')}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                <div className="mt-2.5">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">เลือกรูปตัวอย่างด่วน (สำหรับทดสอบ)</span>
                  <div className="flex flex-wrap gap-1.5">
                    {HOUSE_PHOTO_PRESETS.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => setHousePhoto(p.url)}
                        className="text-[10px] px-2.5 py-1 bg-slate-50 hover:bg-brand-50 hover:text-brand-700 font-semibold text-slate-500 rounded border border-slate-200 transition-colors cursor-pointer"
                      >
                        + {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* รูปถ่ายร่วมกับผู้ปกครอง */}
              <div className="space-y-3">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  รูปถ่ายร่วมกับผู้ปกครองและนักเรียน
                </span>
                
                {parentPhoto ? (
                  <div className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-video">
                    <img src={parentPhoto} alt="รูปถ่ายเยี่ยมบ้าน" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setParentPhoto('')}
                      className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white p-1.5 rounded-full shadow-xs cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-200 hover:border-brand-300 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50/50 aspect-video transition-colors group">
                    <Camera className="w-8 h-8 text-slate-400 group-hover:text-brand-500 transition-colors mb-2" />
                    <p className="text-xs text-slate-500 mb-2 font-medium">ลากไฟล์มาวางที่นี่ หรือ เลือกไฟล์จากระบบ</p>
                    <label className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs transition-colors">
                      อัปโหลดรูปภาพ
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'parent')}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                <div className="mt-2.5">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">เลือกรูปตัวอย่างด่วน (สำหรับทดสอบ)</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PARENT_PHOTO_PRESETS.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => setParentPhoto(p.url)}
                        className="text-[10px] px-2.5 py-1 bg-slate-50 hover:bg-brand-50 hover:text-brand-700 font-semibold text-slate-500 rounded border border-slate-200 transition-colors cursor-pointer"
                      >
                        + {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 7: ผลการคัดกรอง และบันทึกข้อเสนอแนะ */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h2 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center gap-2 pb-2.5 border-b border-slate-150 uppercase tracking-tight">
              <span className="flex items-center justify-center w-5 h-5 rounded-md bg-brand-50 text-brand-600 text-[11px] font-black border border-brand-100">7</span>
              สรุปผลการคัดกรองเบื้องต้นและการนำเสนอแนะ
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Screening outcome (3 columns) */}
              <div className="md:col-span-4">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  สรุปกลุ่มคัดกรอง (แนะนำอัตโนมัติ)
                </label>
                <div className="flex flex-col gap-2">
                  {[
                    { key: 'ปกติ', label: 'กลุ่มปกติ', desc: 'ไม่มีความสุ่มเสี่ยง สภาพบ้านอบอุ่นแข็งแรง', bg: 'bg-emerald-500', hoverBg: 'hover:bg-emerald-600', text: 'text-emerald-700', activeBg: 'bg-emerald-50 border-emerald-200' },
                    { key: 'เสี่ยง', label: 'กลุ่มเสี่ยง', desc: 'มีปัจจัยขัดสนทางการเงิน หรือพฤติกรรมที่ต้องระวัง', bg: 'bg-amber-500', hoverBg: 'hover:bg-amber-600', text: 'text-amber-700', activeBg: 'bg-amber-50 border-amber-200' },
                    { key: 'มีปัญหา', label: 'กลุ่มมีปัญหา', desc: 'ติดเกมชักชวนกันโดดเรียน หรือ สารเสพติด ชำรุดพุพังรุนแรง', bg: 'bg-rose-500', hoverBg: 'hover:bg-rose-600', text: 'text-rose-700', activeBg: 'bg-rose-50 border-rose-200' }
                  ].map((opt) => {
                    const isSelected = screeningResult === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setScreeningResult(opt.key as any)}
                        className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                          isSelected 
                            ? `${opt.activeBg} ring-1 ring-brand-500 shadow-xs` 
                            : 'bg-slate-50 border-transparent hover:bg-slate-100/80'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${opt.bg}`} />
                          <span className={`text-xs font-bold ${opt.text}`}>{opt.label}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 pl-5 leading-normal">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Suggestions and Signature (8 columns) */}
              <div className="md:col-span-8 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    ข้อเสนอแนะความเห็นของครูที่ปรึกษา / สรุปช่วยเหลือ
                  </label>
                  <textarea
                    rows={4}
                    value={counselorNotes}
                    onChange={(e) => setCounselorNotes(e.target.value)}
                    placeholder="เช่น ส่งเรื่องพิจารณารับทุนการศึกษาเสริมพิเศษ / ส่งแนะแนวช่วยคุมปรับพฤติกรรมโดดเรียน"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700 leading-normal"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    ชื่อ-สกุล ครูที่ปรึกษาผู้ลงบันทึก <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={submittedBy}
                    onChange={(e) => setSubmittedBy(e.target.value)}
                    className="w-full max-w-md px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700 font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 pb-12 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-lg cursor-pointer transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-4 h-4" />
              บันทึกข้อมูลเยี่ยมบ้าน
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
