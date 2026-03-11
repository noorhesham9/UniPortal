import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { ActivityIndicator, useColorScheme, View } from "react-native";
import { Provider, useDispatch, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { getCurrentUser, setLoading, setUser } from "../store/slices/authSlice";
import { persistor, store } from "../store/store";
function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    // 1. نبدأ بحالة التحميل
    dispatch(setLoading(true));
    const auth = getAuth();
    // هذا المستمع ينتظر فايربيز حتى يقرأ التوكن من الجهاز
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // ننتظر حتى ينتهي جلب بيانات المستخدم من MongoDB تماماً
          await dispatch(getCurrentUser()).unwrap();
        } else {
          dispatch(setUser(null));
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        // نضمن إغلاق شاشة التحميل في كل الحالات (سواء وجد مستخدم أو لا، نجح الطلب أو فشل)
        dispatch(setLoading(false));
      }
    });

    return unsubscribe; // تنظيف المستمع عند إغلاق التطبيق
  }, []);
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Group>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="(screens)/settings/index"
              options={{ title: "الإعدادات" }}
            />
            <Stack.Screen
              name="(screens)/profile/index"
              options={{ title: "الملف الشخصي" }}
            />
            <Stack.Screen
              name="(screens)/reset-password/index"
              options={{ title: "إعادة تعيين كلمة المرور" }}
            />
          </Stack.Group>
        ) : (
          <Stack.Group screenOptions={{ headerShown: false }}>
            <Stack.Screen
              name="(auth)/login"
              options={{ title: "تسجيل الدخول" }}
            />
            <Stack.Screen
              name="(auth)/register"
              options={{ title: "إنشاء حساب" }}
            />
            <Stack.Screen
              name="(auth)/forget-password"
              options={{ title: "نسيت كلمة المرور" }}
            />
          </Stack.Group>
        )}
      </Stack>
    </ThemeProvider>
  );
}

function RootLayoutWithRedux() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RootLayoutContent />
      </PersistGate>
    </Provider>
  );
}

export default RootLayoutWithRedux;
