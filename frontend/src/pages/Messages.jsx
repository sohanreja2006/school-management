import React from 'react';
import { MessageSquare, Bell } from 'lucide-react';
import Card from '../components/ui/Card';

const Messages = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-secondary-900 tracking-tight">Messages & Communication</h1>
        <p className="text-secondary-500 font-medium mt-1">Connect with parents and teachers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-8 flex flex-col items-center text-center space-y-4 hover:shadow-xl transition-all cursor-pointer border-emerald-100 bg-emerald-50/30">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-secondary-900">Direct Messages</h3>
          <p className="text-sm text-secondary-500">Secure chat with parents and staff.</p>
          <span className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-full">Coming Soon</span>
        </Card>

        <Card className="p-8 flex flex-col items-center text-center space-y-4 hover:shadow-xl transition-all cursor-pointer border-blue-100 bg-blue-50/30">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
            <Bell className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-secondary-900">Announcements</h3>
          <p className="text-sm text-secondary-500">Broadcast news to the entire school.</p>
          <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase rounded-full">Active</span>
        </Card>
      </div>
    </div>
  );
};

export default Messages;
