import React, { useState, useEffect } from 'react';
import { students } from '../services/api';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  UserPlus,
  Filter,
  MoreHorizontal,
  QrCode,
  CheckCircle2,
  MessageCircle,
  CreditCard,
  FileText,
  Camera
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { generateIDCard, generateAdmitCard } from '../utils/cardGenerator';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useSearch } from '../context/SearchContext';
import { useTranslation } from 'react-i18next';

const Students = () => {
  const { t } = useTranslation();
  const { searchQuery, setSearchQuery } = useSearch();
  const [studentList, setStudentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedStudentQR, setSelectedStudentQR] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    class: '',
    rollNumber: '',
    contact: '',
    parentName: '',
    parentEmail: '',
    totalFees: 0,
    photo: null,
    regenerateKey: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [selectedStudentChat, setSelectedStudentChat] = useState(null);
  const [filters, setFilters] = useState({
    class: '',
    feeStatus: 'all' // all, paid, partial, unpaid
  });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data } = await students.getAll();
      setStudentList(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      class: student.class,
      rollNumber: student.rollNumber,
      contact: student.contact,
      parentName: student.parentName,
      parentEmail: student.parentEmail || '',
      totalFees: student.totalFees,
      photo: student.photo || null,
      regenerateKey: false,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      if (editingStudent) {
        const payload = { ...formData };
        // Auto-regenerate if email changed
        if (formData.parentEmail !== (editingStudent.parentEmail || '')) {
          payload.regenerateKey = true;
        }
        await students.update(editingStudent.id || editingStudent._id, payload);
      } else {
        await students.add(formData);
      }
      setShowModal(false);
      setEditingStudent(null);
      fetchStudents();
      setFormData({ name: '', class: '', rollNumber: '', contact: '', parentName: '', parentEmail: '', totalFees: 0, photo: null });
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleWhatsAppSend = (student) => {
    setSelectedStudentChat(student);
    setChatMessage(`Hello ${student.parentName}, I am writing to you from Academix School regarding your ward ${student.name}...`);
    setShowChatModal(true);
  };

  const confirmWhatsAppSend = () => {
    if (!selectedStudentChat || !chatMessage) return;
    const phone = selectedStudentChat.contact.replace(/\D/g, ''); // Remove non-numeric
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(chatMessage)}`;
    window.open(url, '_blank');
    setShowChatModal(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await students.delete(id);
        fetchStudents();
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  const columns = [
    {
      header: t('Student'),
      render: (student) => (
        <div className="flex items-center gap-4">
          {student.photo ? (
            <img src={student.photo} alt={student.name} className="w-10 h-10 rounded-xl object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold">
              {student.name.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-bold text-secondary-900 dark:text-white">{student.name}</p>
            <p className="text-xs text-secondary-500 dark:text-secondary-400">{student.parentName}</p>
          </div>
        </div>
      )
    },
    { header: t('Roll No'), accessor: 'rollNumber' },
    { 
      header: t('Class'), 
      render: (student) => (
        <span className="px-3 py-1.5 bg-secondary-100 dark:bg-secondary-700/50 text-secondary-700 dark:text-secondary-300 rounded-lg text-xs font-bold uppercase tracking-wider">
          {t('Class')} {student.class}
        </span>
      )
    },
    { header: t('Contact'), accessor: 'contact' },
    {
      header: t('Fees Status'),
      render: (student) => (
        <div className="flex flex-col gap-2 w-32">
          <div className="w-full bg-secondary-100 dark:bg-secondary-700/50 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-primary-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${student.totalFees > 0 ? ((student.paidFees || 0) / student.totalFees) * 100 : 0}%` }}
            ></div>
          </div>
          <span className="text-[10px] font-bold text-secondary-500 dark:text-secondary-400 uppercase">
            {student.totalFees > 0 ? Math.round(((student.paidFees || 0) / student.totalFees) * 100) : 0}% {t('paid')}
          </span>
        </div>
      )
    },
    {
      header: t('Parent Key'),
      render: (student) => (
        <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded">
          {student.parentKey || t('Not Generated')}
        </div>
      )
    },
    {
      header: t('Actions'),
      render: (student) => (
        <div className="flex items-center gap-1">
          <button 
            onClick={() => handleEdit(student)}
            className="p-2 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-secondary-700/50 rounded-xl transition-all"
            title={t("Edit Student")}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => {
              setSelectedStudentQR(student);
              setShowQRModal(true);
            }}
            className="p-2 text-secondary-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-secondary-700/50 rounded-xl transition-all"
            title={t("Verify QR")}
          >
            <QrCode className="w-4 h-4" />
          </button>
          <button 
            onClick={() => generateIDCard(student)}
            className="p-2 text-secondary-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-secondary-700/50 rounded-xl transition-all"
            title={t("Generate ID Card")}
          >
            <CreditCard className="w-4 h-4" />
          </button>
          <button 
            onClick={() => generateAdmitCard(student)}
            className="p-2 text-secondary-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-secondary-700/50 rounded-xl transition-all"
            title={t("Generate Admit Card")}
          >
            <FileText className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleWhatsAppSend(student)}
            className="p-2 text-secondary-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-secondary-700/50 rounded-xl transition-all"
            title={t("Chat on WhatsApp")}
          >
            <MessageCircle className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleDelete(student.id || student._id)}
            className="p-2 text-secondary-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-secondary-700/50 rounded-xl transition-all"
            title={t("Delete Student")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary-900 dark:text-white tracking-tight">{t('Student Management')}</h1>
          <p className="text-secondary-500 dark:text-secondary-400 font-medium mt-1">{t('Manage, filter, and track all student records.')}</p>
        </div>
        <Button 
          onClick={() => {
            setEditingStudent(null);
            setFormData({ name: '', class: '', rollNumber: '', contact: '', parentName: '', parentEmail: '', totalFees: 0, photo: null });
            setShowModal(true);
          }} 
          className="gap-2 shadow-primary-900/10"
        >
          <UserPlus className="w-5 h-5" />
          {t('Add Student')}
        </Button>
      </div>

      <Card className="p-0 overflow-visible dark:bg-secondary-800/80 dark:border-white/10">
        <div className="p-6 border-b border-secondary-100 dark:border-secondary-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input 
              type="text" 
              placeholder={t("Search by name, roll, or class...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-secondary-50 dark:bg-secondary-900/50 border border-secondary-100 dark:border-secondary-700/50 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm font-medium dark:text-white"
            />
          </div>
          <div className="flex gap-3">
            <Button 
              variant={showFilters ? "primary" : "secondary"} 
              className="gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
              {showFilters ? t("Hide Filters") : t("Filters")}
            </Button>
            <Button variant="ghost" className="p-3">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="p-6 border-b border-secondary-100 dark:border-secondary-700/50 bg-secondary-50/50 dark:bg-secondary-900/30 flex flex-wrap gap-6 animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">{t('Filter by Class')}</label>
              <select 
                value={filters.class}
                onChange={(e) => setFilters({...filters, class: e.target.value})}
                className="block w-48 px-4 py-2 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500/20 dark:text-white"
              >
                <option value="">{t('All Classes')}</option>
                {[...new Set(studentList.map(s => s.class))].filter(Boolean).sort().map(c => (
                  <option key={c} value={c}>{t('Class')} {c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">{t('Fee Status')}</label>
              <div className="flex gap-2">
                {['all', 'paid', 'unpaid', 'partial'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilters({...filters, feeStatus: status})}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition-all ${
                      filters.feeStatus === status 
                        ? 'bg-primary-600 border-primary-600 text-white shadow-md' 
                        : 'bg-white dark:bg-secondary-800 border-secondary-100 dark:border-secondary-700 text-secondary-400 hover:border-secondary-200'
                    }`}
                  >
                    {t(status)}
                  </button>
                ))}
              </div>
            </div>
            <button 
              onClick={() => setFilters({ class: '', feeStatus: 'all' })}
              className="mt-auto mb-1 text-xs font-black text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              {t('Reset All')}
            </button>
          </div>
        )}

        <div className="p-2">
          <Table 
            columns={columns} 
            data={studentList.filter(student => {
              const classMatch = !filters.class || student.class === filters.class;
              const balance = (student.totalFees || 0) - (student.paidFees || 0);
              const status = balance <= 0 ? 'paid' : (student.paidFees || 0) > 0 ? 'partial' : 'unpaid';
              const feeMatch = filters.feeStatus === 'all' || status === filters.feeStatus;
              return classMatch && feeMatch;
            })} 
            isLoading={loading} 
            searchQuery={searchQuery}
            emptyMessage="No students match your filter criteria."
          />
        </div>
      </Card>

      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={editingStudent ? t("Edit Student Details") : t("Register New Student")}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>{t("Cancel")}</Button>
            <Button onClick={handleSubmit}>{editingStudent ? t("Save Changes") : t("Create Student Record")}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PHOTO UPLOAD */}
            <div className="md:col-span-2 flex items-center gap-6">
              <div className="relative">
                {formData.photo ? (
                  <img src={formData.photo} alt="Preview" className="w-20 h-20 rounded-2xl object-cover border-2 border-primary-200" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-secondary-100 dark:bg-secondary-900/50 flex items-center justify-center text-secondary-400">
                    <Camera className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-2">{t("Student Photo")}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    // Auto-compress to ~80KB using Canvas
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const img = new Image();
                      img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const MAX_SIZE = 400; // px - larger for better quality, still stays under 100KB after compression
                        let w = img.width, h = img.height;
                        if (w > h) { h = (h / w) * MAX_SIZE; w = MAX_SIZE; }
                        else { w = (w / h) * MAX_SIZE; h = MAX_SIZE; }
                        canvas.width = w;
                        canvas.height = h;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, w, h);
                        // Compress to JPEG at quality that targets ~80KB
                        let quality = 0.7;
                        let base64 = canvas.toDataURL('image/jpeg', quality);
                        // Ensure it stays under 100KB (approx 133,000 base64 chars)
                        while (base64.length > 130000 && quality > 0.1) {
                          quality -= 0.05;
                          base64 = canvas.toDataURL('image/jpeg', quality);
                        }
                        const sizeKB = Math.round((base64.length * 3) / 4 / 1024);
                        console.log(`Photo compressed to ~${sizeKB}KB`);
                        setFormData(prev => ({...prev, photo: base64}));
                      };
                      img.src = ev.target.result;
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-primary-50 dark:file:bg-secondary-700/50 file:text-primary-700 dark:file:text-primary-400 file:font-bold hover:file:bg-primary-100 cursor-pointer"
                />
                <p className="text-xs text-secondary-400 mt-1">Auto-compressed to ~80KB</p>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-2">{t("Full Name")}</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-5 py-3.5 bg-secondary-50 dark:bg-secondary-900/50 border border-secondary-200 dark:border-secondary-700 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium dark:text-white"
                placeholder="e.g. John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-2">{t("Class")}</label>
              <input
                type="text"
                required
                value={formData.class}
                onChange={(e) => setFormData({...formData, class: e.target.value})}
                className="w-full px-5 py-3.5 bg-secondary-50 dark:bg-secondary-900/50 border border-secondary-200 dark:border-secondary-700 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium dark:text-white"
                placeholder="e.g. 10th A"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-2">{t("Roll Number")}</label>
              <input
                type="text"
                required
                value={formData.rollNumber}
                onChange={(e) => setFormData({...formData, rollNumber: e.target.value})}
                className="w-full px-5 py-3.5 bg-secondary-50 dark:bg-secondary-900/50 border border-secondary-200 dark:border-secondary-700 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium dark:text-white"
                placeholder="e.g. 101"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-2">{t("Parent Name")}</label>
              <input
                type="text"
                required
                value={formData.parentName}
                onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                className="w-full px-5 py-3.5 bg-secondary-50 dark:bg-secondary-900/50 border border-secondary-200 dark:border-secondary-700 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium dark:text-white"
                placeholder="Father/Mother name"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300">{t("Parent Email")}</label>
                {editingStudent && (
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, regenerateKey: !prev.regenerateKey }))}
                    className={`text-[10px] font-black uppercase px-2 py-1 rounded transition-all ${
                      formData.regenerateKey ? 'bg-amber-100 text-amber-700' : 'text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-secondary-700/50'
                    }`}
                  >
                    {formData.regenerateKey ? t('Key will be reset') : t('Regenerate Key?')}
                  </button>
                )}
              </div>
              <input
                type="email"
                value={formData.parentEmail}
                onChange={(e) => setFormData({...formData, parentEmail: e.target.value})}
                className="w-full px-5 py-3.5 bg-secondary-50 dark:bg-secondary-900/50 border border-secondary-200 dark:border-secondary-700 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium dark:text-white"
                placeholder="parent@example.com"
              />
              <p className="text-[10px] text-secondary-400 mt-1 italic">{t('Changing email automatically resets the parent key.')}</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-2">{t("Contact Number")}</label>
              <input
                type="text"
                required
                value={formData.contact}
                onChange={(e) => setFormData({...formData, contact: e.target.value})}
                className="w-full px-5 py-3.5 bg-secondary-50 dark:bg-secondary-900/50 border border-secondary-200 dark:border-secondary-700 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium dark:text-white"
                placeholder="+1 234 567 890"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-2">{t("Total Yearly Fees")} (₹)</label>
              <input
                type="number"
                required
                value={formData.totalFees}
                onChange={(e) => setFormData({...formData, totalFees: e.target.value})}
                className="w-full px-5 py-3.5 bg-secondary-50 dark:bg-secondary-900/50 border border-secondary-200 dark:border-secondary-700 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium dark:text-white"
                placeholder="5000"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* QR Code Verification Modal */}
      <Modal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title="Student Verification QR"
        footer={<Button onClick={() => setShowQRModal(false)}>Close</Button>}
      >
        {selectedStudentQR && (
          <div className="flex flex-col items-center justify-center p-8 space-y-6">
            <div className="p-6 bg-white rounded-3xl border-4 border-primary-50 shadow-premium">
              <QRCodeSVG 
                value={`Student Verification Details:\n------------------------\nName: ${selectedStudentQR.name}\nClass: ${selectedStudentQR.class}\nParent Name: ${selectedStudentQR.parentName}\nMobile: ${selectedStudentQR.contact}\n------------------------\nVerified by Academix`}
                size={220}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-black text-secondary-900">{selectedStudentQR.name}</h3>
              <p className="text-sm font-bold text-secondary-500 uppercase tracking-widest mt-1">
                Roll: {selectedStudentQR.rollNumber} • Class: {selectedStudentQR.class}
              </p>
              <div className="mt-6 p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 flex items-center gap-2 text-xs font-black uppercase">
                <CheckCircle2 className="w-4 h-4" />
                Valid Academic Record
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Custom WhatsApp Chat Modal */}
      <Modal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        title="Custom WhatsApp Message"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowChatModal(false)}>Cancel</Button>
            <Button onClick={confirmWhatsAppSend} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              <MessageCircle className="w-4 h-4" />
              Open WhatsApp
            </Button>
          </>
        }
      >
        {selectedStudentChat && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-secondary-50 rounded-2xl border border-secondary-100">
               <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-black">
                  {selectedStudentChat.name.charAt(0)}
               </div>
               <div>
                  <p className="font-bold text-secondary-900">{selectedStudentChat.parentName}</p>
                  <p className="text-xs text-secondary-500">Parent of {selectedStudentChat.name} • {selectedStudentChat.contact}</p>
               </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">Type your message</label>
              <textarea 
                rows={5}
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Write your custom message here..."
                className="w-full px-5 py-4 bg-secondary-50 border-2 border-secondary-100 rounded-2xl outline-none focus:border-emerald-500 font-medium text-sm transition-all"
              />
              <p className="text-[10px] text-secondary-400 italic">This will open your personal WhatsApp to send the message.</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Students;

