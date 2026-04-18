import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { useSelector } from "react-redux";
import AppHeader from "../../components/AppHeader";
import { useAppTheme } from "../../context/ThemeContext";
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

  // Register for push notifications and sync FCM token
  useNotifications();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

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
            tabBarIcon: ({ color }) => (
              <Ionicons name="bar-chart" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="final-grades"
          options={{
            title: "الدرجات النهائية",
            tabBarIcon: ({ color }) => (
              <Ionicons name="trophy-outline" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="academic-summary"
          options={{
            title: "السجل الأكاديمي",
            tabBarIcon: ({ color }) => (
              <Ionicons name="school-outline" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="current-enrollments"
          options={{
            title: "المواد المسجلة",
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
