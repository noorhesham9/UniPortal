# 🎓 UniPortal

> A comprehensive digital gateway for universities — unifying all academic services and information in one place for students, faculty, and administration.

---

## 📌 Overview

UniPortal is a full-stack university portal designed to replace traditional paper-based and manual processes with a fast, organized, and modern digital experience. The platform serves three main user types — students, professors, and administrators — each with a tailored interface and role-based access control.

The system consists of three layers:
- **Web Application** (React.js) — for all users via browser
- **Mobile Application** (React Native / Expo) — for students on the go
- **Backend API** (Node.js / Express) — powering all services

---

## ✨ Features

### 👨‍🎓 Student
- View and manage personal profile
- Register for courses and view schedule
- Track academic study plan
- View enrollments and payment status
- Chat with academic advisor
- Receive push notifications from advisor

### 👨‍🏫 Professor / Advisor
- View and manage assigned courses
- Chat with students
- Send push notifications to one or multiple students

### 🛡️ Admin / Super Admin
- Full control over all platform features
- Manage users, departments, rooms, and courses
- Enroll students directly
- Manage registration slices and semesters
- Approve tuition receipts
- Lock/unlock the registration system
- Impersonate users for support purposes
- Manage course offerings and schedule builder

---

## 🛠️ Tech Stack

### Frontend (Web)
| Technology | Purpose |
|---|---|
| React.js | UI framework |
| Redux | State management |
| React Router | Client-side routing |
| Socket.io Client | Real-time communication |
| Axios | HTTP requests |

### Mobile
| Technology | Purpose |
|---|---|
| React Native | Mobile UI framework |
| Expo | Development platform |
| Expo Router | File-based navigation |
| Redux | State management |
| Expo Notifications | Push notifications |
| Firebase Auth | Authentication |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database |
| Firebase Admin SDK | Push notifications & auth |
| Socket.io | Real-time events |
| Cloudinary | File/image uploads |
| JWT | Authorization |

---

## 📁 Project Structure

