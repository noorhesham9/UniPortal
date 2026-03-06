import React, { useEffect } from 'react';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import { useColorScheme, ActivityIndicator, View } from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../store/store';
import { getCurrentUser } from '../store/slices/authSlice';

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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {isAuthenticated ? (
          // Main app screens
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </>
        ) : (
          // Auth screens
          <>
            <Stack.Screen
              name="(auth)"
              options={{ headerShown: false }}
            />
          </>
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
