import React, { useState, useEffect } from 'react';
import { notifications } from '../services/api';
import { Bell, CheckCircle2, Clock, Info, X } from 'lucide-react';

const NotificationTray = ({ isOpen, onClose }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const { data } = await notifications.getAll();
      setItems(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await notifications.markAsRead(id);
      setItems(items.map(item => (item.id || item._id) === id ? { ...item, isRead: true } : item));
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-20 right-10 w-96 bg-white rounded-3xl shadow-2xl border border-secondary-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="p-6 border-b border-secondary-100 flex items-center justify-between bg-secondary-50/50">
        <h3 className="font-black text-secondary-900 tracking-tight">Notifications</h3>
        <button onClick={onClose} className="p-1.5 hover:bg-secondary-100 rounded-xl transition-all">
          <X size={18} className="text-secondary-500" />
        </button>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-secondary-400 font-bold uppercase tracking-widest text-xs">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <Bell size={40} className="mx-auto text-secondary-200 mb-4" />
            <p className="text-secondary-500 font-medium">All caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-secondary-50">
            {items.map((item) => (
              <div 
                key={item.id || item._id} 
                className={`p-5 hover:bg-secondary-50 transition-all cursor-pointer group relative ${!item.isRead ? 'bg-primary-50/30' : ''}`}
                onClick={() => markRead(item.id || item._id)}
              >
                <div className="flex gap-4">
                  <div className={`p-2.5 rounded-2xl h-fit ${
                    item.type === 'Fee' ? 'bg-rose-100 text-rose-600' :
                    item.type === 'Attendance' ? 'bg-amber-100 text-amber-600' :
                    'bg-indigo-100 text-indigo-600'
                  }`}>
                    {item.type === 'Fee' ? <Clock size={18} /> : 
                     item.type === 'Attendance' ? <Info size={18} /> : 
                     <CheckCircle2 size={18} />}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold text-secondary-900 ${!item.isRead ? 'pr-4' : ''}`}>
                      {item.title}
                    </p>
                    <p className="text-xs text-secondary-500 mt-1 leading-relaxed">{item.message}</p>
                    <p className="text-[10px] font-black text-secondary-300 uppercase mt-3 tracking-widest">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {!item.isRead && (
                    <div className="absolute top-6 right-6 w-2 h-2 bg-primary-600 rounded-full shadow-lg shadow-primary-500/50"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-secondary-50/50 text-center border-top border-secondary-100">
        <button className="text-xs font-black text-primary-600 uppercase tracking-widest hover:text-primary-700 transition-all">
          View All Activity
        </button>
      </div>
    </div>
  );
};

export default NotificationTray;
