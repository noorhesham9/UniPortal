import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("Personal Info");
  const [photo, setPhoto] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "John Doe",
    email: user?.email || "john@university.edu",
    phone: user?.phone || "",
    address: user?.address || "",
  });

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) setPhoto(URL.createObjectURL(file));
  };

  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (file) setReceiptFile(file);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    console.log("Saved:", formData);
    setIsEditing(false);
  };

  const menuItems = [
    { label: "Personal Info", icon: "👤" },
    { label: "Financial Records", icon: "💳" },
    { label: "Courses", icon: "📚" },
    { label: "Settings", icon: "⚙️" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#0d1117", color: "white", fontFamily: "Arial" }}>

      {/* Top Navbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 30px", backgroundColor: "#161b22", borderBottom: "1px solid #21262d" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ backgroundColor: "#f0a500", borderRadius: "8px", padding: "8px", fontSize: "18px" }}>🎓</div>
          <div>
            <div style={{ fontWeight: "bold" }}>Student Portal</div>
            <div style={{ fontSize: "11px", color: "#8b949e" }}>Academic Session 2024-2025</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <button onClick={() => navigate("/dashboard")} style={{ padding: "8px 20px", backgroundColor: "transparent", border: "none", color: "white", cursor: "pointer", fontSize: "15px" }}>
            Cancel
          </button>
          <button onClick={isEditing ? handleSave : () => setIsEditing(true)} style={{ padding: "8px 22px", backgroundColor: "#f0a500", border: "none", borderRadius: "8px", color: "#000", fontWeight: "bold", cursor: "pointer", fontSize: "14px" }}>
            {isEditing ? "Save Changes" : "Edit Profile"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: "flex", flex: 1 }}>

        {/* Sidebar */}
        <div style={{ width: "260px", backgroundColor: "#161b22", padding: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ backgroundColor: "#21262d", borderRadius: "10px", padding: "15px", display: "flex", alignItems: "center", gap: "12px", marginBottom: "15px" }}>
            <div style={{ backgroundColor: "#f0a500", borderRadius: "50%", width: "45px", height: "45px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "16px", color: "#000", overflow: "hidden" }}>
              {photo
                ? <img src={photo} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : (user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase() : "JD")}
            </div>
            <div>
              <div style={{ fontWeight: "bold" }}>{formData.name}</div>
              <div style={{ fontSize: "12px", color: "#8b949e" }}>ID: {user?.studentId || "STU-88291"}</div>
            </div>
          </div>{menuItems.map((item) => (
            <div
              key={item.label}
              onClick={() => setActiveTab(item.label)}
              style={{
                padding: "12px 15px",
                borderRadius: "8px",
                cursor: "pointer",
                backgroundColor: activeTab === item.label ? "#21262d" : "transparent",
                color: activeTab === item.label ? "#f0a500" : "white",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                borderLeft: activeTab === item.label ? "3px solid #f0a500" : "3px solid transparent"
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: "30px" }}>

          {/* Personal Info */}
          {activeTab === "Personal Info" && (
            <div style={{ backgroundColor: "#161b22", borderRadius: "12px", padding: "30px" }}>
              <h2 style={{ marginBottom: "8px" }}>👤 Profile Photo</h2>
              <p style={{ color: "#8b949e", marginBottom: "25px" }}>Upload a formal photo for your student ID and digital profile.</p>

              {/* Photo Upload */}
              <div style={{ border: "2px dashed #30363d", borderRadius: "10px", padding: "40px 20px", textAlign: "center", marginBottom: "25px" }}>
                {photo ? (
                  <img src={photo} alt="profile" style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover", marginBottom: "15px" }} />
                ) : (
                  <div style={{ backgroundColor: "#21262d", width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 15px", fontSize: "35px" }}>
                    📷
                  </div>
                )}
                <div style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "8px" }}>Upload Personal Photo</div>
                <div style={{ color: "#8b949e", fontSize: "13px", marginBottom: "5px" }}>Drag and drop or click to browse</div>
                <div style={{ color: "#8b949e", fontSize: "11px", marginBottom: "20px" }}>JPG OR PNG (MAX. 2MB)</div>
                <label style={{ padding: "10px 28px", backgroundColor: "#21262d", border: "1px solid #30363d", borderRadius: "8px", color: "#f0a500", cursor: "pointer", fontWeight: "bold" }}>
                  Select Photo
                  <input type="file" accept=".jpg,.png" onChange={handlePhotoUpload} style={{ display: "none" }} />
                </label>
              </div>

              {/* Edit Form */}
              {isEditing && (
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  <h3 style={{ marginBottom: "5px" }}>✏️ Edit Information</h3>
                  {[
                    { label: "Full Name", name: "name", type: "text" },
                    { label: "Email", name: "email", type: "email" },
                    { label: "Phone", name: "phone", type: "text" },
                    { label: "Address", name: "address", type: "text" },
                  ].map((field) => (
                    <div key={field.name}>
                      <label style={{ display: "block", marginBottom: "6px", color: "#8b949e", fontSize: "13px" }}>{field.label}</label>
                      <input
                        type={field.type}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        style={{ width: "100%", padding: "12px 15px", backgroundColor: "#21262d", border: "1px solid #30363d", borderRadius: "8px", color: "white", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                      />
                    </div>
                  ))}
                </div>
              )}{/* Display Info */}
              {!isEditing && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  {[
                    { label: "Full Name", value: formData.name },
                    { label: "Email", value: formData.email },
                    { label: "Phone", value: formData.phone || "Not set" },
                    { label: "Address", value: formData.address || "Not set" },
                    { label: "Department", value: user?.department || "Computer Science" },
                    { label: "Level", value: user?.level || "3rd Year" },
                  ].map((field) => (
                    <div key={field.label} style={{ backgroundColor: "#21262d", borderRadius: "8px", padding: "15px" }}>
                      <div style={{ fontSize: "12px", color: "#8b949e", marginBottom: "6px" }}>{field.label}</div>
                      <div style={{ fontWeight: "bold" }}>{field.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Financial Records */}
          {activeTab === "Financial Records" && (
            <div style={{ backgroundColor: "#161b22", borderRadius: "12px", padding: "30px" }}>
              <h2 style={{ marginBottom: "8px" }}>💳 Financial Records</h2>
              <p style={{ color: "#8b949e", marginBottom: "25px" }}>Upload your payment receipt for this semester.</p>
              <div style={{ border: "2px dashed #30363d", borderRadius: "10px", padding: "60px 20px", textAlign: "center" }}>
                <div style={{ fontSize: "40px", marginBottom: "15px" }}>📄</div>
                <div style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "8px" }}>Upload Payment Receipt</div>
                <div style={{ color: "#8b949e", fontSize: "13px", marginBottom: "5px" }}>PDF, JPG OR PNG (MAX. 5MB)</div>
                {receiptFile && (
                  <div style={{ color: "#f0a500", margin: "15px 0" }}>✅ {receiptFile.name}</div>
                )}
                <label style={{ padding: "10px 28px", backgroundColor: "#21262d", border: "1px solid #30363d", borderRadius: "8px", color: "#f0a500", cursor: "pointer", fontWeight: "bold" }}>
                  Select File
                  <input type="file" accept=".pdf,.jpg,.png" onChange={handleReceiptUpload} style={{ display: "none" }} />
                </label>
              </div>
            </div>
          )}

          {activeTab === "Courses" && (
            <div style={{ backgroundColor: "#161b22", borderRadius: "12px", padding: "30px" }}>
              <h2>📚 My Courses</h2>
              <p style={{ color: "#8b949e" }}>Your enrolled courses will appear here.</p>
            </div>
          )}

          {activeTab === "Settings" && (
            <div style={{ backgroundColor: "#161b22", borderRadius: "12px", padding: "30px" }}>
              <h2>⚙️ Settings</h2>
              <p style={{ color: "#8b949e" }}>Settings options will appear here.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;