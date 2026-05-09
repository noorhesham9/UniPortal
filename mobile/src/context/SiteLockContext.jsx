import { createContext, useContext, useEffect, useState } from "react";
import { AppState } from "react-native";
import { useSelector } from "react-redux";
import { publicAPI, siteLockEmitter } from "../utils/api";
import { useSocket } from "./SocketContext";

const SiteLockContext = createContext({ siteLocked: false, checking: true });

export function SiteLockProvider({ children }) {
  const [siteLocked, setSiteLocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const { socket } = useSocket();
  const { isAuthenticated } = useSelector((s) => s.auth);

  const fetchLock = async () => {
    try {
      const res = await publicAPI.getSiteLock();
      setSiteLocked(res.data.locked);
    } catch {
      // keep last known state on failure
    } finally {
      setChecking(false);
    }
  };
  // Fetch on mount and whenever auth changes
  useEffect(() => {
    setChecking(true);
    fetchLock();
  }, [isAuthenticated]);

  // Re-fetch every time the app comes back to the foreground
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") fetchLock();
    });
    return () => sub.remove();
  }, []);

  // Any API call returning 403 SITE_LOCKED triggers lock immediately
  useEffect(() => {
    const handler = () => setSiteLocked(true);
    siteLockEmitter.on("locked", handler);
    return () => siteLockEmitter.off("locked", handler);
  }, []);

  // Real-time updates via socket
  useEffect(() => {
    if (!socket) return;
    const handler = ({ locked }) => setSiteLocked(locked);
    socket.on("site_lock_changed", handler);
    return () => socket.off("site_lock_changed", handler);
  }, [socket]);

  return (
    <SiteLockContext.Provider value={{ siteLocked, checking, refresh: fetchLock }}>
      {children}
    </SiteLockContext.Provider>
  );
}

export const useSiteLock = () => useContext(SiteLockContext);
