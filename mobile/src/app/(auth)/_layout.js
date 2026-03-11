import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="login/index"
        options={{
          title: "تسجيل الدخول",
          headerShown: false, // لإخفاء الهيدر تماماً
        }}
      />
      <Stack.Screen
        name="register/index"
        options={{
          title: "إنشاء حساب",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
