import React, { useState, useEffect } from 'react';
import { extraFeatures } from '../services/api';
import { Plus, BookOpen, Search, Filter } from 'lucide-react';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Homework = () => {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    class: '',
    dueDate: '',
    description: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await extraFeatures.getHomework();
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
      await extraFeatures.createHomework(formData);
      setShowModal(false);
      fetchData();
      setFormData({ title: '', subject: '', class: '', dueDate: '', description: '' });
    } catch (err) {
      alert('Failed to create homework');
    }
  };

  const columns = [
    { header: 'Title', accessor: 'title' },
    { header: 'Subject', accessor: 'subject' },
    { header: 'Class', accessor: 'class' },
    { 
      header: 'Due Date', 
      render: (item) => new Date(item.dueDate).toLocaleDateString() 
    },
    { header: 'Teacher', render: (item) => item.teacher?.name || 'N/A' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-secondary-900 tracking-tight">Homework Management</h1>
          <p className="text-secondary-500 font-medium mt-1">Assign and track student homework.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="w-5 h-5" />
          Add Homework
        </Button>
      </div>

      <Card className="p-0">
        <div className="p-6 border-b border-secondary-100 flex items-center justify-between">
           <div className="relative max-w-md w-full">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input type="text" placeholder="Search homework..." className="w-full pl-11 pr-4 py-2 bg-secondary-50 border border-secondary-100 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20" />
           </div>
        </div>
        <div className="p-2">
          <Table columns={columns} data={dataList} isLoading={loading} />
        </div>
      </Card>

      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title="Create New Homework"
        footer={
          <Button onClick={handleSubmit}>Save Homework</Button>
        }
      >
        <form className="space-y-4">
          <input 
            type="text" placeholder="Title" value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})}
            className="w-full px-4 py-2 bg-secondary-50 border border-secondary-100 rounded-xl outline-none"
          />
          <div className="grid grid-cols-2 gap-4">
            <input 
              type="text" placeholder="Subject" value={formData.subject} 
              onChange={e => setFormData({...formData, subject: e.target.value})}
              className="w-full px-4 py-2 bg-secondary-50 border border-secondary-100 rounded-xl outline-none"
            />
            <input 
              type="text" placeholder="Class" value={formData.class} 
              onChange={e => setFormData({...formData, class: e.target.value})}
              className="w-full px-4 py-2 bg-secondary-50 border border-secondary-100 rounded-xl outline-none"
            />
          </div>
          <input 
            type="date" value={formData.dueDate} 
            onChange={e => setFormData({...formData, dueDate: e.target.value})}
            className="w-full px-4 py-2 bg-secondary-50 border border-secondary-100 rounded-xl outline-none"
          />
          <textarea 
            placeholder="Description" value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full px-4 py-2 bg-secondary-50 border border-secondary-100 rounded-xl outline-none h-32"
          />
        </form>
      </Modal>
    </div>
  );
};

export default Homework;
