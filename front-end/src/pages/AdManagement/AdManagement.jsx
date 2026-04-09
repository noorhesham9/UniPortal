import { useState } from "react";

const mockAds = [
  {
    id: 1,
    title: "التسجيل المبكر لفصل الخريف",
    subtitle: "للعام الجامعي 2023-2024",
    status: "active",
    views: "12.4K",
    clicks: "842",
    conversion: "6.8%",
    date: "12 أكتوبر 2023",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBwCnSdKiT5TdJDRb4jadRj2a9HBQ7AH2tk06fom-gyCfL3QjLdRREQCoRXF3zitzMKWjtoYcwkA_9gdL1W7zXlqFOlEW6S1HFJ6kuQz5YXdym8lS2XW7tLVk6qCS-7paYkty-wMqs2H8CtEhn25fHk05Do4CRVbKcIkQ1HjiI6ewVlrJ4oyW-Kd5bgK2Q7uEDV5XcCRZE2P0P_t65dgedGRzvdSoN0EsMGwdLLp8jBknTrt1DxZxkiUfIG5BiSIh78AU0LwV8dGS4",
  },
  {
    id: 2,
    title: "ندوة الابتكار الرقمي في الكيمياء",
    subtitle: "مؤتمر دولي 2024",
    status: "draft",
    kpiNote: "في انتظار المراجعة النهائية",
    date: "منذ يومين",
    icon: "science",
  },
  {
    id: 3,
    title: "منح البحث العلمي لطلاب الدراسات العليا",
    subtitle: "برامج تمويل المعامل",
    status: "draft",
    kpiNote: "بانتظار موافقة العميد",
    date: "منذ 5 أيام",
    icon: "experiment",
  },
];

