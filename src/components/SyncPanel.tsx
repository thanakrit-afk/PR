import React, { useState } from 'react';
import { APPS_SCRIPT_CODE } from '../appsScriptCode';
import { Check, Copy, AlertCircle, Database, HelpCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface SyncPanelProps {
  appsScriptUrl: string;
  setAppsScriptUrl: (url: string) => void;
  googleSheetUrl: string;
  setGoogleSheetUrl: (url: string) => void;
  isSynced: boolean;
  setIsSynced: (synced: boolean) => void;
  onFetchFromSheet: () => Promise<void>;
  onFetchDirectSheet: (url?: string) => Promise<void>;
  onPushToSheet: () => Promise<void>;
  isLoading: boolean;
}

export const SyncPanel: React.FC<SyncPanelProps> = ({
  appsScriptUrl,
  setAppsScriptUrl,
  googleSheetUrl,
  setGoogleSheetUrl,
  isSynced,
  setIsSynced,
  onFetchFromSheet,
  onFetchDirectSheet,
  onPushToSheet,
  isLoading
}) => {
  const [copied, setCopied] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'direct' | 'script'>('direct');

  const handleCopy = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestConnection = async () => {
    if (!appsScriptUrl) {
      setTestStatus('error');
      setErrorMessage('กรุณากรอก URL ของ Google Apps Script');
      return;
    }
    
    setTestStatus('testing');
    try {
      // Testing with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(appsScriptUrl, {
        method: 'GET',
        signal: controller.signal,
        mode: 'cors'
      });
      
      clearTimeout(timeoutId);
      const data = await response.json();
      
      if (data && data.success) {
        setTestStatus('success');
        setIsSynced(true);
        // Persist state
        localStorage.setItem('apps_script_url', appsScriptUrl);
        localStorage.setItem('is_synced', 'true');
      } else {
        setTestStatus('error');
        setErrorMessage(data.error || 'โครงสร้างข้อมูลไม่ถูกต้อง โปรดตรวจสอบการติดตั้งสคริปต์');
      }
    } catch (err: any) {
      console.error(err);
      setTestStatus('error');
      setErrorMessage('ไม่สามารถเชื่อมต่อได้โดยตรง (อาจเกิดจากข้อจำกัด CORS ในบราวเซอร์ หรือ URL ไม่ถูกต้อง) ตรวจสอบให้แน่ใจว่าเลือกสิทธิ์เป็น "Anyone" หรือ "ทุกคน" ตอน Deploy');
    }
  };

  const handleDisconnect = () => {
    setAppsScriptUrl('');
    setIsSynced(false);
    setTestStatus('idle');
    localStorage.removeItem('apps_script_url');
    localStorage.removeItem('is_synced');
  };

  const handleFetchDirect = async () => {
    if (!googleSheetUrl) return;
    await onFetchDirectSheet(googleSheetUrl);
  };

  return (
    <div id="sync-panel" className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-150 pb-5 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-50 text-brand-600 rounded-lg border border-brand-100">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">ระบบเชื่อมโยงฐานข้อมูล Google Sheets</h2>
            <p className="text-xs text-slate-500 mt-0.5">นำเข้าประวัตินักศึกษาและอัปเดตข้อมูลเยี่ยมบ้านผ่านชีตส่วนกลางของคุณ</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {googleSheetUrl && (
            <a
              href={googleSheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="sync-panel-view-sheet-btn"
              className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100 transition-all cursor-pointer shadow-2xs"
            >
              <Database className="w-3 h-3 text-emerald-600" />
              เปิดดู Google Sheet ↗
            </a>
          )}
          {isSynced ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
              <Wifi className="w-3.5 h-3.5" />
              เชื่อมต่อสำเร็จ (Cloud Sync)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
              <WifiOff className="w-3.5 h-3.5" />
              โหมดทำงานแบบ Local
            </span>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-150 mb-5 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('direct')}
          className={`pb-2.5 px-4 text-xs font-bold uppercase tracking-tight border-b-2 transition-all cursor-pointer ${
            activeTab === 'direct'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          ๑. ดึงข้อมูล 100% จากลิงก์ตรง (แนะนำ - ง่ายที่สุด)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('script')}
          className={`pb-2.5 px-4 text-xs font-bold uppercase tracking-tight border-b-2 transition-all cursor-pointer ${
            activeTab === 'script'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          ๒. ซิงค์สองทางผ่าน Google Apps Script
        </button>
      </div>

      {/* TAB 1: DIRECT LINK IMPORT */}
      {activeTab === 'direct' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-tight mb-2 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500"></span>
              วิธีเตรียมไฟล์ Google Sheets เพื่อซิงค์ข้อมูล (รวดเร็ว 100%)
            </h4>
            <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-1">
              <li>เปิดไฟล์ Google Sheet ของคุณ</li>
              <li>คลิกปุ่ม <strong className="text-slate-800">แชร์ (Share)</strong> ที่มุมขวาบน</li>
              <li>เปลี่ยนการเข้าถึงทั่วไปเป็น <strong className="text-emerald-700">"ทุกคนที่มีลิงก์ (Anyone with link)"</strong> และเลือกสิทธิ์เป็น <strong className="text-emerald-700">"ผู้มีสิทธิ์อ่าน (Viewer)"</strong></li>
              <li>คัดลอกลิงก์จากช่องที่อยู่เว็บด้านบนเบราว์เซอร์ แล้วนำมาวางในช่องด้านล่างนี้ได้ทันที</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
            <div className="lg:col-span-9">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                วางลิงก์ Google Sheets ของคุณที่แชร์แบบอ่านได้แล้วที่นี่
              </label>
              <input
                type="text"
                value={googleSheetUrl}
                onChange={(e) => setGoogleSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/.../edit?usp=sharing"
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700 disabled:opacity-60 transition-all font-mono"
              />
            </div>
            <div className="lg:col-span-3">
              <button
                type="button"
                onClick={handleFetchDirect}
                disabled={isLoading || !googleSheetUrl}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg cursor-pointer transition-all shadow-xs disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    กำลังดึงข้อมูล...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    ดึงข้อมูลชีต 100%
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 leading-relaxed bg-brand-50/40 p-3 rounded-lg border border-brand-100 flex items-start gap-2">
            <span className="text-brand-600 font-bold shrink-0">✨ ระบบตรวจจับอัจฉริยะ:</span>
            <span>
              แอปพลิเคชันจะทำการตรวจสอบข้อมูล แถวแรกของ Google Sheet ของคุณโดยอัตโนมัติ เพื่อดึงค่า "รหัสนักศึกษา", "ชื่อ-นามสกุล", "เบอร์โทร", "ที่อยู่ปัจจุบัน", 
              "เลขบัตรประชาชน", "หมู่เลือด", "ข้อมูลผู้ปกครอง" และ "รูปถ่ายบ้าน" นำเข้ามาแสดงผลในโปรแกรมทันที 100% 
              เพื่อให้คุณสามารถประเมินผลการเยี่ยมบ้าน คัดกรองกลุ่มเสี่ยง และเขียนสรุปรายงานผู้บริหารได้ทันทีโดยไม่ต้องคีย์ข้อมูลใหม่ด้วยตนเอง
            </span>
          </div>
        </div>
      )}

      {/* TAB 2: APPS SCRIPT SYNC */}
      {activeTab === 'script' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex justify-end mb-2">
            <button 
              type="button"
              onClick={() => setShowInstructions(!showInstructions)}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-slate-600 hover:text-brand-600 bg-slate-50 hover:bg-brand-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {showInstructions ? 'ซ่อนคำแนะนำ' : 'วิธีติดตั้ง Apps Script อย่างละเอียด'}
            </button>
          </div>

          {showInstructions && (
            <div className="bg-slate-50 rounded-lg p-5 mb-4 text-xs text-slate-700 border border-slate-200">
              <h3 className="font-extrabold text-slate-800 mb-3 flex items-center gap-1.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-500 text-white text-xs">!</span>
                คู่มือการเปิดใช้ระบบเชื่อมโยง Google Sheet (ภายใน 3 นาที)
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-slate-600 pl-1 mb-5">
                <li>เปิดไฟล์ <strong>Google Sheets</strong> ของคุณ (หรือใช้ไฟล์ที่มีข้อมูลนักเรียนอยู่แล้ว)</li>
                <li>ไปที่เมนู <strong>ส่วนขยาย (Extensions)</strong> &gt; <strong>Apps Script</strong></li>
                <li>ลบโค้ดเริ่มต้นทั้งหมดในหน้าต่างเขียนโค้ดออก</li>
                <li>คัดลอกโค้ด Apps Script ด้านล่างนี้ไปวางแทนที่</li>
                <li>กดไอคอน <strong>บันทึก (Save)</strong> ด้านบน</li>
                <li>คลิกปุ่ม <strong>ใช้งาน (Deploy)</strong> &gt; <strong>การใช้งานใหม่ (New deployment)</strong></li>
                <li>กดไอคอนฟันเฟืองข้าง Select type เลือกเป็น <strong>เว็บแอป (Web app)</strong></li>
                <li>ตั้งค่า: ผู้เรียกใช้งานเป็น <strong>"ฉัน" (Me)</strong> และ ผู้มีสิทธิ์เข้าถึงเป็น <strong>"ทุกคน" (Anyone)</strong></li>
                <li>คลิกปุ่ม <strong>ใช้งาน (Deploy)</strong> อนุญาตสิทธิ์ต่าง ๆ ให้เรียบร้อย แล้วคัดลอก <strong>URL เว็บแอป</strong> มากรอกด้านล่าง</li>
              </ol>

              <div className="bg-white border border-slate-200 rounded-lg p-3.5">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-xs font-mono text-slate-500 font-semibold">code.gs (Google Apps Script Code)</span>
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-brand-50 text-brand-700 rounded hover:bg-brand-100 transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        คัดลอกแล้ว!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        คัดลอกโค้ด
                      </>
                    )}
                  </button>
                </div>
                <pre className="text-xs bg-slate-900 text-slate-200 p-4 rounded overflow-x-auto max-h-56 font-mono leading-relaxed">
                  {APPS_SCRIPT_CODE}
                </pre>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
            <div className="lg:col-span-8">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                วาง URL ของ Google Apps Script Web App ที่ได้จากการ Deploy
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={appsScriptUrl}
                  onChange={(e) => setAppsScriptUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  disabled={isLoading}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white text-slate-700 disabled:opacity-60 transition-all font-mono"
                />
                {isSynced && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                    <Check className="w-5 h-5" />
                  </span>
                )}
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-wrap gap-2">
              {!isSynced ? (
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isLoading || !appsScriptUrl}
                  className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg cursor-pointer transition-all disabled:cursor-not-allowed shadow-xs"
                >
                  {testStatus === 'testing' ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      กำลังทดสอบ...
                    </>
                  ) : (
                    'เชื่อมต่อระบบ'
                  )}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onFetchFromSheet}
                    disabled={isLoading}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-brand-700 text-xs font-semibold rounded-lg border border-slate-200 cursor-pointer transition-all"
                    title="ดึงข้อมูลล่าสุดจาก Google Sheets"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    ดึงข้อมูลชีต
                  </button>
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center px-3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-lg border border-rose-100 cursor-pointer transition-all"
                  >
                    ยกเลิกเชื่อมต่อ
                  </button>
                </>
              )}
            </div>
          </div>

          {testStatus === 'error' && (
            <div className="mt-4 p-3 bg-rose-50 text-rose-700 border border-rose-100 rounded-lg text-xs flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
          
          {testStatus === 'success' && (
            <div className="mt-4 p-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-xs flex items-start gap-2 animate-fadeIn">
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
              <span>เชื่อมต่อกับระบบ Google Sheets สำเร็จ! ข้อมูลจะถูกดึงและซิงค์ผ่าน Apps Script ของคุณโดยตรง</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
