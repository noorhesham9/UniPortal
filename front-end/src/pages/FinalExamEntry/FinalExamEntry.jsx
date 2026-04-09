import React, { useState, useEffect } from 'react';


const FinalExamEntry = () => {
  const [students, setStudents] = useState([]); // لستة الطلاب هتبدأ فاضية
  const [sections, setSections] = useState([]); // لستة السكاشن المتاحة للدكتور
  const [selectedSection, setSelectedSection] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. جلب السكاشن المتاحة للدكتور عند تحميل الصفحة
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await axios.get('/api/sections/my-sections'); // ده API افتراضي لجلب سكاشن الدكتور
        setSections(response.data.sections);
      } catch (error) {
        console.error("خطأ في جلب السكاشن:", error);
      }
    };
    fetchSections();
  }, []);

  // 2. سحب بيانات الطلاب "بجد" لما الدكتور يختار سكشن معين
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedSection) return;
      
      setLoading(true);
      try {
        const response = await axios.get(`/api/enrollments/section/${selectedSection}`);
        
        // تحويل البيانات من شكل الـ Backend لشكل الـ Table بتاعنا
        const formattedStudents = response.data.students.map(item => ({
          enrollmentId: item._id, // مهم جداً عشان الحفظ
          id: item.student?._id, // ID الطالب
          studentCode: item.student?.code || "N/A", // كود الطالب
          name: item.student?.name,
          yearWork: (item.grades_object?.attendance || 0) + 
                     (item.grades_object?.quizzes || 0) + 
                     (item.grades_object?.midterm || 0),
          finalExam: item.grades_object?.finalExam || "",
          isLocked: item.isGradeLocked
        }));
        
        setStudents(formattedStudents);
      } catch (error) {
        alert("حدث خطأ أثناء سحب بيانات الطلاب");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedSection]);

  // دالة الحفظ النهائي
  const handlePublish = async () => {
    try {
      const finalData = students.map(s => ({
        enrollmentId: s.enrollmentId,
        finalExam: s.finalExam,
        totalGrade: s.yearWork + (parseInt(s.finalExam) || 0),
        letterGrade: calculateGrade(s.yearWork + (parseInt(s.finalExam) || 0)).label
      }));

      await axios.post('/api/enrollments/bulk-update-final', { finalGradesData: finalData });
      alert("تم نشر النتائج بنجاح!");
    } catch (error) {
      alert("فشل في حفظ البيانات");
    }
  };

  return (
    <div>
      <h1>إدخال درجات الامتحان النهائي</h1>
      <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
        <option value="">اختر سكشن</option>
        {sections.map((section) => (
          <option key={section._id} value={section._id}>{section.name}</option>
        ))}
      </select>
      {loading ? <p>جاري التحميل...</p> : <table>{/* add your table content here */}</table>}
      <button onClick={handlePublish}>نشر النتائج</button>
    </div>
  )
};