const statusLabel = {
  active: { text: "ACTIVE", cls: "bg-green-100 text-green-800 border-green-200" },
  draft: { text: "DRAFT", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  archived: { text: "ARCHIVED", cls: "bg-slate-100 text-slate-500 border-slate-200" },
};

export default function AdManagement() {
  const [ads, setAds] = useState(mockAds);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState("newest");

  const handleDelete = (id) => setAds((prev) => prev.filter((a) => a.id !== id));

  const filtered = ads
    .filter((a) => {
      const matchSearch = a.title.includes(search) || a.subtitle.includes(search);
      const matchStatus = statusFilter ? a.status === statusFilter : true;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => (sort === "newest" ? b.id - a.id : a.id - b.id));

  return (
    <div
      dir="rtl"
      style={{ fontFamily: "'Cairo', sans-serif", background: "#f4f6f4", minHeight: "100vh" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Amiri:wght@400;700&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      <div style={{ padding: "2.5rem", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "2rem", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 900, color: "#005b41", margin: 0 }}>
            إدارة الحملات الإعلانية
          </h2>
          <p style={{ color: "#64748b", marginTop: "0.5rem", fontWeight: 500 }}>
            نظام الإشراف المركزي على الإعلانات والبيانات الأكاديمية لكلية العلوم.
          </p>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "0.75rem",
            border: "1px solid #e2e8f0",
            padding: "1.25rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            alignItems: "center",
            marginBottom: "1.5rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ position: "relative", flexGrow: 1, maxWidth: "400px" }}>
            <span
              className="material-symbols-outlined"
              style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "1.2rem" }}
            >
              search
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث في سجل الإعلانات..."
              style={{
                width: "100%",
                paddingRight: "2.5rem",
                paddingLeft: "1rem",
                paddingTop: "0.75rem",
                paddingBottom: "0.75rem",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                fontFamily: "inherit",
                outline: "none",
              }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={selectStyle}
          >
            <option value="">حالة الإعلان: الكل</option>
            <option value="active">منشور (Active)</option>
            <option value="draft">مسودة (Draft)</option>
            <option value="archived">مؤرشف (Archived)</option>
          </select>

          <select value={sort} onChange={(e) => setSort(e.target.value)} style={selectStyle}>
            <option value="newest">الأحدث تاريخاً</option>
            <option value="oldest">الأقدم تاريخاً</option>
          </select>

          <button
            onClick={() => { setSearch(""); setStatusFilter(""); setSort("newest"); }}
            style={resetBtnStyle}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>restart_alt</span>
            إعادة ضبط
          </button>

          <div style={{ marginRight: "auto" }}>
            <button style={publishBtnStyle}>
              <span className="material-symbols-outlined">publish</span>
              نشر إعلان جديد
            </button>
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  {["تفاصيل الإعلان الأكاديمي", "الحالة التشغيلية", "مؤشرات الأداء (KPIs)", "تاريخ النشر", "إجراءات المدير"].map((h, i) => (
                    <th key={i} style={{ padding: "1.25rem 1.5rem", fontSize: "0.7rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", textAlign: i === 4 ? "left" : i === 1 || i === 2 ? "center" : "right" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((ad) => (
                  <tr key={ad.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "1.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "0.5rem", overflow: "hidden", border: "1px solid #e2e8f0", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f5ee" }}>
                          {ad.img ? (
                            <img src={ad.img} alt="ad" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <span className="material-symbols-outlined" style={{ fontSize: "1.75rem", color: "#cbd5e1" }}>{ad.icon}</span>
                          )}
                        </div>
                        <div>
                          <h4 style={{ fontWeight: 900, color: "#005b41", margin: 0 }}>{ad.title}</h4>
                          <p style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 700, margin: "0.2rem 0 0" }}>{ad.subtitle}</p>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: "1.5rem", textAlign: "center" }}>
                      <span style={{ padding: "0.35rem 1rem", borderRadius: "9999px", fontSize: "0.65rem", fontWeight: 900, letterSpacing: "0.1em", border: "1px solid", ...statusBadgeStyle(ad.status) }}>
                        {statusLabel[ad.status]?.text}
                      </span>
                    </td>

                    <td style={{ padding: "1.5rem", textAlign: "center" }}>
                      {ad.status === "active" ? (
                        <div style={{ display: "flex", justifyContent: "center", gap: "2rem" }}>
                          <div style={{ textAlign: "center" }}>
                            <p style={{ fontSize: "0.6rem", textTransform: "uppercase", color: "#94a3b8", fontWeight: 900, margin: 0 }}>المشاهدات</p>
                            <p style={{ fontWeight: 900, color: "#005b41", fontSize: "1.1rem", margin: "0.2rem 0 0" }}>{ad.views}</p>
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <p style={{ fontSize: "0.6rem", textTransform: "uppercase", color: "#94a3b8", fontWeight: 900, margin: 0 }}>النقرات</p>
                            <p style={{ fontWeight: 900, color: "#8c733e", fontSize: "1.1rem", margin: "0.2rem 0 0" }}>{ad.clicks}</p>
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <p style={{ fontSize: "0.6rem", textTransform: "uppercase", color: "#94a3b8", fontWeight: 900, margin: 0 }}>التحويل</p>
                            <p style={{ fontWeight: 900, color: "#005b41", fontSize: "1.1rem", margin: "0.2rem 0 0" }}>{ad.conversion}</p>
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "0.875rem" }}>{ad.kpiNote}</span>
                      )}
                    </td>

                    <td style={{ padding: "1.5rem", fontSize: "0.875rem", color: "#475569", fontWeight: 700 }}>{ad.date}</td>

                    <td style={{ padding: "1.5rem", textAlign: "left" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.75rem" }}>
                        <button style={iconBtnStyle} title="تعديل">
                          <span className="material-symbols-outlined" style={{ fontSize: "1.25rem" }}>edit_square</span>
                        </button>
                        <button onClick={() => handleDelete(ad.id)} style={{ ...iconBtnStyle, color: "#ba1a1a" }} title="حذف">
                          <span className="material-symbols-outlined" style={{ fontSize: "1.25rem" }}>delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "#94a3b8", fontWeight: 700 }}>
                      لا توجد إعلانات مطابقة للبحث
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ background: "#f8fafc", padding: "1rem 1.5rem", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: "#64748b", fontWeight: 700 }}>
            <span>عرض 1-{filtered.length} من أصل {ads.length} إعلان في النظام</span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button style={pageBtnStyle(false)}>السابق</button>
              <button style={pageBtnStyle(true)}>التالي</button>
            </div>
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: "1rem", border: "2px solid rgba(140,115,62,0.1)", padding: "3rem", marginTop: "2.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
            <div>
              <span style={{ display: "inline-block", padding: "0.35rem 1rem", background: "#f8f5ee", color: "#8c733e", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem" }}>
                المستودع الرقمي
              </span>
              <h3 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#005b41", margin: "0 0 1rem" }}>مركز رفع الوسائط الإعلانية</h3>
              <p style={{ color: "#475569", lineHeight: 1.8, fontWeight: 500, marginBottom: "1.5rem" }}>
                يرجى تحميل المواد الدعائية للحملات (صور، ملصقات، أو فيديوهات تعريفية). ستخضع كافة المواد لمراجعة قسم العلاقات العامة بالكلية.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {["أقصى حجم للملف: 50 ميجابايت", "الدقة المفضلة: Full HD (1920x1080)", "تنسيقات الملفات: JPG, PNG, MP4, PDF"].map((item) => (
                  <li key={item} style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#374151", fontWeight: 700 }}>
                    <span className="material-symbols-outlined" style={{ color: "#8c733e", fontSize: "1.4rem" }}>task_alt</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ background: "#f8fafc", borderRadius: "1.5rem", border: "3px dashed #e2e8f0", padding: "3rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem", textAlign: "center" }}>
              <div style={{ width: "5rem", height: "5rem", borderRadius: "1rem", background: "#f8f5ee", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "2.5rem", color: "#8c733e" }}>cloud_upload</span>
              </div>
              <div>
                <p style={{ fontWeight: 900, fontSize: "1.1rem", color: "#005b41", margin: 0 }}>اسحب الملفات هنا للبدء</p>
                <p style={{ fontSize: "0.875rem", color: "#94a3b8", marginTop: "0.5rem", fontWeight: 700 }}>أو انقر لاختيار ملف من جهازك</p>
              </div>
              <button style={publishBtnStyle}>تصفح الملفات</button>
            </div>
          </div>
        </div>

        <footer style={{ textAlign: "center", paddingTop: "2.5rem", borderTop: "1px solid #e2e8f0", marginTop: "2.5rem", opacity: 0.6 }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", margin: 0 }}>نظام إدارة الإعلانات الرقمي © 2024 - جامعة القاهرة - كلية العلوم</p>
          <p style={{ fontSize: "0.65rem", color: "#94a3b8", marginTop: "0.25rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Academic Excellence Since 1925</p>
        </footer>
      </div>
    </div>
  );
}

const selectStyle = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "0.5rem",
  fontSize: "0.875rem",
  padding: "0.75rem 1rem",
  fontFamily: "inherit",
  fontWeight: 700,
  color: "#475569",
  outline: "none",
  cursor: "pointer",
};

const resetBtnStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.75rem 1rem",
  fontSize: "0.875rem",
  fontWeight: 700,
  color: "#64748b",
  background: "transparent",
  border: "none",
  borderRadius: "0.5rem",
  cursor: "pointer",
  fontFamily: "inherit",
};

const publishBtnStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "0.875rem 2rem",
  background: "linear-gradient(135deg, #005b41 0%, #003a29 100%)",
  color: "#fff",
  borderRadius: "0.75rem",
  border: "none",
  fontWeight: 900,
  fontSize: "0.9rem",
  cursor: "pointer",
  fontFamily: "inherit",
  boxShadow: "0 4px 15px rgba(0,91,65,0.2)",
};

const iconBtnStyle = {
  width: "2.5rem",
  height: "2.5rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "0.5rem",
  background: "#f1f5f9",
  border: "none",
  cursor: "pointer",
  color: "#374151",
};

const pageBtnStyle = (active) => ({
  padding: "0.25rem 0.75rem",
  borderRadius: "0.25rem",
  border: `1px solid ${active ? "#005b41" : "#cbd5e1"}`,
  background: active ? "#005b41" : "#fff",
  color: active ? "#fff" : "#475569",
  cursor: "pointer",
  fontFamily: "inherit",
  fontWeight: 700,
  fontSize: "0.75rem",
});

const statusBadgeStyle = (status) => {
  const map = {
    active: { background: "#dcfce7", color: "#166534", borderColor: "#bbf7d0" },
    draft: { background: "#fffbeb", color: "#92400e", borderColor: "#fde68a" },
    archived: { background: "#f1f5f9", color: "#64748b", borderColor: "#e2e8f0" },
  };
  return map[status] || map.archived;
};
