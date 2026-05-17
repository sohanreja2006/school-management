import React, { useState, useEffect } from 'react';
import { admissions } from '../services/api';
import { User, Mail, Phone, Calendar, CheckCircle, XCircle, Clock, Search, Filter, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdmissionsList = () => {
  const { t } = useTranslation();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await admissions.getAll();
      setApplications(response.data.data);
    } catch (err) {
      console.error('Failed to fetch admissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await admissions.updateStatus(id, newStatus);
      setApplications(applications.map(app => 
        app._id === id ? { ...app, status: newStatus } : app
      ));
    } catch (err) {
      alert(t('Failed to update status'));
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="px-3 py-1 bg-success-100 text-success-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-xs font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {t('Approved')}</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-error-100 text-error-700 dark:bg-rose-900/30 dark:text-rose-400 rounded-full text-xs font-medium flex items-center gap-1"><XCircle className="w-3 h-3" /> {t('Rejected')}</span>;
      default:
        return <span className="px-3 py-1 bg-warning-100 text-warning-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-xs font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> {t('Pending')}</span>;
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/admission`;
    navigator.clipboard.writeText(link);
    alert(t('Admission form link copied to clipboard!'));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">{t('Admission Applications')}</h1>
          <p className="text-secondary-600 dark:text-secondary-400 text-sm">{t('Review and manage student admission forms.')}</p>
        </div>
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900/30 dark:text-primary-400 rounded-xl transition-all font-semibold"
        >
          <Share2 className="w-4 h-4" /> {t('Copy Admission Link')}
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-secondary-800 p-4 rounded-xl shadow-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
          <input
            type="text"
            placeholder={t("Search student or parent...")}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-900 text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
          <select
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-900 text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all" className="dark:bg-secondary-800">{t('All Status')}</option>
            <option value="pending" className="dark:bg-secondary-800">{t('Pending')}</option>
            <option value="approved" className="dark:bg-secondary-800">{t('Approved')}</option>
            <option value="rejected" className="dark:bg-secondary-800">{t('Rejected')}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary-50 dark:bg-secondary-900/50 border-b border-secondary-100 dark:border-secondary-700">
                <th className="px-6 py-4 text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase">{t('Student Details')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase">{t('Parent & Contact')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase">{t('Grade')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase">{t('Date')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase">{t('Status')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase">{t('Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100 dark:divide-secondary-700">
              {filteredApplications.map((app) => (
                <tr key={app._id} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-900/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
                        {app.studentName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-secondary-900 dark:text-white">{app.studentName}</div>
                        <div className="text-xs text-secondary-500 truncate max-w-[150px]">{app.address}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-sm text-secondary-700 dark:text-secondary-300 flex items-center gap-2">
                        <User className="w-3 h-3" /> {app.parentName}
                      </div>
                      <div className="text-xs text-secondary-500 flex items-center gap-2">
                        <Mail className="w-3 h-3" /> {app.email}
                      </div>
                      <div className="text-xs text-secondary-500 flex items-center gap-2">
                        <Phone className="w-3 h-3" /> {app.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">{t('Grade')} {app.grade}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-secondary-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(app.submittedAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(app.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStatusUpdate(app._id, 'approved')}
                        className="p-2 text-success-600 hover:bg-success-50 dark:hover:bg-success-900/20 rounded-lg transition-colors"
                        title="Approve"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(app._id, 'rejected')}
                        className="p-2 text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-lg transition-colors"
                        title="Reject"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredApplications.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-secondary-500 dark:text-secondary-400">
                    {t('No applications found matching your search.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdmissionsList;