```
UniPortal/
│
├── back-end/
│   ├── constants/
│   │   └── permissions.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── chatController.js
│   │   ├── courseController.js
│   │   ├── enrollmentController.js
│   │   ├── notificationController.js
│   │   ├── receiptController.js
│   │   ├── registrationSliceController.js
│   │   ├── sectionController.js
│   │   ├── SemesterController.js
│   │   ├── studyPlanController.js
│   │   └── uploadController.js
│   ├── middleware/
│   │   ├── authorize.js
│   │   ├── enrollmentValidation.js
│   │   ├── requireAuth.js
│   │   └── scheduleConflict.js
│   ├── models/
│   │   ├── AllowedStudentModel.js
│   │   ├── course.model.js
│   │   ├── Department.js
│   │   ├── Enrollment.js
│   │   ├── Message.js
│   │   ├── Permission.js
│   │   ├── RegistrationSlice.js
│   │   ├── Role.js
│   │   ├── room.model.js
│   │   ├── Section.js
│   │   ├── Semester.js
│   │   ├── StudyPlan.js
│   │   └── User.js
│   ├── Routes/
│   │   ├── adminRoute.js
│   │   ├── authRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── departmentRoutes.js
│   │   ├── enrollmentRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── receiptRoutes.js
│   │   ├── registrationSliceRoutes.js
│   │   ├── roomRoutes.js
│   │   ├── sectionRoutes.js
│   │   ├── SemesterRoutes.js
│   │   ├── studyPlanRoutes.js
│   │   └── uploadRoutes.js
│   ├── services/
│   │   └── notificationService.js
│   ├── utils/
│   │   ├── cloudinary.js
│   │   ├── errorHandler.js
│   │   ├── firebaseAdmin.js
│   │   └── seedDatabase.js
│   ├── app.js
│   ├── server.js
│   └── runSeed.js
│
├── front-end/
│   ├── public/
│   └── src/
│       ├── context/
│       │   └── SocketContext.js
│       ├── hooks/
│       │   └── useSocket.js
│       ├── pages/
│       │   ├── dashboard/
│       │   │   ├── components/
│       │   │   │   ├── Footer.jsx
│       │   │   │   ├── Header.jsx
│       │   │   │   └── Sidebar.jsx
│       │   │   └── dashSections/
│       │   │       ├── AddDepartment/
│       │   │       ├── AdminCourseOfferings/
│       │   │       ├── AdminDepartments/
│       │   │       ├── AdminEnrollment/
│       │   │       ├── AdminRooms/
│       │   │       ├── AdminUsers/
│       │   │       ├── AdvisorChat/
│       │   │       ├── AdvisorNotifications/
│       │   │       ├── AllEnrollments/
│       │   │       ├── allowedIDS/
│       │   │       ├── CourseManage/
│       │   │       ├── CourseManagement/
│       │   │       ├── createCourse/
│       │   │       ├── CreateSections/
│       │   │       ├── EditCourse/
│       │   │       ├── EditProfile/
│       │   │       ├── MyEnrollments/
│       │   │       ├── MyPayments/
│       │   │       ├── Profile/
│       │   │       ├── registerCourse/
│       │   │       ├── RegistrationSlices/
│       │   │       ├── RoomManagement/
│       │   │       ├── ScheduleBuilder/
│       │   │       ├── Settings/
│       │   │       ├── StudentChat/
│       │   │       ├── StudyPlanAdmin/
│       │   │       ├── StudyPlanStudent/
│       │   │       └── TuitionApproval/
│       │   ├── ForgotPassword/
│       │   ├── Login/
│       │   ├── Register/
│       │   ├── ResetPassword/
│       │   └── unAuthorized/
│       ├── routes/
│       │   └── AppRoutes.jsx
│       ├── services/
│       │   ├── store/
│       │   ├── AdminServices.js
│       │   ├── api.js
│       │   ├── AuthServices.js
│       │   ├── ChatServices.js
│       │   ├── CourseServices.js
│       │   ├── DepartmentServices.js
│       │   ├── NotificationServices.js
│       │   ├── ReceiptServices.js
│       │   ├── RegistrationSliceServices.js
│       │   ├── RoomServices.js
│       │   ├── SectionServices.js
│       │   ├── SemesterServices.js
│       │   └── StudyPlanServices.js
│       └── utils/
│           ├── firebaseConfig.js
│           └── ProtectedRoute.js
│
└── mobile/
    ├── assets/
    └── src/
        ├── app/
        │   ├── (auth)/
        │   │   ├── forget-password/
        │   │   ├── login/
        │   │   ├── register/
        │   │   └── reset-password/
        │   ├── (screens)/
        │   └── (tabs)/
        ├── constants/
        │   └── theme.ts
        ├── context/
        │   └── ThemeContext.js
        ├── hooks/
        │   ├── use-color-scheme.ts
        │   ├── use-theme.ts
        │   ├── useAuth.ts
        │   └── useNotifications.ts
        ├── screens/
        │   └── main/
        │       ├── CourseRegistrationScreen.jsx
        │       ├── DashboardScreen.jsx
        │       ├── NotificationsScreen.tsx
        │       └── Waitlist/
        ├── services/
        │   └── idService.js
        ├── store/
        │   └── slices/
        │       ├── authSlice.js
        │       └── enrollmentSlice.js
        └── utils/
            ├── api.js
            └── firebaseConfig.js
```

---

## 👥 Roles & Permissions

| Role | Access Level |
|---|---|
| **Super Admin** | Full access to everything |
| **Admin** | Administrative features based on assigned permissions |
| **Professor** | Course management, student chat, send notifications |
| **Student** | Personal portal, course registration, payments, advisor chat |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB
- Firebase project (for auth & push notifications)
- Expo CLI (for mobile)

### Backend
```bash
cd back-end
npm install
npm run dev
```

### Frontend (Web)
```bash
cd front-end
npm install
npm start
```

### Mobile
```bash
cd mobile
npm install
npx expo start
```

---

## 🔔 Notifications

UniPortal supports real-time push notifications via **Firebase Cloud Messaging (FCM)**:
- Advisors and admins can send notifications to individual students or groups directly from the web dashboard
- Students receive notifications instantly on their mobile devices
- The mobile app includes a dedicated Notifications Center screen

---

## 🔒 Security

- Firebase Authentication for identity management
- JWT-based API authorization
- Role-based access control (RBAC) on all endpoints
- Registration system can be locked/unlocked by admins in real time

---

## 👨‍💻 Developed By

UniPortal — University Digital Portal Project