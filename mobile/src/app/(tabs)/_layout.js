import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import AppHeader from "../../components/AppHeader";
import { useAppTheme } from "../../context/ThemeContext";
import { useSiteLock } from "../../context/SiteLockContext";
import { useNotifications } from "../../hooks/useNotifications";

export default function TabLayout() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const isAdmin =
    isAuthenticated && ["admin", "super_admin"].includes(user?.role?.name);
  const isSuperAdmin =
    isAuthenticated &&
    (user?.role?.name === "super_admin" ||
      user?.role?.permissions?.some((p) => p.name === "manage_super_admin"));

  const router = useRouter();
  const { theme } = useAppTheme();
  const { siteLocked, checking, refresh } = useSiteLock();
  const isStudent = isAuthenticated && user?.role?.name === "student";

  // Register for push notifications and sync FCM token
  useNotifications();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  // Show spinner while checking lock state on app resume
  if (checking) {
    return (
      <View style={[lockStyles.fullScreen, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  // Full-screen lock for students
  if (siteLocked && isStudent) {
    return (
      <View style={[lockStyles.fullScreen, { backgroundColor: theme.bg }]}>
        <AppHeader />
        <View style={lockStyles.lockBody}>
          <View
            style={[
              lockStyles.iconWrap,
              { backgroundColor: "rgba(239,68,68,0.1)" },
            ]}
          >
            <Ionicons name="lock-closed" size={48} color="#ef4444" />
          </View>
          <Text style={[lockStyles.lockTitle, { color: theme.text }]}>
            الموقع مغلق مؤقتاً
          </Text>
          <Text style={[lockStyles.lockSub, { color: theme.textSub }]}>
            تم تعليق الخدمات مؤقتاً من قِبل الإدارة.{"\n"}يرجى المحاولة لاحقاً.
          </Text>
          <TouchableOpacity
            style={[lockStyles.refreshBtn, { borderColor: theme.border }]}
            onPress={refresh}
            disabled={checking}
          >
            {checking ? (
              <ActivityIndicator size="small" color={theme.accent} />
            ) : (
              <>
                <Ionicons
                  name="refresh-outline"
                  size={18}
                  color={theme.accent}
                />
                <Text style={[lockStyles.refreshText, { color: theme.accent }]}>
                  تحديث
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <AppHeader />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.accent,
          tabBarInactiveTintColor: theme.textMuted,
          tabBarStyle: {
            backgroundColor: theme.tabBar,
            borderTopColor: theme.tabBorder,
          },
          headerStyle: { backgroundColor: theme.card },
          headerTintColor: theme.text,
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "الرئيسية",
            tabBarIcon: ({ color }) => (
              <Ionicons name="home-outline" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="registration"
          options={{
            title: "التسجيل",
            href: isAdmin || (siteLocked && isStudent) ? null : undefined,
            tabBarIcon: ({ color }) => (
              <Ionicons name="add-circle-outline" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "الإعدادات",
            tabBarIcon: ({ color }) => (
              <Ionicons name="settings-outline" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="grades"
          options={{
            title: "الدرجات",
            href: isAdmin || (siteLocked && isStudent) ? null : undefined,
            tabBarIcon: ({ color }) => (
              <Ionicons name="bar-chart" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="final-grades"
          options={{
            title: "الدرجات النهائية",
            href: isAdmin || (siteLocked && isStudent) ? null : undefined,
            tabBarIcon: ({ color }) => (
              <Ionicons name="trophy-outline" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="academic-summary"
          options={{
            title: "السجل الأكاديمي",
            href: isAdmin || (siteLocked && isStudent) ? null : undefined,
            tabBarIcon: ({ color }) => (
              <Ionicons name="school-outline" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="current-enrollments"
          options={{
            title: "المواد المسجلة",
            href: isAdmin || (siteLocked && isStudent) ? null : undefined,
            tabBarIcon: ({ color }) => (
              <Ionicons name="book-outline" size={24} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="admin"
          options={{
            href: isSuperAdmin ? undefined : null,
            tabBarIcon: ({ color }) => (
              <Ionicons
                name="shield-checkmark-outline"
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen name="accepted-ids" options={{ href: null }} />
        <Tabs.Screen name="edit-course" options={{ href: null }} />
        <Tabs.Screen name="notifications" options={{ href: null }} />
        <Tabs.Screen
          name="waitlist"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="records"
          options={{
            href: null,
          }}
        />
        {/* <Tabs.Screen
          name="admin"
          options={{
            href: null,
          }}
        /> */}
      </Tabs>
    </View>
  );
}

const lockStyles = StyleSheet.create({
  fullScreen: { flex: 1 },
  lockBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 16,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  lockTitle: { fontSize: 22, fontWeight: "800", textAlign: "center" },
  lockSub: { fontSize: 14, textAlign: "center", lineHeight: 22 },
  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
    borderWidth: 1,
  },
  refreshText: { fontSize: 15, fontWeight: "700" },
});
