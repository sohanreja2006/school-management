import React, { useState, useEffect } from 'react';
import { extraFeatures } from '../services/api';
import { Plus, Library, Search } from 'lucide-react';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const LibraryPage = () => {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    totalCopies: 1,
    availableCopies: 1,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await extraFeatures.getBooks();
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
      await extraFeatures.addBook(formData);
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert('Failed to add book');
    }
  };

  const columns = [
    { header: 'Title', accessor: 'title' },
    { header: 'Author', accessor: 'author' },
    { header: 'ISBN', accessor: 'isbn' },
    { header: 'Available', render: (item) => `${item.availableCopies} / ${item.totalCopies}` },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-secondary-900 tracking-tight">Library Management</h1>
          <p className="text-secondary-500 font-medium mt-1">Manage school books and inventory.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="w-5 h-5" />
          Add Book
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
        title="Add New Book"
        footer={<Button onClick={handleSubmit}>Add Book</Button>}
      >
        <form className="space-y-4">
          <input type="text" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 bg-secondary-50 border border-secondary-100 rounded-xl outline-none" />
          <input type="text" placeholder="Author" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} className="w-full px-4 py-2 bg-secondary-50 border border-secondary-100 rounded-xl outline-none" />
          <input type="text" placeholder="ISBN" value={formData.isbn} onChange={e => setFormData({...formData, isbn: e.target.value})} className="w-full px-4 py-2 bg-secondary-50 border border-secondary-100 rounded-xl outline-none" />
          <div className="grid grid-cols-2 gap-4">
            <input type="number" placeholder="Total Copies" value={formData.totalCopies} onChange={e => setFormData({...formData, totalCopies: e.target.value, availableCopies: e.target.value})} className="w-full px-4 py-2 bg-secondary-50 border border-secondary-100 rounded-xl outline-none" />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LibraryPage;
