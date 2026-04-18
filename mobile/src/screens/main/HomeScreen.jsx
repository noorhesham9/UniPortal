import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { useAppTheme } from "../../context/ThemeContext";
import { publicAPI } from "../../utils/api";

export default function HomeScreen() {
  const { theme: t } = useAppTheme();
  const { isAuthenticated } = useSelector((s) => s.auth);

  const [siteLocked, setSiteLocked]       = useState(null); // null = loading
  const [semester, setSemester]           = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);

  const load = async () => {
    try {
      // Fetch all three in parallel — site-lock and semester will succeed
      // if a token exists (logged in), announcements is always public
      const [annRes, lockRes, semRes] = await Promise.allSettled([
        publicAPI.getAnnouncements(),
        publicAPI.getSiteLock(),
        publicAPI.getActiveSemester(),
      ]);

      if (annRes.status === "fulfilled")
        setAnnouncements(annRes.value.data.announcements || []);
      if (lockRes.status === "fulfilled")
        setSiteLocked(lockRes.value.data.locked);
      if (semRes.status === "fulfilled")
        setSemester(semRes.value.data.semester);
    } catch (_) {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, [isAuthenticated]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const typeIcon = (type) =>
    type === "document" ? "document-text-outline"
    : type === "event"  ? "calendar-outline"
    : "megaphone-outline";

  const typeColor = (type) =>
    type === "document" ? "#5856D6"
    : type === "event"  ? "#FF9500"
    : "#facc15";

  if (loading) {
    return (
      <View style={[s.center, { backgroundColor: t.bg }]}>
        <ActivityIndicator size="large" color={t.accent} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: t.bg }}
      contentContainerStyle={s.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.accent} />}
    >
      {/* ── Status Cards ── */}
      <View style={s.row}>
        {/* Site Lock */}
        <View style={[s.statusCard, { backgroundColor: t.card, borderColor: t.border }]}>
          <View style={[s.statusIcon, { backgroundColor: siteLocked ? "#FF3B3020" : "#34C75920" }]}>
            <Ionicons
              name={siteLocked ? "lock-closed" : "lock-open"}
              size={22}
              color={siteLocked ? "#FF3B30" : "#34C759"}
            />
          </View>
          <Text style={[s.statusLabel, { color: t.textMuted }]}>Registration</Text>
          <Text style={[s.statusValue, { color: siteLocked ? "#FF3B30" : "#34C759" }]}>
            {siteLocked === null ? "—" : siteLocked ? "Locked" : "Open"}
          </Text>
        </View>

        {/* Active Semester */}
        <View style={[s.statusCard, { backgroundColor: t.card, borderColor: t.border }]}>
          <View style={[s.statusIcon, { backgroundColor: "#facc1520" }]}>
            <Ionicons name="school-outline" size={22} color={t.accent} />
          </View>
          <Text style={[s.statusLabel, { color: t.textMuted }]}>Current Term</Text>
          <Text style={[s.statusValue, { color: t.text }]} numberOfLines={1}>
            {semester ? `${semester.term} ${semester.year}` : "—"}
          </Text>
        </View>
      </View>

      {/* Semester Details */}
      {semester && (
        <View style={[s.semCard, { backgroundColor: t.card, borderColor: t.border }]}>
          <View style={s.semHeader}>
            <Ionicons name="calendar" size={18} color={t.accent} />
            <Text style={[s.semTitle, { color: t.text }]}>
              {semester.term} {semester.year}
            </Text>
            <View style={[s.activeBadge, { backgroundColor: "#34C75920" }]}>
              <Text style={s.activeBadgeText}>Active</Text>
            </View>
          </View>
          <View style={s.semGrid}>
            <SemItem t={t} label="Start" value={fmtDate(semester.start_date)} />
            <SemItem t={t} label="End"   value={fmtDate(semester.end_date)} />
            <SemItem t={t} label="Add/Drop Start" value={fmtDate(semester.add_drop_start)} />
            <SemItem t={t} label="Add/Drop End"   value={fmtDate(semester.add_drop_end)} />
          </View>
          {semester.show_final_results && (
            <View style={s.resultsBanner}>
              <Ionicons name="checkmark-circle" size={16} color="#34C759" />
              <Text style={s.resultsBannerText}>Final results are now available</Text>
            </View>
          )}
        </View>
      )}

      {/* ── Announcements ── */}
      <Text style={[s.sectionTitle, { color: t.textSub }]}>Announcements</Text>

      {announcements.length === 0 ? (
        <View style={[s.emptyBox, { backgroundColor: t.card, borderColor: t.border }]}>
          <Ionicons name="megaphone-outline" size={36} color={t.border} />
          <Text style={[s.emptyText, { color: t.textMuted }]}>No announcements yet</Text>
        </View>
      ) : (
        announcements.map((ann) => (
          <View key={ann._id} style={[s.annCard, { backgroundColor: t.card, borderColor: t.border }]}>
            {/* Image */}
            {ann.imageUrl && (
              <Image source={{ uri: ann.imageUrl }} style={s.annImage} resizeMode="cover" />
            )}

            <View style={s.annBody}>
              {/* Type badge + date */}
              <View style={s.annMeta}>
                <View style={[s.typeBadge, { backgroundColor: typeColor(ann.type) + "20" }]}>
                  <Ionicons name={typeIcon(ann.type)} size={12} color={typeColor(ann.type)} />
                  <Text style={[s.typeBadgeText, { color: typeColor(ann.type) }]}>
                    {ann.type?.toUpperCase()}
                  </Text>
                </View>
                <Text style={[s.annDate, { color: t.textMuted }]}>{fmtDate(ann.date)}</Text>
              </View>

              <Text style={[s.annTitle, { color: t.text }]}>{ann.title}</Text>
              <Text style={[s.annBodyText, { color: t.textSub }]} numberOfLines={3}>
                {ann.body}
              </Text>

              {/* File attachment */}
              {ann.fileUrl && (
                <TouchableOpacity
                  style={[s.fileBtn, { borderColor: t.border, backgroundColor: t.bg }]}
                  onPress={() => Linking.openURL(ann.fileUrl)}
                >
                  <Ionicons name="attach-outline" size={16} color={t.accent} />
                  <Text style={[s.fileBtnText, { color: t.accent }]} numberOfLines={1}>
                    {ann.fileName || "Attachment"}
                  </Text>
                  {ann.fileSize && (
                    <Text style={[s.fileSize, { color: t.textMuted }]}>{ann.fileSize}</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

function SemItem({ t, label, value }) {
  return (
    <View style={s.semItem}>
      <Text style={[s.semItemLabel, { color: t.textMuted }]}>{label}</Text>
      <Text style={[s.semItemValue, { color: t.text }]}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  scroll:       { padding: 16, paddingBottom: 32 },
  center:       { flex: 1, justifyContent: "center", alignItems: "center" },

  // Status row
  row:          { flexDirection: "row", gap: 12, marginBottom: 14 },
  statusCard:   { flex: 1, borderRadius: 14, borderWidth: 1, padding: 14, alignItems: "center", gap: 6 },
  statusIcon:   { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  statusLabel:  { fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 },
  statusValue:  { fontSize: 15, fontWeight: "700" },

  // Semester card
  semCard:      { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 20 },
  semHeader:    { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  semTitle:     { fontSize: 15, fontWeight: "700", flex: 1 },
  activeBadge:  { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  activeBadgeText: { fontSize: 11, fontWeight: "600", color: "#34C759" },
  semGrid:      { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  semItem:      { width: "47%", gap: 2 },
  semItemLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: 0.4 },
  semItemValue: { fontSize: 13, fontWeight: "600" },
  resultsBanner: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12,
    backgroundColor: "#34C75915", borderRadius: 8, padding: 8 },
  resultsBannerText: { fontSize: 12, color: "#34C759", fontWeight: "600" },

  // Section title
  sectionTitle: { fontSize: 13, fontWeight: "600", textTransform: "uppercase",
    letterSpacing: 0.5, marginBottom: 10 },

  // Empty
  emptyBox:     { borderRadius: 14, borderWidth: 1, padding: 32,
    alignItems: "center", gap: 8, marginBottom: 12 },
  emptyText:    { fontSize: 13 },

  // Announcement card
  annCard:      { borderRadius: 14, borderWidth: 1, marginBottom: 12, overflow: "hidden" },
  annImage:     { width: "100%", height: 180 },
  annBody:      { padding: 14, gap: 8 },
  annMeta:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  typeBadge:    { flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  typeBadgeText:{ fontSize: 10, fontWeight: "700" },
  annDate:      { fontSize: 11 },
  annTitle:     { fontSize: 15, fontWeight: "700" },
  annBodyText:  { fontSize: 13, lineHeight: 20 },
  fileBtn:      { flexDirection: "row", alignItems: "center", gap: 6,
    borderWidth: 1, borderRadius: 8, padding: 10, marginTop: 4 },
  fileBtnText:  { fontSize: 13, fontWeight: "600", flex: 1 },
  fileSize:     { fontSize: 11 },
});
