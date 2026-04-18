import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useAppTheme } from "../../context/ThemeContext";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const {
  fetchNotifications,
  markNotificationsRead,
} = require("../../store/slices/notificationSlice");

export default function NotificationsScreen() {
  const { theme } = useAppTheme();
  const s = makeStyles(theme);
  const dispatch = useDispatch();
  const { items, unreadCount, loading } = useSelector(
    (state: any) => state.notifications,
  );
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    dispatch(fetchNotifications() as any);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchNotifications() as any);
    setRefreshing(false);
  };

  const markAllRead = () => {
    dispatch(markNotificationsRead([]) as any);
  };

  const markRead = (id: string) => {
    dispatch(markNotificationsRead([id]) as any);
  };

  if (loading && items.length === 0) {
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
            <Ionicons
              name="notifications-outline"
              size={20}
              color={theme.accent}
            />
          </View>
          <View>
            <Text style={s.headerTitle}>الإشعارات</Text>
            {unreadCount > 0 && (
              <Text style={s.headerSub}>{unreadCount} غير مقروء</Text>
            )}
          </View>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={s.markAllBtn}
            onPress={markAllRead}
            activeOpacity={0.7}
          >
            <Text style={s.markAllText}>تحديد الكل كمقروء</Text>
          </TouchableOpacity>
        )}
      </View>

      {items.length === 0 ? (
        <View style={s.empty}>
          <Ionicons
            name="notifications-off-outline"
            size={52}
            color={theme.textMuted}
          />
          <Text style={s.emptyTitle}>لا توجد إشعارات</Text>
          <Text style={s.emptySub}>ستظهر هنا إشعارات الدرجات والإدارة</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item: any) => item._id}
          renderItem={({ item }) => (
            <NotificationCard
              item={item}
              onPress={() => !item.isRead && markRead(item._id)}
              theme={theme}
              s={s}
            />
          )}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.accent}
            />
          }
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

  const iconName =
    item.type === "admin"
      ? "shield-outline"
      : item.type === "advisor"
        ? "person-outline"
        : "school-outline";

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity
        style={[s.card, !item.isRead && s.cardUnread]}
        onPress={onPress}
        activeOpacity={0.75}
      >
        <View style={[s.cardIconWrap, !item.isRead && s.cardIconWrapUnread]}>
          <Ionicons
            name={iconName}
            size={18}
            color={item.isRead ? theme.textMuted : theme.accent}
          />
        </View>
        <View style={s.cardContent}>
          <View style={s.cardTop}>
            <Text
              style={[s.cardTitle, !item.isRead && s.cardTitleUnread]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text style={s.cardTime}>{formatTime(item.createdAt)}</Text>
          </View>
          <Text style={s.cardBody} numberOfLines={2}>
            {item.body}
          </Text>
        </View>
        {!item.isRead && <View style={s.unreadDot} />}
      </TouchableOpacity>
    </Animated.View>
  );
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "الآن";
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} د`;
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} س`;
  return date.toLocaleDateString("ar");
}

const makeStyles = (t: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: t.bg },
    center: { alignItems: "center", justifyContent: "center" },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 14,
      backgroundColor: t.card,
      borderBottomWidth: 1,
      borderBottomColor: t.border,
    },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    headerIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: t.accent + "18",
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: { fontSize: 18, fontWeight: "700", color: t.text },
    headerSub: { fontSize: 12, color: t.textMuted, marginTop: 1 },
    markAllBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: t.accent + "40",
    },
    markAllText: { fontSize: 12, fontWeight: "600", color: t.accent },
    list: { padding: 16, gap: 10 },
    card: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: t.card,
      borderRadius: 14,
      padding: 14,
      borderWidth: 1,
      borderColor: t.border,
      gap: 12,
      position: "relative",
    },
    cardUnread: {
      borderColor: t.accent + "30",
      backgroundColor: t.accent + "08",
    },
    cardIconWrap: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: t.bg,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    cardIconWrapUnread: { backgroundColor: t.accent + "15" },
    cardContent: { flex: 1 },
    cardTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: "500",
      color: t.textSub,
      flex: 1,
      marginRight: 8,
    },
    cardTitleUnread: { fontWeight: "700", color: t.text },
    cardTime: { fontSize: 11, color: t.textMuted, flexShrink: 0 },
    cardBody: { fontSize: 13, color: t.textMuted, lineHeight: 18 },
    unreadDot: {
      position: "absolute",
      top: 14,
      right: 14,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: t.accent,
    },
    empty: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 32,
      gap: 12,
    },
    emptyTitle: { fontSize: 17, fontWeight: "700", color: t.text },
    emptySub: {
      fontSize: 13,
      color: t.textMuted,
      textAlign: "center",
      lineHeight: 20,
    },
  });
