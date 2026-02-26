import axios from "axios";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes.jsx";
import { loginSuccess, logoutUser } from "./services/store/reducers/authSlice";
import { auth } from "./utils/firebaseConfig";
function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // 1. مراقبة حالة المستخدم في Firebase
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // 2. الحصول على التوكن
          const idToken = await firebaseUser.getIdToken();

          // 3. نبعت للسيرفر بتاعنا عشان نعرف "مين ده؟" وايه الـ Role بتاعته
          // الـ Backend لازم يفك التوكن ويتأكد منه ويرجع بيانات اليوزر
          const response = await axios.get(
            "http://localhost:3100/api/v1/auth/me",
            {
              headers: { Authorization: `Bearer ${idToken}` },
              withCredentials: true,
            },
          );

          if (response.data.success) {
            // 4. تحديث الـ Redux ببيانات اليوزر الكاملة (شاملة الـ Role)
            dispatch(loginSuccess(response.data.user));
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          dispatch(logoutUser()); // لو التوكن باظ أو السيرفر رفض، سجل خروج
        }
      } else {
        // لو مفيش يوزر مسجل في فيربيز
        dispatch(logoutUser());
      }
    });
    return () => unsubscribe();
  }, [dispatch]);
  return (
    <Router>
      <div className="App">
        <AppRoutes />
      </div>
    </Router>
  );
}

export default App;
