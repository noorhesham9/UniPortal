import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import AppRoutes from "./Routes/AppRoutes.jsx";
import { loginSuccess, logoutUser } from "./services/store/reducers/authSlice.js";
import { getMe, loginWithToken } from "./services/AuthServices.js";
import { onIdTokenChanged } from "firebase/auth";
import { auth } from "./utils/firebaseConfig.js";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // onIdTokenChanged fires on login, logout, AND every time Firebase
    // silently refreshes the ID token (every ~1 hour).
    // We re-sync the cookie each time so the backend always has a valid token.
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        dispatch(logoutUser());
        return;
      }
      try {
        const idToken = await firebaseUser.getIdToken();
        // Re-sync cookie with the fresh token
        await loginWithToken(idToken);
        // Refresh Redux user state
        const data = await getMe();
        if (data.success) dispatch(loginSuccess(data.user));
        else dispatch(logoutUser());
      } catch {
        dispatch(logoutUser());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return (
    <Router>
      <div className="App dark ">
        <AppRoutes />
      </div>
    </Router>
  );
}

export default App;
