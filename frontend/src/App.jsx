import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';
import Layout from './components/Layout';

// Lazy load all pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const CompleteProfile = lazy(() => import('./pages/CompleteProfile'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Students = lazy(() => import('./pages/Students'));
const Attendance = lazy(() => import('./pages/Attendance'));
const Fees = lazy(() => import('./pages/Fees'));
const Timetable = lazy(() => import('./pages/Timetable'));
const Reports = lazy(() => import('./pages/Reports'));
const Exams = lazy(() => import('./pages/Exams'));
const MarksEntry = lazy(() => import('./pages/MarksEntry'));
const Results = lazy(() => import('./pages/Results'));
const ParentDashboard = lazy(() => import('./pages/ParentDashboard'));
const ParentLogin = lazy(() => import('./pages/ParentLogin'));
const AdmissionForm = lazy(() => import('./pages/AdmissionForm'));
const AdmissionsList = lazy(() => import('./pages/AdmissionsList'));
const Homework = lazy(() => import('./pages/Homework'));
const Leaves = lazy(() => import('./pages/Leaves'));
const Library = lazy(() => import('./pages/Library'));
const Transport = lazy(() => import('./pages/Transport'));
const Payroll = lazy(() => import('./pages/Payroll'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Events = lazy(() => import('./pages/Events'));
const Messages = lazy(() => import('./pages/Messages'));
const PaymentSettings = lazy(() => import('./pages/PaymentSettings'));
const PaymentVerification = lazy(() => import('./pages/PaymentVerification'));
const Profile = lazy(() => import('./pages/Profile'));
const Staff = lazy(() => import('./pages/Staff'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-900">
    <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return children;
};

function App() {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/parent-login" element={<ParentLogin />} />
        
        <Route element={
          <ProtectedRoute>
            <SearchProvider>
              <Layout toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
            </SearchProvider>
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={
            user?.role === 'parent' ? <Navigate to="/parent-dashboard" /> : <Dashboard />
          } />
          <Route path="parent-dashboard" element={<ParentDashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="fees" element={<Fees />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="reports" element={<Reports />} />
          <Route path="exams" element={<Exams />} />
          <Route path="marks-entry" element={<MarksEntry />} />
          <Route path="results" element={<Results />} />
          <Route path="admissions" element={<AdmissionsList />} />
          <Route path="homework" element={<Homework />} />
          <Route path="leaves" element={<Leaves />} />
          <Route path="library" element={<Library />} />
          <Route path="transport" element={<Transport />} />
          <Route path="payroll" element={<Payroll />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="events" element={<Events />} />
          <Route path="messages" element={<Messages />} />
          <Route path="payment-settings" element={<PaymentSettings />} />
          <Route path="payment-verification" element={<PaymentVerification />} />
          <Route path="profile" element={<Profile />} />
          <Route path="staff" element={<Staff />} />
        </Route>
        
        <Route path="/admission" element={<AdmissionForm />} />
        
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Suspense>
  );
}

export default App;
