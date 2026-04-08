import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useAppTheme } from "../../context/ThemeContext";

export default function TabLayout() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const isAdmin = isAuthenticated && ["admin", "super_admin"].includes(user?.role?.name);
  const router = useRouter();
  const { theme } = useAppTheme();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: theme.accent,
      tabBarInactiveTintColor: theme.textMuted,
      tabBarStyle: { backgroundColor: theme.tabBar, borderTopColor: theme.tabBorder },
      headerStyle: { backgroundColor: theme.card },
      headerTintColor: theme.text,
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "الرئيسية",
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="registration"
        options={{
          title: "التسجيل",
          tabBarIcon: ({ color }) => <Ionicons name="add-circle-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="waitlist"
        options={{
          title: "قائمة الانتظار",
          tabBarIcon: ({ color }) => <Ionicons name="time-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "الإعدادات",
          tabBarIcon: ({ color }) => <Ionicons name="settings-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: "الإدارة",
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ color }) => <Ionicons name="shield-checkmark-outline" size={24} color={color} />,
        }}
      />
      {/* Always hidden */}
      <Tabs.Screen name="accepted-ids" options={{ href: null }} />
      <Tabs.Screen name="edit-course"  options={{ href: null }} />
    </Tabs>
  );
}
