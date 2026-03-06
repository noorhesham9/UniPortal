import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ title: "تسجيل الدخول" }} />
        <Stack.Screen
          name="(auth)/register"
          options={{ title: "إنشاء حساب" }}
        />
        <Stack.Screen
          name="(screens)/contact/index"
          options={{ title: "اتصل بنا" }}
        />
        <Stack.Screen
          name="(screens)/settings/index"
          options={{ title: "الإعدادات" }}
        />
        <Stack.Screen
          name="(screens)/profile/index"
          options={{ title: "الملف الشخصي" }}
        />
      </Stack>
    </ThemeProvider>
  );
}
