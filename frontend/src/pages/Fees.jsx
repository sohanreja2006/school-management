import React, { useState, useEffect } from 'react';
import { students, fees } from '../services/api';
import { exportToCSV } from '../utils/exportUtils';
import { generateInvoice } from '../utils/pdfUtils';
import { 
  CreditCard, 
  Filter, 
  Download, 
  ArrowUpCircle,
  Clock,
  CheckCircle2,
  Bell,
  FileText,
  CheckCircle,
  MoreHorizontal,
  ChevronRight,
  Search
} from 'lucide-react';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useSearch } from '../context/SearchContext';
import { notifications } from '../services/api';
import { Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Fees = () => {
  const { t } = useTranslation();
  const { searchQuery, setSearchQuery } = useSearch();
  const [studentList, setStudentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feeStats, setFeeStats] = useState({ totalExpected: 0, totalCollected: 0, pending: 0 });
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [manualAmount, setManualAmount] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    class: '',
    status: 'all' // all, paid, partial, unpaid
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentRes, statsRes] = await Promise.all([
        students.getAll(),
        fees.getStats()
      ]);
      setStudentList(studentRes.data?.data || []);
      setFeeStats(statsRes.data?.data || { totalExpected: 0, totalCollected: 0, pending: 0 });
    } catch (err) {
      console.error('Error fetching fee data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExport = () => {
    if (!studentList.length) return;
    const exportData = studentList.map(s => ({
      Name: s.name,
      Roll: s.rollNumber,
      Class: s.class,
      Total: s.totalFees,
      Paid: s.paidFees,
      Balance: (s.totalFees || 0) - (s.paidFees || 0),
      Status: (s.paidFees || 0) >= (s.totalFees || 0) ? 'Paid' : (s.paidFees || 0) > 0 ? 'Partial' : 'Unpaid'
    }));
    exportToCSV(exportData, 'Academix_fee_report');
  };

  const handleManualUpdate = async (e) => {
    if (e) e.preventDefault();
    if (!selectedStudent) return;

    try {
      const currentPaid = selectedStudent.paidFees || 0;
      const newTotal = Number(manualAmount);
      const difference = newTotal - currentPaid;

      await fees.recordPayment({
        studentId: selectedStudent.id || selectedStudent._id,
        amount: difference,
        paymentMethod: 'Manual Adjustment',
        remarks: 'Direct adjustment'
      });
      
      setShowEditModal(false);
      fetchData();
      setManualAmount('');
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update payment. Please try again.');
    }
  };

  const markFullyPaid = async (student) => {
    const balance = (student.totalFees || 0) - (student.paidFees || 0);
    if (balance <= 0) return;
    
    if (window.confirm(`Mark ${student.name} as fully paid?`)) {
      try {
        await fees.recordPayment({
          studentId: student.id || student._id,
          amount: balance,
          paymentMethod: 'Manual Adjustment'
        });
        fetchData();
      } catch (err) {
        alert('Failed to update status');
      }
    }
  };

  const sendFeeReminder = async (student) => {
    const balance = (student.totalFees || 0) - (student.paidFees || 0);
    if (balance <= 0) return;

    try {
      await notifications.sendAlert({
        studentId: student.id || student._id,
        type: 'fees',
        contact: student.contact,
        message: `Dear Parent, this is a reminder regarding the pending fees of $${balance.toLocaleString()} for your ward ${student.name}. Please settle the dues at your earliest convenience. Thank you, Academix School.`
      });
      alert('Fee reminder sent to parent!');
    } catch (err) {
      alert('Failed to send reminder');
    }
  };

  const columns = [
    {
      header: t('Student'),
      render: (student) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-secondary-100 dark:bg-secondary-700/50 flex items-center justify-center text-secondary-700 dark:text-secondary-300 font-bold">
            {student.name?.charAt(0) || 'S'}
          </div>
          <div>
            <p className="font-bold text-secondary-900 dark:text-white">{student.name}</p>
            <p className="text-[11px] font-bold text-secondary-400 dark:text-secondary-500 uppercase tracking-tighter">{student.rollNumber}</p>
          </div>
        </div>
      )
    },
    { 
      header: t('Total Fees'), 
      render: (s) => <span className="font-bold text-secondary-900 dark:text-white">₹{(s.totalFees || 0).toLocaleString()}</span> 
    },
    { 
      header: t('Paid Amount'), 
      render: (s) => <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{(s.paidFees || 0).toLocaleString()}</span> 
    },
    { 
      header: t('Balance Dues'), 
      render: (s) => <span className="font-bold text-rose-600 dark:text-rose-400">₹{((s.totalFees || 0) - (s.paidFees || 0)).toLocaleString()}</span> 
    },
    {
      header: t('Status'),
      render: (student) => {
        const balance = (student.totalFees || 0) - (student.paidFees || 0);
        const status = balance <= 0 ? 'paid' : (student.paidFees || 0) > 0 ? 'partial' : 'unpaid';
        return (
          <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border-2 ${
            status === 'paid' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50' :
            status === 'partial' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800/50' :
            'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-800/50'
          }`}>
            {t(status)}
          </span>
        );
      }
    },
    {
      header: t('Actions'),
      render: (student) => {
        const balance = (student.totalFees || 0) - (student.paidFees || 0);
        return (
          <div className="flex items-center gap-2">
            <Button 
              size="sm"
              variant="secondary"
              onClick={() => {
                setSelectedStudent(student);
                setManualAmount(student.paidFees || 0);
                setShowEditModal(true);
              }}
              className="gap-1.5 h-9 px-3 text-[10px] font-black uppercase"
            >
              {t("Update Paid")}
            </Button>
            
            <button 
              onClick={() => generateInvoice(student)}
              className="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-secondary-700/50 rounded-xl transition-all"
              title={t("Download Invoice")}
            >
              <FileText className="w-4.5 h-4.5" />
            </button>

            {balance > 0 && (
              <button 
                onClick={() => sendFeeReminder(student)}
                className="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-secondary-700/50 rounded-xl transition-all"
                title={t("Send SMS/WhatsApp Reminder")}
              >
                <Send className="w-4 h-4" />
              </button>
            )}

            {balance > 0 && (
              <button 
                onClick={() => markFullyPaid(student)}
                className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-secondary-700/50 rounded-xl transition-all"
                title={t("Mark Fully Paid")}
              >
                <CheckCircle className="w-4.5 h-4.5" />
              </button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary-900 dark:text-white tracking-tight">{t('Finance Center')}</h1>
          <p className="text-secondary-500 dark:text-secondary-400 font-medium mt-1">{t('Directly manage student dues and payments.')}</p>
        </div>
        <Button variant="secondary" onClick={handleExport} className="gap-2">
          <Download className="w-5 h-5" />
          {t('Export Report')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-primary-600 dark:bg-primary-700/80 p-8 rounded-3xl text-white shadow-premium flex flex-col justify-between relative overflow-hidden group border border-white/5">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <CheckCircle2 size={120} />
          </div>
          <div>
            <div className="p-3 bg-white/10 w-fit rounded-2xl backdrop-blur-md mb-6">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-primary-100 text-sm font-black uppercase tracking-widest">{t('Total Collected')}</p>
            <h3 className="text-4xl font-black mt-2">₹{(feeStats.totalCollected || 0).toLocaleString()}</h3>
          </div>
          <div className="mt-8 flex items-center gap-2 text-primary-100 font-bold text-sm">
            <span>{t('Live collection data')}</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        <Card className="flex flex-col justify-between shadow-premium hover:shadow-premium-hover transition-all duration-300 dark:bg-secondary-800/80 dark:border-white/10">
          <div>
            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 w-fit rounded-2xl mb-6">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-secondary-400 dark:text-secondary-500 text-sm font-black uppercase tracking-widest">{t('Balance Dues')}</p>
            <h3 className="text-4xl font-black text-secondary-900 dark:text-white mt-2">₹{(feeStats.pending || 0).toLocaleString()}</h3>
          </div>
          <div className="mt-8 bg-rose-50 dark:bg-rose-900/20 p-3 rounded-2xl flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-sm">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
            <span>{t('Uncollected Revenue')}</span>
          </div>
        </Card>

        <Card className="flex flex-col justify-between shadow-premium hover:shadow-premium-hover transition-all duration-300 dark:bg-secondary-800/80 dark:border-white/10">
          <div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 w-fit rounded-2xl mb-6">
              <CreditCard className="w-6 h-6" />
            </div>
            <p className="text-secondary-400 dark:text-secondary-500 text-sm font-black uppercase tracking-widest">{t('Collection Rate')}</p>
            <h3 className="text-4xl font-black text-secondary-900 dark:text-white mt-2">
              {feeStats.totalExpected ? Math.round((feeStats.totalCollected / feeStats.totalExpected) * 100) : 0}%
            </h3>
          </div>
          <div className="mt-8">
             <div className="w-full bg-secondary-100 dark:bg-secondary-700/50 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full" 
                  style={{ width: `${feeStats.totalExpected ? (feeStats.totalCollected / feeStats.totalExpected) * 100 : 0}%` }}
                ></div>
             </div>
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-visible dark:bg-secondary-800/80 dark:border-white/10">
        <div className="p-8 border-b border-secondary-100 dark:border-secondary-700/50 flex justify-between items-center bg-secondary-50/30 dark:bg-secondary-900/30 rounded-t-[32px]">
          <h3 className="text-xl font-black text-secondary-900 dark:text-white tracking-tight">{t('Student Fee Management')}</h3>
          <div className="flex gap-4 flex-1 max-w-md">
             <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input 
                  type="text" 
                  placeholder={t("Search students or records...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-secondary-900 border border-secondary-100 dark:border-secondary-700/50 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm font-medium dark:text-white"
                />
             </div>
             <button 
               onClick={() => setShowFilters(!showFilters)}
               className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 transition-all text-sm font-bold ${
                 showFilters 
                   ? 'bg-primary-600 border-primary-600 text-white' 
                   : 'bg-white dark:bg-secondary-800 border-secondary-100 dark:border-secondary-700 text-secondary-500 hover:border-secondary-200'
               }`}
             >
                <Filter className="w-4 h-4" />
                {showFilters ? t("Active") : t("Filters")}
             </button>
          </div>
        </div>

        {showFilters && (
          <div className="p-8 bg-secondary-50/50 dark:bg-secondary-900/30 border-b border-secondary-100 dark:border-secondary-700/50 flex flex-wrap gap-8 animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-3">
               <label className="text-[10px] font-black text-secondary-400 dark:text-secondary-500 uppercase tracking-widest">{t('Class Selection')}</label>
               <select 
                 value={filters.class}
                 onChange={(e) => setFilters({...filters, class: e.target.value})}
                 className="block w-48 px-5 py-3 bg-white dark:bg-secondary-800 border-2 border-secondary-100 dark:border-secondary-700 rounded-2xl text-sm font-bold outline-none focus:border-primary-500 transition-all dark:text-white"
               >
                 <option value="">{t('All Classes')}</option>
                 {[...new Set(studentList.map(s => s.class))].filter(Boolean).sort().map(c => (
                   <option key={c} value={c}>{t('Class')} {c}</option>
                 ))}
               </select>
            </div>
            <div className="space-y-3">
               <label className="text-[10px] font-black text-secondary-400 dark:text-secondary-500 uppercase tracking-widest">{t('Payment Status')}</label>
               <div className="flex gap-2">
                 {['all', 'paid', 'unpaid', 'partial'].map((s) => (
                   <button
                     key={s}
                     onClick={() => setFilters({...filters, status: s})}
                     className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider border-2 transition-all ${
                       filters.status === s 
                         ? 'bg-secondary-900 dark:bg-primary-600 border-secondary-900 dark:border-primary-600 text-white shadow-lg' 
                         : 'bg-white dark:bg-secondary-800 border-secondary-100 dark:border-secondary-700 text-secondary-400 hover:border-secondary-200'
                     }`}
                   >
                     {t(s)}
                   </button>
                 ))}
               </div>
            </div>
            <button 
              onClick={() => setFilters({ class: '', status: 'all' })}
              className="mt-auto mb-1 text-xs font-black text-primary-600 dark:text-primary-400 hover:text-primary-700 underline underline-offset-4"
            >
              {t('Reset Filters')}
            </button>
          </div>
        )}

        <div className="p-2">
          <Table 
            columns={columns} 
            data={studentList.filter(student => {
              const classMatch = !filters.class || student.class === filters.class;
              const balance = (student.totalFees || 0) - (student.paidFees || 0);
              const currentStatus = balance <= 0 ? 'paid' : (student.paidFees || 0) > 0 ? 'partial' : 'unpaid';
              const statusMatch = filters.status === 'all' || currentStatus === filters.status;
              return classMatch && statusMatch;
            })} 
            isLoading={loading} 
            searchQuery={searchQuery}
            emptyMessage="No fee records match your filters."
          />
        </div>
      </Card>

      <Modal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        title={t("Update Paid Amount")}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>{t("Cancel")}</Button>
            <Button onClick={handleManualUpdate} className="gap-2">
              <CheckCircle className="w-5 h-5" />
              {t("Save Changes")}
            </Button>
          </>
        }
      >
        {selectedStudent && (
          <div className="space-y-8">
            <div className="p-6 bg-secondary-50 dark:bg-secondary-900/50 border border-secondary-100 dark:border-secondary-700/50 rounded-3xl flex justify-between items-center">
              <div>
                <p className="text-xs font-black text-secondary-400 dark:text-secondary-500 uppercase tracking-widest mb-1">{t('Total Fee Amount')}</p>
                <p className="text-2xl font-black text-secondary-900 dark:text-white">
                  ₹{(selectedStudent.totalFees || 0).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-secondary-900 dark:text-white">{selectedStudent.name}</p>
                <p className="text-xs font-bold text-secondary-500 uppercase">{selectedStudent.rollNumber}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-black text-secondary-700 dark:text-secondary-300 mb-3 uppercase tracking-wider">{t('Set Total Paid Amount')} (₹)</label>
              <div className="relative group">
                <span className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 text-secondary-400 font-black text-xl group-focus-within:text-primary-600 transition-colors">₹</span>
                <input
                  type="number"
                  value={manualAmount}
                  onChange={(e) => setManualAmount(e.target.value)}
                  className="w-full pl-12 pr-6 py-5 bg-secondary-50 dark:bg-secondary-900/50 border-2 border-secondary-100 dark:border-secondary-700/50 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-black text-2xl text-secondary-900 dark:text-white"
                  placeholder="0.00"
                />
              </div>
              <p className="mt-2 text-xs text-secondary-500 dark:text-secondary-400 font-medium">{t('Enter the total amount this student has paid to date.')}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Fees;
