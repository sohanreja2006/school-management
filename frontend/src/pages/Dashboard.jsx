import React, { useState, useEffect } from 'react';
import {
  Users,
  CreditCard,
  CalendarCheck,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { students, fees, attendance, admissions } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTranslation } from 'react-i18next';

const WelcomeBanner = ({ name, schoolName }) => (
  <div className="relative overflow-hidden bg-gradient-to-r from-primary-500 to-primary-400 rounded-[2.5rem] p-6 sm:p-10 text-white mb-10 shadow-xl shadow-primary-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
    <div className="relative z-10 max-w-lg">
      <div className="flex items-center gap-3 mb-2">
        <p className="text-white/80 font-medium text-sm">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        {schoolName && (
          <>
            <span className="w-1 h-1 bg-white/40 rounded-full"></span>
            <p className="text-white font-bold text-xs uppercase tracking-widest">{schoolName}</p>
          </>
        )}
      </div>
      <h2 className="text-3xl sm:text-5xl font-bold mb-4 tracking-tight leading-tight">Welcome back, {name}!</h2>
      <p className="text-white/80 text-sm sm:text-lg">Always stay updated in your student portal. Check your latest updates and activities below.</p>
    </div>

    <div className="hidden lg:block relative z-10 w-[450px] h-64">
      {/* Premium Glow Effect */}
      <div className="absolute inset-0 bg-primary-400/20 blur-[80px] rounded-full scale-110 translate-x-1/4"></div>

      <img
        src="/teacher-duo.png"
        alt="Teacher Duo"
        className="absolute bottom-[-40px] right-0 h-[140%] w-auto object-contain z-20 drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] mix-blend-multiply"
      />
    </div>

    {/* Decorative 3D-like shapes */}
    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
    <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-primary-300/30 rounded-full translate-y-1/2 blur-2xl"></div>
  </div>
);

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white dark:bg-secondary-800 p-8 rounded-[2rem] border border-secondary-100 dark:border-secondary-700 shadow-sm hover:shadow-md transition-all duration-300 group">
    <div className="flex flex-col gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div>
        <h3 className="text-3xl font-bold text-secondary-900 dark:text-white">{value}</h3>
        <p className="text-secondary-500 dark:text-secondary-400 text-sm font-medium mt-1">{title}</p>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    studentCount: 0,
    totalCollected: 0,
    pendingFees: 0,
    attendanceRate: 85,
  });
  const [loading, setLoading] = useState(true);

  const [chartData, setChartData] = useState([
    { name: t('Mon'), attendance: 82 },
    { name: t('Tue'), attendance: 88 },
    { name: t('Wed'), attendance: 85 },
    { name: t('Thu'), attendance: 90 },
    { name: t('Fri'), attendance: 87 },
  ]);

  const [feeData, setFeeData] = useState([
    { name: t('Jan'), collected: 4000, pending: 2400 },
    { name: t('Feb'), collected: 3000, pending: 1398 },
    { name: t('Mar'), collected: 2000, pending: 9800 },
    { name: t('Apr'), collected: 2780, pending: 3908 },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentRes, feeRes, attRes, feeHistRes] = await Promise.all([
          students.getAll(),
          fees.getStats(),
          attendance.get(),
          fees.getHistory()
        ]);

        const allAtt = attRes.data?.data || [];
        let totalMarked = 0;
        let totalPresent = 0;

        const dayStats = {
          1: { present: 0, total: 0, name: t('Mon') },
          2: { present: 0, total: 0, name: t('Tue') },
          3: { present: 0, total: 0, name: t('Wed') },
          4: { present: 0, total: 0, name: t('Thu') },
          5: { present: 0, total: 0, name: t('Fri') },
        };

        allAtt.forEach(a => {
          totalMarked += 1;
          const s = (a.status || '').toLowerCase().trim();
          if (s === 'present' || s === 'late') {
            totalPresent += 1;
          }
          if (!a.date) return;
          const d = new Date(a.date);
          const day = d.getDay();
          if (day >= 1 && day <= 5) {
            dayStats[day].total += 1;
            if (s === 'present' || s === 'late') {
              dayStats[day].present += 1;
            }
          }
        });

        const realAttRate = totalMarked > 0 ? Math.round((totalPresent / totalMarked) * 100) : 92;

        setStats({
          studentCount: studentRes.data?.count || studentRes.data?.data?.length || 0,
          totalCollected: feeRes.data?.data?.totalCollected || 0,
          pendingFees: feeRes.data?.data?.pending || 0,
          attendanceRate: realAttRate
        });

        const calculatedChartData = [1, 2, 3, 4, 5].map(day => {
          const ds = dayStats[day];
          const rate = ds.total > 0 ? Math.round((ds.present / ds.total) * 100) : realAttRate;
          return { name: ds.name, attendance: rate };
        });
        setChartData(calculatedChartData);

        const allHist = feeHistRes.data?.data || [];
        const totalExpected = feeRes.data?.data?.totalExpected || 500000;
        const monthNames = [t('Jan'), t('Feb'), t('Mar'), t('Apr'), t('May'), t('Jun'), t('Jul'), t('Aug'), t('Sep'), t('Oct'), t('Nov'), t('Dec')];

        const monthlyCollected = {};
        allHist.forEach(p => {
          if (!p.paymentDate && !p.created_at) return;
          const d = new Date(p.paymentDate || p.created_at);
          const m = d.getMonth();
          monthlyCollected[m] = (monthlyCollected[m] || 0) + Number(p.amount || 0);
        });

        const displayMonths = [0, 1, 2, 3, 4]; // Jan to May
        const monthlyExpected = Math.round(totalExpected / 12);

        const calculatedFeeData = displayMonths.map(mIndex => {
          const collected = monthlyCollected[mIndex] || 0;
          const pending = Math.max(0, monthlyExpected - collected);
          return {
            name: monthNames[mIndex],
            collected,
            pending
          };
        });
        setFeeData(calculatedFeeData);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [t]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-64 bg-secondary-100 dark:bg-secondary-800 rounded-[2.5rem]" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-secondary-50 dark:bg-secondary-800/50 rounded-[2rem]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <WelcomeBanner name={user?.name || 'John'} schoolName={user?.schoolName} />

      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">{t("School Overview")}</h2>
          <button className="text-primary-600 font-bold text-sm hover:underline">{t("See all")}</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title={t("Total Students")}
            value={stats.studentCount.toLocaleString()}
            icon={Users}
            color="bg-primary-500 text-primary-500"
          />
          <StatCard
            title={t("Total Paid")}
            value={`$${stats.totalCollected.toLocaleString()}`}
            icon={TrendingUp}
            color="bg-primary-500 text-primary-500"
          />
          <StatCard
            title={t("Pending Dues")}
            value={`$${stats.pendingFees.toLocaleString()}`}
            icon={CreditCard}
            color="bg-primary-500 text-primary-500"
          />
          <StatCard
            title={t("Overall Attendance")}
            value={`${stats.attendanceRate}%`}
            icon={CalendarCheck}
            color="bg-primary-500 text-primary-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <Card title={t("Attendance Trends")} subtitle={t("Weekly school attendance data")}>
          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dx={-10} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', boxShadow: '0 10px 40px -10px rgba(139, 92, 246, 0.2)', padding: '12px' }}
                  itemStyle={{ color: '#8b5cf6', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="attendance" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorAtt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title={t("Revenue Growth")} subtitle={t("Monthly collection vs pending dues")}>
          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dx={-10} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', boxShadow: '0 10px 40px -10px rgba(139, 92, 246, 0.2)', padding: '12px' }}
                  cursor={{ fill: 'rgba(139, 92, 246, 0.05)' }}
                />
                <Bar dataKey="collected" fill="#8b5cf6" radius={[8, 8, 0, 0]} barSize={32} />
                <Bar dataKey="pending" fill="#f43f5e" radius={[8, 8, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

    </div>
  );
};

export default Dashboard;

