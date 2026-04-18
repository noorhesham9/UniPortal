import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "../context/SocketContext";
import {
  addLocalNotification,
  fetchNotifications,
} from "../store/slices/notificationSlice";

export const useNotifications = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: any) => state.auth);
  const { socket } = useSocket() as any;

  // Initial fetch on auth
  useEffect(() => {
    if (!isAuthenticated) return;
    dispatch(fetchNotifications() as any);
  }, [isAuthenticated]);

  // Real-time: listen for new notifications via socket
  useEffect(() => {
    if (!socket) return;

    const handler = (notification: any) => {
      dispatch(addLocalNotification(notification));
    };

    socket.on("new_notification", handler);

    return () => {
      socket.off("new_notification", handler);
    };
  }, [socket]);
};
