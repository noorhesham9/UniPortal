// // src/pages/EditCourse/EditCourse.jsx
// import React, { useState } from 'react';
// import './EditCourse.css';
// // السطر ده هو اللي هنعتمد عليه عشان نمشي مع نظام نور
// import { createCourse, getAllCourses, getDepartments } from '../../services/CourseServices';
// const EditCourse = () => {
//     const [loading, setLoading] = useState(false);
//     const [course, setCourse] = useState({
//         name: 'Advanced Distributed Systems',
//         code: 'CS-402',
//         department: 'Computer Science & Engineering',
//         credits: 4,
//         description: 'This course covers advanced concepts in distributed systems including consensus algorithms, scalability, fault tolerance, and cloud infrastructure design.'
//     });

//     const handleSave = async () => {
//         setLoading(true);
//         try {
//             // استخدام الـ API بتاعك
//             await apiClient.put(`/courses/${course.code}`, course);
//             alert("تم حفظ التعديلات!");
//         } catch (error) {
//             console.error(error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="edit-course-wrapper">
//             <div className="breadcrumb">Courses / {course.code}</div>
            
//             <header className="page-header">
//                 <div>
//                     <h1>Edit Course</h1>
//                     <p>Update the curriculum and administrative details for this unit.</p>
//                 </div>
//                 <div className="action-buttons">
//                     <button className="btn-cancel">Cancel</button>
//                     <button className="btn-save" onClick={handleSave}>
//                         {loading ? 'Saving...' : 'Save Changes'}
//                     </button>
//                 </div>
//             </header>

//             <div className="main-layout">
//                 <div className="left-section">
//                     {/* Identification */}
//                     <div className="content-card">
//                         <div className="card-header">
//                             <span className="icon-yellow">ⓘ</span> Course Identification
//                         </div>
//                         <div className="form-grid">
//                             <div className="form-group">
//                                 <label>Course Name</label>
//                                 <input value={course.name} onChange={(e) => setCourse({...course, name: e.target.value})} />
//                             </div>
//                             <div className="form-group">
//                                 <label>Course Code</label>
//                                 <input value={course.code} readOnly />
//                             </div>
//                             <div className="form-group">
//                                 <label>Department</label>
//                                 <select value={course.department}>
//                                     <option>{course.department}</option>
//                                 </select>
//                             </div>
//                             <div className="form-group">
//                                 <label>Credits</label>
//                                 <input type="number" value={course.credits} />
//                             </div>
//                         </div>
//                     </div>

//                     {/* Description */}
//                     <div className="content-card">
//                         <div className="card-header">
//                             <span className="icon-yellow">📄</span> Course Description & Prerequisites
//                         </div>
//                         <div className="form-group">
//                             <label>Full Description</label>
//                             <textarea 
//                                 rows="6" 
//                                 value={course.description} 
//                                 onChange={(e) => setCourse({...course, description: e.target.value})}
//                             />
//                         </div>
//                         <div className="form-group" style={{marginTop: '1.5rem'}}>
//                             <label>Prerequisites</label>
//                             <div className="prerequisites-list">
//                                 <div className="chip">CS-201 Data Structures ✕</div>
//                                 <div className="chip">CS-305 Operating Systems ✕</div>
//                                 <button className="btn-add-course">+ Add Course</button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="right-section">
//                     {/* Settings */}
//                     <div className="content-card">
//                         <div className="card-header">Settings</div>
//                         <div className="setting-item">
//                             <div className="setting-info">
//                                 <h4>Active Status</h4>
//                                 <p>Currently visible to students</p>
//                             </div>
//                             <input type="checkbox" defaultChecked />
//                         </div>
//                         <div className="setting-item">
//                             <div className="setting-info">
//                                 <h4>Lab Included</h4>
//                                 <p>Requires physical lab space</p>
//                             </div>
//                             <input type="checkbox" defaultChecked />
//                         </div>
//                     </div>

//                     {/* Audit History */}
//                     <div className="content-card">
//                         <div className="card-header">Audit History</div>
//                         <div className="audit-timeline">
//                             <div className="audit-entry">
//                                 <h4>Modified by Dr. Sarah Chen</h4>
//                                 <p>Oct 24, 2023 - 02:30 PM</p>
//                             </div>
//                             <div className="audit-entry past">
//                                 <h4>Course Created</h4>
//                                 <p>Jun 12, 2023 - 09:15 AM</p>
//                             </div>
//                         </div>
//                         <a href="#" className="view-log">View Full Log</a>
//                     </div>

//                     {/* Danger Zone */}
//                     <div className="content-card danger-card">
//                         <h4>Danger Zone</h4>
//                         <p>Once deleted, a course cannot be recovered and all student enrollments will be archived.</p>
//                         <button className="btn-delete">Delete Course</button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default EditCourse;


