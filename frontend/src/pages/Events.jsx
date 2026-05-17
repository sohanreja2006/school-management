import React, { useState, useEffect } from 'react';
import { extraFeatures } from '../services/api';
import { Plus, Calendar, Search } from 'lucide-react';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Events = () => {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Academic',
    startDate: '',
    endDate: '',
    location: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await extraFeatures.getEvents();
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
      await extraFeatures.createEvent(formData);
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert('Failed to create event');
    }
  };

  const columns = [
    { header: 'Event Title', accessor: 'title' },
    { header: 'Type', accessor: 'type' },
    { header: 'Start Date', render: (item) => new Date(item.startDate).toLocaleDateString() },
    { header: 'Location', accessor: 'location' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-secondary-900 tracking-tight">Events Calendar</h1>
          <p className="text-secondary-500 font-medium mt-1">Manage school events and holidays.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="w-5 h-5" />
          Add Event
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
        title="Add New Event"
        footer={<Button onClick={handleSubmit}>Create Event</Button>}
      >
        <form className="space-y-4">
          <input type="text" placeholder="Event Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 bg-secondary-50 border border-secondary-100 rounded-xl outline-none" />
          <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2 bg-secondary-50 border border-secondary-100 rounded-xl outline-none">
            <option value="Academic">Academic</option>
            <option value="Holiday">Holiday</option>
            <option value="Sports">Sports</option>
            <option value="Cultural">Cultural</option>
            <option value="PTM">PTM</option>
          </select>
          <div className="grid grid-cols-2 gap-4">
            <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full px-4 py-2 bg-secondary-50 border border-secondary-100 rounded-xl outline-none" />
            <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full px-4 py-2 bg-secondary-50 border border-secondary-100 rounded-xl outline-none" />
          </div>
          <input type="text" placeholder="Location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2 bg-secondary-50 border border-secondary-100 rounded-xl outline-none" />
        </form>
      </Modal>
    </div>
  );
};

export default Events;
