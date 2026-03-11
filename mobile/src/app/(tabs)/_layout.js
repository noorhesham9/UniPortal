import { Feather } from "@expo/vector-icons";
import { ActivityIndicator, View } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // أيقونات جاهزة
import { Tabs } from "expo-router";
import { useSelector } from "react-redux";

export default function TabLayout() {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  if (user) {
    console.log(user);
  }
  if (loading) return <ActivityIndicator />;
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "#007AFF" }}>
      <Tabs.Screen
        name="admin"
        options={{
          title: "الإدارة",
          // لو مش أدمن، الـ Tab بيختفي تماماً من الشريط
          href:
            isAuthenticated && user?.user?.role?.name === "admin"
              ? "/admin"
              : null,
          tabBarIcon: ({ color }) => (
            <Ionicons name="shield" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: "Profile",
          headerTitle: "My Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "الإعدادات",
          headerTitle: "الإعدادات",
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="registration"
        options={{
          title: "التسجيل",
          headerTitle: "التسجيل",
          tabBarIcon: ({ color }) => (
            <Ionicons name="add-circle" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="waitlist"
        options={{
          title: "جدولي",
          headerTitle: "جدولي",
          tabBarIcon: ({ color }) => (
            <Ionicons name="calendar" size={24} color={color} />
          ),
        }}
      />
      {/*  */}
 <Tabs.Screen
  name="accepted-ids" 
  options={{
    title: "الوصول",
    headerShown: false,
  
    href: isAuthenticated && user?.user?.role?.name === "admin" 
          ? "/accepted-ids" 
          : null, 
    tabBarIcon: ({ color }) => (
      <Feather name="shield" size={24} color={color} />
    ),
  }}
/>
    </Tabs>
  );
}
