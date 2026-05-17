import React, { useState, useEffect } from 'react';
import { extraFeatures } from '../services/api';
import { Plus, FileCheck, Search } from 'lucide-react';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Leaves = () => {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    type: 'Student',
    appliedBy: 'Self'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await extraFeatures.getLeaves();
      setDataList(data.data);
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
    try {
      await extraFeatures.applyLeave(formData);
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert('Failed to apply for leave');
    }
  };

  const columns = [
    { header: 'User', render: (item) => item.user?.name || 'N/A' },
    { header: 'Type', accessor: 'type' },
    { header: 'Start Date', render: (item) => new Date(item.startDate).toLocaleDateString() },
    { header: 'End Date', render: (item) => new Date(item.endDate).toLocaleDateString() },
    { header: 'Status', render: (item) => (
      <span className={`px-2 py-1 rounded text-xs font-bold ${
        item.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 
        item.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
      }`}>
        {item.status}
      </span>
    )},
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-secondary-900 tracking-tight">Leave Management</h1>
          <p className="text-secondary-500 font-medium mt-1">Manage and track leave requests.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="w-5 h-5" />
          Apply for Leave
        </Button>
      </div>

      <Card className="p-0">
        <div className="p-2">
          <Table columns={columns} data={dataList} isLoading={loading} />
        </div>
      </Card>

      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title="Apply for Leave"
        footer={<Button onClick={handleSubmit}>Submit Request</Button>}
      >
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full px-4 py-2 bg-secondary-50 border border-secondary-100 rounded-xl outline-none" />
            <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full px-4 py-2 bg-secondary-50 border border-secondary-100 rounded-xl outline-none" />
          </div>
          <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2 bg-secondary-50 border border-secondary-100 rounded-xl outline-none">
            <option value="Student">Student</option>
            <option value="Teacher">Teacher</option>
            <option value="Staff">Staff</option>
          </select>
          <textarea placeholder="Reason" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="w-full px-4 py-2 bg-secondary-50 border border-secondary-100 rounded-xl outline-none h-32" />
        </form>
      </Modal>
    </div>
  );
};

export default Leaves;
