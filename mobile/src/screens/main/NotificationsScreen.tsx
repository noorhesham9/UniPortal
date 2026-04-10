import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, TouchableOpacity, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useAppTheme } from '../../context/ThemeContext';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  date: Date;
  read: boolean;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function NotificationsScreen() {
  const { theme } = useAppTheme();
  const s = makeStyles(theme);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    setLoading(false);

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      const { title, body } = notification.request.content;
      const newItem: NotificationItem = {
        id: notification.request.identifier,
        title: title || 'New Notification',
        body: body || '',
        date: new Date(),
        read: false,
      };
      setNotifications((prev) => [newItem, ...prev]);
    });

    return () => {
      notificationListener.current?.remove();
    };
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <NotificationCard item={item} onPress={() => markRead(item.id)} theme={theme} s={s} />
  );

  if (loading) {
    return (
      <View style={[s.center, s.container]}>
        <ActivityIndicator color={theme.accent} size="large" />
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.headerIconWrap}>
            <Ionicons name="notifications-outline" size={20} color={theme.accent} />
          </View>
          <View>
            <Text style={s.headerTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <Text style={s.headerSub}>{unreadCount} unread</Text>
            )}
          </View>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={s.markAllBtn} onPress={markAllRead} activeOpacity={0.7}>
            <Text style={s.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {notifications.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="notifications-off-outline" size={52} color={theme.textMuted} />
          <Text style={s.emptyTitle}>No notifications yet</Text>
          <Text style={s.emptySub}>
            Notifications from your academic advisor will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

function NotificationCard({ item, onPress, theme, s }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity
        style={[s.card, !item.read && s.cardUnread]}
        onPress={onPress}
        activeOpacity={0.75}
      >
        <View style={[s.cardIconWrap, !item.read && s.cardIconWrapUnread]}>
          <Ionicons
            name="notifications-outline"
            size={18}
            color={item.read ? theme.textMuted : theme.accent}
          />
        </View>
        <View style={s.cardContent}>
          <View style={s.cardTop}>
            <Text style={[s.cardTitle, !item.read && s.cardTitleUnread]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={s.cardTime}>{formatTime(item.date)}</Text>
          </View>
          <Text style={s.cardBody} numberOfLines={2}>{item.body}</Text>
        </View>
        {!item.read && <View style={s.unreadDot} />}
      </TouchableOpacity>
    </Animated.View>
  );
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString();
}

const makeStyles = (t: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: t.bg },
    center: { alignItems: 'center', justifyContent: 'center' },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 14,
      backgroundColor: t.card,
      borderBottomWidth: 1,
      borderBottomColor: t.border,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    headerIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: t.accent + '18',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: t.text },
    headerSub: { fontSize: 12, color: t.textMuted, marginTop: 1 },
    markAllBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: t.accent + '40',
    },
    markAllText: { fontSize: 12, fontWeight: '600', color: t.accent },
    list: { padding: 16, gap: 10 },
    card: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: t.card,
      borderRadius: 14,
      padding: 14,
      borderWidth: 1,
      borderColor: t.border,
      gap: 12,
      position: 'relative',
    },
    cardUnread: {
      borderColor: t.accent + '30',
      backgroundColor: t.accent + '08',
    },
    cardIconWrap: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: t.bg,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    cardIconWrapUnread: { backgroundColor: t.accent + '15' },
    cardContent: { flex: 1 },
    cardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    cardTitle: { fontSize: 14, fontWeight: '500', color: t.textSub, flex: 1, marginRight: 8 },
    cardTitleUnread: { fontWeight: '700', color: t.text },
    cardTime: { fontSize: 11, color: t.textMuted, flexShrink: 0 },
    cardBody: { fontSize: 13, color: t.textMuted, lineHeight: 18 },
    unreadDot: {
      position: 'absolute',
      top: 14,
      right: 14,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: t.accent,
    },
    empty: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
      gap: 12,
    },
    emptyTitle: { fontSize: 17, fontWeight: '700', color: t.text },
    emptySub: { fontSize: 13, color: t.textMuted, textAlign: 'center', lineHeight: 20 },
  });