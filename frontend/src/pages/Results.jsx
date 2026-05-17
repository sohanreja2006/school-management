import React, { useState, useEffect } from 'react';
import { examination, students } from '../services/api';
import { Trophy, TrendingUp, Users, Download, Medal, BarChart3, Search, User } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { calculateGrade } from '../utils/gradingUtils';
import { generateReportCard } from '../utils/pdfUtils';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useTranslation } from 'react-i18next';

const Results = () => {
  const { t } = useTranslation();
  const [examList, setExamList] = useState([]);
  const [results, setResults] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('merit'); // 'merit' or 'individual'
  
  const [selection, setSelection] = useState({
    examId: '',
    className: '10th A'
  });

  const [individualSearch, setIndividualSearch] = useState('');
  const [selectedStudentResult, setSelectedStudentResult] = useState(null);
  const [customReportSettings, setCustomReportSettings] = useState({
    schoolName: 'Academix International School',
    customPercentage: '',
    customGrade: ''
  });
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selection.examId && selection.className && activeTab === 'merit') {
      fetchResults();
    }
  }, [selection.examId, selection.className, activeTab]);

  const fetchInitialData = async () => {
    try {
      const [examRes, studentRes] = await Promise.all([
        examination.getExams(),
        students.getAll()
      ]);
      setExamList(examRes.data.data);
      
      const classes = [...new Set(studentRes.data.data.map(s => s.class))].filter(Boolean);
      setAvailableClasses(classes);
      
      if (examRes.data.data.length > 0) setSelection(prev => ({ ...prev, examId: (examRes.data.data[0].id || examRes.data.data[0]._id) }));
      if (classes.length > 0) setSelection(prev => ({ ...prev, className: classes[0] }));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchResults = async () => {
    setLoading(true);
    try {
      const { data } = await examination.getClassResults({ 
        examId: selection.examId, 
        className: selection.className 
      });
      setResults(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchIndividualResult = async (studentId) => {
    if (!selection.examId) return;
    setLoading(true);
    try {
      const { data } = await examination.getStudentResult(studentId, selection.examId);
      setSelectedStudentResult(data.data);
      if (data.data?.summary) {
        setCustomReportSettings({
          schoolName: 'Academix International School',
          customPercentage: data.data.summary.percentage,
          customGrade: data.data.summary.grade
        });
      }
    } catch (err) {
      alert('Result not found for this student');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (results.length === 0) return;
    const { exportToCSV } = await import('../utils/exportUtils');
    const exportData = results.map((r, idx) => ({
      Rank: idx + 1,
      Name: r.name,
      RollNumber: r.rollNumber,
      Obtained: r.totalObtained,
      Total: r.totalMax,
      Percentage: `${r.percentage.toFixed(2)}%`,
      Grade: r.percentage >= 90 ? 'A+' : r.percentage >= 80 ? 'A' : r.percentage >= 60 ? 'B' : r.percentage >= 40 ? 'C' : 'F'
    }));
    exportToCSV(exportData, `results_${selection.className}`);
  };

  const columns = [
    { header: t('Rank'), render: (row, idx) => (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary-50 dark:bg-secondary-700/50 font-black text-secondary-900 dark:text-white text-xs">
        {idx + 1}
      </div>
    )},
    { header: t('Student Name'), render: (row) => (
      <div className="flex items-center gap-3">
        {results.indexOf(row) < 3 && <Trophy size={14} className={results.indexOf(row) === 0 ? "text-amber-500" : "text-secondary-400"} />}
        <span className="font-black text-secondary-900 dark:text-white">{row.name}</span>
      </div>
    )},
    { header: t('Roll No'), accessor: 'rollNumber', render: (row) => <span className="dark:text-secondary-400">{row.rollNumber}</span> },
    { header: t('Marks'), render: (row) => <span className="font-bold text-secondary-700 dark:text-secondary-400">{row.totalObtained} / {row.totalMax}</span> },
    { header: t('Percentage'), render: (row) => (
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 bg-secondary-100 dark:bg-secondary-700 rounded-full overflow-hidden">
          <div className="h-full bg-primary-600" style={{ width: `${row.percentage}%` }}></div>
        </div>
        <span className="font-black text-primary-600 dark:text-primary-400 text-xs">{row.percentage.toFixed(1)}%</span>
      </div>
    )},
    { header: t('Grade'), render: (row) => {
       const { grade, color } = calculateGrade(row.percentage);
       return <span className={`font-black ${color}`}>{grade}</span>;
    }},
    { header: t('Actions'), render: (row) => (
      <Button 
        variant="secondary" 
        className="text-[10px] py-1.5 px-3 uppercase tracking-widest font-black"
        onClick={() => {
          setActiveTab('individual');
          fetchIndividualResult(row.id || row._id);
        }}
      >
        {t('View Report')}
      </Button>
    )}
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-secondary-900 dark:text-white tracking-tight">{t('Academic Performance')}</h1>
          <p className="text-secondary-500 dark:text-secondary-400 font-medium mt-1">{t('Class-wise rankings and individual student report cards.')}</p>
        </div>
        
        <div className="flex items-center gap-2 bg-secondary-100 dark:bg-secondary-800 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab('merit')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'merit' ? 'bg-white dark:bg-secondary-900 text-primary-600 shadow-sm' : 'text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-200'}`}
          >
            {t('Merit List')}
          </button>
          <button 
            onClick={() => setActiveTab('individual')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'individual' ? 'bg-white dark:bg-secondary-900 text-primary-600 shadow-sm' : 'text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-200'}`}
          >
            {t('Student Report')}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 bg-white dark:bg-secondary-800 p-4 rounded-3xl shadow-premium border border-secondary-100 dark:border-secondary-700 items-center">
        <div className="flex items-center gap-2 pr-4 border-r border-secondary-100 dark:border-secondary-700">
          <Medal className="text-primary-600" size={20} />
          <select 
            value={selection.examId}
            onChange={(e) => setSelection({...selection, examId: e.target.value})}
            className="bg-transparent font-black text-sm outline-none cursor-pointer dark:text-white"
          >
            {examList.map(e => <option key={e.id || e._id} value={e.id || e._id} className="dark:bg-secondary-800">{e.name}</option>)}
          </select>
        </div>
        
        {activeTab === 'merit' && (
          <>
            <div className="flex items-center gap-2 pr-4 border-r border-secondary-100 dark:border-secondary-700">
              <Users className="text-primary-600" size={20} />
              <select 
                value={selection.className}
                onChange={(e) => setSelection({...selection, className: e.target.value})}
                className="bg-transparent font-black text-sm outline-none cursor-pointer dark:text-white"
              >
                {availableClasses.map(c => <option key={c} value={c} className="dark:bg-secondary-800">{t('Class')} {c}</option>)}
              </select>
            </div>
            <Button variant="secondary" onClick={handleExport} size="sm" className="gap-2">
              <Download size={16} />
              {t('Export CSV')}
            </Button>
          </>
        )}

        {activeTab === 'individual' && (
          <div className="flex-1 flex items-center gap-3">
             <Search size={18} className="text-secondary-400" />
             <input 
               type="text" 
               placeholder={t("Enter Student ID (MongoDB ID) to fetch report...")}
               className="flex-1 bg-transparent font-bold text-sm outline-none dark:text-white"
               value={individualSearch}
               onChange={(e) => setIndividualSearch(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && fetchIndividualResult(individualSearch)}
             />
             <Button size="sm" onClick={() => fetchIndividualResult(individualSearch)}>{t('Get Report')}</Button>
          </div>
        )}
      </div>

      {activeTab === 'merit' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-primary-600 dark:bg-primary-700/80 text-white border-none shadow-xl shadow-primary-500/20">
              <Medal className="mb-4 opacity-50" size={32} />
              <p className="text-primary-100 text-[10px] font-black uppercase tracking-widest">{t('Class Topper')}</p>
              <h3 className="text-2xl font-black mt-1 truncate">{results[0]?.name || '---'}</h3>
              <p className="text-primary-200 text-xs mt-4 font-bold">{results[0]?.percentage?.toFixed(1) || '0.0'}% {t('Score')}</p>
            </Card>
            <Card className="dark:bg-secondary-800 dark:border-secondary-700">
              <Users className="text-primary-600 dark:text-primary-400 mb-4" size={32} />
              <p className="text-secondary-400 dark:text-secondary-500 text-[10px] font-black uppercase tracking-widest">{t('Students Appeared')}</p>
              <h3 className="text-3xl font-black text-secondary-900 dark:text-white mt-1">{results.length}</h3>
            </Card>
            <Card className="dark:bg-secondary-800 dark:border-secondary-700">
              <TrendingUp className="text-emerald-500 mb-4" size={32} />
              <p className="text-secondary-400 dark:text-secondary-500 text-[10px] font-black uppercase tracking-widest">{t('Average Score')}</p>
              <h3 className="text-3xl font-black text-secondary-900 dark:text-white mt-1">
                {(results.reduce((acc, r) => acc + r.percentage, 0) / (results.length || 1)).toFixed(1)}%
              </h3>
            </Card>
            <Card className="dark:bg-secondary-800 dark:border-secondary-700">
              <BarChart3 className="text-primary-500 mb-4" size={32} />
              <p className="text-secondary-400 dark:text-secondary-500 text-[10px] font-black uppercase tracking-widest">{t('Pass Rate')}</p>
              <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {Math.round((results.filter(r => r.percentage >= 33).length / (results.length || 1)) * 100)}%
              </h3>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card p={0} title={t("Merit List")} subtitle={t("Top performers by total percentage")} className="dark:bg-secondary-800 dark:border-secondary-700">
                <div className="p-2">
                  <Table columns={columns} data={results} isLoading={loading} />
                </div>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card title={t("Score Distribution")} subtitle={t("Percentage brackets count")} className="dark:bg-secondary-800 dark:border-secondary-700">
                <div className="h-64 w-full mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { range: '90%+', count: results.filter(r => r.percentage >= 90).length },
                      { range: '80-90%', count: results.filter(r => r.percentage >= 80 && r.percentage < 90).length },
                      { range: '60-80%', count: results.filter(r => r.percentage >= 60 && r.percentage < 80).length },
                      { range: '<60%', count: results.filter(r => r.percentage < 60).length },
                    ]}>
                      <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: document.documentElement.classList.contains('dark') ? '#94a3b8' : '#64748b'}} />
                      <Tooltip cursor={{fill: document.documentElement.classList.contains('dark') ? '#1e293b' : '#f8fafc'}} contentStyle={{backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#fff', borderColor: document.documentElement.classList.contains('dark') ? '#334155' : '#e2e8f0'}} />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-8">
          {selectedStudentResult ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-1 bg-secondary-900 dark:bg-black text-white border-secondary-800 overflow-hidden relative">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary-600/20 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                   <div className="w-20 h-20 bg-primary-600 rounded-3xl flex items-center justify-center font-black text-3xl mb-6 shadow-xl shadow-primary-900/40">
                      {individualSearch.charAt(0).toUpperCase()}
                   </div>
                   <h2 className="text-3xl font-black tracking-tight mb-1">{t('Student Performance')}</h2>
                   <p className="text-secondary-400 font-bold text-sm uppercase tracking-widest">{t('Academic Session')} 2026</p>
                   
                   <div className="mt-12 space-y-6">
                      <div>
                         <p className="text-[10px] font-black text-secondary-500 uppercase tracking-widest mb-1">{t('Overall Percentage')}</p>
                         <p className="text-5xl font-black text-white">{selectedStudentResult.summary.percentage}%</p>
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-secondary-500 uppercase tracking-widest mb-1">{t('Final Grade')}</p>
                         <p className="text-3xl font-black text-primary-400">{selectedStudentResult.summary.grade}</p>
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-secondary-500 uppercase tracking-widest mb-1">{t('Total Marks')}</p>
                         <p className="text-xl font-black text-white">{selectedStudentResult.summary.totalObtained} / {selectedStudentResult.summary.totalMax}</p>
                      </div>
                      <Button 
                        variant="secondary" 
                        className="w-full gap-2 mt-4 shadow-lg" 
                        onClick={() => {
                          if (selectedStudentResult?.summary) {
                            setCustomReportSettings({
                              schoolName: 'Academix International School',
                              customPercentage: selectedStudentResult.summary.percentage,
                              customGrade: selectedStudentResult.summary.grade
                            });
                            setShowReportModal(true);
                          }
                        }}
                      >
                         <Download size={16} />
                         {t('Customize & Print')}
                      </Button>
                   </div>
                </div>
              </Card>

              <div className="lg:col-span-2 space-y-6">
                 <Card title={t("Subject-wise Breakdown")} subtitle={t("Detailed performance metrics per subject")} className="dark:bg-secondary-800 dark:border-secondary-700">
                    <div className="space-y-4 mt-6">
                       {selectedStudentResult.results.map((r, idx) => (
                         <div key={idx} className="p-5 bg-secondary-50 dark:bg-secondary-900/50 rounded-2xl border border-secondary-100 dark:border-secondary-700 flex justify-between items-center group hover:border-primary-200 transition-all">
                            <div>
                               <p className="font-black text-secondary-900 dark:text-white">{r.subject}</p>
                               <p className="text-[10px] font-bold text-secondary-400 dark:text-secondary-500 uppercase">{t('Max Marks')}: {r.max}</p>
                            </div>
                            <div className="text-right">
                               <p className={`font-black text-lg ${r.status === 'Pass' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {r.obtained}
                                </p>
                               <p className="text-[10px] font-black uppercase tracking-widest text-secondary-400 dark:text-secondary-500">{t(r.status)}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </Card>
              </div>
            </div>
          ) : (
            <div className="p-20 text-center bg-secondary-50 dark:bg-secondary-900/30 rounded-[40px] border-2 border-dashed border-secondary-200 dark:border-secondary-700">
               <User size={64} className="mx-auto text-secondary-200 dark:text-secondary-700 mb-6" />
               <h3 className="text-2xl font-black text-secondary-900 dark:text-white">{t('No Student Selected')}</h3>
               <p className="text-secondary-500 dark:text-secondary-400 font-medium max-w-sm mx-auto mt-2">{t('Enter a Student ID above to view their complete academic performance for the selected exam.')}</p>
            </div>
          )}
        </div>
      )}

      {/* Custom Report Card Generator Modal */}
      <Modal 
        isOpen={showReportModal} 
        onClose={() => setShowReportModal(false)} 
        title={t("Customized Report Card Generator")}
        footer={
          <Button 
            onClick={() => {
              if (selectedStudentResult) {
                const selectedExam = examList.find(e => (e.id || e._id) === selection.examId)?.name || 'Examination';
                generateReportCard(selectedStudentResult, selectedExam, {
                  customSchoolName: customReportSettings.schoolName,
                  customPercentage: customReportSettings.customPercentage,
                  customGrade: customReportSettings.customGrade,
                  studentName: selectedStudentResult.studentInfo?.name || 'Student',
                  rollNumber: selectedStudentResult.studentInfo?.rollNumber || 'N/A'
                });
                setShowReportModal(false);
              }
            }}
            className="gap-2 px-8"
          >
            {t('Download Customized PDF')}
          </Button>
        }
      >
        {selectedStudentResult && (
          <div className="space-y-6">
            <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-2xl border border-primary-100 dark:border-primary-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest">{t('Student')}</div>
                <div className="text-lg font-black text-secondary-900 dark:text-white">{selectedStudentResult.studentInfo?.name || 'Student'} (Roll: {selectedStudentResult.studentInfo?.rollNumber || 'N/A'})</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-secondary-500 uppercase tracking-widest">{t('Auto Calculated')}</div>
                <div className="text-sm font-black text-primary-600 dark:text-primary-400">{selectedStudentResult.summary.percentage}% • Grade {selectedStudentResult.summary.grade}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-secondary-500 uppercase tracking-widest mb-2">{t('School Name on Report Card')}</label>
                <input 
                  type="text" 
                  value={customReportSettings.schoolName}
                  onChange={e => setCustomReportSettings({...customReportSettings, schoolName: e.target.value})}
                  className="w-full px-5 py-3 bg-secondary-50 dark:bg-secondary-900 border-2 border-secondary-100 dark:border-secondary-700 rounded-2xl outline-none focus:border-primary-500 font-bold dark:text-white"
                  placeholder="e.g. Academix International School"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-secondary-500 uppercase tracking-widest mb-2">{t('Override Percentage')}</label>
                  <input 
                    type="text" 
                    value={customReportSettings.customPercentage}
                    onChange={e => setCustomReportSettings({...customReportSettings, customPercentage: e.target.value})}
                    className="w-full px-5 py-3 bg-secondary-50 dark:bg-secondary-900 border-2 border-secondary-100 dark:border-secondary-700 rounded-2xl outline-none focus:border-primary-500 font-bold dark:text-white"
                    placeholder="e.g. 95.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-secondary-500 uppercase tracking-widest mb-2">{t('Override Grade')}</label>
                  <input 
                    type="text" 
                    value={customReportSettings.customGrade}
                    onChange={e => setCustomReportSettings({...customReportSettings, customGrade: e.target.value})}
                    className="w-full px-5 py-3 bg-secondary-50 dark:bg-secondary-900 border-2 border-secondary-100 dark:border-secondary-700 rounded-2xl outline-none focus:border-primary-500 font-bold dark:text-white"
                    placeholder="e.g. A+"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Results;
