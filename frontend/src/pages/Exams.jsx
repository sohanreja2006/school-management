import React, { useState, useEffect } from 'react';
import { examination } from '../services/api';
import { Plus, Calendar, Trash2, Edit2, BookOpen } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Table from '../components/ui/Table';
import { useSearch } from '../context/SearchContext';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Exams = () => {
  const { t } = useTranslation();
  const { searchQuery, setSearchQuery } = useSearch();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Unit Test',
    startDate: '',
    endDate: '',
    status: 'Upcoming'
  });
  const [editingExam, setEditingExam] = useState(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const { data } = await examination.getExams();
      setExams(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingExam) {
        await examination.updateExam(editingExam.id || editingExam._id, formData);
      } else {
        await examination.createExam(formData);
      }
      setShowModal(false);
      setEditingExam(null);
      setFormData({ name: '', type: 'Unit Test', startDate: '', endDate: '', status: 'Upcoming' });
      fetchExams();
    } catch (err) {
      alert('Failed to save exam');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await examination.deleteExam(id);
        fetchExams();
      } catch (err) {
        alert('Failed to delete exam');
      }
    }
  };

  const handleEdit = (exam) => {
    setEditingExam(exam);
    setFormData({
      name: exam.name,
      type: exam.type,
      startDate: exam.startDate.split('T')[0],
      endDate: exam.endDate.split('T')[0],
      status: exam.status
    });
    setShowModal(true);
  };

  const columns = [
    { header: t('Exam Name'), accessor: 'name', render: (row) => <span className="font-black text-secondary-900 dark:text-white">{row.name}</span> },
    { header: t('Type'), accessor: 'type', render: (row) => <span className="dark:text-secondary-400">{t(row.type)}</span> },
    { header: t('Start Date'), render: (row) => <span className="dark:text-secondary-400">{new Date(row.startDate).toLocaleDateString()}</span> },
    { header: t('Status'), render: (row) => (
      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
        row.status === 'Completed' ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' :
        row.status === 'Ongoing' ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' :
        'bg-secondary-100 dark:bg-secondary-700/50 text-secondary-500 dark:text-secondary-400'
      }`}>
        {t(row.status)}
      </span>
    )},
    { header: t('Actions'), render: (row) => (
      <div className="flex gap-2">
        <button onClick={() => handleEdit(row)} className="p-2 text-secondary-400 hover:text-primary-600 transition-all"><Edit2 size={16} /></button>
        <button onClick={() => handleDelete(row.id || row._id)} className="p-2 text-secondary-400 hover:text-rose-600 transition-all"><Trash2 size={16} /></button>
      </div>
    )}
  ];

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-secondary-900 dark:text-white tracking-tight">{t('Examination Management')}</h1>
          <p className="text-secondary-500 dark:text-secondary-400 font-medium mt-1">{t('Schedule and manage school-wide examinations.')}</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2 shadow-primary-500/20">
          <Plus size={18} />
          {t('Create Exam')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-primary-600 dark:bg-primary-700/80 text-white border-none shadow-xl shadow-primary-500/20">
          <Calendar className="mb-4 opacity-50" size={32} />
          <p className="text-primary-100 text-[10px] font-black uppercase tracking-widest">{t('Active Exams')}</p>
          <h3 className="text-3xl font-black mt-1">{exams.filter(e => e.status === 'Ongoing').length}</h3>
        </Card>
        <Card className="dark:bg-secondary-800 dark:border-secondary-700">
          <BookOpen className="text-primary-600 dark:text-primary-400 mb-4" size={32} />
          <p className="text-secondary-400 dark:text-secondary-500 text-[10px] font-black uppercase tracking-widest">{t('Total Exams')}</p>
          <h3 className="text-3xl font-black text-secondary-900 dark:text-white mt-1">{exams.length}</h3>
        </Card>
      </div>

      <Card p={0} title={t("Examination Schedule")} className="dark:bg-secondary-800 dark:border-secondary-700">
        <div className="p-6 border-b border-secondary-100 dark:border-secondary-700 flex justify-between items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input 
              type="text" 
              placeholder={t("Search exams...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-secondary-50 dark:bg-secondary-900 border border-secondary-100 dark:border-secondary-700 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm font-medium dark:text-white"
            />
          </div>
        </div>
        <div className="p-2">
          <Table columns={columns} data={exams} isLoading={loading} searchQuery={searchQuery} />
        </div>
      </Card>

      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={t("Schedule New Exam")}
        footer={<Button onClick={handleSubmit}>{t("Create Exam")}</Button>}
      >
        <form className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-secondary-400 dark:text-secondary-500 uppercase tracking-widest mb-2">{t('Exam Name')}</label>
            <input 
              type="text" 
              placeholder="e.g. Annual Finals 2024"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-5 py-3.5 bg-secondary-50 dark:bg-secondary-900 border-2 border-secondary-100 dark:border-secondary-700 rounded-2xl outline-none focus:border-primary-500 font-bold dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-secondary-400 dark:text-secondary-500 uppercase tracking-widest mb-2">{t('Type')}</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-5 py-3.5 bg-secondary-50 dark:bg-secondary-900 border-2 border-secondary-100 dark:border-secondary-700 rounded-2xl outline-none focus:border-primary-500 font-bold dark:text-white"
              >
                <option value="Unit Test">{t('Unit Test')}</option>
                <option value="Term">{t('Term')}</option>
                <option value="Mid Term">{t('Mid Term')}</option>
                <option value="Final">{t('Final')}</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-secondary-400 dark:text-secondary-500 uppercase tracking-widest mb-2">{t('Status')}</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-5 py-3.5 bg-secondary-50 dark:bg-secondary-900 border-2 border-secondary-100 dark:border-secondary-700 rounded-2xl outline-none focus:border-primary-500 font-bold dark:text-white"
              >
                <option value="Upcoming">{t('Upcoming')}</option>
                <option value="Ongoing">{t('Ongoing')}</option>
                <option value="Completed">{t('Completed')}</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-secondary-400 dark:text-secondary-500 uppercase tracking-widest mb-2">{t('Start Date')}</label>
              <input 
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full px-5 py-3.5 bg-secondary-50 dark:bg-secondary-900 border-2 border-secondary-100 dark:border-secondary-700 rounded-2xl outline-none focus:border-primary-500 font-bold dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-secondary-400 dark:text-secondary-500 uppercase tracking-widest mb-2">{t('End Date')}</label>
              <input 
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                className="w-full px-5 py-3.5 bg-secondary-50 dark:bg-secondary-900 border-2 border-secondary-100 dark:border-secondary-700 rounded-2xl outline-none focus:border-primary-500 font-bold dark:text-white"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Exams;
