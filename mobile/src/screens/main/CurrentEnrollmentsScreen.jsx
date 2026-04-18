import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useAppTheme } from "../../context/ThemeContext";
import {
  dropEnrollment,
  fetchAvailableCourses,
  fetchCurrentEnrollments,
} from "../../store/slices/enrollmentSlice";

export default function CurrentEnrollmentsScreen() {
  const dispatch = useDispatch();
  const { theme } = useAppTheme();
  const { currentEnrollments, loading, error, isRegistrationOpen, registrationClosedReason, registrationLoading } =
    useSelector((s) => s.enrollment);
  const [refreshing, setRefreshing] = useState(false);
  const [droppingId, setDroppingId] = useState(null);

  const s = makeStyles(theme);

  useEffect(() => {
    dispatch(fetchCurrentEnrollments());
    dispatch(fetchAvailableCourses()); // to check if registration is open
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(fetchCurrentEnrollments()),
      dispatch(fetchAvailableCourses()),
    ]);
    setRefreshing(false);
  };

  const handleDrop = (enrollment) => {
    const courseName = enrollment.section?.course_id?.title || "this course";
    Alert.alert(
      "Drop Course",
      `Are you sure you want to drop "${courseName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Drop",
          style: "destructive",
          onPress: async () => {
            setDroppingId(enrollment._id);
            const result = await dispatch(dropEnrollment(enrollment._id));
            setDroppingId(null);
            if (dropEnrollment.rejected.match(result)) {
              Alert.alert("Error", result.payload || "Failed to drop course.");
            }
          },
        },
      ]
    );
  };

  if (loading && !currentEnrollments?.length) {
    return (
      <SafeAreaView edges={['bottom']} style={s.container}>
        <View style={s.center}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={s.loadingText}>Loading enrollments...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !currentEnrollments?.length) {
    return (
      <SafeAreaView edges={['bottom']} style={s.container}>
        <View style={s.center}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={s.errorText}>{error}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => dispatch(fetchCurrentEnrollments())}>
            <Text style={s.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const enrollments = currentEnrollments || [];

  return (
    <SafeAreaView edges={['bottom']} style={s.container}>
      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={s.headerTitle}>My Enrollments</Text>
          <Text style={s.headerSub}>
            {enrollments.length} course{enrollments.length !== 1 ? "s" : ""} this semester
          </Text>
        </View>

        {/* Registration status banner */}
        {isRegistrationOpen ? (
          <View style={s.banner}>
            <Ionicons name="time-outline" size={16} color="#f59e0b" />
            <Text style={s.bannerText}>Registration is open — you can drop courses</Text>
          </View>
        ) : registrationClosedReason === "not_in_slice" ? (
          <View style={[s.banner, s.bannerInfo]}>
            <Ionicons name="time-outline" size={16} color="#3b82f6" />
            <Text style={[s.bannerText, { color: "#3b82f6" }]}>
              لم يحن دورك بعد — أنت لست ضمن الشريحة المفتوحة حالياً
            </Text>
          </View>
        ) : registrationClosedReason === "closed" ? (
          <View style={[s.banner, s.bannerClosed]}>
            <Ionicons name="lock-closed-outline" size={16} color="#ef4444" />
            <Text style={[s.bannerText, { color: "#ef4444" }]}>
              التسجيل مغلق حالياً
            </Text>
          </View>
        ) : null}

        {enrollments.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="book-outline" size={52} color={theme.border} />
            <Text style={s.emptyTitle}>No enrollments yet</Text>
            <Text style={s.emptySub}>Go to Course Registration to enroll</Text>
          </View>
        ) : (
          enrollments.map((enrollment) => {
            const section = enrollment.section;
            const course = section?.course_id;
            const instructor = section?.instructor_id?.name || "N/A";
            const room = section?.room_id?.room_name || section?.room_id?.number || "N/A";
            const time = [section?.day, section?.start_time, section?.end_time].filter(Boolean).join(" ") || "N/A";
            const isDropping = droppingId === enrollment._id;

            return (
              <View key={enrollment._id} style={s.card}>
                <View style={s.cardTop}>
                  <View style={s.cardTopLeft}>
                    <Text style={s.courseCode}>{course?.code || "N/A"}</Text>
                    <View style={s.creditsBadge}>
                      <Text style={s.creditsText}>{course?.credits || 0} cr</Text>
                    </View>
                  </View>
                  {isRegistrationOpen && (
                    <TouchableOpacity
                      style={[s.dropBtn, isDropping && s.dropBtnDisabled]}
                      onPress={() => handleDrop(enrollment)}
                      disabled={isDropping || registrationLoading}
                    >
                      {isDropping ? (
                        <ActivityIndicator size="small" color="#ef4444" />
                      ) : (
                        <>
                          <Ionicons name="trash-outline" size={14} color="#ef4444" />
                          <Text style={s.dropBtnText}>Drop</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>

                <Text style={s.courseTitle} numberOfLines={2}>{course?.title || ""}</Text>

                <View style={s.divider} />

                <View style={s.details}>
                  <DetailRow icon="layers-outline" label="Section" value={`#${section?.sectionNumber || "N/A"}`} theme={theme} s={s} />
                  <DetailRow icon="person-outline" label="Instructor" value={instructor} theme={theme} s={s} />
                  <DetailRow icon="location-outline" label="Room" value={room} theme={theme} s={s} />
                  <DetailRow icon="time-outline" label="Time" value={time} theme={theme} s={s} />
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ icon, label, value, theme, s }) {
  return (
    <View style={s.detailRow}>
      <Ionicons name={icon} size={14} color={theme.textSub} style={{ marginRight: 6 }} />
      <Text style={s.detailLabel}>{label}: </Text>
      <Text style={s.detailValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  scroll: { padding: 16, paddingBottom: 40 },

  loadingText: { fontSize: 14, color: theme.textSub, marginTop: 10 },
  errorText: { fontSize: 14, color: "#ef4444", marginTop: 10, textAlign: "center" },
  retryBtn: { marginTop: 16, backgroundColor: theme.accent, paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8 },
  retryText: { fontSize: 14, fontWeight: "700", color: "#1a1a1a" },

  header: { marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: theme.text },
  headerSub: { fontSize: 13, color: theme.textSub, marginTop: 2 },

  banner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(245,158,11,0.1)",
    borderWidth: 1, borderColor: "rgba(245,158,11,0.3)",
    borderRadius: 10, padding: 12, marginBottom: 16,
  },
  bannerInfo: {
    backgroundColor: "rgba(59,130,246,0.1)",
    borderColor: "rgba(59,130,246,0.3)",
  },
  bannerClosed: {
    backgroundColor: "rgba(239,68,68,0.1)",
    borderColor: "rgba(239,68,68,0.3)",
  },
  bannerText: { fontSize: 13, color: "#f59e0b", fontWeight: "600", flex: 1 },

  empty: { alignItems: "center", paddingVertical: 60, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: theme.text },
  emptySub: { fontSize: 13, color: theme.textSub },

  card: {
    backgroundColor: theme.card,
    borderWidth: 1, borderColor: theme.border,
    borderRadius: 14, padding: 16, marginBottom: 12,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  cardTopLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  courseCode: { fontSize: 16, fontWeight: "800", color: theme.text },
  creditsBadge: {
    backgroundColor: "rgba(245,158,11,0.12)",
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  creditsText: { fontSize: 11, fontWeight: "700", color: "#f59e0b" },
  courseTitle: { fontSize: 14, color: theme.textSub, marginBottom: 12, lineHeight: 20 },

  dropBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(239,68,68,0.1)",
    borderWidth: 1, borderColor: "rgba(239,68,68,0.3)",
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    minWidth: 70, justifyContent: "center",
  },
  dropBtnDisabled: { opacity: 0.5 },
  dropBtnText: { fontSize: 13, fontWeight: "700", color: "#ef4444" },

  divider: { height: 1, backgroundColor: theme.border, marginBottom: 12 },
  details: { gap: 6 },
  detailRow: { flexDirection: "row", alignItems: "center" },
  detailLabel: { fontSize: 13, color: theme.textSub, fontWeight: "600" },
  detailValue: { fontSize: 13, color: theme.text, flex: 1 },
});
