import React, { useState, useEffect } from 'react';
import { parentService } from '../services/api';
import { 
  Calendar, 
  CreditCard, 
  Trophy, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  TrendingUp,
  User,
  BookOpen,
  FileText,
  Download,
  CalendarDays,
  Bell,
  LogOut,
  GraduationCap
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ParentDashboard = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchChildData = async () => {
      try {
        const response = await parentService.getChildData();
        setData(response.data.data);
      } catch (err) {
        console.error('Error fetching child data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChildData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('parentToken');
    setUser(null);
    navigate('/parent-login');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 font-bold animate-pulse">Synchronizing Academic Data...</p>
      </div>
    </div>
  );

  if (!data) return (
    <div className="p-10 text-center text-red-500 bg-red-50 min-h-screen flex flex-col items-center justify-center">
      <AlertCircle className="w-16 h-16 mb-4" />
      <h2 className="text-2xl font-black mb-2">Sync Error</h2>
      <p className="font-bold">No student record linked to this email. Please contact the school office.</p>
      <Button onClick={handleLogout} variant="secondary" className="mt-6">Back to Login</Button>
    </div>
  );

  const { student, attendance, fees, marks, schedules, notifications } = data;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 font-outfit">
      {/* Premium Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 backdrop-blur-md bg-white/80">
        <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 leading-none">Academix</h2>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Parent Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-primary-600 transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-red-50 hover:text-red-600 text-gray-600 rounded-xl transition-all font-bold text-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-8 space-y-8">
        {/* Profile Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-gray-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary-500/20 transition-all duration-700"></div>
          <div className="relative flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-xl border-4 border-white/10 flex items-center justify-center bg-gradient-to-tr from-primary-500 to-primary-700">
              {student.photo ? (
                <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-black text-white">{student.name.charAt(0)}</span>
              )}
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-black tracking-tight">{student.name}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
                <span className="px-4 py-1.5 bg-white/10 rounded-full text-xs font-bold backdrop-blur-md border border-white/10">Class {student.class}</span>
                <span className="px-4 py-1.5 bg-white/10 rounded-full text-xs font-bold backdrop-blur-md border border-white/10">Roll No: {student.rollNumber}</span>
                <span className="px-4 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold backdrop-blur-md border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Active Student
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="rounded-2xl px-6 py-4 bg-white text-gray-900 hover:bg-gray-100 font-bold shadow-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Report Card
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
          {['overview', 'attendance', 'fees', 'marks'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab 
                  ? 'bg-white text-primary-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card onClick={() => setActiveTab('attendance')} className="p-6 rounded-[2rem] border-none shadow-sm bg-blue-50/50 group hover:scale-[1.02] transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-200">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-100 px-2 py-1 rounded-lg">Attendance</span>
                </div>
                <p className="text-4xl font-black text-gray-900">{attendance.percentage}%</p>
                <p className="text-sm font-bold text-gray-500 mt-1">Monthly Average</p>
                <div className="mt-4 w-full bg-blue-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{width: `${attendance.percentage}%`}}></div>
                </div>
              </Card>

              <Card onClick={() => setActiveTab('fees')} className="p-6 rounded-[2rem] border-none shadow-sm bg-orange-50/50 group hover:scale-[1.02] transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-orange-500 text-white rounded-2xl shadow-lg shadow-orange-200">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-orange-600 bg-orange-100 px-2 py-1 rounded-lg">Fees Status</span>
                </div>
                <p className="text-4xl font-black text-gray-900">${fees.balance}</p>
                <p className="text-sm font-bold text-gray-500 mt-1">Pending Balance</p>
                <button className="mt-4 text-xs font-bold text-orange-600 hover:underline">Pay Now via UPI/Card →</button>
              </Card>

              <Card onClick={() => setActiveTab('marks')} className="p-6 rounded-[2rem] border-none shadow-sm bg-purple-50/50 group hover:scale-[1.02] transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-purple-500 text-white rounded-2xl shadow-lg shadow-purple-200">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-purple-600 bg-purple-100 px-2 py-1 rounded-lg">Last Exam</span>
                </div>
                <p className="text-4xl font-black text-gray-900">A+</p>
                <p className="text-sm font-bold text-gray-500 mt-1">Overall Performance</p>
                <div className="mt-4 flex gap-1">
                   <div className="px-2 py-1 bg-purple-200 text-[10px] font-bold text-purple-700 rounded-md">Top Scorer</div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-8 rounded-[2.5rem] border-none shadow-sm">
                <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                  <Clock className="w-6 h-6 text-primary-500" /> Today's Schedule
                </h3>
                <div className="space-y-4">
                  {schedules.length === 0 ? (
                    <p className="text-gray-400 font-bold text-center py-10">No classes today.</p>
                  ) : (
                    schedules.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-6 p-4 bg-gray-50 rounded-2xl">
                        <div className="w-20 text-center">
                          <p className="text-sm font-black text-gray-900">{item.start_time}</p>
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">{item.subjects?.name || 'Subject'}</p>
                          <p className="text-xs text-gray-500 font-medium">Room {item.room_number || 'N/A'}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              <Card className="p-8 rounded-[2.5rem] border-none shadow-sm">
                <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                  <Bell className="w-6 h-6 text-rose-500" /> Notifications
                </h3>
                <div className="space-y-6">
                  {notifications.length === 0 ? (
                    <p className="text-gray-400 font-bold text-center py-10">No announcements.</p>
                  ) : (
                    notifications.map((notif, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="w-2 h-2 rounded-full bg-rose-500 mt-2"></div>
                        <div>
                          <p className="font-bold text-gray-900">{notif.title}</p>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </>
        )}

        {activeTab === 'attendance' && (
          <Card className="p-8 rounded-[2.5rem] border-none shadow-sm">
            <h3 className="text-2xl font-black text-gray-900 mb-8">Attendance History</h3>
            <div className="space-y-4">
              {attendance.history.map((record, idx) => (
                <div key={idx} className="flex items-center justify-between p-5 bg-gray-50 rounded-3xl border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${record.status === 'present' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {record.status === 'present' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 capitalize">{record.status}</p>
                      <p className="text-xs font-bold text-gray-400">{new Date(record.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'fees' && (
          <Card className="p-8 rounded-[2.5rem] border-none shadow-sm">
            <h3 className="text-2xl font-black text-gray-900 mb-8">Fee Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                <p className="text-xs font-black text-emerald-600 uppercase mb-2">Paid</p>
                <p className="text-4xl font-black text-emerald-700">${fees.paid}</p>
              </div>
              <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100">
                <p className="text-xs font-black text-rose-600 uppercase mb-2">Due</p>
                <p className="text-4xl font-black text-rose-700">${fees.balance}</p>
              </div>
            </div>
            <div className="space-y-4">
              {fees.payments.map((payment, idx) => (
                <div key={idx} className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-3xl">
                  <div className="flex items-center gap-4">
                    <TrendingUp className="text-emerald-500" />
                    <div>
                      <p className="font-bold text-gray-900">{payment.fee_type || 'Monthly Fees'}</p>
                      <p className="text-xs font-bold text-gray-400">{new Date(payment.payment_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className="text-xl font-black text-emerald-600">+ ${payment.amount}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'marks' && (
          <Card className="p-8 rounded-[2.5rem] border-none shadow-sm">
            <h3 className="text-2xl font-black text-gray-900 mb-8">Academic Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {marks.map((mark, idx) => (
                <div key={idx} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex justify-between items-center">
                  <div>
                    <p className="text-lg font-black text-gray-900">{mark.subjects?.name || 'Subject'}</p>
                    <p className="text-xs font-bold text-gray-500">{mark.exams?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-primary-600">{mark.marks_obtained}</p>
                    <p className="text-[10px] font-bold text-gray-400">/ {mark.total_marks}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;
