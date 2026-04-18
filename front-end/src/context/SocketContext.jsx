import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { onAuthStateChanged } from "firebase/auth";
import { useSelector } from "react-redux";
import { auth } from "../utils/firebaseConfig";

const SOCKET_URL = "http://localhost:3100";
const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);
  const { impersonating } = useSelector((s) => s.auth);

  const connectSocket = async (firebaseUser) => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }

    const token = await firebaseUser.getIdToken();

    // withCredentials: true sends the impersonation_token cookie automatically
    // The server reads it from socket.handshake.headers.cookie — same as requireAuth
    const s = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
      transports: ["websocket"],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = s;

    s.on("connect", () => {
      console.log("[SocketContext] Connected:", s.id);
      setSocket(s);
    });
    s.on("disconnect", (reason) => {
      console.log("[SocketContext] Disconnected:", reason);
      setSocket(null);
    });
    s.on("connect_error", (err) => console.error("[SocketContext] Error:", err.message));
  };

  // Connect on Firebase auth restore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        socketRef.current?.disconnect();
        socketRef.current = null;
        setSocket(null);
        return;
      }
      await connectSocket(firebaseUser);
    });

    return () => {
      unsubscribe();
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, []); // eslint-disable-line

  // Reconnect when impersonation starts/stops so the server re-reads the cookie
  useEffect(() => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;
    connectSocket(firebaseUser);
  }, [impersonating]); // eslint-disable-line

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
