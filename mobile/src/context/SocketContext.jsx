import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { auth } from "../utils/firebaseConfig";

const SOCKET_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:3100"
    : "http://localhost:3100";

const SocketContext = createContext({ socket: null, connected: false });

export function SocketProvider({ children }) {
  const { isAuthenticated } = useSelector((s) => s.auth);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setSocket((prev) => { prev?.disconnect(); return null; });
      setConnected(false);
      return;
    }

    let cancelled = false;

    const connect = async () => {
      try {
        await auth.authStateReady();
        const token = auth.currentUser
          ? await auth.currentUser.getIdToken()
          : null;

        if (cancelled || !token) return;

        const s = io(SOCKET_URL, {
          auth: { token },
          transports: ["websocket"],
          reconnection: true,
          reconnectionDelay: 3000,
        });

        s.on("connect", () => setConnected(true));
        s.on("disconnect", () => setConnected(false));

        if (!cancelled) setSocket(s);
        else s.disconnect();
      } catch (e) {
        console.warn("[Socket] connect error:", e.message);
      }
    };

    connect();

    return () => {
      cancelled = true;
      setSocket((prev) => { prev?.disconnect(); return null; });
      setConnected(false);
    };
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
