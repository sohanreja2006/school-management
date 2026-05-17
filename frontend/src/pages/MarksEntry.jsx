import React, { useState, useEffect, useRef } from 'react';
import { students, examination } from '../services/api';
import { Save, CheckCircle2, AlertCircle, ChevronRight, GraduationCap } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useTranslation } from 'react-i18next';

const MarksEntry = () => {
  const { t } = useTranslation();
  const [examList, setExamList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [loadingPerformers, setLoadingPerformers] = useState(false);
  const [selectedStudentForReport, setSelectedStudentForReport] = useState(null);
  const [customReportSettings, setCustomReportSettings] = useState({
    schoolName: 'Academix International School',
    customPercentage: '',
    customGrade: ''
  });
  const [showReportModal, setShowReportModal] = useState(false);
  
  const [selection, setSelection] = useState({
    examId: '',
    className: '',
    subjectId: ''
  });
  
  const [marksData, setMarksData] = useState({});
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    maxMarks: 100,
    passMarks: 33,
    class: ''
  });

  // Track if this is the initial load to avoid unnecessary fetches
  const initialLoadDone = useRef(false);

  // Step 1: On mount, fetch exams + student classes
  useEffect(() => {
    const init = async () => {
      try {
        const [examRes, studentRes] = await Promise.all([
          examination.getExams(),
          students.getAll()
        ]);
        const exams = examRes.data.data || [];
        const allStudents = studentRes.data.data || [];
        
        setExamList(exams);
        
        const classes = [...new Set(allStudents.map(s => s.class))].filter(Boolean);
        setAvailableClasses(classes);
        
        // Set initial selection
        const firstExam = exams.length > 0 ? (exams[0].id || exams[0]._id) : '';
        const firstClass = classes.length > 0 ? classes[0] : '';
        
        setSelection(prev => ({ ...prev, examId: firstExam, className: firstClass }));
        initialLoadDone.current = true;
      } catch (err) {
        console.error('Init error:', err);
      }
    };
    init();
  }, []);

  // Step 2: When className changes, fetch subjects and students for that class
  useEffect(() => {
    if (!selection.className || !initialLoadDone.current) return;
    
    const fetchClassData = async () => {
      setLoading(true);
      try {
        const [subjRes, studRes] = await Promise.all([
          examination.getSubjects({ className: selection.className }),
          students.getAll()
        ]);
        
        const subjects = subjRes.data.data || [];
        const classStudents = (studRes.data.data || []).filter(s => s.class === selection.className);
        
        setSubjectList(subjects);
        setStudentList(classStudents);
        setMarksData({}); // Clear marks when switching class
        
        // Auto-select first subject (without triggering another fetch)
        if (subjects.length > 0) {
          setSelection(prev => ({ ...prev, subjectId: (subjects[0].id || subjects[0]._id) }));
        } else {
          setSelection(prev => ({ ...prev, subjectId: '' }));
        }
      } catch (err) {
        console.error('Fetch class data error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClassData();
  }, [selection.className]);

  // Step 2.5: When subject or exam changes, fetch existing marks from DB
  useEffect(() => {
    if (!selection.examId || !selection.subjectId || !initialLoadDone.current) return;
    
    const fetchExistingMarks = async () => {
      try {
        const { data } = await examination.getMarks({ 
          examId: selection.examId, 
          subjectId: selection.subjectId 
        });
        if (data.success) {
          setMarksData(data.data || {});
        }
      } catch (err) {
        console.error('Fetch marks error:', err);
      }
    };
    fetchExistingMarks();
  }, [selection.examId, selection.subjectId]);

  // Step 3: When subject changes, just clear marks (NO re-fetch)
  const handleSubjectChange = (newSubjectId) => {
    setSelection(prev => ({ ...prev, subjectId: newSubjectId }));
    // Marks will be fetched by the useEffect
  };

  // Step 4: When exam changes, just clear marks (NO re-fetch)
  const handleExamChange = (newExamId) => {
    setSelection(prev => ({ ...prev, examId: newExamId }));
    // Marks will be fetched by the useEffect
  };

  const handleMarkChange = (studentId, value, maxMarks) => {
    const numValue = parseFloat(value);
    if (value !== '' && numValue > maxMarks) {
      alert(`Marks cannot exceed maximum marks (${maxMarks})`);
      return;
    }
    setMarksData(prev => ({ ...prev, [studentId]: value }));
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    try {
      await examination.createSubject({ ...subjectForm, class: selection.className });
      setShowSubjectModal(false);
      setSubjectForm({ name: '', maxMarks: 100, passMarks: 33, class: selection.className });
      // Re-fetch subjects only
      const subjRes = await examination.getSubjects({ className: selection.className });
      setSubjectList(subjRes.data.data || []);
    } catch (err) {
      alert('Failed to add subject');
    }
  };

  const handleSave = async () => {
    if (!selection.examId) {
      alert('Please select an exam first');
      return;
    }
    if (!selection.subjectId) {
      alert('Please select a subject first');
      return;
    }
    
    const entries = Object.entries(marksData)
      .filter(([_, v]) => v !== '' && v !== undefined && v !== null)
      .filter(([_, v]) => !isNaN(parseFloat(v)));
    
    if (entries.length === 0) {
      alert('Please enter marks for at least one student');
      return;
    }
    
    setSaving(true);
    try {
      const marksArray = entries.map(([studentId, marksObtained]) => ({
        studentId,
        marksObtained: parseFloat(marksObtained)
      }));
      
      console.log('Saving marks payload:', {
        exam: selection.examId,
        subject: selection.subjectId,
        marks: marksArray
      });
      
      const response = await examination.saveMarks({
        exam: selection.examId,
        subject: selection.subjectId,
        marks: marksArray
      });
      
      console.log('Save response:', response.data);
      alert(`Marks saved successfully! (${marksArray.length} entries)`);

      // Automatically fetch top performers after saving
      setLoadingPerformers(true);
      try {
        const { data: perfData } = await examination.getClassResults({
          examId: selection.examId,
          className: selection.className
        });
        if (perfData?.success) {
          setTopPerformers(perfData.data || []);
        }
      } catch (perfErr) {
        console.error('Failed to fetch top performers:', perfErr);
      } finally {
        setLoadingPerformers(false);
      }
    } catch (err) {
      console.error('Save error full:', err);
      console.error('Response data:', err.response?.data);
      console.error('Response status:', err.response?.status);
      const msg = err.response?.data?.error || err.response?.data?.message || err.message;
      alert('Failed to save marks: ' + msg);
    } finally {
      setSaving(false);
    }
  };

  const selectedSubject = subjectList.find(s => (s.id || s._id) === selection.subjectId);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-secondary-900 dark:text-white tracking-tight">{t('Marks Entry System')}</h1>
          <p className="text-secondary-500 dark:text-secondary-400 font-medium mt-1">{t('Record and manage examination scores student-wise.')}</p>
        </div>
        <div className="flex flex-wrap gap-4 bg-white dark:bg-secondary-800 p-3 rounded-3xl shadow-premium border border-secondary-100 dark:border-secondary-700">
          <select 
            value={selection.examId}
            onChange={(e) => handleExamChange(e.target.value)}
            className="px-4 py-2.5 bg-secondary-50 dark:bg-secondary-900 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-primary-500/20 transition-all dark:text-white"
          >
            <option value="">{t('Select Exam')}</option>
            {examList.map(e => <option key={e.id || e._id} value={e.id || e._id}>{e.name}</option>)}
          </select>
          <select 
            value={selection.className}
            onChange={(e) => setSelection(prev => ({ ...prev, className: e.target.value }))}
            className="px-4 py-2.5 bg-secondary-50 dark:bg-secondary-900 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-primary-500/20 transition-all dark:text-white"
          >
            {availableClasses.map(c => <option key={c} value={c}>{t('Class')} {c}</option>)}
          </select>
          <select 
            value={selection.subjectId}
            onChange={(e) => handleSubjectChange(e.target.value)}
            className="px-4 py-2.5 bg-secondary-50 dark:bg-secondary-900 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-primary-500/20 transition-all dark:text-white"
          >
            <option value="">{t('Select Subject')}</option>
            {subjectList.map(s => <option key={s.id || s._id} value={s.id || s._id}>{s.name} ({t('Max')}: {s.maxMarks})</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <Card p={0} title={t("Entry Grid")} subtitle={`${t('Class')}: ${selection.className || '...'} • ${t('Subject')}: ${selectedSubject?.name || '...'}`} className="dark:bg-secondary-800 dark:border-secondary-700">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary-50/50 dark:bg-secondary-900/30">
                    <th className="px-8 py-5 text-[10px] font-black text-secondary-500 dark:text-secondary-400 uppercase tracking-widest">{t('Student Info')}</th>
                    <th className="px-8 py-5 text-[10px] font-black text-secondary-500 dark:text-secondary-400 uppercase tracking-widest text-center">{t('Marks Obtained')}</th>
                    <th className="px-8 py-5 text-[10px] font-black text-secondary-500 dark:text-secondary-400 uppercase tracking-widest text-center">{t('Status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-50">
                  {studentList.length === 0 && !loading && (
                    <tr>
                      <td colSpan={3} className="px-8 py-16 text-center">
                        <AlertCircle className="mx-auto text-secondary-300 mb-3" size={32} />
                        <p className="font-bold text-secondary-400">No students found for this class.</p>
                        <p className="text-xs text-secondary-300 mt-1">Add students to this class first.</p>
                      </td>
                    </tr>
                  )}
                  {studentList.map((student) => (
                    <tr key={student.id || student._id} className="hover:bg-secondary-50/30 dark:hover:bg-secondary-900/30 transition-all group border-b border-secondary-50 dark:border-secondary-700/50">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-secondary-100 dark:bg-secondary-700/50 flex items-center justify-center font-black text-secondary-500 dark:text-secondary-400 text-xs">
                            {student.rollNumber}
                          </div>
                          <div>
                            <p className="font-black text-secondary-900 dark:text-white leading-none mb-1">{student.name}</p>
                            <p className="text-[10px] font-bold text-secondary-400 dark:text-secondary-500 uppercase">{t('Roll')}: {student.rollNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-center">
                          <div className="relative w-32">
                            <input 
                              type="number"
                              value={marksData[student.id || student._id] ?? ''}
                              onChange={(e) => handleMarkChange(student.id || student._id, e.target.value, selectedSubject?.maxMarks || 100)}
                              className="w-full px-4 py-3 bg-white dark:bg-secondary-900 border-2 border-secondary-100 dark:border-secondary-700/50 rounded-2xl outline-none focus:border-primary-500 text-center font-black text-lg transition-all dark:text-white"
                              placeholder="0"
                              min="0"
                              max={selectedSubject?.maxMarks || 100}
                            />
                            <span className="absolute -right-8 top-1/2 -translate-y-1/2 text-[10px] font-black text-secondary-300 dark:text-secondary-600">/ {selectedSubject?.maxMarks || 100}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex justify-center">
                          {marksData[student.id || student._id] !== undefined && marksData[student.id || student._id] !== '' ? (
                            parseFloat(marksData[student.id || student._id]) >= (selectedSubject?.passMarks || 33) ? (
                              <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest">{t('Pass')}</div>
                            ) : (
                              <div className="px-3 py-1 bg-rose-100 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-full text-[10px] font-black uppercase tracking-widest">{t('Fail')}</div>
                            )
                          ) : (
                            <div className="px-3 py-1 bg-secondary-100 dark:bg-secondary-700/50 text-secondary-400 dark:text-secondary-500 rounded-full text-[10px] font-black uppercase tracking-widest">{t('Pending')}</div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-8 border-t border-secondary-100 dark:border-secondary-700 bg-secondary-50/30 dark:bg-secondary-900/30 flex justify-between items-center">
              <p className="text-xs font-bold text-secondary-400 dark:text-secondary-500">
                {Object.keys(marksData).filter(k => marksData[k] !== '' && marksData[k] !== undefined).length} of {studentList.length} {t('entries filled')}
              </p>
              <Button onClick={handleSave} isLoading={saving} className="gap-2 px-10">
                <Save size={18} />
                {t('Save All Marks')}
              </Button>
            </div>
          </Card>

          {/* Top Performers List */}
          {topPerformers.length > 0 && (
            <Card title={t("🏆 Top Performers (Merit List)")} subtitle={t("Automatically generated rankings after saving exam marks")} className="dark:bg-secondary-800 dark:border-secondary-700 mt-8">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-secondary-50/50 dark:bg-secondary-900/30">
                      <th className="px-6 py-4 text-[10px] font-black text-secondary-500 dark:text-secondary-400 uppercase tracking-widest">{t('Rank')}</th>
                      <th className="px-6 py-4 text-[10px] font-black text-secondary-500 dark:text-secondary-400 uppercase tracking-widest">{t('Student Name')}</th>
                      <th className="px-6 py-4 text-[10px] font-black text-secondary-500 dark:text-secondary-400 uppercase tracking-widest">{t('Roll No')}</th>
                      <th className="px-6 py-4 text-[10px] font-black text-secondary-500 dark:text-secondary-400 uppercase tracking-widest">{t('Total Marks')}</th>
                      <th className="px-6 py-4 text-[10px] font-black text-secondary-500 dark:text-secondary-400 uppercase tracking-widest">{t('Percentage')}</th>
                      <th className="px-6 py-4 text-[10px] font-black text-secondary-500 dark:text-secondary-400 uppercase tracking-widest">{t('Actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-50 dark:divide-secondary-700/50">
                    {topPerformers.map((perf, index) => (
                      <tr key={perf._id || perf.id} className="hover:bg-secondary-50/30 dark:hover:bg-secondary-900/30 transition-all">
                        <td className="px-6 py-4">
                          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center font-black text-xs">
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-black text-secondary-900 dark:text-white">
                          {perf.name}
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-secondary-500 dark:text-secondary-400">
                          {perf.rollNumber}
                        </td>
                        <td className="px-6 py-4 font-bold text-secondary-700 dark:text-secondary-300">
                          {perf.totalObtained} / {perf.totalMax}
                        </td>
                        <td className="px-6 py-4 font-black text-primary-600 dark:text-primary-400">
                          {perf.percentage?.toFixed(2)}%
                        </td>
                        <td className="px-6 py-4">
                          <Button 
                            variant="secondary"
                            size="sm"
                            onClick={async () => {
                              try {
                                const { data: resData } = await examination.getStudentResult(perf._id || perf.id, selection.examId);
                                if (resData?.success) {
                                  setSelectedStudentForReport({
                                    ...resData.data,
                                    studentInfo: { name: perf.name, rollNumber: perf.rollNumber }
                                  });
                                  setCustomReportSettings({
                                    schoolName: 'Academix International School',
                                    customPercentage: resData.data.summary.percentage,
                                    customGrade: resData.data.summary.grade
                                  });
                                  setShowReportModal(true);
                                }
                              } catch (err) {
                                alert('Failed to fetch student details for report card.');
                              }
                            }}
                          >
                            {t('Generate Report Card')}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
           <Card title={t("Quick Setup")} subtitle={t("Manage available subjects")} className="dark:bg-secondary-800 dark:border-secondary-700">
             <div className="space-y-4">
               {subjectList.map(s => (
                 <div key={s.id || s._id} className="p-4 bg-secondary-50 dark:bg-secondary-900/50 rounded-2xl border border-secondary-100 dark:border-secondary-700 flex justify-between items-center group">
                   <div>
                     <p className="font-black text-secondary-900 dark:text-white text-sm">{s.name}</p>
                     <p className="text-[10px] font-bold text-secondary-400 dark:text-secondary-500 uppercase">{t('Max')}: {s.maxMarks} • {t('Pass')}: {s.passMarks}</p>
                   </div>
                   <div className="p-2 rounded-xl bg-white dark:bg-secondary-800 text-primary-600 dark:text-primary-400 shadow-sm opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                     <ChevronRight size={14} />
                   </div>
                 </div>
               ))}
               {subjectList.length === 0 && (
                 <p className="text-xs font-bold text-secondary-400 dark:text-secondary-500 text-center py-4">{t('No subjects for this class yet.')}</p>
               )}
               <Button 
                 variant="secondary" 
                 className="w-full text-xs py-3 border-dashed border-2"
                 onClick={() => {
                   setSubjectForm({ name: '', maxMarks: 100, passMarks: 33, class: selection.className });
                   setShowSubjectModal(true);
                 }}
               >
                 + {t('Add New Subject')}
               </Button>
             </div>
           </Card>

           <Modal 
             isOpen={showSubjectModal} 
             onClose={() => setShowSubjectModal(false)} 
             title={t("Add New Subject")}
             footer={<Button onClick={handleAddSubject}>{t("Add Subject")}</Button>}
           >
             <form className="space-y-4">
               <div>
                 <label className="block text-[10px] font-black text-secondary-400 dark:text-secondary-500 uppercase tracking-widest mb-2">{t('Subject Name')}</label>
                 <input 
                   type="text" 
                   value={subjectForm.name}
                   onChange={(e) => setSubjectForm({...subjectForm, name: e.target.value})}
                   className="w-full px-5 py-3 bg-secondary-50 dark:bg-secondary-900 border-2 border-secondary-100 dark:border-secondary-700 rounded-2xl outline-none focus:border-primary-500 font-bold dark:text-white"
                   placeholder="e.g. Physics"
                 />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-[10px] font-black text-secondary-400 dark:text-secondary-500 uppercase tracking-widest mb-2">{t('Max Marks')}</label>
                   <input 
                     type="number" 
                     value={subjectForm.maxMarks}
                     onChange={(e) => setSubjectForm({...subjectForm, maxMarks: parseInt(e.target.value) || 0})}
                     className="w-full px-5 py-3 bg-secondary-50 dark:bg-secondary-900 border-2 border-secondary-100 dark:border-secondary-700 rounded-2xl outline-none focus:border-primary-500 font-bold dark:text-white"
                   />
                 </div>
                 <div>
                   <label className="block text-[10px] font-black text-secondary-400 dark:text-secondary-500 uppercase tracking-widest mb-2">{t('Pass Marks')}</label>
                   <input 
                     type="number" 
                     value={subjectForm.passMarks}
                     onChange={(e) => setSubjectForm({...subjectForm, passMarks: parseInt(e.target.value) || 0})}
                     className="w-full px-5 py-3 bg-secondary-50 dark:bg-secondary-900 border-2 border-secondary-100 dark:border-secondary-700 rounded-2xl outline-none focus:border-primary-500 font-bold dark:text-white"
                   />
                 </div>
               </div>
             </form>
           </Modal>

            {/* Custom Report Card Generator Modal */}
            <Modal 
              isOpen={showReportModal} 
              onClose={() => setShowReportModal(false)} 
              title={t("Customized Report Card Generator")}
              footer={
                <Button 
                  onClick={() => {
                    if (selectedStudentForReport) {
                      const selectedExam = examList.find(e => (e.id || e._id) === selection.examId)?.name || 'Examination';
                      import('../utils/pdfUtils').then(({ generateReportCard }) => {
                        generateReportCard(selectedStudentForReport, selectedExam, {
                          customSchoolName: customReportSettings.schoolName,
                          customPercentage: customReportSettings.customPercentage,
                          customGrade: customReportSettings.customGrade,
                          studentName: selectedStudentForReport.studentInfo?.name,
                          rollNumber: selectedStudentForReport.studentInfo?.rollNumber
                        });
                        setShowReportModal(false);
                      });
                    }
                  }}
                  className="gap-2 px-8"
                >
                  {t('Download Customized PDF')}
                </Button>
              }
            >
              {selectedStudentForReport && (
                <div className="space-y-6">
                  <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-2xl border border-primary-100 dark:border-primary-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest">{t('Student')}</div>
                      <div className="text-lg font-black text-secondary-900 dark:text-white">{selectedStudentForReport.studentInfo?.name} (Roll: {selectedStudentForReport.studentInfo?.rollNumber})</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-secondary-500 uppercase tracking-widest">{t('Auto Calculated')}</div>
                      <div className="text-sm font-black text-primary-600 dark:text-primary-400">{selectedStudentForReport.summary.percentage}% • Grade {selectedStudentForReport.summary.grade}</div>
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

          <Card className="bg-indigo-600 dark:bg-indigo-700/80 text-white border-none shadow-xl shadow-indigo-500/20">
            <GraduationCap className="mb-4 opacity-50" size={32} />
            <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest">{t('Efficiency Tip')}</p>
            <p className="text-xs font-medium leading-relaxed mt-2 italic">
              {t('"Use the Tab key to quickly move between input fields for faster data entry."')}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MarksEntry;
