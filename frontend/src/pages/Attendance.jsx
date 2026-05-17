import React, { useState, useEffect } from 'react';
import { students, attendance as attendanceApi, notifications } from '../services/api';
import { 
  CheckCircle, 
  XCircle, 
  Clock,
  Save,
  CalendarDays,
  Users,
  CheckCircle2,
  Search,
  Bell,
  Mail,
  RotateCcw,
  TrendingUp,
  AlertCircle,
  QrCode,
  Printer,
  Camera,
  Check
} from 'lucide-react';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { useSearch } from '../context/SearchContext';
import { useTranslation } from 'react-i18next';

const Attendance = () => {
  const { t } = useTranslation();
  const { searchQuery, setSearchQuery } = useSearch();
  const [studentList, setStudentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState({});
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [filterClass, setFilterClass] = useState('');

  // Smart QR Attendance states
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [showQrPrinter, setShowQrPrinter] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scannerActive, setScannerActive] = useState(true);

  const handleQrScan = async (student) => {
    handleStatusChange(student.id || student._id, 'Present');
    try {
      await attendanceApi.mark({ studentId: student.id || student._id, date, status: 'Present' });
    } catch (e) { console.error(e); }

    setScanResult({
      student,
      time: new Date().toLocaleTimeString(),
      status: 'Present'
    });

    setTimeout(() => {
      setScanResult(null);
    }, 3000);
  };

  const handleBarcodeInputSubmit = (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    const found = studentList.find(s => 
      (s.id || s._id).toLowerCase() === barcodeInput.trim().toLowerCase() ||
      s.rollNumber.toString() === barcodeInput.trim() ||
      s.name.toLowerCase().includes(barcodeInput.trim().toLowerCase())
    );
    if (found) {
      handleQrScan(found);
      setBarcodeInput('');
    } else {
      alert(t('Student not found matching barcode/ID: ') + barcodeInput);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get all students to find classes
      const studentRes = await students.getAll();
      const allStudents = studentRes.data.data;
      const classes = [...new Set(allStudents.map(s => s.class))].filter(Boolean);
      setAvailableClasses(classes);
      
      const currentClass = filterClass || classes[0];
      if (!filterClass && classes.length > 0) setFilterClass(classes[0]);

      // Get daily status
      const statusRes = await attendanceApi.getDailyStatus({ date });
      const dailyData = statusRes.data.data;

      // Filter and set students for current class
      const classStudents = dailyData.filter(s => s.class === currentClass);
      setStudentList(classStudents);

      // Map existing attendance
      const mapped = {};
      classStudents.forEach(s => {
        mapped[s.id || s._id] = s.status;
      });
      setAttendanceData(mapped);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [date, filterClass]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceData({ ...attendanceData, [studentId]: status });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Only save marked ones
      const promises = Object.entries(attendanceData)
        .filter(([_, status]) => status !== 'Pending')
        .map(([studentId, status]) => 
          attendanceApi.mark({ studentId, date, status })
        );
      
      if (promises.length === 0) {
        alert('No attendance changes to save.');
        return;
      }

      await Promise.all(promises);
      alert('Attendance saved successfully!');
      fetchData(); // Refresh to get updated percentages
    } catch (err) {
      alert('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm(`Are you sure you want to reset attendance for ${date}? This will delete all records for this day.`)) {
      setResetting(true);
      try {
        await attendanceApi.reset({ date });
        alert('Attendance reset for today.');
        fetchData();
      } catch (err) {
        alert('Failed to reset attendance');
      } finally {
        setResetting(false);
      }
    }
  };

  const sendAttendanceAlert = async (student, status) => {
    try {
      await notifications.sendAlert({
        studentId: student.id || student._id,
        type: 'attendance',
        contact: student.contact,
        message: `Dear Parent, this is to inform you that your ward ${student.name} is marked ${status.toUpperCase()} today (${date}). Please take note. Regards, Academix School.`
      });
      alert(`Notification sent to parent of ${student.name}`);
    } catch (err) {
      alert('Failed to send alert');
    }
  };

  const columns = [
    {
      header: t('Student Name'),
      render: (student) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary-100 dark:bg-secondary-700/50 flex items-center justify-center text-secondary-700 dark:text-secondary-300 font-bold">
            {student.name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-secondary-900 dark:text-white">{student.name}</p>
            <p className="text-[10px] text-secondary-400 dark:text-secondary-500 font-black uppercase">{t('Roll No')}: {student.rollNumber}</p>
          </div>
        </div>
      )
    },
    { 
      header: t('Attendance Stats'), 
      render: (student) => {
        const overall = student.attendancePercentage || 0;
        const monthly = student.monthlyAttendancePercentage || 0;
        return (
          <div className="flex flex-col gap-3 w-40">
            {/* Overall */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider text-secondary-500 dark:text-secondary-400">
                <span>{t('Overall')}: {overall}%</span>
                {overall < 75 && <AlertCircle className="w-2.5 h-2.5 text-red-500" />}
              </div>
              <div className="w-full bg-secondary-100 dark:bg-secondary-700/50 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${overall < 75 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                  style={{ width: `${overall}%` }}
                ></div>
              </div>
            </div>
            {/* Monthly */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider text-primary-600 dark:text-primary-400">
                <span>{t('This Month')}: {monthly}%</span>
              </div>
              <div className="w-full bg-primary-50 dark:bg-primary-900/20 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-primary-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${monthly}%` }}
                ></div>
              </div>
            </div>
          </div>
        );
      }
    },
    {
      header: t('Daily Marking'),
      render: (student) => (
        <div className="flex items-center justify-center gap-2">
          {[
            { label: 'Present', icon: CheckCircle, activeClass: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50 shadow-emerald-100 dark:shadow-none shadow-sm' },
            { label: 'Absent', icon: XCircle, activeClass: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/50 shadow-rose-100 dark:shadow-none shadow-sm' },
            { label: 'Late', icon: Clock, activeClass: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50 shadow-amber-100 dark:shadow-none shadow-sm' }
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={() => handleStatusChange(student.id || student._id, btn.label)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all text-xs font-black uppercase tracking-wider ${
                attendanceData[student.id || student._id] === btn.label
                  ? btn.activeClass
                  : 'bg-white dark:bg-secondary-800 border-secondary-100 dark:border-secondary-700 text-secondary-400 hover:border-secondary-200 hover:text-secondary-600 dark:hover:text-secondary-300'
              }`}
            >
              <btn.icon className="w-4 h-4" />
              {t(btn.label)}
            </button>
          ))}
          
          {(attendanceData[student.id || student._id] === 'Absent' || attendanceData[student.id || student._id] === 'Late') && (
            <button 
              onClick={() => sendAttendanceAlert(student, attendanceData[student.id || student._id])}
              className="p-3 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-all ml-2 border border-primary-100 dark:border-primary-800/50"
              title={t("Notify Parent Now")}
            >
              <Bell className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-secondary-900 dark:text-white tracking-tight">{t('Daily Attendance')}</h1>
          <p className="text-secondary-500 dark:text-secondary-400 font-medium mt-1 uppercase text-xs tracking-widest font-black">
            {t('System Refreshes Daily • Automatic % Detection')}
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white dark:bg-secondary-800 p-3 rounded-3xl border border-secondary-100 dark:border-secondary-700/50 shadow-premium">
          <div className="flex items-center gap-2 pr-4 border-r border-secondary-100 dark:border-secondary-700/50">
            <Users className="text-primary-600 dark:text-primary-400 w-5 h-5 ml-2" />
            <select 
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="bg-transparent font-black text-sm outline-none cursor-pointer px-2 dark:text-white"
            >
              {availableClasses.map(c => <option key={c} value={c} className="dark:bg-secondary-800">{t('Class')} {c}</option>)}
            </select>
          </div>
          <div className="p-2.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-2xl">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div className="pr-4">
            <p className="text-[10px] font-black text-secondary-400 dark:text-secondary-500 uppercase tracking-widest">{t('Marking For')}</p>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="outline-none text-sm font-black text-secondary-900 dark:text-white bg-transparent cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-secondary-900 dark:bg-secondary-800/80 p-8 rounded-[32px] text-white flex items-center gap-6 shadow-premium border border-white/5">
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                <Users className="w-8 h-8 text-primary-400" />
            </div>
            <div>
                <p className="text-secondary-400 text-xs font-black uppercase tracking-widest">{t('Class Strength')}</p>
                <h3 className="text-3xl font-black mt-1">{studentList.length}</h3>
            </div>
        </div>
        <div className="bg-emerald-600 dark:bg-emerald-700/80 p-8 rounded-[32px] text-white flex items-center gap-6 shadow-premium border border-white/5">
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                <CheckCircle2 className="w-8 h-8 text-emerald-200" />
            </div>
            <div>
                <p className="text-emerald-100 text-xs font-black uppercase tracking-widest">{t('Present Today')}</p>
                <h3 className="text-3xl font-black mt-1">
                  {Object.values(attendanceData).filter(v => v === 'Present').length}
                </h3>
            </div>
        </div>
        <div className="bg-primary-600 dark:bg-primary-700/80 p-8 rounded-[32px] text-white flex items-center gap-6 shadow-premium border border-white/5">
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                <TrendingUp className="w-8 h-8 text-primary-200" />
            </div>
            <div>
                <p className="text-primary-100 text-xs font-black uppercase tracking-widest">{t('Avg. Attendance')}</p>
                <h3 className="text-3xl font-black mt-1">
                   {studentList.length > 0 
                     ? (studentList.reduce((acc, curr) => acc + (curr.attendancePercentage || 0), 0) / studentList.length).toFixed(1)
                     : 0}%
                </h3>
            </div>
        </div>
      </div>

      <Card className="p-0 overflow-visible border-none shadow-premium dark:bg-secondary-800/80 dark:border-white/10">
        <div className="p-8 border-b border-secondary-100 dark:border-secondary-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-t-[32px] bg-white dark:bg-secondary-800">
          <div className="flex-1 max-w-md w-full">
             <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input 
                  type="text" 
                  placeholder={t("Quick search student...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-secondary-50 dark:bg-secondary-900/50 border border-secondary-100 dark:border-secondary-700/50 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm font-medium dark:text-white"
                />
             </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="secondary"
              onClick={() => setShowQrPrinter(true)}
              className="gap-2 border-2 border-primary-100 dark:border-primary-800 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
            >
              <Printer className="w-5 h-5" />
              {t("Print QR Cards")}
            </Button>
            <Button 
              variant="secondary"
              onClick={() => setShowQrScanner(true)}
              className="gap-2 border-2 border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all font-bold"
            >
              <QrCode className="w-5 h-5" />
              {t("Smart QR Scanner")}
            </Button>
            <Button 
              variant="secondary"
              onClick={handleReset}
              isLoading={resetting}
              className="gap-2 border-2 border-secondary-100 dark:border-secondary-700 text-secondary-600 dark:text-secondary-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 hover:border-rose-20"
            >
              <RotateCcw className="w-5 h-5" />
              {t("Reset Today")}
            </Button>
            <Button 
              onClick={handleSave}
              isLoading={saving}
              className="gap-2 shadow-primary-900/10"
            >
              <Save className="w-5 h-5" />
              {t("Submit Attendance")}
            </Button>
          </div>
        </div>

        <div className="p-2 bg-white dark:bg-secondary-800 rounded-b-[32px]">
          <Table 
            columns={columns} 
            data={studentList} 
            isLoading={loading} 
            searchQuery={searchQuery}
            emptyMessage={t("All students in this class have been marked or no students found.")}
          />
        </div>
      </Card>

      {/* Smart QR Scanner Modal */}
      <Modal
        isOpen={showQrScanner}
        onClose={() => setShowQrScanner(false)}
        title={t("📷 Smart QR Attendance Kiosk")}
        footer={
          <Button onClick={() => setShowQrScanner(false)} className="px-8">
            {t("Close Kiosk")}
          </Button>
        }
      >
        <div className="space-y-6">
          <div className="p-4 bg-secondary-50 dark:bg-secondary-900/50 rounded-2xl border border-secondary-100 dark:border-secondary-700 text-center">
            <p className="text-xs font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-widest mb-1">
              {t('Kiosk Active For Date')}: {date}
            </p>
            <p className="text-sm font-black text-secondary-900 dark:text-white">
              {t('Scan student QR cards using a barcode scanner, webcam, or simulate instant scans below.')}
            </p>
          </div>

          {/* Scan Result Display */}
          {scanResult ? (
            <div className="p-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-[2rem] border-2 border-emerald-200 dark:border-emerald-800 text-center animate-bounce flex flex-col items-center justify-center shadow-lg shadow-emerald-500/10">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-4 shadow-md">
                <Check className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                {scanResult.student.name}
              </h3>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 uppercase tracking-widest">
                {t('Roll No')}: {scanResult.student.rollNumber} • {t('Marked Present')} ({scanResult.time})
              </p>
              <p className="text-[10px] font-bold text-emerald-500 mt-4 animate-pulse">
                {t('Ready for next scan...')}
              </p>
            </div>
          ) : (
            <div className="p-12 border-2 border-dashed border-secondary-200 dark:border-secondary-700 rounded-[2rem] text-center bg-secondary-50/50 dark:bg-secondary-900/30 flex flex-col items-center justify-center">
              <Camera className="w-16 h-16 text-secondary-300 dark:text-secondary-600 mb-4 animate-pulse" />
              <p className="text-lg font-black text-secondary-700 dark:text-secondary-300">
                {t('Waiting for QR Code / Barcode Scan...')}
              </p>
              <p className="text-xs font-bold text-secondary-400 dark:text-secondary-500 mt-1 max-w-xs mx-auto">
                {t('Hold student ID card in front of the scanner or enter ID below.')}
              </p>
            </div>
          )}

          {/* Manual Barcode / ID Input */}
          <form onSubmit={handleBarcodeInputSubmit} className="space-y-2">
            <label className="block text-xs font-black text-secondary-500 uppercase tracking-widest">
              {t('Manual Barcode / Student ID Entry')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t("Enter Student Roll No, Name or ID...")}
                value={barcodeInput}
                onChange={e => setBarcodeInput(e.target.value)}
                className="flex-1 px-5 py-3 bg-secondary-50 dark:bg-secondary-900 border-2 border-secondary-100 dark:border-secondary-700 rounded-2xl outline-none focus:border-primary-500 font-bold dark:text-white text-sm"
                autoFocus
              />
              <Button type="submit" className="px-6 gap-2">
                {t('Enter Scan')}
              </Button>
            </div>
          </form>

          {/* Quick Simulation Roster */}
          <div>
            <label className="block text-xs font-black text-secondary-500 uppercase tracking-widest mb-3">
              {t('⚡ Instant QR Simulation Roster (Click to Scan)')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-2">
              {studentList.map(s => (
                <button
                  key={s.id || s._id}
                  type="button"
                  onClick={() => handleQrScan(s)}
                  className="p-3 bg-white dark:bg-secondary-800 border border-secondary-100 dark:border-secondary-700 rounded-xl text-left hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all group flex items-center justify-between"
                >
                  <div className="truncate pr-2">
                    <p className="text-xs font-black text-secondary-900 dark:text-white truncate">
                      {s.name}
                    </p>
                    <p className="text-[10px] font-bold text-secondary-400 dark:text-secondary-500 uppercase">
                      {t('Roll')}: {s.rollNumber}
                    </p>
                  </div>
                  <QrCode className="w-4 h-4 text-secondary-300 group-hover:text-primary-500 flex-shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Print QR Cards Modal */}
      <Modal
        isOpen={showQrPrinter}
        onClose={() => setShowQrPrinter(false)}
        title={t("🖨️ Student QR ID Cards")}
        footer={
          <Button 
            onClick={() => {
              window.print();
            }} 
            className="px-8 gap-2"
          >
            <Printer className="w-4 h-4" />
            {t("Print All QR Cards")}
          </Button>
        }
      >
        <div className="space-y-6">
          <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-2xl border border-primary-100 dark:border-primary-800 text-center">
            <p className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-1">
              {t('Class Roster QR Generator')}
            </p>
            <p className="text-sm font-black text-secondary-900 dark:text-white">
              {t('These official QR ID cards can be printed and distributed to students for daily smart kiosk scanning.')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto pr-2 print:max-h-none print:overflow-visible print:grid-cols-2">
            {studentList.map(s => (
              <div 
                key={s.id || s._id} 
                className="p-6 bg-white dark:bg-secondary-800 border-2 border-secondary-100 dark:border-secondary-700 rounded-[2rem] flex flex-col items-center text-center shadow-sm relative overflow-hidden group hover:border-primary-300 transition-all"
              >
                {/* Header Banner */}
                <div className="absolute top-0 left-0 right-0 bg-primary-500 py-2 text-white text-[10px] font-black uppercase tracking-widest">
                  {t('Academix Official Student ID')}
                </div>
                
                <div className="mt-6 mb-4 p-3 bg-white rounded-2xl border border-secondary-100 shadow-inner">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(s.id || s._id)}`}
                    alt={s.name}
                    className="w-32 h-32 object-contain"
                  />
                </div>

                <h4 className="text-lg font-black text-secondary-900 dark:text-white">
                  {s.name}
                </h4>
                <p className="text-xs font-bold text-secondary-500 dark:text-secondary-400 mt-1 uppercase tracking-widest">
                  {t('Class')} {s.class} • {t('Roll No')}: {s.rollNumber}
                </p>
                <div className="mt-4 px-4 py-1.5 bg-secondary-50 dark:bg-secondary-900/50 rounded-full text-[10px] font-black text-secondary-400 dark:text-secondary-500 tracking-wider">
                  ID: {s.id || s._id}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Attendance;