import React, { useState } from 'react';
import './EditCourse.css';
// الربط مع ملف نور اللي موجود في فولدر services
import { createCourse } from '../../services/CourseServices';

const EditCourse = () => {
    const [loading, setLoading] = useState(false);
    const [course, setCourse] = useState({
        name: 'Advanced Distributed Systems',
        code: 'CS-402',
        department: 'Computer Science & Engineering',
        credits: 4,
        description: 'This course covers advanced concepts in distributed systems including consensus algorithms, scalability, fault tolerance, and cloud infrastructure design.'
    });

    // الفنكشن اللي بتنفذ الحفظ لما ندوس على الزرار
    const handleSave = async () => {
        setLoading(true);
        try {
            // بنستخدم الفنكشن اللي جاية من الـ CourseServices
            await createCourse(course); 
            alert("تم حفظ التعديلات بنجاح يا مو! 🚀");
        } catch (error) {
            console.error("Error saving course:", error);
            alert("حصلت مشكلة في الحفظ: " + (error.message || "خطأ غير معروف"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="edit-course-wrapper">
            <div className="breadcrumb">Courses / {course.code}</div>
            
            <header className="page-header">
                <div>
                    <h1>Edit Course</h1>
                    <p>Update the curriculum and administrative details for this unit.</p>
                </div>
                <div className="action-buttons">
                    <button className="btn-cancel">Cancel</button>
                    <button className="btn-save" onClick={handleSave} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </header>

            <div className="main-layout">
                <div className="left-section">
                    {/* Identification Card */}
                    <div className="content-card">
                        <div className="card-header">
                            <span className="icon-yellow">ⓘ</span> Course Identification
                        </div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Course Name</label>
                                <input 
                                    value={course.name} 
                                    onChange={(e) => setCourse({...course, name: e.target.value})} 
                                />
                            </div>
                            <div className="form-group">
                                <label>Course Code</label>
                                <input value={course.code} readOnly />
                            </div>
                            <div className="form-group">
                                <label>Department</label>
                                <select 
                                    value={course.department} 
                                    onChange={(e) => setCourse({...course, department: e.target.value})}
                                >
                                    <option>Computer Science & Engineering</option>
                                    <option>Software Engineering</option>
                                    <option>Information Systems</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Credits</label>
                                <input 
                                    type="number" 
                                    value={course.credits} 
                                    onChange={(e) => setCourse({...course, credits: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Description Card */}
                    <div className="content-card">
                        <div className="card-header">
                            <span className="icon-yellow">📄</span> Course Description & Prerequisites
                        </div>
                        <div className="form-group">
                            <label>Full Description</label>
                            <textarea 
                                rows="6" 
                                value={course.description} 
                                onChange={(e) => setCourse({...course, description: e.target.value})}
                            />
                        </div>
                        <div className="form-group" style={{marginTop: '1.5rem'}}>
                            <label>Prerequisites</label>
                            <div className="prerequisites-list">
                                <div className="chip">CS-201 Data Structures ✕</div>
                                <div className="chip">CS-305 Operating Systems ✕</div>
                                <button className="btn-add-course" type="button">+ Add Course</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="right-section">
                    {/* Settings Card */}
                    <div className="content-card">
                        <div className="card-header">Settings</div>
                        <div className="setting-item">
                            <div className="setting-info">
                                <h4>Active Status</h4>
                                <p>Currently visible to students</p>
                            </div>
                            <input type="checkbox" defaultChecked />
                        </div>
                        <div className="setting-item">
                            <div className="setting-info">
                                <h4>Lab Included</h4>
                                <p>Requires physical lab space</p>
                            </div>
                            <input type="checkbox" defaultChecked />
                        </div>
                    </div>

                    {/* Audit History Card */}
                    <div className="content-card">
                        <div className="card-header">Audit History</div>
                        <div className="audit-timeline">
                            <div className="audit-entry">
                                <h4>Modified by Dr. Sarah Chen</h4>
                                <p>Oct 24, 2023 - 02:30 PM</p>
                            </div>
                            <div className="audit-entry past">
                                <h4>Course Created</h4>
                                <p>Jun 12, 2023 - 09:15 AM</p>
                            </div>
                        </div>
                        <button className="view-log-btn" style={{background:'none', border:'none', color:'#FACC15', cursor:'pointer', width:'100%', fontWeight:'600'}}>
                            View Full Log
                        </button>
                    </div>

                    {/* Danger Zone Card */}
                    <div className="content-card danger-card">
                        <h4>Danger Zone</h4>
                        <p>Once deleted, a course cannot be recovered.</p>
                        <button className="btn-delete" type="button">Delete Course</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditCourse;