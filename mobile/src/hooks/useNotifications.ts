import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useEffect } from 'react';
import axios from 'axios';
import { Platform } from 'react-native';


const API_URL = 'http://192.168.1.5:3100/api/notifications/update-token';

export const useNotifications = () => {
  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        sendTokenToBackend(token);
      }
    });
  }, []);
};

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }


    token = (await Notifications.getExpoPushTokenAsync({

        projectId: 'your-project-id' 
    })).data;
    console.log("FCM Token:", token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}

const sendTokenToBackend = async (token: string) => {
  try {
    await axios.patch(API_URL, { fcmToken: token }, {
        headers: {
            Authorization: `Bearer TOKEN_HERE` 
        }
    });
    console.log('Token sent to backend successfully');
  } catch (error) {
    console.error('Error sending token to backend:', error);
  }
};