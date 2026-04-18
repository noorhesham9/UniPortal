import { useEffect, useState } from "react";
import { FiSave } from "react-icons/fi";
import { getCollegeInfo, updateCollegeInfo } from "../../../../services/publicServices";
import "./AdminCollegeInfo.css";

const EMPTY = {
  aboutText: "",
  vision: "",
  mission: "",
  deanMessage: { name: "", title: "عميد الكلية", message: "", imageUrl: "" },
  viceMessage: { name: "", title: "وكيل الكلية", message: "", imageUrl: "" },
};

export default function AdminCollegeInfo() {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getCollegeInfo().then((d) => {
      if (d.info) setForm({ ...EMPTY, ...d.info });
    }).catch(() => {});
  }, []);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const setNested = (section, key, val) =>
    setForm((f) => ({ ...f, [section]: { ...f[section], [key]: val } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCollegeInfo(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      alert("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="aci-page">
      <div className="aci-header">
        <div>
          <h1>College Info</h1>
          <p>Manage the public About page content.</p>
        </div>
        <button className="aci-save-btn" onClick={handleSave} disabled={saving}>
          <FiSave /> {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
        </button>
      </div>

      {/* ── General ── */}
      <section className="aci-section">
        <h2>عن الكلية</h2>
        <label>نبذة عامة
          <textarea rows={4} value={form.aboutText} onChange={(e) => set("aboutText", e.target.value)} placeholder="اكتب نبذة عن الكلية..." />
        </label>
        <div className="aci-row">
          <label>الرؤية
            <textarea rows={3} value={form.vision} onChange={(e) => set("vision", e.target.value)} placeholder="رؤية الكلية..." />
          </label>
          <label>الرسالة
            <textarea rows={3} value={form.mission} onChange={(e) => set("mission", e.target.value)} placeholder="رسالة الكلية..." />
          </label>
        </div>
      </section>

      {/* ── Dean ── */}
      <PersonSection
        title="كلمة العميد"
        data={form.deanMessage}
        onChange={(k, v) => setNested("deanMessage", k, v)}
      />

      {/* ── Vice ── */}
      <PersonSection
        title="كلمة الوكيل"
        data={form.viceMessage}
        onChange={(k, v) => setNested("viceMessage", k, v)}
      />
    </div>
  );
}

function PersonSection({ title, data, onChange }) {
  return (
    <section className="aci-section">
      <h2>{title}</h2>
      <div className="aci-row">
        <label>الاسم
          <input value={data.name} onChange={(e) => onChange("name", e.target.value)} placeholder="اسم الشخص" />
        </label>
        <label>اللقب
          <input value={data.title} onChange={(e) => onChange("title", e.target.value)} placeholder="عميد الكلية / وكيل الكلية" />
        </label>
      </div>
      <label>رابط الصورة (اختياري)
        <input value={data.imageUrl} onChange={(e) => onChange("imageUrl", e.target.value)} placeholder="https://..." />
      </label>
      <label>الكلمة
        <textarea rows={6} value={data.message} onChange={(e) => onChange("message", e.target.value)} placeholder={`اكتب ${title} هنا...`} />
      </label>
    </section>
  );
}
