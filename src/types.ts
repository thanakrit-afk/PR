export interface Student {
  id: string; // เลขประจำตัวนักเรียน
  name: string; // ชื่อ-นามสกุล
  level: 'ปวช. 1' | 'ปวช. 2' | 'ปวช. 3' | 'ปวส. 1' | 'ปวส. 2'; // ระดับชั้น
  department: string; // แผนกวิชา เช่น เทคโนโลยีสารสนเทศ, คอมพิวเตอร์ธุรกิจ, ช่างยนต์, บัญชี
  room: string; // ห้องเรียน เช่น 1, 2, 3
  parentName: string; // ชื่อผู้ปกครอง
  parentPhone: string; // เบอร์โทรศัพท์ผู้ปกครอง
  address: string; // ที่อยู่
  latitude: number | null; // พิกัดละติจูด
  longitude: number | null; // พิกัดลองจิจูด
  visitStatus: 'ยังไม่ได้เยี่ยม' | 'เยี่ยมแล้ว';
  
  // ข้อมูลเพิ่มเติมตามหัวข้อในเอกสาร Google Doc
  nickname?: string; // ชื่อเล่น
  citizenId?: string; // เลขประจำตัวประชาชน
  bloodGroup?: string; // หมู่โลหิต
  studentPhone?: string; // เบอร์โทรศัพท์นักศึกษา
  parentRelationship?: string; // ความเกี่ยวข้องกับนักเรียน เช่น บิดา, มารดา, ปู่, ย่า, ตา, ยาย
  parentOccupation?: string; // อาชีพผู้ปกครอง

  // บันทึกการเยี่ยมบ้าน (ถ้าเยี่ยมแล้ว)
  visitData?: HomeVisitData;
  password?: string; // รหัสผ่านสำหรับเข้าสู่ระบบของนักศึกษา
}

export interface HomeVisitData {
  visitDate: string; // วันที่เยี่ยมบ้าน
  travelInfo: string; // ข้อมูลการเดินทาง เช่น รถส่วนตัว, ทางเข้าซอยแคบ
  latitude: number;
  longitude: number;
  
  // สภาพที่อยู่อาศัย
  houseCondition: 'มั่นคงแข็งแรง' | 'ปานกลาง/มีจุดชำรุด' | 'ทรุดโทรม/ไม่มั่นคง' | 'ชั่วคราว/แออัด';
  houseOwnership: 'บ้านตนเอง' | 'บ้านเช่า' | 'อาศัยญาติ' | 'หอพักนักเรียน';
  
  // สถานะครอบครัวและความสัมพันธ์
  familyStatus: 'อยู่กับบิดามารดา' | 'อยู่กับบิดา (มารดาเสียชีวิต/แยกทาง)' | 'อยู่กับมารดา (บิดาเสียชีวิต/แยกทาง)' | 'อยู่กับญาติ/ผู้ปกครอง';
  relationshipScale: number; // 1-5 (ความสัมพันธ์ในครอบครัว)
  
  // รายได้เฉลี่ยของครอบครัว และภาระหนี้สิน
  averageMonthlyIncome: number; // รายได้เฉลี่ยต่อเดือน
  debtStatus: 'ไม่มีหนี้สิน' | 'มีหนี้สินในระบบ' | 'มีหนี้สินนอกระบบ' | 'มีทั้งในและนอกระบบ';
  
  // พฤติกรรมและความเสี่ยงของนักเรียน
  risks: {
    academic: boolean; // การเรียน (ผลการเรียนต่ำ/ขาดเรียนบ่อย)
    substance: boolean; // สารเสพติด/อบายมุข
    gaming: boolean; // ติดเกม/ติดโทรศัพท์
    relationship: boolean; // เพศ/ความสัมพันธ์วัยรุ่น
    financial: boolean; // ขัดสนทางการเงิน
    travelRisk: boolean; // การเดินทางมาเรียนมีความเสี่ยง/ระยะทางไกล
  };
  riskNotes: string; // บันทึกความเสี่ยงเพิ่มเติม
  
  // รูปภาพ
  housePhoto: string; // รูปถ่ายสภาพบ้าน (Base64 หรือ URL)
  parentPhoto: string; // รูปถ่ายร่วมกับผู้ปกครอง (Base64 หรือ URL)
  
  // สรุปผลการคัดกรอง
  screeningResult: 'ปกติ' | 'เสี่ยง' | 'มีปัญหา';
  counselorNotes: string; // บันทึกข้อเสนอแนะของครูที่ปรึกษา
  submittedBy: string; // ชื่อครูผู้บันทึก
}

export interface SyncConfig {
  appsScriptUrl: string;
  isSynced: boolean;
  lastSyncedAt: string | null;
}
