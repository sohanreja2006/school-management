import React from 'react';
import { Link } from 'react-router-dom';
import LandingNavbar from '../components/LandingNavbar';
import { 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  BarChart3, 
  Users, 
  MessageSquare, 
  Smartphone,
  ChevronRight,
  Sparkles,
  Zap,
  GraduationCap,
  Briefcase,
  Layers,
  Search,
  Check,
  BookOpen,
  FileText,
  CalendarDays,
  CreditCard,
  UserCheck,
  Award,
  ShoppingCart
} from 'lucide-react';

const Home = () => {
  const modules = [
    { title: 'Student Management', icon: <Users className="w-6 h-6" />, color: 'bg-blue-500' },
    { title: 'Staff Management', icon: <Briefcase className="w-6 h-6" />, color: 'bg-indigo-500' },
    { title: 'Fee Management', icon: <Zap className="w-6 h-6" />, color: 'bg-teal-500' },
    { title: 'Exam Management', icon: <GraduationCap className="w-6 h-6" />, color: 'bg-purple-500' },
    { title: 'Attendance Tracking', icon: <Clock className="w-6 h-6" />, color: 'bg-orange-500' },
    { title: 'Library Management', icon: <BookOpen className="w-6 h-6" />, color: 'bg-pink-500' },
    { title: 'Transport / Bus', icon: <Smartphone className="w-6 h-6" />, color: 'bg-blue-400' },
    { title: 'Inventory & Stock', icon: <Search className="w-6 h-6" />, color: 'bg-green-500' },
    { title: 'Payroll Management', icon: <CreditCard className="w-6 h-6" />, color: 'bg-slate-700' },
    { title: 'Messaging & Alerts', icon: <MessageSquare className="w-6 h-6" />, color: 'bg-red-500' },
    { title: 'Online Admissions', icon: <UserCheck className="w-6 h-6" />, color: 'bg-cyan-500' },
    { title: 'Timetable Maker', icon: <CalendarDays className="w-6 h-6" />, color: 'bg-amber-500' },
    { title: 'ID Cards Generator', icon: <ShieldCheck className="w-6 h-6" />, color: 'bg-emerald-500' },
    { title: 'Question Papers', icon: <FileText className="w-6 h-6" />, color: 'bg-rose-500' },
    { title: 'Homework Tracking', icon: <Layers className="w-6 h-6" />, color: 'bg-fuchsia-500' },
    { title: 'Behavior & Skills', icon: <Sparkles className="w-6 h-6" />, color: 'bg-yellow-500' },
    { title: 'Certificates & Reports', icon: <Award className="w-6 h-6" />, color: 'bg-lime-500' },
    { title: 'Online Store & POS', icon: <ShoppingCart className="w-6 h-6" />, color: 'bg-sky-500' },
  ];

  const solutions = [
    { 
      title: 'For Schools', 
      desc: 'Comprehensive ERP solution for primary and secondary schools.',
      features: ['Attendance Tracking', 'Online Fees', 'Report Cards', 'Parent App']
    },
    { 
      title: 'For Colleges', 
      desc: 'Scalable management for higher education and universities.',
      features: ['Course Scheduling', 'LMS Integration', 'Advanced Analytics', 'Hostel Management'],
      comingSoon: true
    },
    { 
      title: 'For Coaching Centers', 
      desc: 'Focused tools for tutorial centers and competitive exam prep.',
      features: ['Batch Management', 'Mock Tests', 'Performance Tracking', 'Lead Management']
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-56 lg:pb-40 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[800px] h-[800px] bg-blue-50 rounded-full blur-[120px] -z-10 opacity-60"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left z-10">
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.05] tracking-tight mb-8 font-outfit">
                Next generation <br />
                <span className="text-blue-600">School Management</span> <br />
                Software
              </h1>
              
              <p className="text-lg lg:text-xl text-slate-500 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-montserrat font-medium">
                The ultimate solution for your school and colleges. Managed with ease.
                Our cloud-based platform automates everything from admissions to graduation.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
                <a 
                  href="#features"
                  className="px-8 py-5 bg-blue-600 text-white font-black rounded-full shadow-2xl shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 font-outfit uppercase tracking-widest text-xs"
                >
                  Explore Modules
                  <ArrowRight className="w-5 h-5" />
                </a>
                
                <Link 
                  to="/signup" 
                  className="px-8 py-5 text-slate-700 font-black hover:text-blue-600 transition-colors flex items-center gap-2 font-outfit uppercase tracking-widest text-xs"
                >
                  Request A Demo
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Image/Mockup */}
            <div className="flex-1 relative">
              <div className="relative z-10 w-full max-w-[650px] mx-auto">
                <div className="bg-white p-2 rounded-[2.5rem] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.12)] border border-slate-100 relative overflow-hidden">
                  <img 
                    src="/illustrations/dashboard-mockup.png" 
                    alt="Academix Dashboard" 
                    className="w-full h-auto rounded-3xl"
                  />
                </div>
                {/* Floating Stats */}
                <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-3xl shadow-2xl border border-slate-50 animate-float hidden lg:block">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-black text-slate-900 font-outfit">100%</p>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Automation</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="py-20 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
             {[
               { t: 'Admissions', d: 'Simplify the entire enrollment process.', i: <Users className="text-blue-600"/> },
               { t: 'Fee Collection', d: 'Automated online fee management.', i: <Zap className="text-indigo-600"/> },
               { t: 'Examination', d: 'Manage exams and results efficiently.', i: <GraduationCap className="text-teal-600"/> },
               { t: 'Attendance', d: 'Real-time tracking for students.', i: <Clock className="text-orange-600"/> },
             ].map((item, idx) => (
               <div key={idx} className="flex flex-col items-center text-center lg:items-start lg:text-left">
                 <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
                   {item.i}
                 </div>
                 <h4 className="text-lg font-black text-slate-900 mb-2 font-outfit">{item.t}</h4>
                 <p className="text-sm text-slate-500 font-medium font-montserrat">{item.d}</p>
               </div>
             ))}
           </div>
        </div>
      </section>

      {/* Modules Grid Section */}
      <section id="features" className="py-32 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 font-outfit tracking-tight">Our <span className="text-blue-600">Modules</span></h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-montserrat font-medium">Powering your school administration with features that actually matter.</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {modules.map((m, i) => (
              <div key={i} className="group p-8 rounded-[2rem] bg-white border border-slate-100 hover:border-blue-200 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 text-center">
                 <div className={`w-14 h-14 rounded-2xl ${m.color} text-white flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform`}>
                    {m.icon}
                 </div>
                 <h3 className="text-xs font-black text-slate-900 font-outfit leading-snug">{m.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 font-outfit tracking-tight">
                Enterprise-Grade <br /> <span className="text-blue-400">Security & Reliability</span>
              </h2>
              <p className="text-lg text-slate-300 mb-10 font-montserrat font-medium max-w-xl">
                Fortified by global compliance standards. We encrypt every byte across our data centers for 99.9% uptime and instant, limitless scale.
              </p>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold font-outfit">GDPR, CCPA & ISO 27001</h4>
                    <p className="text-sm text-slate-400">Strict compliance controls protecting your data.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold font-outfit">99.9% Uptime SLA</h4>
                    <p className="text-sm text-slate-400">Reliable infrastructure with daily off-site backups.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 flex justify-center lg:justify-end">
              <div className="bg-slate-800 p-8 rounded-[3rem] border border-slate-700 max-w-sm w-full relative">
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-500 rounded-full blur-[50px] opacity-50"></div>
                <ShieldCheck className="w-20 h-20 text-blue-400 mb-8" />
                <h3 className="text-3xl font-black mb-4 font-outfit">AES-256</h3>
                <p className="text-slate-400 font-medium">Bank-level encryption at rest and in transit ensures your student and financial data is always safe.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 font-outfit tracking-tight">One Solution for <br /> <span className="text-blue-600">Every Institution</span></h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            {solutions.map((s, i) => (
              <div key={i} className="p-10 rounded-[3rem] bg-white border border-slate-100 flex flex-col h-full relative overflow-hidden">
                {s.comingSoon && (
                  <div className="absolute top-8 right-[-35px] rotate-45 bg-blue-600 text-white text-[10px] font-black py-1 px-10 shadow-lg uppercase tracking-widest">
                    Coming Soon
                  </div>
                )}
                <h3 className="text-2xl font-black text-slate-900 mb-4 font-outfit flex items-center gap-3">
                  {s.title}
                </h3>
                <p className="text-slate-500 mb-8 font-montserrat font-medium">{s.desc}</p>
                <div className="space-y-4 mb-10">
                  {s.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-blue-50 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="text-sm font-bold text-slate-700 font-outfit uppercase tracking-wide">{f}</span>
                    </div>
                  ))}
                </div>
                <Link to="/signup" className="mt-auto w-full py-4 border-2 border-slate-100 rounded-2xl text-center font-black text-slate-700 hover:border-blue-600 hover:text-blue-600 transition-all font-outfit uppercase tracking-widest text-[10px]">
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="py-32 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col lg:flex-row items-center gap-20">
             <div className="flex-1">
               <h2 className="text-4xl lg:text-6xl font-black text-white mb-8 font-outfit leading-tight tracking-tight">
                 Empower Parents with <br />
                 the <span className="text-blue-200">Mobile App.</span>
               </h2>
               <p className="text-xl text-blue-100 mb-10 font-montserrat font-medium">
                 Keep parents informed and engaged. Real-time notifications for attendance, 
                 fees, exams, and daily circulars.
               </p>
                <div className="flex flex-wrap gap-4">
                  <a href="#" className="hover:scale-105 transition-transform duration-300">
                    <img 
                      src="/badges/app_store.png" 
                      alt="Download on App Store" 
                      className="h-14 w-auto rounded-xl shadow-lg shadow-black/20"
                    />
                  </a>
                  <a href="#" className="hover:scale-105 transition-transform duration-300">
                    <img 
                      src="/badges/play_store.png" 
                      alt="Get it on Play Store" 
                      className="h-14 w-auto rounded-xl shadow-lg shadow-black/20"
                    />
                  </a>
                </div>
             </div>
             <div className="flex-1">
                <div className="relative w-full max-w-[400px] mx-auto">
                   <div className="bg-white/10 p-6 rounded-[3.5rem] backdrop-blur-xl border border-white/20">
                      <div className="bg-white rounded-[3rem] p-4 aspect-[9/19] flex items-center justify-center">
                        <img src="/logo-icon.png" alt="App Icon" className="w-20 h-auto opacity-20" />
                      </div>
                   </div>
                </div>
             </div>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <img src="/logo-icon.png" alt="Logo" className="h-5 w-auto invert" />
              </div>
              <span className="text-xl font-black text-slate-900 font-outfit">Academix</span>
            </div>
            <div className="flex gap-10">
              <Link className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest font-outfit">Terms</Link>
              <Link className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest font-outfit">Privacy</Link>
              <Link className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest font-outfit">Help</Link>
            </div>
            <p className="text-sm font-bold text-slate-400 font-outfit uppercase tracking-widest">© 2026 Academix. Made for Educators.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
