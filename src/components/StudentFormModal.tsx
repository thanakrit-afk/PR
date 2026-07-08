import React, { useState, useEffect, useRef } from 'react';
import { Student } from '../types';
import { 
  X, Save, AlertCircle, Layers, UserCheck, Phone, MapPin, Sparkles, Search, Compass, Calendar, Home, DollarSign, CreditCard, ShieldAlert
} from 'lucide-react';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null; // null for adding, non-null for editing
  onSave: (studentData: Student) => void;
  studentsList: Student[];
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  student,
  onSave,
  studentsList
}) => {
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formLevel, setFormLevel] = useState<Student['level']>('ปวช. 1');
  const [formDepartment, setFormDepartment] = useState('ระบบขนส่งทางราง');
  const [formRoom, setFormRoom] = useState('1');
  const [formParentName, setFormParentName] = useState('');
  const [formParentPhone, setFormParentPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formNickname, setFormNickname] = useState('');
  const [formCitizenId, setFormCitizenId] = useState('');
  const [formBloodGroup, setFormBloodGroup] = useState('O');
  const [formStudentPhone, setFormStudentPhone] = useState('');
  const [formParentRelationship, setFormParentRelationship] = useState('บิดา');
  const [formParentOccupation, setFormParentOccupation] = useState('');
  const [formError, setFormError] = useState('');

  // Additional form states for coordinates and comprehensive home visit details
  const [formLatitude, setFormLatitude] = useState<number | null>(null);
  const [formLongitude, setFormLongitude] = useState<number | null>(null);
  const [formVisitStatus, setFormVisitStatus] = useState<'ยังไม่ได้เยี่ยม' | 'เยี่ยมแล้ว'>('ยังไม่ได้เยี่ยม');
  
  // Home visit questionnaire fields
  const [formVisitDate, setFormVisitDate] = useState('');
  const [formTravelInfo, setFormTravelInfo] = useState('');
  const [formHouseCondition, setFormHouseCondition] = useState<'มั่นคงแข็งแรง' | 'ปานกลาง/มีจุดชำรุด' | 'ทรุดโทรม/ไม่มั่นคง' | 'ชั่วคราว/แออัด'>('มั่นคงแข็งแรง');
  const [formHouseOwnership, setFormHouseOwnership] = useState<'บ้านตนเอง' | 'บ้านเช่า' | 'อาศัยญาติ' | 'หอพักนักเรียน'>('บ้านตนเอง');
  const [formFamilyStatus, setFormFamilyStatus] = useState<'อยู่กับบิดามารดา' | 'อยู่กับบิดา (มารดาเสียชีวิต/แยกทาง)' | 'อยู่กับมารดา (บิดาเสียชีวิต/แยกทาง)' | 'อยู่กับญาติ/ผู้ปกครอง'>('อยู่กับบิดามารดา');
  const [formAverageMonthlyIncome, setFormAverageMonthlyIncome] = useState<number>(15000);
  const [formDebtStatus, setFormDebtStatus] = useState<'ไม่มีหนี้สิน' | 'มีหนี้สินในระบบ' | 'มีหนี้สินนอกระบบ' | 'มีทั้งในและนอกระบบ'>('ไม่มีหนี้สิน');
  const [formHousePhoto, setFormHousePhoto] = useState('');
  const [formParentPhoto, setFormParentPhoto] = useState('');
  const [formScreeningResult, setFormScreeningResult] = useState('ปกติ');
  const [formCounselorNotes, setFormCounselorNotes] = useState('');

  // Search location state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  // Map refs
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const mapContainerId = "form-modal-map";

  // Sync state with selected student when editing or reset when adding
  useEffect(() => {
    if (student) {
      setFormId(student.id);
      setFormName(student.name);
      setFormLevel(student.level);
      setFormDepartment(student.department || 'ระบบขนส่งทางราง');
      setFormRoom(student.room || '1');
      setFormParentName(student.parentName || '');
      setFormParentPhone(student.parentPhone || '');
      setFormAddress(student.address || '');
      setFormNickname(student.nickname || '');
      setFormCitizenId(student.citizenId || '');
      setFormBloodGroup(student.bloodGroup || 'O');
      setFormStudentPhone(student.studentPhone || '');
      setFormParentRelationship(student.parentRelationship || 'บิดา');
      setFormParentOccupation(student.parentOccupation || '');
      
      // GPS and Visit status initialization
      setFormLatitude(student.latitude);
      setFormLongitude(student.longitude);
      setFormVisitStatus(student.visitStatus || 'ยังไม่ได้เยี่ยม');
      
      if (student.visitData) {
        setFormVisitDate(student.visitData.visitDate || '');
        setFormTravelInfo(student.visitData.travelInfo || '');
        setFormHouseCondition(student.visitData.houseCondition || 'มั่นคงแข็งแรง');
        setFormHouseOwnership(student.visitData.houseOwnership || 'บ้านตนเอง');
        setFormFamilyStatus(student.visitData.familyStatus || 'อยู่กับบิดามารดา');
        setFormAverageMonthlyIncome(student.visitData.averageMonthlyIncome || 15000);
        setFormDebtStatus(student.visitData.debtStatus || 'ไม่มีหนี้สิน');
        setFormHousePhoto(student.visitData.housePhoto || '');
        setFormParentPhoto(student.visitData.parentPhoto || '');
        setFormScreeningResult(student.visitData.screeningResult || 'ปกติ');
        setFormCounselorNotes(student.visitData.counselorNotes || '');
      } else {
        setFormVisitDate(new Date().toISOString().split('T')[0]);
        setFormTravelInfo('');
        setFormHouseCondition('มั่นคงแข็งแรง');
        setFormHouseOwnership('บ้านตนเอง');
        setFormFamilyStatus('อยู่กับบิดามารดา');
        setFormAverageMonthlyIncome(15000);
        setFormDebtStatus('ไม่มีหนี้สิน');
        setFormHousePhoto('');
        setFormParentPhoto('');
        setFormScreeningResult('ปกติ');
        setFormCounselorNotes('');
      }
    } else {
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
      
      // Defaults for adding student
      setFormLatitude(16.4396);
      setFormLongitude(102.8288);
      setFormVisitStatus('ยังไม่ได้เยี่ยม');
      setFormVisitDate(new Date().toISOString().split('T')[0]);
      setFormTravelInfo('');
      setFormHouseCondition('มั่นคงแข็งแรง');
      setFormHouseOwnership('บ้านตนเอง');
      setFormFamilyStatus('อยู่กับบิดามารดา');
      setFormAverageMonthlyIncome(15000);
      setFormDebtStatus('ไม่มีหนี้สิน');
      setFormHousePhoto('');
      setFormParentPhoto('');
      setFormScreeningResult('ปกติ');
      setFormCounselorNotes('');
    }
    setFormError('');
  }, [student, isOpen]);

  // Leaflet Map Initialization Effect
  useEffect(() => {
    if (!isOpen) {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
      return;
    }

    const timer = setTimeout(() => {
      const container = document.getElementById(mapContainerId);
      if (!container) return;

      const L = (window as any).L;
      if (!L) {
        console.warn("Leaflet (L) is not loaded in window.");
        return;
      }

      const initialLat = formLatitude || 16.4396;
      const initialLng = formLongitude || 102.8288;

      if (!mapRef.current) {
        // Initialize map
        const map = L.map(mapContainerId).setView([initialLat, initialLng], 14);
        mapRef.current = map;

        // Add standard OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Add draggable marker
        const marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);
        markerRef.current = marker;

        // Sync coordinate state when marker is dragged
        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          setFormLatitude(Number(pos.lat.toFixed(6)));
          setFormLongitude(Number(pos.lng.toFixed(6)));
        });

        // Click on map to set position
        map.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          setFormLatitude(Number(lat.toFixed(6)));
          setFormLongitude(Number(lng.toFixed(6)));
          marker.setLatLng([lat, lng]);
        });
      } else {
        // If map already exists, update view & marker
        mapRef.current.setView([initialLat, initialLng]);
        if (markerRef.current) {
          markerRef.current.setLatLng([initialLat, initialLng]);
        }
      }
    }, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen]);

  // Handle address/location search via Nominatim
  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=th`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);
        setFormLatitude(Number(newLat.toFixed(6)));
        setFormLongitude(Number(newLng.toFixed(6)));
        
        if (mapRef.current) {
          mapRef.current.setView([newLat, newLng], 15);
          if (markerRef.current) {
            markerRef.current.setLatLng([newLat, newLng]);
          }
        }
      } else {
        alert('ไม่พบสถานที่ดังกล่าวในประเทศไทย โปรดระบุชื่อให้ละเอียดขึ้น (เช่น อำเภอ, จังหวัด)');
      }
    } catch (err) {
      console.error('Search error:', err);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อบริการแผนที่');
    } finally {
      setSearchLoading(false);
    }
  };

  // Get current device GPS
  const handleGetCurrentGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLat = position.coords.latitude;
          const currentLng = position.coords.longitude;
          setFormLatitude(Number(currentLat.toFixed(6)));
          setFormLongitude(Number(currentLng.toFixed(6)));
          
          if (mapRef.current) {
            mapRef.current.setView([currentLat, currentLng], 15);
            if (markerRef.current) {
              markerRef.current.setLatLng([currentLat, currentLng]);
            }
          }
        },
        (error) => {
          console.error(error);
          alert('ไม่สามารถดึงตำแหน่งปัจจุบันได้ (เบราวเซอร์ปฏิเสธพิกัดจริง หรือกำลังทำงานใน Sandbox)');
        }
      );
    } else {
      alert('อุปกรณ์ของคุณไม่รองรับการดึงพิกัดด้วย GPS');
    }
  };

  if (!isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Form validation
    const trimmedId = formId.trim();
    const trimmedName = formName.trim();
    const trimmedDept = formDepartment.trim();
    const trimmedRoom = formRoom.trim();
    const trimmedParentName = formParentName.trim();
    const trimmedParentPhone = formParentPhone.trim();
    const trimmedAddress = formAddress.trim();

    if (!trimmedId) {
      setFormError('กรุณากรอกรหัสประจำตัวนักเรียน');
      return;
    }
    if (!trimmedName) {
      setFormError('กรุณากรอกชื่อ-นามสกุลนักเรียน');
      return;
    }
    if (!trimmedDept) {
      setFormError('กรุณากรอกแผนกวิชา');
      return;
    }
    if (!trimmedRoom) {
      setFormError('กรุณากรอกห้องเรียน');
      return;
    }
    if (!trimmedParentName) {
      setFormError('กรุณากรอกชื่อผู้ปกครอง');
      return;
    }
    if (!trimmedParentPhone) {
      setFormError('กรุณากรอกเบอร์โทรศัพท์ผู้ปกครอง');
      return;
    }
    if (!trimmedAddress) {
      setFormError('กรุณากรอกที่อยู่ปัจจุบัน');
      return;
    }

    // Check duplicate ID if adding, or if editing and ID changed
    const isAdding = student === null;
    if (isAdding) {
      const isDuplicate = studentsList.some(s => s.id.toLowerCase() === trimmedId.toLowerCase());
      if (isDuplicate) {
        setFormError(`รหัสนักศึกษา ${trimmedId} ซ้ำกับในระบบ มีผู้เรียนรหัสนี้อยู่แล้ว`);
        return;
      }
    } else if (student && trimmedId.toLowerCase() !== student.id.toLowerCase()) {
      const isDuplicate = studentsList.some(s => s.id.toLowerCase() === trimmedId.toLowerCase() && s.id.toLowerCase() !== student.id.toLowerCase());
      if (isDuplicate) {
        setFormError(`รหัสนักศึกษา ${trimmedId} ซ้ำกับนักศึกษาท่านอื่นในระบบ`);
        return;
      }
    }

    // Construct the updated/new student with full details, map coordinates, and home visit data
    let visitData = student?.visitData;
    if (formVisitStatus === 'เยี่ยมแล้ว') {
      visitData = {
        visitDate: formVisitDate || new Date().toISOString().split('T')[0],
        travelInfo: formTravelInfo || 'รถส่วนตัว',
        latitude: formLatitude || 16.4396,
        longitude: formLongitude || 102.8288,
        houseCondition: formHouseCondition,
        houseOwnership: formHouseOwnership,
        familyStatus: formFamilyStatus,
        relationshipScale: student?.visitData?.relationshipScale ?? 4,
        averageMonthlyIncome: Number(formAverageMonthlyIncome) || 15000,
        debtStatus: formDebtStatus,
        risks: student?.visitData?.risks ?? {
          academic: false,
          substance: false,
          gaming: false,
          relationship: false,
          financial: false,
          travelRisk: false
        },
        riskNotes: student?.visitData?.riskNotes ?? '',
        housePhoto: formHousePhoto,
        parentPhoto: formParentPhoto,
        screeningResult: formScreeningResult,
        counselorNotes: formCounselorNotes,
        submittedBy: student?.visitData?.submittedBy ?? 'ครูที่ปรึกษา'
      };
    } else {
      visitData = undefined;
    }

    const studentData: Student = {
      id: trimmedId,
      name: trimmedName,
      level: formLevel,
      department: trimmedDept,
      room: trimmedRoom,
      parentName: trimmedParentName,
      parentPhone: trimmedParentPhone,
      address: trimmedAddress,
      latitude: formLatitude,
      longitude: formLongitude,
      visitStatus: formVisitStatus,
      nickname: formNickname.trim(),
      citizenId: formCitizenId.trim(),
      bloodGroup: formBloodGroup,
      studentPhone: formStudentPhone.trim(),
      parentRelationship: formParentRelationship,
      parentOccupation: formParentOccupation.trim(),
      visitData: visitData,
      password: student?.password
    };

    onSave(studentData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <h3 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-brand-400" />
            {student === null ? 'เพิ่มประวัตินักเรียนนักศึกษาใหม่' : 'แก้ไขข้อมูลประวัตินักเรียนนักศึกษา'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {formError && (
            <div className="p-3.5 bg-rose-50 text-rose-800 border border-rose-100 rounded-xl text-xs flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span className="font-semibold">{formError}</span>
            </div>
          )}

          <div className="space-y-4 text-left">
            {/* Section 1 title */}
            <div className="border-b border-slate-100 pb-1.5 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                ๑. ข้อมูลส่วนตัวนักเรียน/นักศึกษา
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Student ID */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  รหัสประจำตัวนักศึกษา <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น 6620901001"
                  value={formId}
                  onChange={(e) => setFormId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700 font-mono font-bold"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น นายปัญญา รักดี"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Nickname */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  ชื่อเล่น
                </label>
                <input
                  type="text"
                  placeholder="เช่น สม"
                  value={formNickname}
                  onChange={(e) => setFormNickname(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700"
                />
              </div>

              {/* Citizen ID */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  เลขประจำตัวประชาชน
                </label>
                <input
                  type="text"
                  maxLength={13}
                  placeholder="เลข 13 หลัก"
                  value={formCitizenId}
                  onChange={(e) => setFormCitizenId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700 font-mono"
                />
              </div>

              {/* Blood group */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  หมู่โลหิต
                </label>
                <select
                  value={formBloodGroup}
                  onChange={(e) => setFormBloodGroup(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700 font-medium"
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
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  ระดับชั้น <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formLevel}
                  onChange={(e) => setFormLevel(e.target.value as Student['level'])}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700 font-semibold"
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
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  ห้องเรียน <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น 1 หรือ 2"
                  value={formRoom}
                  onChange={(e) => setFormRoom(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700 font-semibold"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  แผนกวิชา <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700 font-semibold"
                >
                  <option value="ระบบขนส่งทางราง">ระบบขนส่งทางราง</option>
                  <option value="สาขาเทคโนโลยีธุรกิจดิจิทัล">สาขาเทคโนโลยีธุรกิจดิจิทัล</option>
                  <option value="สาขาเทคโนโลยีสารสนเทศ">สาขาเทคโนโลยีสารสนเทศ</option>
                  <option value="ช่างยนต์">ช่างยนต์</option>
                  <option value="ช่างไฟฟ้า">ช่างไฟฟ้า</option>
                  <option value="ช่างอิเล็กทรอนิกส์">ช่างอิเล็กทรอนิกส์</option>
                  <option value="ช่างกล">ช่างกล</option>
                  <option value="ช่างเชื่อม">ช่างเชื่อม</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                เบอร์โทรศัพท์นักศึกษา
              </label>
              <input
                type="text"
                placeholder="เช่น 089-XXX-XXXX"
                value={formStudentPhone}
                onChange={(e) => setFormStudentPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700 font-mono"
              />
            </div>

            {/* Section 2 title */}
            <div className="border-b border-slate-100 pb-1.5 pt-2 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-brand-500" />
                ๒. ข้อมูลผู้ปกครองและครอบครัว
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Parent Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  ชื่อผู้ปกครอง <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ชื่อ-สกุลผู้ปกครองหรือผู้ดูแล"
                  value={formParentName}
                  onChange={(e) => setFormParentName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700 font-semibold"
                />
              </div>

              {/* Relationship */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  ความเกี่ยวข้องกับนักเรียน
                </label>
                <input
                  type="text"
                  placeholder="เช่น บิดา, มารดา, ปู่, ย่า, ตา, ยาย"
                  value={formParentRelationship}
                  onChange={(e) => setFormParentRelationship(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Parent Occupation */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  อาชีพผู้ปกครอง
                </label>
                <input
                  type="text"
                  placeholder="เช่น ค้าขาย, ทำสวน, รับจ้างทั่วไป"
                  value={formParentOccupation}
                  onChange={(e) => setFormParentOccupation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700"
                />
              </div>

              {/* Parent Phone */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700 font-mono font-bold"
                />
              </div>
            </div>

            {/* Section 3 title */}
            <div className="border-b border-slate-100 pb-1.5 pt-2 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-500" />
                ๓. ข้อมูลสภาพแวดล้อมและที่พักอาศัย
              </span>
            </div>

            {/* Address */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                ที่อยู่บ้านปัจจุบันของนักเรียน <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="กรอกบ้านเลขที่ ซอย ถนน ตำบล อำเภอ จังหวัด"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700 leading-normal font-semibold"
              />
            </div>

            {/* GPS PINNING INTERACTIVE GOOGLE MAPS / OSM */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-500 animate-bounce" />
                ๔. พิกัดตำแหน่งบ้านตาม Google Maps / OpenStreetMap
              </span>
              <p className="text-[11px] text-slate-500">
                คุณครูสามารถพิมพ์ค้นหาสถานที่ หรือกดคลิกเลือกตำแหน่งบนแผนที่ และลากหมุดเพื่อระบุตำแหน่งพิกัดบ้านของนักเรียนให้ตรงตามจริงได้เลย
              </p>

              {/* Map Search input */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อสถานที่, หมู่บ้าน, อำเภอ, จังหวัด..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearchLocation();
                      }
                    }}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSearchLocation}
                  disabled={searchLoading}
                  className="px-3.5 py-2 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {searchLoading ? 'ค้นหา...' : 'ค้นหาที่ตั้ง'}
                </button>
              </div>

              {/* Coordinates Inputs & Mobile GPS puller */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    ละติจูด (Latitude)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formLatitude !== null ? formLatitude : ''}
                    onChange={(e) => setFormLatitude(e.target.value ? Number(e.target.value) : null)}
                    placeholder="เช่น 16.4396"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    ลองจิจูด (Longitude)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formLongitude !== null ? formLongitude : ''}
                    onChange={(e) => setFormLongitude(e.target.value ? Number(e.target.value) : null)}
                    placeholder="เช่น 102.8288"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-700"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1 flex items-end">
                  <button
                    type="button"
                    onClick={handleGetCurrentGps}
                    className="w-full py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Compass className="w-4 h-4 text-brand-500 animate-spin-slow" />
                    ดึง GPS มือถือ
                  </button>
                </div>
              </div>

              {/* Embedded Interactive Map Container */}
              <div 
                id={mapContainerId} 
                className="w-full h-52 bg-slate-200 rounded-xl border border-slate-200 mt-2 z-10 overflow-hidden relative shadow-inner"
                style={{ minHeight: '208px' }}
              >
                {/* Fallback info when Leaflet is not initialized */}
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs">
                  กำลังโหลดแผนที่แบบโต้ตอบ...
                </div>
              </div>
              <p className="text-[10px] text-slate-400 text-center">
                💡 คำแนะนำ: ดับเบิ้ลคลิกเพื่อขยายแผนที่ คลิกตำแหน่งเพื่อย้ายหมุด หรือเลื่อนลากหมุดไปในตำแหน่งบ้านที่ถูกต้องได้ทันที
              </p>
            </div>

            {/* VISIT STATUS SELECTION & QUESTIONNAIRE */}
            <div className="space-y-4 pt-2 border-t border-slate-150">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  สถานะการเยี่ยมบ้านของครูที่ปรึกษา
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormVisitStatus('ยังไม่ได้เยี่ยม')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      formVisitStatus === 'ยังไม่ได้เยี่ยม'
                        ? 'bg-amber-50 text-amber-700 border-amber-300 shadow-xs'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    ยังไม่ได้เยี่ยม
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormVisitStatus('เยี่ยมแล้ว')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      formVisitStatus === 'เยี่ยมแล้ว'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    เยี่ยมแล้ว (บันทึกข้อมูลเยี่ยม)
                  </button>
                </div>
              </div>

              {/* Dynamic visit inputs if Visit Status is 'เยี่ยมแล้ว' */}
              {formVisitStatus === 'เยี่ยมแล้ว' && (
                <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100/80 space-y-4 animate-fadeIn text-left">
                  <div className="border-b border-emerald-100/60 pb-1.5">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      ๕. ข้อมูลรายละเอียดจากการคัดกรองเยี่ยมบ้านจริง (Advisor Home Visit Survey)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        วันที่ทำการเยี่ยมบ้าน
                      </label>
                      <input
                        type="date"
                        value={formVisitDate}
                        onChange={(e) => setFormVisitDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        ข้อมูลยานพาหนะ/การเดินทาง
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น รถส่วนตัว, เดินเท้า, ซอยแคบเข้ายาก"
                        value={formTravelInfo}
                        onChange={(e) => setFormTravelInfo(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        สภาพที่อยู่อาศัยที่พบเห็น
                      </label>
                      <select
                        value={formHouseCondition}
                        onChange={(e) => setFormHouseCondition(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold"
                      >
                        <option value="มั่นคงแข็งแรง">มั่นคงแข็งแรง</option>
                        <option value="ปานกลาง/มีจุดชำรุด">ปานกลาง/มีจุดชำรุด</option>
                        <option value="ทรุดโทรม/ไม่มั่นคง">ทรุดโทรม/ไม่มั่นคง</option>
                        <option value="ชั่วคราว/แออัด">ชั่วคราว/แออัด</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        สิทธิ์การครอบครองบ้าน
                      </label>
                      <select
                        value={formHouseOwnership}
                        onChange={(e) => setFormHouseOwnership(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold"
                      >
                        <option value="บ้านตนเอง">บ้านตนเอง</option>
                        <option value="บ้านเช่า">บ้านเช่า</option>
                        <option value="อาศัยญาติ">อาศัยญาติ</option>
                        <option value="หอพักนักเรียน">หอพักนักเรียน</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        สถานภาพทางครอบครัว
                      </label>
                      <select
                        value={formFamilyStatus}
                        onChange={(e) => setFormFamilyStatus(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold"
                      >
                        <option value="อยู่กับบิดามารดา">อยู่กับบิดามารดา</option>
                        <option value="อยู่กับบิดา (มารดาเสียชีวิต/แยกทาง)">อยู่กับบิดา (มารดาเสียชีวิต/แยกทาง)</option>
                        <option value="อยู่กับมารดา (บิดาเสียชีวิต/แยกทาง)">อยู่กับมารดา (บิดาเสียชีวิต/แยกทาง)</option>
                        <option value="อยู่กับญาติ/ผู้ปกครอง">อยู่กับญาติ/ผู้ปกครอง</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-0.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        รายได้รวมต่อเดือนของครอบครัว (บาท)
                      </label>
                      <input
                        type="number"
                        value={formAverageMonthlyIncome}
                        onChange={(e) => setFormAverageMonthlyIncome(Number(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-0.5">
                        <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                        สถานะหนี้สินครอบครัว
                      </label>
                      <select
                        value={formDebtStatus}
                        onChange={(e) => setFormDebtStatus(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700"
                      >
                        <option value="ไม่มีหนี้สิน">ไม่มีหนี้สิน</option>
                        <option value="มีหนี้สินในระบบ">มีหนี้สินในระบบ (ธนาคาร, กยศ.)</option>
                        <option value="มีหนี้สินนอกระบบ">มีหนี้สินนอกระบบ</option>
                        <option value="มีทั้งในและนอกระบบ">มีทั้งในและนอกระบบ</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-0.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
                        สรุปผลคัดกรองความเสี่ยง
                      </label>
                      <select
                        value={formScreeningResult}
                        onChange={(e) => setFormScreeningResult(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold text-emerald-800"
                      >
                        <option value="ปกติ">ปกติ (ไม่มีความเสี่ยง)</option>
                        <option value="กลุ่มเสี่ยง">กลุ่มเสี่ยง (ต้องเฝ้าระวังอย่างใกล้ชิด)</option>
                        <option value="กลุ่มวิกฤต">กลุ่มวิกฤต (ต้องเข้าช่วยเหลือเร่งด่วน)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      ความคิดเห็น/บันทึกความช่วยเหลือเพิ่มเติมของครูที่ปรึกษา
                    </label>
                    <textarea
                      rows={2}
                      placeholder="เช่น ต้องการทุนการศึกษาเพิ่มเติม, มีปัญหาสภาพแวดล้อมเสียงดัง, เรียนดีแต่ขัดสน"
                      value={formCounselorNotes}
                      onChange={(e) => setFormCounselorNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Save/Cancel footer actions inside modal */}
          <div className="pt-4 border-t border-slate-150 flex justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-colors border border-transparent"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center gap-1 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              บันทึกข้อมูลและส่งแจ้งเตือน
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
