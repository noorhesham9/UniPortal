import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { useAppTheme } from "../context/ThemeContext";

export default function AppHeader({ title = "UniPortal", showNotifications = true }) {
  const { theme } = useAppTheme();
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.safeArea, { backgroundColor: theme.card, paddingTop: insets.top }]}>
      <View
        style={[
          styles.container,
          { backgroundColor: theme.card, borderBottomColor: theme.border },
        ]}
      >
        <View style={styles.left}>
          <Ionicons name="school" size={24} color={theme.accent} />
          <Text style={[styles.logoText, { color: theme.text }]}>UniPortal</Text>
        </View>
        <View style={styles.center}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        </View>
        <View style={styles.right}>
          {showNotifications && (
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => router.push("/(tabs)/notifications")}
            >
              <Ionicons name="notifications-outline" size={24} color={theme.textSub} />
              {unreadCount > 0 && (
                <View style={[styles.badge, { backgroundColor: theme.accent }]}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.text }]}>
              {user?.name || "User"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "#fff" },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoText: { fontSize: 18, fontWeight: "bold" },
  center: { flex: 1, alignItems: "center" },
  title: { fontSize: 16, fontWeight: "600" },
  right: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBtn: { padding: 4, position: "relative" },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: { fontSize: 9, fontWeight: "700", color: "#000" },
  userInfo: { alignItems: "flex-end" },
  userName: { fontSize: 14, fontWeight: "500" },
});
