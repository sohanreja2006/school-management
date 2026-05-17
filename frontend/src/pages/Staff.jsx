import React, { useState, useEffect } from 'react';
import { staffService } from '../services/api';
import { Plus, Edit, Trash2, UserCheck, Key, BookOpen, Phone, ShieldAlert, Check } from 'lucide-react';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useTranslation } from 'react-i18next';

const Staff = () => {
  const { t } = useTranslation();
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    assignedClasses: '',
    role: 'Teacher',
  });

  const [editFormData, setEditFormData] = useState({
    id: null,
    name: '',
    contact: '',
    assignedClasses: '',
    role: 'Teacher',
    resetKey: false,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await staffService.getAll();
      setDataList(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert(t('Name is required'));
      return;
    }
    try {
      await staffService.add(formData);
      setShowModal(false);
      setFormData({ name: '', contact: '', assignedClasses: '', role: 'Teacher' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || t('Failed to add staff'));
    }
  };

  const handleEditClick = (row) => {
    setEditFormData({
      id: row.id,
      name: row.name || '',
      contact: row.contact || '',
      assignedClasses: Array.isArray(row.assignedClasses) ? row.assignedClasses.join(', ') : (row.assignedClasses || ''),
      role: row.role || 'Teacher',
      resetKey: false,
    });
    setEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await staffService.update(editFormData.id, editFormData);
      setEditModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || t('Failed to update staff'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('Are you sure you want to delete this staff member?'))) return;
    try {
      await staffService.delete(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || t('Failed to delete staff'));
    }
  };

  const copyCredentials = (staff) => {
    const text = `Login Credentials for Academix Teacher App\nStaff ID: ${staff.staffId}\n4-Digit Key: ${staff.staffKey}`;
    navigator.clipboard.writeText(text);
    setCopiedId(staff.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const columns = [
    {
      header: t('Staff Member'),
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold">
            {row.name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-secondary-900 dark:text-white">{row.name}</p>
            <p className="text-[10px] text-secondary-400 dark:text-secondary-500 font-black uppercase tracking-wider">{row.role}</p>
          </div>
        </div>
      ),
    },
    {
      header: t('Assigned Classes'),
      render: (row) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {row.assignedClasses && row.assignedClasses.length > 0 ? (
            row.assignedClasses.map((cls, idx) => (
              <span key={idx} className="px-2.5 py-1 bg-secondary-100 dark:bg-secondary-700 text-secondary-800 dark:text-secondary-200 text-xs font-bold rounded-lg border border-secondary-200 dark:border-secondary-600">
                {cls}
              </span>
            ))
          ) : (
            <span className="text-xs text-secondary-400 italic">{t('No classes assigned')}</span>
          )}
        </div>
      ),
    },
    {
      header: t('Contact'),
      accessor: 'contact',
    },
    {
      header: t('Mobile Login Credentials'),
      render: (row) => (
        <div className="flex items-center gap-2 bg-secondary-50 dark:bg-secondary-900/50 p-2 rounded-xl border border-secondary-200 dark:border-secondary-700/50">
          <div>
            <div className="text-[10px] font-black text-secondary-400 dark:text-secondary-500 uppercase tracking-widest">{t('Staff ID')}</div>
            <div className="text-xs font-mono font-bold text-primary-600 dark:text-primary-400">{row.staffId}</div>
          </div>
          <div className="h-6 w-[1px] bg-secondary-200 dark:bg-secondary-700 mx-1"></div>
          <div>
            <div className="text-[10px] font-black text-secondary-400 dark:text-secondary-500 uppercase tracking-widest">{t('4-Digit PIN')}</div>
            <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">{row.staffKey}</div>
          </div>
          <button
            onClick={() => copyCredentials(row)}
            className="ml-2 p-1.5 bg-white dark:bg-secondary-800 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg border border-secondary-200 dark:border-secondary-600 text-secondary-600 dark:text-secondary-300 transition-all shadow-sm"
            title={t('Copy Credentials')}
          >
            {copiedId === row.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Key className="w-3.5 h-3.5" />}
          </button>
        </div>
      ),
    },
    {
      header: t('Actions'),
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleEditClick(row)}
            className="bg-secondary-100 hover:bg-secondary-200 text-secondary-700 py-1.5 px-2.5 text-xs shadow-none border border-secondary-200"
          >
            <Edit className="w-3.5 h-3.5" />
          </Button>
          <Button
            onClick={() => handleDelete(row.id)}
            className="bg-red-50 hover:bg-red-100 text-red-600 py-1.5 px-2.5 text-xs shadow-none border border-red-200"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary-900 dark:text-white tracking-tight">{t('Staff & Faculty')}</h1>
          <p className="text-secondary-500 dark:text-secondary-400 font-medium mt-1">
            {t('Manage teachers, assign classes, and view auto-generated mobile login credentials.')}
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2 shadow-premium">
          <Plus className="w-5 h-5" />
          {t('Add Staff Member')}
        </Button>
      </div>

      <Card className="p-0 border-none shadow-premium dark:bg-secondary-800/80">
        <div className="p-2">
          <Table columns={columns} data={dataList} isLoading={loading} emptyMessage={t('No staff members found. Click "Add Staff Member" to get started.')} />
        </div>
      </Card>

      {/* Add Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={t('Add New Staff Member')}
        footer={<Button onClick={handleSubmit}>{t('Create Account')}</Button>}
      >
        <form className="space-y-4">
          <div>
            <label className="text-xs font-bold text-secondary-500 uppercase mb-1 block">{t('Full Name')}</label>
            <input
              type="text"
              placeholder="e.g. Sarah Jenkins"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-secondary-50 dark:bg-secondary-900 border border-secondary-100 dark:border-secondary-700 rounded-xl outline-none dark:text-white"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-secondary-500 uppercase mb-1 block">{t('Contact / Phone')}</label>
            <input
              type="text"
              placeholder="e.g. +1 234 567 890"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              className="w-full px-4 py-2 bg-secondary-50 dark:bg-secondary-900 border border-secondary-100 dark:border-secondary-700 rounded-xl outline-none dark:text-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-secondary-500 uppercase mb-1 block">{t('Assigned Classes (Comma Separated)')}</label>
            <input
              type="text"
              placeholder="e.g. 10A, 10B, 9A"
              value={formData.assignedClasses}
              onChange={(e) => setFormData({ ...formData, assignedClasses: e.target.value })}
              className="w-full px-4 py-2 bg-secondary-50 dark:bg-secondary-900 border border-secondary-100 dark:border-secondary-700 rounded-xl outline-none dark:text-white"
            />
            <span className="text-[10px] text-secondary-400 mt-1 block">{t('These classes will appear in the Teacher Mobile App dropdown.')}</span>
          </div>

          <div>
            <label className="text-xs font-bold text-secondary-500 uppercase mb-1 block">{t('Role')}</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 bg-secondary-50 dark:bg-secondary-900 border border-secondary-100 dark:border-secondary-700 rounded-xl outline-none dark:text-white cursor-pointer"
            >
              <option value="Teacher">{t('Teacher')}</option>
              <option value="Assistant Teacher">{t('Assistant Teacher')}</option>
              <option value="Head of Department">{t('Head of Department')}</option>
            </select>
          </div>

          <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-2xl border border-primary-100 dark:border-primary-800 text-center mt-6">
            <p className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-1">
              {t('Automated Credential Generation')}
            </p>
            <p className="text-xs text-secondary-600 dark:text-secondary-300 font-medium">
              {t('A unique Staff ID and 4-Digit PIN will be automatically generated upon creation.')}
            </p>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        title={t('Edit Staff Member')}
        footer={<Button onClick={handleUpdate}>{t('Save Changes')}</Button>}
      >
        <form className="space-y-4">
          <div>
            <label className="text-xs font-bold text-secondary-500 uppercase mb-1 block">{t('Full Name')}</label>
            <input
              type="text"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              className="w-full px-4 py-2 bg-secondary-50 dark:bg-secondary-900 border border-secondary-100 dark:border-secondary-700 rounded-xl outline-none dark:text-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-secondary-500 uppercase mb-1 block">{t('Contact / Phone')}</label>
            <input
              type="text"
              value={editFormData.contact}
              onChange={(e) => setEditFormData({ ...editFormData, contact: e.target.value })}
              className="w-full px-4 py-2 bg-secondary-50 dark:bg-secondary-900 border border-secondary-100 dark:border-secondary-700 rounded-xl outline-none dark:text-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-secondary-500 uppercase mb-1 block">{t('Assigned Classes (Comma Separated)')}</label>
            <input
              type="text"
              value={editFormData.assignedClasses}
              onChange={(e) => setEditFormData({ ...editFormData, assignedClasses: e.target.value })}
              className="w-full px-4 py-2 bg-secondary-50 dark:bg-secondary-900 border border-secondary-100 dark:border-secondary-700 rounded-xl outline-none dark:text-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-secondary-500 uppercase mb-1 block">{t('Role')}</label>
            <select
              value={editFormData.role}
              onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
              className="w-full px-4 py-2 bg-secondary-50 dark:bg-secondary-900 border border-secondary-100 dark:border-secondary-700 rounded-xl outline-none dark:text-white cursor-pointer"
            >
              <option value="Teacher">{t('Teacher')}</option>
              <option value="Assistant Teacher">{t('Assistant Teacher')}</option>
              <option value="Head of Department">{t('Head of Department')}</option>
            </select>
          </div>

          <div className="pt-4 border-t border-secondary-100 dark:border-secondary-700 flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-secondary-800 dark:text-white block">{t('Reset Mobile Login PIN?')}</span>
              <span className="text-xs text-secondary-500 dark:text-secondary-400">{t('Generates a new random 4-digit key on save')}</span>
            </div>
            <input
              type="checkbox"
              checked={editFormData.resetKey}
              onChange={(e) => setEditFormData({ ...editFormData, resetKey: e.target.checked })}
              className="w-5 h-5 accent-primary-600 rounded cursor-pointer"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Staff;
