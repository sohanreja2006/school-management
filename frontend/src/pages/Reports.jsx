import React, { useState, useEffect } from 'react';
import { students, fees } from '../services/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Download, Filter, TrendingUp, Users, CreditCard, Calendar } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { exportToCSV } from '../utils/exportUtils';
import { useTranslation } from 'react-i18next';

const Reports = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [feeStats, setFeeStats] = useState({ totalExpected: 0, totalCollected: 0, pending: 0 });
  const [studentData, setStudentData] = useState([]);
  const [filterClass, setFilterClass] = useState('All');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [feeRes, studentRes] = await Promise.all([
        fees.getStats(),
        students.getAll()
      ]);
      setFeeStats(feeRes.data?.data || { totalExpected: 0, totalCollected: 0, pending: 0 });
      setStudentData(studentRes.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ede9fe'];

  const pieData = [
    { name: 'Collected', value: feeStats.totalCollected },
    { name: 'Pending', value: feeStats.pending }
  ];

  const classData = studentData.reduce((acc, student) => {
    const className = student.class || 'Unknown';
    if (!acc[className]) acc[className] = { name: className, students: 0, collected: 0 };
    acc[className].students += 1;
    acc[className].collected += (student.paidFees || 0);
    return acc;
  }, {});

  const barData = Object.values(classData);

  const handleExport = () => {
    const data = studentData.map(s => ({
      Name: s.name,
      Class: s.class,
      TotalFees: s.totalFees,
      PaidFees: s.paidFees,
      Balance: s.totalFees - (s.paidFees || 0)
    }));
    exportToCSV(data, 'Academix_financial_report');
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary-900 dark:text-white tracking-tight">{t('Advanced Reports')}</h1>
          <p className="text-secondary-500 dark:text-secondary-400 font-medium mt-1">{t('Deep dive into school performance and financials.')}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleExport} className="gap-2">
            <Download size={18} />
            {t('Export CSV')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary-600 dark:bg-primary-700 text-white border-none shadow-xl shadow-primary-500/20">
          <TrendingUp className="mb-4 opacity-50" size={32} />
          <p className="text-primary-100 text-xs font-black uppercase tracking-widest">{t('Total Collection')}</p>
          <h3 className="text-4xl font-black mt-1">${feeStats.totalCollected.toLocaleString()}</h3>
          <p className="text-primary-200 text-xs mt-4 font-bold">↑ 12% {t('from last month')}</p>
        </Card>
        <Card className="dark:bg-secondary-800 dark:border-secondary-700">
          <Users className="text-primary-600 dark:text-primary-400 mb-4" size={32} />
          <p className="text-secondary-400 dark:text-secondary-500 text-xs font-black uppercase tracking-widest">{t('Total Students')}</p>
          <h3 className="text-4xl font-black text-secondary-900 dark:text-white mt-1">{studentData.length}</h3>
          <p className="text-secondary-500 dark:text-secondary-400 text-xs mt-4 font-bold">{t('Active enrollment')}</p>
        </Card>
        <Card className="dark:bg-secondary-800 dark:border-secondary-700">
          <CreditCard className="text-rose-500 mb-4" size={32} />
          <p className="text-secondary-400 dark:text-secondary-500 text-xs font-black uppercase tracking-widest">{t('Pending Dues')}</p>
          <h3 className="text-4xl font-black text-rose-600 dark:text-rose-400 mt-1">${feeStats.pending.toLocaleString()}</h3>
          <p className="text-rose-500 dark:text-rose-400 text-xs mt-4 font-bold">{t('Requires attention')}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title={t("Fee Collection by Class")} subtitle={t("Distribution of revenue across classes")} className="dark:bg-secondary-800 dark:border-secondary-700">
          <div className="h-80 w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={document.documentElement.classList.contains('dark') ? '#334155' : '#f1f5f9'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: document.documentElement.classList.contains('dark') ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: document.documentElement.classList.contains('dark') ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: 700}} dx={-10} />
                <Tooltip 
                  cursor={{fill: document.documentElement.classList.contains('dark') ? '#1e293b' : '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px', backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#fff', color: document.documentElement.classList.contains('dark') ? '#fff' : '#000'}}
                />
                <Bar dataKey="collected" fill="#8b5cf6" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title={t("Collection Status")} subtitle={t("Overall payment completion rate")} className="dark:bg-secondary-800 dark:border-secondary-700">
          <div className="h-80 w-full mt-6 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black text-secondary-900 dark:text-white">
                {feeStats.totalExpected ? Math.round((feeStats.totalCollected / feeStats.totalExpected) * 100) : 0}%
              </span>
              <span className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">{t('Collected')}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card title={t("Detailed Class Statistics")} p={0} className="dark:bg-secondary-800 dark:border-secondary-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary-50/50 dark:bg-secondary-900/50">
                <th className="px-8 py-5 text-xs font-black text-secondary-500 dark:text-secondary-400 uppercase tracking-widest">{t('Class Name')}</th>
                <th className="px-8 py-5 text-xs font-black text-secondary-500 dark:text-secondary-400 uppercase tracking-widest">{t('Students')}</th>
                <th className="px-8 py-5 text-xs font-black text-secondary-500 dark:text-secondary-400 uppercase tracking-widest">{t('Collected')}</th>
                <th className="px-8 py-5 text-xs font-black text-secondary-500 dark:text-secondary-400 uppercase tracking-widest">{t('Progress')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-50 dark:divide-secondary-700">
              {barData.map((row, idx) => (
                <tr key={idx} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-900/50 transition-all">
                  <td className="px-8 py-5 font-bold text-secondary-900 dark:text-white">{t('Class')} {row.name}</td>
                  <td className="px-8 py-5 text-secondary-500 dark:text-secondary-400 font-bold">{row.students} {t('Students')}</td>
                  <td className="px-8 py-5 font-black text-emerald-600 dark:text-emerald-400">${row.collected.toLocaleString()}</td>
                  <td className="px-8 py-5">
                    <div className="w-full bg-secondary-100 dark:bg-secondary-700 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary-600 h-full rounded-full" 
                        style={{ width: `${Math.min(100, (row.collected / (row.students * 5000)) * 100)}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Reports;
