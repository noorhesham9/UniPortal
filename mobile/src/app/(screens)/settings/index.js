import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useAppTheme } from "../../../context/ThemeContext";
import { logoutUser } from "../../../store/slices/authSlice";
import apiClient from "../../../utils/api";

export default function SettingsScreen() {
  const { isDark, toggleTheme } = useAppTheme();
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);

  const isAdmin = ["admin", "super_admin"].includes(user?.role?.name);

  const [siteLocked, setSiteLocked] = useState(false);
  const [lockLoading, setLockLoading] = useState(false);

  const bg = isDark ? "#0d1b2e" : "#ffffff";
  const cardBg = isDark ? "#0f172a" : "#ffffff";
  const border = isDark ? "#1e293b" : "#E5E5EA";
  const text = isDark ? "#f8fafc" : "#000000";
  const subText = isDark ? "#94a3b8" : "#8E8E93";
  const iconColor = isDark ? "#94a3b8" : "#555";

  useEffect(() => {
    if (isAdmin) {
      apiClient
        .get("/admin/site-lock")
        .then((res) => setSiteLocked(res.data.locked))
        .catch(() => {});
    }
  }, [isAdmin]);

  const handleToggleLock = async (value) => {
    setLockLoading(true);
    try {
      const res = await apiClient.post("/admin/site-lock", { locked: value });
      setSiteLocked(res.data.locked);
    } catch (e) {
      console.error("Failed to toggle site lock", e);
    } finally {
      setLockLoading(false);
    }
  };

  const handleLogout = async () => {
    dispatch(logoutUser());
  };

  const SettingItem = ({
    icon,
    title,
    value,
    onValueChange,
    isSwitch,
    onPress,
    subTitle,
    switchDisabled,
  }) => (
    <TouchableOpacity
      style={[styles.row, { borderColor: border }]}
      onPress={onPress}
      disabled={isSwitch}
    >
      <View style={styles.leftSection}>
        <Ionicons name={icon} size={22} color={iconColor} style={styles.icon} />
        <View>
          <Text style={[styles.rowText, { color: text }]}>{title}</Text>
          {subTitle && (
            <Text style={[styles.subText, { color: subText }]}>{subTitle}</Text>
          )}
        </View>
      </View>
      {isSwitch ? (
        switchDisabled ? (
          <ActivityIndicator size="small" color="#facc15" />
        ) : (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: "#e2e8f0", true: "#facc15" }}
            thumbColor={value ? "#0f172a" : "#ffffff"}
          />
        )
      ) : (
        <Ionicons name="chevron-forward" size={20} color={subText} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]}>
      <Text style={[styles.sectionTitle, { color: subText }]}>العامة</Text>
      <View
        style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}
      >
        <SettingItem
          icon="moon-outline"
          title="الوضع الليلي"
          isSwitch
          value={isDark}
          onValueChange={toggleTheme}
        />
        <SettingItem
          icon="language-outline"
          title="اللغة"
          subTitle="العربية"
          onPress={() => {}}
        />
      </View>

      {isAdmin && (
        <>
          <Text style={[styles.sectionTitle, { color: subText }]}>
            إدارة النظام
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: cardBg, borderColor: border },
            ]}
          >
            <SettingItem
              icon={siteLocked ? "lock-closed-outline" : "lock-open-outline"}
              title="قفل التسجيل"
              subTitle={
                siteLocked ? "الموقع مغلق أمام الطلاب" : "الموقع مفتوح للطلاب"
              }
              isSwitch
              value={siteLocked}
              onValueChange={handleToggleLock}
              switchDisabled={lockLoading}
            />
          </View>
        </>
      )}

      <Text style={[styles.sectionTitle, { color: subText }]}>الحساب</Text>
      <View
        style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}
      >
        <SettingItem
          icon="lock-closed-outline"
          title="تغيير كلمة المرور"
          onPress={() => router.push("/(screens)/reset-password")}
        />
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          <Text style={styles.logoutText}>تسجيل الخروج</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionTitle: {
    fontSize: 14,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
    textAlign: "right",
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
  },
  row: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 0.5,
  },
  leftSection: { flexDirection: "row-reverse", alignItems: "center" },
  icon: { marginLeft: 12 },
  rowText: { fontSize: 16, textAlign: "right" },
  subText: { fontSize: 12, textAlign: "right" },
  logoutBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: 15,
  },
  logoutText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 12,
  },
});
