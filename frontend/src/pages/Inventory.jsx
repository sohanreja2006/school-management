import React, { useState, useEffect } from 'react';
import { extraFeatures } from '../services/api';
import { Plus, Package, Search } from 'lucide-react';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Inventory = () => {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'IT',
    serialNumber: '',
    cost: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await extraFeatures.getAssets();
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
      await extraFeatures.addAsset(formData);
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert('Failed to add asset');
    }
  };

  const columns = [
    { header: 'Asset Name', accessor: 'name' },
    { header: 'Category', accessor: 'category' },
    { header: 'Cost', render: (item) => `$${item.cost}` },
    { header: 'Status', accessor: 'status' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-secondary-900 tracking-tight">Inventory Management</h1>
          <p className="text-secondary-500 font-medium mt-1">Track school assets and equipment.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="w-5 h-5" />
          Add Asset
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
        title="Add New Asset"
        footer={<Button onClick={handleSubmit}>Save Asset</Button>}
      >
        <form className="space-y-4">
          <input type="text" placeholder="Asset Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-secondary-50 border border-secondary-100 rounded-xl outline-none" />
          <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 bg-secondary-50 border border-secondary-100 rounded-xl outline-none">
            <option value="IT">IT</option>
            <option value="Lab">Lab</option>
            <option value="Sports">Sports</option>
            <option value="Furniture">Furniture</option>
          </select>
          <input type="text" placeholder="Serial Number" value={formData.serialNumber} onChange={e => setFormData({...formData, serialNumber: e.target.value})} className="w-full px-4 py-2 bg-secondary-50 border border-secondary-100 rounded-xl outline-none" />
          <input type="number" placeholder="Cost" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} className="w-full px-4 py-2 bg-secondary-50 border border-secondary-100 rounded-xl outline-none" />
        </form>
      </Modal>
    </div>
  );
};

export default Inventory;
