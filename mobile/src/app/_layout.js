import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, useColorScheme, View } from "react-native";
import { Provider, useDispatch, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { getCurrentUser } from "../store/slices/authSlice";
import { persistor, store } from "../store/store";

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check if user is already logged in
    dispatch(getCurrentUser());
  }, [dispatch]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        {isAuthenticated ? (
          // Main app screens
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
          </Stack.Group>
        ) : (
          <Stack.Group screenOptions={{ headerShown: false }}>
            <Stack.Screen
              name="(auth)/register"
              options={{ title: "إنشاء حساب" }}
            />
            <Stack.Screen
              name="(screens)/contact/index"
              options={{ title: "اتصل بنا" }}
            />
            <Stack.Screen
              name="(auth)/login"
              options={{ title: "تسجيل الدخول" }}
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
