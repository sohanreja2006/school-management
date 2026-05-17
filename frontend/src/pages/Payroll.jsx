import React, { useState, useEffect } from 'react';
import { extraFeatures } from '../services/api';
import { Plus, Banknote, Search } from 'lucide-react';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Payroll = () => {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    staff: '',
    month: '',
    year: 2026,
    baseSalary: 0,
    allowances: 0,
    deductions: 0,
    totalSalary: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await extraFeatures.getSalaries();
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
      const total = Number(formData.baseSalary) + Number(formData.allowances) - Number(formData.deductions);
      await extraFeatures.processSalary({...formData, totalSalary: total});
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert('Failed to process salary');
    }
  };

  const columns = [
    { header: 'Staff Name', render: (item) => item.staff?.name || 'N/A' },
    { header: 'Month', accessor: 'month' },
    { header: 'Total Salary', render: (item) => `$${item.totalSalary}` },
    { header: 'Status', render: (item) => (
      <span className={`px-2 py-1 rounded text-xs font-bold ${item.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
        {item.status}
      </span>
    )},
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-secondary-900 tracking-tight">Payroll Management</h1>
          <p className="text-secondary-500 font-medium mt-1">Manage staff salaries and payments.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="w-5 h-5" />
          Process Salary
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
        title="Process Salary"
        footer={<Button onClick={handleSubmit}>Save Payroll</Button>}
      >
        <form className="space-y-4">
          <input type="text" placeholder="Staff ID" value={formData.staff} onChange={e => setFormData({...formData, staff: e.target.value})} className="w-full px-4 py-2 bg-secondary-50 border border-secondary-100 rounded-xl outline-none" />
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Month" value={formData.month} onChange={e => setFormData({...formData, month: e.target.value})} className="w-full px-4 py-2 bg-secondary-50 border border-secondary-100 rounded-xl outline-none" />
            <input type="number" placeholder="Year" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full px-4 py-2 bg-secondary-50 border border-secondary-100 rounded-xl outline-none" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <input type="number" placeholder="Base" value={formData.baseSalary} onChange={e => setFormData({...formData, baseSalary: e.target.value})} className="w-full px-4 py-2 bg-secondary-50 border border-secondary-100 rounded-xl outline-none" />
            <input type="number" placeholder="Allowances" value={formData.allowances} onChange={e => setFormData({...formData, allowances: e.target.value})} className="w-full px-4 py-2 bg-secondary-50 border border-secondary-100 rounded-xl outline-none" />
            <input type="number" placeholder="Deductions" value={formData.deductions} onChange={e => setFormData({...formData, deductions: e.target.value})} className="w-full px-4 py-2 bg-secondary-50 border border-secondary-100 rounded-xl outline-none" />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Payroll;
