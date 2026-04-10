import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { auth } from "../utils/firebaseConfig";

const SOCKET_URL = "http://localhost:3100";

/**
 * Returns a socket instance once authenticated.
 * Using useState (not useRef) so components re-render when the socket is ready,
 * which allows useEffect listeners to attach at the right time.
 */
const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    let s;

    const connect = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();

      s = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket"],
        reconnectionAttempts: 5,
      });

      s.on("connect", () => {
        console.log("[Socket] Connected:", s.id);
        setSocket(s);
      });

      s.on("connect_error", (err) => {
        console.error("[Socket] Connection error:", err.message);
      });
    };

    connect();

    return () => {
      s?.disconnect();
      setSocket(null);
    };
  }, []);

  return socket;
};

export default useSocket;
