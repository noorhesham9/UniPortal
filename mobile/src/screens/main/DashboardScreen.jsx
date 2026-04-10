import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, RefreshControl, Image,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { fetchCompletedHours } from '../../store/slices/enrollmentSlice';
import { useAppTheme } from '../../context/ThemeContext';

const AVATAR_PLACEHOLDER = 'https://ui-avatars.com/api/?background=facc15&color=0f172a&size=200&bold=true&name=';

export default function DashboardScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const { completedHours, loading } = useSelector((state) => state.enrollment);
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useAppTheme();

  useEffect(() => {
    if (user?._id) loadData();
  }, [user?._id]);

  const loadData = async () => {
    if (user?._id) await dispatch(fetchCompletedHours(user._id));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const gpa = user?.gpa ?? 0;
  const paymentStatus = user?.feesPaid ? 'مسدد' : 'غير مسدد';

  const avatarUri = user?.profilePhoto?.url
    || `${AVATAR_PLACEHOLDER}${encodeURIComponent(user?.name || 'S')}`;

  console.log('[Avatar] profilePhoto:', user?.profilePhoto, '→ uri:', avatarUri);

  const s = makeStyles(theme);

  return (
    <ScrollView
      style={s.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
    >
      {/* ── Hero / Avatar section ── */}
      <View style={s.hero}>
        <View style={s.avatarWrapper}>
        <Image
          source={{ uri: avatarUri }}
          style={s.avatar}
          onError={() => console.log('[Avatar Error] failed to load:', avatarUri)}
          onLoad={() => console.log('[Avatar Loaded]')}
          defaultSource={{ uri: `${AVATAR_PLACEHOLDER}${encodeURIComponent(user?.name || 'S')}` }}
        />
          <View style={s.onlineDot} />
        </View>

        <Text style={s.name}>{user?.name || 'الطالب'}</Text>
        <Text style={s.role}>{user?.role?.name || 'طالب جامعي'}</Text>

        <View style={s.badgeRow}>
          {user?.department?.name && (
            <View style={s.badge}>
              <Ionicons name="business-outline" size={12} color={theme.accentFg} />
              <Text style={s.badgeText}>{user.department.name}</Text>
            </View>
          )}
          {user?.level && (
            <View style={s.badge}>
              <Ionicons name="school-outline" size={12} color={theme.accentFg} />
              <Text style={s.badgeText}>{user.level}</Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Info cards ── */}
      <View style={s.infoGrid}>
        <InfoCard
          theme={theme}
          icon="id-card-outline"
          iconColor="#007AFF"
          label="رقم الطالب"
          value={user?.studentId || '—'}
        />
        <InfoCard
          theme={theme}
          icon="mail-outline"
          iconColor="#5856D6"
          label="البريد الإلكتروني"
          value={user?.email || '—'}
          small
        />
        <InfoCard
          theme={theme}
          icon="trending-up-outline"
          iconColor="#34C759"
          label="المعدل التراكمي"
          value={`${gpa} / 5.0`}
        />
        <InfoCard
          theme={theme}
          icon="book-outline"
          iconColor="#FF9500"
          label="الساعات المنجزة"
          value={loading ? null : `${completedHours} ساعة`}
          loading={loading}
        />
        <InfoCard
          theme={theme}
          icon="card-outline"
          iconColor={paymentStatus === 'مسدد' ? '#34C759' : '#FF3B30'}
          label="حالة الدفع"
          value={paymentStatus}
          valueColor={paymentStatus === 'مسدد' ? '#34C759' : '#FF3B30'}
        />
        <InfoCard
          theme={theme}
          icon="checkmark-circle-outline"
          iconColor={user?.is_active ? '#34C759' : '#FF3B30'}
          label="حالة الحساب"
          value={user?.is_active ? 'نشط' : 'غير نشط'}
          valueColor={user?.is_active ? '#34C759' : '#FF3B30'}
        />
      </View>

      {/* ── Quick actions ── */}
      <Text style={s.sectionTitle}>الإجراءات السريعة</Text>
      <View style={s.actionsRow}>
        <QuickAction
          theme={theme}
          icon="settings-outline"
          label="الإعدادات"
          onPress={() => router.push('/(screens)/settings')}
        />
        <QuickAction
          theme={theme}
          icon="chatbubble-ellipses-outline"
          label="تواصل معنا"
          onPress={() => router.push('/(screens)/contact')}
        />
        <QuickAction
          theme={theme}
          icon="lock-closed-outline"
          label="كلمة المرور"
          onPress={() => router.push('/(screens)/reset-password')}
        />
      </View>

      {/* ── Notice ── */}
      <View style={s.notice}>
        <Ionicons name="information-circle" size={22} color="#FF9500" />
        <Text style={s.noticeText}>
          تأكد من استكمال بيانات ملفك الشخصي وسداد رسوم التسجيل في الموعد المحدد
        </Text>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

/* ── Sub-components ─────────────────────────────────────────── */

function InfoCard({ theme, icon, iconColor, label, value, valueColor, loading, small }) {
  const s = makeStyles(theme);
  return (
    <View style={s.infoCard}>
      <View style={[s.iconCircle, { backgroundColor: iconColor + '18' }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={s.infoLabel}>{label}</Text>
      {loading ? (
        <ActivityIndicator size="small" color={iconColor} style={{ marginTop: 4 }} />
      ) : (
        <Text
          style={[s.infoValue, small && { fontSize: 12 }, valueColor && { color: valueColor }]}
          numberOfLines={1}
        >
          {value}
        </Text>
      )}
    </View>
  );
}

function QuickAction({ theme, icon, label, onPress }) {
  const s = makeStyles(theme);
  return (
    <TouchableOpacity style={s.actionBtn} onPress={onPress} activeOpacity={0.75}>
      <View style={s.actionIcon}>
        <Ionicons name={icon} size={22} color={theme.accentFg} />
      </View>
      <Text style={s.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

/* ── Styles ─────────────────────────────────────────────────── */

const makeStyles = (t) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.bg },

  // Hero
  hero: {
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 28,
    paddingHorizontal: 20,
    backgroundColor: t.card,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: t.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarWrapper: { position: 'relative', marginBottom: 14 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: t.accent,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#34C759',
    borderWidth: 2,
    borderColor: t.card,
  },
  name: { fontSize: 22, fontWeight: '700', color: t.text, marginBottom: 4 },
  role: { fontSize: 13, color: t.textSub, marginBottom: 12 },
  badgeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: t.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: { fontSize: 11, fontWeight: '600', color: t.accentFg },

  // Info grid
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 20,
    gap: 10,
  },
  infoCard: {
    width: '47%',
    backgroundColor: t.cardAlt,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: t.border,
    alignItems: 'flex-end',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  infoLabel: { fontSize: 11, color: t.textMuted, marginBottom: 4, textAlign: 'right' },
  infoValue: { fontSize: 15, fontWeight: '700', color: t.text, textAlign: 'right' },

  // Quick actions
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: t.textSub,
    textAlign: 'right',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  actionBtn: { alignItems: 'center', gap: 6 },
  actionIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: t.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { fontSize: 11, color: t.textSub, textAlign: 'center' },

  // Notice
  notice: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: t.isDark ? 'rgba(255,149,0,0.08)' : 'rgba(255,149,0,0.1)',
    borderRightWidth: 4,
    borderRightColor: '#FF9500',
    padding: 12,
    borderRadius: 10,
  },
  noticeText: { flex: 1, fontSize: 12, color: t.textSub, lineHeight: 18, textAlign: 'right' },
});
