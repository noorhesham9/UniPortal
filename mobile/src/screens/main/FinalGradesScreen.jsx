import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { fetchFinalResults } from "../../store/slices/enrollmentSlice";

const gradeColor = (g) => {
  if (["A+", "A"].includes(g)) return { bg: "rgba(34,197,94,0.15)", text: "#22c55e" };
  if (["B+", "B"].includes(g)) return { bg: "rgba(59,130,246,0.15)", text: "#3b82f6" };
  if (["C+", "C"].includes(g)) return { bg: "rgba(245,158,11,0.15)", text: "#f59e0b" };
  if (g === "D") return { bg: "rgba(249,115,22,0.15)", text: "#f97316" };
  return { bg: "rgba(239,68,68,0.15)", text: "#ef4444" };
};

export default function FinalGradesScreen() {
  const dispatch = useDispatch();
  const { theme } = useAppTheme();
  const { finalResults, loading, error } = useSelector((s) => s.enrollment);
  const [refreshing, setRefreshing] = useState(false);
  const [openSem, setOpenSem] = useState(null);

  useEffect(() => {
    dispatch(fetchFinalResults());
  }, []);

  useEffect(() => {
    const results = finalResults?.results || [];
    if (results.length && !openSem) setOpenSem(results[0].semester._id);
  }, [finalResults]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchFinalResults());
    setRefreshing(false);
  };

  const s = makeStyles(theme);

  if (loading && !finalResults) {
    return (
      <SafeAreaView edges={['bottom']} style={s.container}>
        <View style={s.center}>
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text style={s.loadingText}>Loading results...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView edges={['bottom']} style={s.container}>
        <View style={s.center}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={s.errorText}>{error}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => dispatch(fetchFinalResults())}>
            <Text style={s.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const showResults = finalResults?.showResults ?? false;
  const results = finalResults?.results || [];

  if (!showResults) {
    return (
      <SafeAreaView edges={['bottom']} style={s.container}>
        <View style={s.emptyWrap}>
          <Text style={s.emptyIcon}>🔒</Text>
          <Text style={s.emptyTitle}>Results not available yet</Text>
          <Text style={s.emptySub}>Results will be visible once the administration releases them.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (results.length === 0) {
    return (
      <SafeAreaView edges={['bottom']} style={s.container}>
        <View style={s.emptyWrap}>
          <Text style={s.emptyIcon}>📋</Text>
          <Text style={s.emptyTitle}>No final results yet</Text>
          <Text style={s.emptySub}>Results appear after the semester ends and grades are finalized.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const allCourses = results.flatMap((r) => r.courses);
  const totalCredits = allCourses.reduce((s, c) => s + (c.course?.credits || 0), 0);
  const passedCredits = allCourses.filter((c) => c.passed).reduce((s, c) => s + (c.course?.credits || 0), 0);
  const latestGPA = results[0]?.gpa ?? "—";

  const activeSem = results.find((r) => r.semester._id === openSem);

  return (
    <SafeAreaView edges={['bottom']} style={s.container}>
      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />}
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={s.headerTitle}>Final Results</Text>
          <Text style={s.headerSub}>End-of-semester academic results</Text>
        </View>

        {/* Summary Cards */}
        <View style={s.summaryGrid}>
          <View style={s.statCard}>
            <Text style={s.statValue}>{results.length}</Text>
            <Text style={s.statLabel}>SEMESTERS</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statValue}>{totalCredits}</Text>
            <Text style={s.statLabel}>TOTAL HOURS</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statValue}>{passedCredits}</Text>
            <Text style={s.statLabel}>PASSED HOURS</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statValue, { color: "#f59e0b" }]}>{latestGPA}</Text>
            <Text style={s.statLabel}>LATEST GPA</Text>
          </View>
        </View>

        {/* Semester Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabsWrap}>
          {results.map((r) => (
            <TouchableOpacity
              key={r.semester._id}
              style={[s.tab, openSem === r.semester._id && s.tabActive]}
              onPress={() => setOpenSem(r.semester._id)}
            >
              <Text style={[s.tabText, openSem === r.semester._id && s.tabTextActive]}>
                {r.semester.term} {r.semester.year}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Active Semester */}
        {activeSem && (
          <View style={s.semBlock}>
            <View style={s.semMeta}>
              <Text style={s.semMetaText}>
                GPA: <Text style={s.semMetaStrong}>{activeSem.gpa}</Text>
              </Text>
              <Text style={s.semMetaText}>{activeSem.courses.length} courses</Text>
            </View>

            {/* Course Cards */}
            <View style={s.tableWrap}>
              {/* Table Header */}
              <View style={s.tableHead}>
                <Text style={[s.th, { flex: 3 }]}>COURSE</Text>
                <Text style={[s.th, { flex: 1, textAlign: "center" }]}>CR</Text>
                <Text style={[s.th, { flex: 2, textAlign: "center" }]}>TOTAL</Text>
                <Text style={[s.th, { flex: 1, textAlign: "center" }]}>GRADE</Text>
                <Text style={[s.th, { flex: 1.5, textAlign: "center" }]}>STATUS</Text>
              </View>

              {activeSem.courses.map((c, i) => {
                const gc = gradeColor(c.grade);
                const pct = Math.min(((c.total || 0) / (c.totalMax || 100)) * 100, 100);
                return (
                  <View key={c.enrollmentId || i} style={[s.tableRow, i === activeSem.courses.length - 1 && { borderBottomWidth: 0 }]}>
                    <View style={{ flex: 3 }}>
                      <Text style={s.courseName} numberOfLines={1}>{c.course?.title}</Text>
                      <Text style={s.courseCode}>{c.course?.code}</Text>
                    </View>
                    <Text style={[s.td, { flex: 1, textAlign: "center" }]}>{c.course?.credits}</Text>
                    <View style={{ flex: 2, alignItems: "center" }}>
                      <Text style={s.totalText}>{Number(c.total || 0).toFixed(1)}/{c.totalMax ?? 100}</Text>
                      <View style={s.barBg}>
                        <View style={[s.barFill, { width: `${pct}%`, backgroundColor: c.passed ? "#22c55e" : "#ef4444" }]} />
                      </View>
                    </View>
                    <View style={{ flex: 1, alignItems: "center" }}>
                      <View style={[s.gradeBadge, { backgroundColor: gc.bg }]}>
                        <Text style={[s.gradeText, { color: gc.text }]}>{c.grade}</Text>
                      </View>
                    </View>
                    <View style={{ flex: 1.5, alignItems: "center" }}>
                      <View style={[s.statusBadge, { backgroundColor: c.passed ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)" }]}>
                        <Text style={[s.statusText, { color: c.passed ? "#22c55e" : "#ef4444" }]}>
                          {c.passed ? "✓ Pass" : "✗ Fail"}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  scroll: { padding: 16, paddingBottom: 40 },

  loadingText: { fontSize: 14, color: theme.textSub, marginTop: 10 },
  errorText: { fontSize: 14, color: "#ef4444", marginTop: 10, textAlign: "center" },
  retryBtn: { marginTop: 16, backgroundColor: "#f59e0b", paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8 },
  retryText: { fontSize: 14, fontWeight: "700", color: "#1a1a1a" },

  emptyWrap: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32, gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: theme.text, textAlign: "center" },
  emptySub: { fontSize: 13, color: theme.textSub, textAlign: "center", lineHeight: 20 },

  header: { marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: theme.text },
  headerSub: { fontSize: 13, color: theme.textSub, marginTop: 2 },

  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1, minWidth: "45%",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 10, padding: 16,
  },
  statValue: { fontSize: 26, fontWeight: "800", color: theme.text },
  statLabel: { fontSize: 10, color: theme.textSub, textTransform: "uppercase", letterSpacing: 0.8, marginTop: 4 },

  tabsWrap: { marginBottom: 16 },
  tab: {
    paddingHorizontal: 14, paddingVertical: 8, marginRight: 8,
    borderRadius: 6, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  tabActive: { backgroundColor: "rgba(245,158,11,0.12)", borderColor: "#f59e0b" },
  tabText: { fontSize: 13, color: theme.textSub },
  tabTextActive: { color: "#f59e0b", fontWeight: "700" },

  semBlock: { gap: 12 },
  semMeta: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  semMetaText: { fontSize: 13, color: theme.textSub },
  semMetaStrong: { color: theme.text, fontWeight: "600" },

  tableWrap: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
    borderRadius: 10, overflow: "hidden",
  },
  tableHead: {
    flexDirection: "row", paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.07)",
  },
  th: { fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: "700" },
  tableRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 12, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.04)",
  },
  td: { fontSize: 13, color: "#cbd5e1" },
  courseName: { fontSize: 13, fontWeight: "600", color: theme.text },
  courseCode: { fontSize: 11, color: "#475569", marginTop: 2 },
  totalText: { fontSize: 12, fontWeight: "600", color: theme.text, marginBottom: 4 },
  barBg: { width: "100%", height: 4, backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 99, overflow: "hidden" },
  barFill: { height: 4, borderRadius: 99 },
  gradeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
  gradeText: { fontSize: 12, fontWeight: "800" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
  statusText: { fontSize: 11, fontWeight: "700" },
});
