import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  CreditCard, 
  Bell, 
  LogOut,
  GraduationCap,
  BarChart3,
  CalendarDays,
  Edit2,
  Trophy,
  ClipboardList,
  BookOpen,
  FileCheck,
  Truck,
  Library,
  Banknote,
  Package,
  Calendar,
  MessageSquare,
  History,
  Settings,
  ShieldCheck,
  GraduationCap as ExamIcon,
  User,
  UserCheck,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import i18n from '../i18n';
import { useTranslation } from 'react-i18next';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { logout, user } = useAuth();
  const { t } = useTranslation();

  const navItems = [
    { name: t('Dashboard'), path: '/dashboard', icon: LayoutDashboard },
    { name: t('Students'), path: '/students', icon: Users, roles: ['admin', 'teacher'] },
    { name: t('Staff & Faculty'), path: '/staff', icon: UserCheck, roles: ['admin'] },
    { name: t('Attendance'), path: '/attendance', icon: CalendarCheck, roles: ['admin', 'teacher'] },
    { name: t('Fees'), path: '/fees', icon: CreditCard, roles: ['admin', 'teacher'] },
    { name: t('Timetable'), path: '/timetable', icon: CalendarDays },
    { name: t('Reports'), path: '/reports', icon: BarChart3, roles: ['admin', 'teacher'] },
    { name: t('Exams'), path: '/exams', icon: GraduationCap, roles: ['admin', 'teacher'] },
    { name: t('Marks Entry'), path: '/marks-entry', icon: Edit2, roles: ['admin', 'teacher'] },
    { name: t('Results'), path: '/results', icon: Trophy },
    { name: t('Admissions'), path: '/admissions', icon: ClipboardList, roles: ['admin'] },
    { name: t('Homework'), path: '/homework', icon: BookOpen },
    { name: t('Leaves'), path: '/leaves', icon: FileCheck },
    { name: t('Library'), path: '/library', icon: Library },
    { name: t('Transport'), path: '/transport', icon: Truck },
    { name: t('Payroll'), path: '/payroll', icon: Banknote, roles: ['admin'] },
    { name: t('Inventory'), path: '/inventory', icon: Package, roles: ['admin'] },
    { name: t('Events'), path: '/events', icon: Calendar },
    { name: t('Messages'), path: '/messages', icon: MessageSquare },
    { name: t('Profile'), path: '/profile', icon: User },
    { name: t('Payment Settings'), path: '/payment-settings', icon: Settings, roles: ['admin'] },
    { name: t('Verification'), path: '/payment-verification', icon: ShieldCheck, roles: ['admin'] },
  ];

  const adminRoles = ['admin', 'principal', 'manager', 'director'];
  const userRole = user?.role || 'admin';
  const isAdminType = adminRoles.includes(userRole);

  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    if (isAdminType && item.roles.includes('admin')) return true;
    return item.roles.includes(userRole);
  });

  return (
    <aside className={`w-72 bg-primary-600 flex flex-col fixed lg:sticky top-0 lg:top-4 left-0 lg:left-4 h-full lg:h-[calc(100vh-2rem)] my-0 lg:my-4 ml-0 lg:ml-4 rounded-none lg:rounded-[2.5rem] z-50 lg:z-30 shadow-2xl overflow-hidden transition-transform duration-300 ease-in-out ${
      isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    }`}>
      <div className="p-8 flex flex-col gap-6 relative">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-6 right-6 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl lg:hidden transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center overflow-hidden">
            {user?.schoolLogo ? (
              <img src={user.schoolLogo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <GraduationCap className="w-7 h-7 text-white" />
            )}
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight text-white block leading-none">{t('Academix')}</span>
            {user?.schoolName && (
              <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mt-1 block truncate max-w-[140px]">
                {user.schoolName}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            value={i18n.language}
            className="text-xs bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-1.5 outline-none focus:ring-1 focus:ring-white/50 text-white"
          >
            <option value="en" className="text-secondary-900">EN</option>
            <option value="bn" className="text-secondary-900">বাংলা</option>
            <option value="hi" className="text-secondary-900">हिन्दी</option>
          </select>
          
          <button 
            onClick={() => document.documentElement.classList.toggle('dark')}
            className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-colors"
          >
            <div className="dark:hidden">🌙</div>
            <div className="hidden dark:block">☀️</div>
          </button>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group relative ${
                isActive
                  ? 'text-white bg-white/20 shadow-lg'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
            <span className="font-semibold text-sm">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-6 mt-auto">
        <button
          onClick={logout}
          className="flex items-center gap-4 px-5 py-4 w-full text-white/70 hover:text-white hover:bg-white/10 rounded-2xl transition-all duration-300 group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold">{t('Sign Out')}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
