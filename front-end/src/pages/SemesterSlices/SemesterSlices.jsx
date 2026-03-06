import { useState } from "react";

const SemesterSlices = () => {
  const [formData, setFormData] = useState({
    year: "",
    term: "",
    is_active: false,
    start_date: "",
    end_date: "",
    max_credits_rules: "",
    add_drop_start: "",
    add_drop_end: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/api/v1/semesters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      alert("Semester created successfully!");
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>شرائح التسجيل</h2>
      <form onSubmit={handleSubmit}>

        <div>
          <label>السنة:</label>
          <input type="number" name="year" value={formData.year}
            onChange={handleChange} required />
        </div>

        <div>
          <label>الترم:</label>
          <select name="term" value={formData.term} onChange={handleChange} required>
            <option value="">اختر الترم</option>
            <option value="Fall">Fall</option>
            <option value="Spring">Spring</option>
            <option value="Summer">Summer</option>
          </select>
        </div>

        <div>
          <label>تاريخ البداية:</label>
          <input type="date" name="start_date" value={formData.start_date}
            onChange={handleChange} required />
        </div>

        <div>
          <label>تاريخ النهاية:</label>
          <input type="date" name="end_date" value={formData.end_date}
            onChange={handleChange} required />
        </div>

        <div>
          <label>بداية Add/Drop:</label>
          <input type="date" name="add_drop_start" value={formData.add_drop_start}
            onChange={handleChange} />
        </div>

        <div>
          <label>نهاية Add/Drop:</label>
          <input type="date" name="add_drop_end" value={formData.add_drop_end}
            onChange={handleChange} />
        </div>

        <div>
          <label>الحد الأقصى للساعات:</label>
          <input type="text" name="max_credits_rules" value={formData.max_credits_rules}
            onChange={handleChange} />
        </div>

        <div>
          <label>فعّال؟</label>
          <input type="checkbox" name="is_active" checked={formData.is_active}
            onChange={handleChange} />
        </div>

        <button type="submit">إنشاء شريحة</button>
      </form>
    </div>
  );
};

export default SemesterSlices;