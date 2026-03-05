import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import AppRoutes from "./Routes/AppRoutes.jsx";
import {
  loginSuccess,
  logoutUser,
} from "./services/store/reducers/authSlice.js";
function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3100/api/v1/auth/me",
          { withCredentials: true },
        );

        if (response.data.success) {
          dispatch(loginSuccess(response.data.user));
        } else {
          dispatch(logoutUser());
        }
      } catch (error) {
        dispatch(logoutUser());
      }
    };

    checkAuth();
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
