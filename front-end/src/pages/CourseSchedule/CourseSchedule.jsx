import { useState, useEffect } from "react";

const CourseSchedule = () => {
  const [courses, setCourses] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [formData, setFormData] = useState({
    course_id: "",
    instructor_id: "",
    room_id: "",
    day: "",
    start_time: "",
    end_time: "",
    semester_id: "",
  });

  // جيب البيانات من الـ API
  useEffect(() => {
    fetch("http://localhost:3000/api/v1/courses")
      .then((res) => res.json())
      .then((data) => setCourses(data))
      .catch((err) => console.error(err));

    fetch("http://localhost:3000/api/v1/users?role=instructor")
      .then((res) => res.json())
      .then((data) => setDoctors(data))
      .catch((err) => console.error(err));

    fetch("http://localhost:3000/api/v1/rooms")
      .then((res) => res.json())
      .then((data) => setRooms(data))
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/api/v1/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      alert("Section created successfully!");
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>طرح المقررات والجداول</h2>
      <form onSubmit={handleSubmit}>

        <div>
          <label>المادة:</label>
          <select name="course_id" value={formData.course_id} onChange={handleChange} required>
            <option value="">اختر المادة</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>{course.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label>الدكتور:</label>
          <select name="instructor_id" value={formData.instructor_id} onChange={handleChange} required>
            <option value="">اختر الدكتور</option>
            {doctors.map((doc) => (
              <option key={doc._id} value={doc._id}>{doc.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>القاعة:</label>
          <select name="room_id" value={formData.room_id} onChange={handleChange} required>
            <option value="">اختر القاعة</option>
            {rooms.map((room) => (
              <option key={room._id} value={room._id}>{room.room_number}</option>
            ))}
          </select>
        </div>

        <div>
          <label>اليوم:</label>
          <select name="day" value={formData.day} onChange={handleChange} required>
            <option value="">اختر اليوم</option>
            <option value="Saturday">السبت</option>
            <option value="Sunday">الأحد</option>
            <option value="Monday">الاثنين</option>
            <option value="Tuesday">الثلاثاء</option>
            <option value="Wednesday">الأربعاء</option>
            <option value="Thursday">الخميس</option>
          </select>
        </div>

        <div>
          <label>وقت البداية:</label>
          <input type="time" name="start_time" value={formData.start_time} onChange={handleChange} required />
        </div>

        <div>
          <label>وقت النهاية:</label>
          <input type="time" name="end_time" value={formData.end_time} onChange={handleChange} required />
        </div>

        <button type="submit">إنشاء جدول</button>
      </form>
    </div>
  );
};

export default CourseSchedule;