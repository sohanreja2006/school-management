import React, { useState, useEffect } from 'react';
import { timetable, students } from '../services/api';
import { Plus, Calendar, Clock, User, BookOpen, Trash2, Edit2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useTranslation } from 'react-i18next';

const Timetable = () => {
  const { t } = useTranslation();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterClass, setFilterClass] = useState('');
  const [availableClasses, setAvailableClasses] = useState([]);
  const [formData, setFormData] = useState({
    class: '10th A',
    day: 'Monday',
    startTime: '',
    endTime: '',
    subject: '',
    teacher: '',
    room: ''
  });
  const [editingId, setEditingId] = useState(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (filterClass) {
      fetchSchedule();
      setFormData(prev => ({ ...prev, class: filterClass }));
    }
  }, [filterClass]);

  const fetchInitialData = async () => {
    try {
      const { data } = await students.getAll();
      const classes = [...new Set(data.data.map(s => s.class))].filter(Boolean);
      setAvailableClasses(classes);
      if (classes.length > 0) {
        setFilterClass(classes[0]);
        setFormData(prev => ({ ...prev, class: classes[0] }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const { data } = await timetable.get({ className: filterClass });
      setSchedule(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await timetable.update(editingId, formData);
      } else {
        await timetable.add(formData);
      }
      setShowModal(false);
      setEditingId(null);
      fetchSchedule();
      setFormData({ ...formData, startTime: '', endTime: '', subject: '', teacher: '', room: '' });
    } catch (err) {
      alert('Failed to save entry');
    }
  };

  const handleEdit = (period) => {
    setEditingId(period.id || period._id);
    setFormData({
      class: period.class,
      day: period.day,
      startTime: period.startTime,
      endTime: period.endTime,
      subject: period.subject,
      teacher: period.teacher,
      room: period.room || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove this period?')) {
      try {
        await timetable.delete(id);
        fetchSchedule();
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary-900 dark:text-white tracking-tight">{t('Class Timetable')}</h1>
          <p className="text-secondary-500 dark:text-secondary-400 font-medium mt-1">{t('Organize and manage weekly class schedules.')}</p>
        </div>
        <div className="flex gap-4">
          <select 
            value={filterClass} 
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-6 py-3 bg-white dark:bg-secondary-800 border-2 border-secondary-100 dark:border-secondary-700 rounded-2xl font-black text-secondary-900 dark:text-white outline-none focus:border-primary-500 transition-all"
          >
            {availableClasses.map(c => <option key={c} value={c}>{t('Class')} {c}</option>)}
          </select>
          <Button onClick={() => setShowModal(true)} className="gap-2">
            <Plus size={18} />
            {t('Add Period')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {days.map((day) => (
          <div key={day} className="space-y-4">
            <div className="bg-secondary-900 dark:bg-secondary-800/80 text-white p-4 rounded-2xl text-center shadow-lg border border-white/5">
              <p className="text-xs font-black uppercase tracking-widest opacity-60">{t('Day')}</p>
              <h4 className="font-black text-lg tracking-tight">{t(day)}</h4>
            </div>
            
            <div className="space-y-4 min-h-[500px]">
              {schedule.filter(s => s.day === day).length === 0 ? (
                <div className="p-8 border-2 border-dashed border-secondary-200 dark:border-secondary-700 rounded-3xl text-center flex flex-col items-center justify-center h-40">
                  <Calendar size={24} className="text-secondary-200 dark:text-secondary-700 mb-2" />
                  <p className="text-[10px] font-black text-secondary-400 dark:text-secondary-500 uppercase tracking-widest">{t('Free Day')}</p>
                </div>
              ) : (
                schedule.filter(s => s.day === day).map((period) => (
                  <div key={period.id || period._id} className="group bg-white dark:bg-secondary-800 p-6 rounded-3xl border border-secondary-100 dark:border-secondary-700/50 shadow-premium hover:shadow-premium-hover hover:border-primary-100 transition-all relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary-600"></div>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 flex gap-2 transition-all">
                      <button 
                        onClick={() => handleEdit(period)}
                        className="p-1.5 text-primary-500 hover:bg-primary-50 dark:hover:bg-secondary-700/50 rounded-lg"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(period.id || period._id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-3">
                      <Clock size={12} />
                      {period.startTime} - {period.endTime}
                    </div>
                    
                    <h5 className="font-black text-secondary-900 dark:text-white text-lg leading-tight mb-4">{period.subject}</h5>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-secondary-500 dark:text-secondary-400">
                        <User size={14} className="text-secondary-400" />
                        {period.teacher}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-secondary-500 dark:text-secondary-400">
                        <BookOpen size={14} className="text-secondary-400" />
                        {t('Room')}: {period.room || 'TBD'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={t("Add Class Period")}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>{t("Cancel")}</Button>
            <Button onClick={handleSubmit}>{t("Save Entry")}</Button>
          </>
        }
      >
        <form className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-secondary-400 uppercase tracking-widest mb-2">{t('Class')}</label>
              <select 
                value={formData.class}
                onChange={(e) => setFormData({...formData, class: e.target.value})}
                className="w-full px-5 py-3.5 bg-secondary-50 dark:bg-secondary-900 border border-secondary-100 dark:border-secondary-700 rounded-2xl outline-none focus:border-primary-500 font-bold dark:text-white"
              >
                {availableClasses.map(c => <option key={c} value={c}>{t('Class')} {c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-secondary-400 uppercase tracking-widest mb-2">{t('Day')}</label>
              <select 
                value={formData.day}
                onChange={(e) => setFormData({...formData, day: e.target.value})}
                className="w-full px-5 py-3.5 bg-secondary-50 dark:bg-secondary-900 border border-secondary-100 dark:border-secondary-700 rounded-2xl outline-none focus:border-primary-500 font-bold dark:text-white"
              >
                {days.map(d => <option key={d} value={d}>{t(d)}</option>)}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-secondary-400 uppercase tracking-widest mb-2">{t('Start Time')}</label>
              <input 
                type="text" 
                placeholder="09:00 AM"
                value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                className="w-full px-5 py-3.5 bg-secondary-50 dark:bg-secondary-900 border border-secondary-100 dark:border-secondary-700 rounded-2xl outline-none focus:border-primary-500 font-bold dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-secondary-400 uppercase tracking-widest mb-2">{t('End Time')}</label>
              <input 
                type="text" 
                placeholder="10:00 AM"
                value={formData.endTime}
                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                className="w-full px-5 py-3.5 bg-secondary-50 dark:bg-secondary-900 border border-secondary-100 dark:border-secondary-700 rounded-2xl outline-none focus:border-primary-500 font-bold dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-secondary-400 uppercase tracking-widest mb-2">{t('Subject Name')}</label>
            <input 
              type="text" 
              placeholder="Mathematics"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              className="w-full px-5 py-3.5 bg-secondary-50 dark:bg-secondary-900 border border-secondary-100 dark:border-secondary-700 rounded-2xl outline-none focus:border-primary-500 font-bold dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-secondary-400 uppercase tracking-widest mb-2">{t('Teacher Name')}</label>
            <input 
              type="text" 
              placeholder="Dr. Sarah Johnson"
              value={formData.teacher}
              onChange={(e) => setFormData({...formData, teacher: e.target.value})}
              className="w-full px-5 py-3.5 bg-secondary-50 dark:bg-secondary-900 border border-secondary-100 dark:border-secondary-700 rounded-2xl outline-none focus:border-primary-500 font-bold dark:text-white"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Timetable;
