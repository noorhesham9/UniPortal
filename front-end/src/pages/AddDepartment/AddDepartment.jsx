  import React, { useState } from "react";

  export default function Test() {
    const [active, setActive] = useState(true);

    return (
      <div className="dept-page-wrapper">
        <div className="dept-container">
          <button className="dept-back-btn">
            <span>←</span> Back to Department List
          </button>

          <header className="dept-header">
            <h1>Add New Department</h1>
            <p>
              Create a new academic or administrative unit. Ensure all required 
              fields are filled to maintain system integrity.
            </p>
          </header>

          <div className="dept-card">
            <form onSubmit={(e) => e.preventDefault()}>
              
              <div className="dept-form-row">
                <div className="dept-input-group">
                  <label>Department Name (English)</label>
                  <input type="text" placeholder="e.g. Faculty of Computer Science" />
                </div>
                <div className="dept-input-group rtl-text">
                  <label>اسم القسم (بالعربية)</label>
                  <input dir="rtl" type="text" placeholder="مثلاً كلية علوم الحاسب" />
                </div>
              </div>

              <div className="dept-form-row">
                <div className="dept-input-group">
                  <label>Department Code</label>
                  <input className="code-input" type="text" placeholder="E.G. CS-ADMIN-01" />
                </div>
                <div className="dept-input-group">
                  <label>Head of Department</label>
                  <div className="custom-select-container">
                    <select>
                      <option value="" disabled selected>Select Faculty Member</option>
                      <option>Dr. Ahmed Ali</option>
                      <option>Dr. Sara Mohamed</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="dept-input-group full-width">
                <label>Description</label>
                <textarea placeholder="Provide a brief overview of the department's objectives and core functions..."></textarea>
              </div>

              <div className="dept-status-bar">
                <div className="status-label-box">
                  <h3>Department Status</h3>
                  <p>Control visibility and active operations for this department.</p>
                </div>
                <div className="status-control">
                  <div 
                    className={`dept-switch ${active ? "is-active" : ""}`}
                    onClick={() => setActive(!active)}
                  >
                    <div className="dept-knob"></div>
                  </div>
                  <span className="status-display">{active ? "Active" : "Inactive"}</span>
                </div>
              </div>

              <div className="dept-actions">
                <button type="submit" className="dept-btn-save">
                  <span className="plus">+</span> Create Department
                </button>
                <button type="button" className="dept-btn-cancel">Cancel</button>
              </div>

            </form>
          </div>
        </div>

        <style>{`
          :root {
            --bg-main: #0f172a;
            --bg-card: #1e293b;
            --accent: #facc15;
            --text-p: #94a3b8;
            --border: #334155;
            --input-bg: #0f172a;
          }

          .dept-page-wrapper {
            background-color: var(--bg-main);
            min-height: 100vh;
            padding: 60px 20px;
            color: white;
            font-family: 'Segoe UI', system-ui, sans-serif;
            display: flex;
            justify-content: center;
          }

          .dept-container {
            width: 100%;
            max-width: 950px;
          }

          .dept-back-btn {
            background: none;
            border: none;
            color: var(--accent);
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 24px;
            font-size: 14px;
          }

          .dept-header h1 {
            font-size: 38px;
            font-weight: 800;
            margin: 0 0 12px 0;
            letter-spacing: -1px;
          }

          .dept-header p {
            color: var(--text-p);
            max-width: 650px;
            line-height: 1.6;
            margin-bottom: 40px;
            font-size: 14.5px;
          }

          .dept-card {
            background: var(--bg-card);
            border-radius: 20px;
            padding: 40px;
            border: 1px solid rgba(255, 255, 255, 0.05);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          }

          .dept-form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 25px;
          }

          .dept-input-group {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .dept-input-group label {
            font-size: 14px;
            font-weight: 600;
            color: #e2e8f0;
          }

          .dept-input-group input, 
          .dept-input-group select, 
          .dept-input-group textarea {
            background: var(--input-bg);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 14px 16px;
            color: white;
            font-size: 14px;
            outline: none;
            transition: all 0.2s ease;
          }

          .dept-input-group input:focus,  
          .dept-input-group textarea:focus {
            border-color: var(--accent);
            box-shadow: 0 0 0 3px rgba(250, 204, 21, 0.1);
          }

          .code-input { text-transform: uppercase; }
          .rtl-text { text-align: right; }
          .full-width { margin-bottom: 30px; }
          
          textarea { height: 130px; resize: none; }

          .dept-status-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 30px 0;
            border-top: 1px solid var(--border);
            margin-bottom: 30px;
          }

          .status-label-box h3 { font-size: 16px; margin-bottom: 4px; }
          .status-label-box p { color: var(--text-p); font-size: 13px; }

          .status-control { display: flex; align-items: center; gap: 15px; }

          .dept-switch {
            width: 56px;
            height: 28px;
            background: #334155;
            border-radius: 30px;
            position: relative;
            cursor: pointer;
            transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .dept-knob {
            width: 20px;
            height: 20px;
            background: white;
            border-radius: 50%;
            position: absolute;
            top: 4px;
            left: 4px;
            transition: 0.3s;
          }

          .is-active { background: var(--accent); }
          .is-active .dept-knob { left: 32px; }

          .status-display { font-weight: 700; font-size: 14px; min-width: 60px; }

          .dept-actions { display: flex; gap: 16px; }

          .dept-btn-save {
            background: var(--accent);
            color: black;
            border: none;
            padding: 14px 28px;
            border-radius: 12px;
            font-weight: 800;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 15px;
          }

          .dept-btn-cancel {
            background: #334155;
            color: #e2e8f0;
            border: none;
            padding: 14px 32px;
            border-radius: 12px;
            font-weight: 700;
            cursor: pointer;
          }

          @media (max-width: 768px) {
            .dept-form-row { grid-template-columns: 1fr; }
          }
        `}</style>
      </div>
    );
  }