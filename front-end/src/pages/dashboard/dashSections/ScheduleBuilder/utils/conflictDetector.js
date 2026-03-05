/**
 * دالة مساعدة لتحويل الوقت النصي إلى دقائق لتسهيل المقارنة
 * مثال: "09:30 AM" هتتحول لـ 570 دقيقة
 */
const timeToMinutes = (timeStr) => {
  // 👈 السطر ده مهم جداً: حماية عشان لو المادة ملهاش وقت متضربش إيرور
  if (!timeStr) return 0; 

  const [time, modifier] = timeStr.split(' '); // فصل الوقت عن AM/PM
  let [hours, minutes] = time.split(':').map(Number);

  if (hours === 12) {
    hours = modifier === 'AM' ? 0 : 12;
  } else if (modifier === 'PM') {
    hours += 12;
  }

  return hours * 60 + minutes;
};

/**
 * الدالة الرئيسية لاكتشاف التعارض
 * @param {Object} newCourse - المادة اللي الطالب بيحاول يضيفها
 * @param {Array} currentSchedule - قائمة المواد الموجودة حالياً في الجدول
 * @returns {Object} - بترجع أوبجكت يوضح في تعارض ولا لأ، ومع أي مادة
 */
export const detectConflict = (newCourse, currentSchedule) => {
  // لو الجدول فاضي، مفيش تعارض أكيد
  if (!currentSchedule || currentSchedule.length === 0) {
    return { hasConflict: false, conflictingCourse: null };
  }

  // تحويل وقت المادة الجديدة لدقائق
  const newStart = timeToMinutes(newCourse.startTime);
  const newEnd = timeToMinutes(newCourse.endTime);

  for (const scheduledCourse of currentSchedule) {
    // 1. هل المادتين في نفس اليوم؟ (بنقارن مصفوفة الأيام)
    // هنا بنعمل حماية إضافية عشان نتأكد إن days مبعوتة كـ Array
    const newDays = Array.isArray(newCourse.days) ? newCourse.days : [];
    const scheduledDays = Array.isArray(scheduledCourse.days) ? scheduledCourse.days : [];

    const sharedDays = newDays.filter(day => 
      scheduledDays.includes(day)
    );

    if (sharedDays.length > 0) {
      // 2. لو في أيام مشتركة، نحول وقت المادة الموجودة في الجدول لدقائق
      const scheduledStart = timeToMinutes(scheduledCourse.startTime);
      const scheduledEnd = timeToMinutes(scheduledCourse.endTime);

      // 3. معادلة اكتشاف التداخل: 
      // (بداية المادة الأولى < نهاية التانية) وَ (نهاية الأولى > بداية التانية)
      if (newStart < scheduledEnd && newEnd > scheduledStart) {
        return {
          hasConflict: true,
          conflictingCourse: scheduledCourse // بنرجع المادة اللي عملت المشكلة عشان نظهرها في الـ UI
        };
      }
    }
  }

  // لو اللوب خلص ومفيش أي تداخل
  return { hasConflict: false, conflictingCourse: null };
};