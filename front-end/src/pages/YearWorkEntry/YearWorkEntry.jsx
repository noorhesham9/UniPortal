import React, { useState } from 'react';

const YearWorkEntry = () => {
  // بيانات تجريبية للطلاب - لاحقاً هتيجي من الـ API
  const [students, setStudents] = useState([
    { id: '202400125', name: 'Ahmed Mohamed Al-Sayed', attendance: 9, quizzes: 18, midterm: 25 },
    { id: '202400138', name: 'Sara Ibrahim Mahmoud', attendance: 4, quizzes: 8, midterm: 12 },
    { id: '202400142', name: 'Youssef Ali Hassan', attendance: 10, quizzes: 20, midterm: 29 },
    { id: '202400155', name: 'Laila Omar Gad', attendance: 8, quizzes: 15, midterm: 22 },
  ]);

  // Function لتحديث الدرجة وحساب المجموع تلقائياً
  const handleGradeChange = (id, field, value) => {
    const numericValue = parseInt(value) || 0;
    setStudents(prev => prev.map(student => 
      student.id === id ? { ...student, [field]: numericValue } : student
    ));
  };

  return (
    <div className="py-8 px-4 sm:px-8 min-h-screen bg-transparent text-on-surface">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Info */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-headline font-extrabold text-white">رصد أعمال السنة</h1>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-high text-primary-container border border-white/5">
            <span className="material-symbols-outlined text-sm">calendar_today</span>
            <span className="text-sm uppercase tracking-widest font-bold">Fall 2024</span>
          </div>
        </div>

        {/* Filters Section */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 bg-surface-container-low p-6 rounded-xl flex flex-col md:flex-row items-center gap-6 border border-white/5">
            <div className="flex-1 w-full space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold">المقرر الدراسي</label>
              <select className="w-full bg-surface-container-highest border-b-2 border-outline-variant focus:border-primary-container text-white py-3 px-4 rounded-lg appearance-none outline-none">
                <option>CS101 - Introduction to Computer Science</option>
                <option>CS204 - Data Structures & Algorithms</option>
              </select>
            </div>
            <div className="w-full md:w-48 space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold">الشعبة</label>
              <select className="w-full bg-surface-container-highest border-b-2 border-outline-variant focus:border-primary-container text-white py-3 px-4 rounded-lg appearance-none outline-none">
                <option>Group G1</option>
                <option>Group G2</option>
              </select>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 bg-surface-container-low p-6 rounded-xl flex flex-col justify-center space-y-4 border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">Lock Grades</div>
                <div className="text-[10px] text-slate-500">قفل الرصد لهذه الشعبة</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-surface-container-low rounded-xl overflow-hidden shadow-xl border border-white/5">
          <div className="p-6 flex flex-col sm:flex-row items-center justify-between border-b border-white/5 gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-container">grid_on</span>
              <h2 className="text-lg font-bold text-white">Year Work Grade Entry</h2>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-xl bg-primary text-on-primary font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/10">
                <span className="material-symbols-outlined text-sm">save</span>
                حفظ التعديلات
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-surface-container text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-6 py-4">ID الطالب</th>
                  <th className="px-6 py-4">اسم الطالب</th>
                  <th className="px-6 py-4 text-center">الحضور (10)</th>
                  <th className="px-6 py-4 text-center">كويزات (20)</th>
                  <th className="px-6 py-4 text-center">ميدتيرم (30)</th>
                  <th className="px-6 py-4 text-center bg-slate-900/50">الإجمالي (60)</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {students.map((student) => {
                  const total = student.attendance + student.quizzes + student.midterm;
                  const isFailing = total < 30; // مثال: رسوب لو أقل من 50%
                  
                  return (
                    <tr key={student.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-500">{student.id}</td>
                      <td className="px-6 py-4 font-bold text-white">{student.name}</td>
                      <td className="px-4 py-2 text-center">
                        <input 
                          type="number" 
                          value={student.attendance}
                          onChange={(e) => handleGradeChange(student.id, 'attendance', e.target.value)}
                          className="w-16 bg-transparent border-none text-center focus:ring-0 focus:bg-surface-container-highest rounded text-white" 
                        />
                      </td>
                      <td className="px-4 py-2 text-center">
                        <input 
                          type="number" 
                          value={student.quizzes}
                          onChange={(e) => handleGradeChange(student.id, 'quizzes', e.target.value)}
                          className="w-16 bg-transparent border-none text-center focus:ring-0 focus:bg-surface-container-highest rounded text-white" 
                        />
                      </td>
                      <td className="px-4 py-2 text-center">
                        <input 
                          type="number" 
                          value={student.midterm}
                          onChange={(e) => handleGradeChange(student.id, 'midterm', e.target.value)}
                          className="w-16 bg-transparent border-none text-center focus:ring-0 focus:bg-surface-container-highest rounded text-white" 
                        />
                      </td>
                      <td className={`px-6 py-4 text-center font-extrabold ${isFailing ? 'text-error bg-error-container/10' : 'text-primary-container bg-slate-900/30'}`}>
                        {total}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-surface-container-low rounded-xl border-r-4 border-secondary flex gap-4 border border-white/5">
            <span className="material-symbols-outlined text-secondary">info</span>
            <div>
              <div className="text-sm font-bold text-white">Grade Validation</div>
              <p className="text-xs text-slate-500 mt-1">تلوين تلقائي باللون الأحمر لمن هم تحت 50%.</p>
            </div>
          </div>
          {/* ... بقية الكروت بنفس الطريقة ... */}
        </div>
      </div>
    </div>
  );
};

export default YearWorkEntry;