import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppTheme } from "../../context/ThemeContext";
import apiClient from "../../utils/api";

const EMPTY_FORM = {
  studentId: "",
  nationalId: "",
  examSeatNumber: "",
  email: "",
};

const STATUS_COLOR = {
  pending_email: "#f59e0b",
  pending_approval: "#818cf8",
  approved: "#22c55e",
  rejected: "#ef4444",
};

export default function AcceptedIDs() {
  const { theme } = useAppTheme();
  const s = makeStyles(theme);

  const [tab, setTab] = useState("whitelist");

  // Whitelist state
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [pendingSeats, setPendingSeats] = useState(0);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Requests state
  const [requests, setRequests] = useState([]);
  const [reqFilter, setReqFilter] = useState("pending_approval");
  const [reviewModal, setReviewModal] = useState(null);
  const [adminNote, setAdminNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadWhitelist = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("/admin/allowed_students");
      setItems(res.data?.items || []);
      setTotal(res.data?.total || 0);
      setActiveCount(res.data?.activeRegistrations || 0);
      setPendingSeats(res.data?.pendingSeats || 0);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(
        `/registration-requests?status=${reqFilter}`,
      );
      setRequests(res.data?.requests || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWhitelist();
  }, []);
  useEffect(() => {
    if (tab === "requests") loadRequests();
  }, [tab, reqFilter]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (tab === "whitelist") await loadWhitelist();
    else await loadRequests();
    setRefreshing(false);
  };

  const handleAdd = async () => {
    if (!form.studentId || !form.nationalId || !form.examSeatNumber) {
      return setError(
        "Student ID, National ID, and Exam Seat Number are required.",
      );
    }
    setSubmitting(true);
    setError(null);
    try {
      await apiClient.post("/admin/allow_Student", form);
      setForm(EMPTY_FORM);
      setShowAddForm(false);
      await loadWhitelist();
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Remove Student", "Remove this student from the whitelist?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await apiClient.delete(`/admin/allowed_students/${id}`);
            await loadWhitelist();
          } catch (err) {
            setError(err?.response?.data?.message || err.message);
          }
        },
      },
    ]);
  };

  const handleReview = async () => {
    if (!reviewModal) return;
    setSubmitting(true);
    try {
      await apiClient.patch(
        `/registration-requests/${reviewModal.request._id}/review`,
        {
          action: reviewModal.action,
          adminNote,
        },
      );
      setReviewModal(null);
      setAdminNote("");
      await loadRequests();
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = items.filter(
    (i) =>
      !search ||
      i.studentId?.toLowerCase().includes(search.toLowerCase()) ||
      i.nationalId?.toLowerCase().includes(search.toLowerCase()) ||
      i.examSeatNumber?.toLowerCase().includes(search.toLowerCase()),
  );

  const pendingCount = requests.filter(
    (r) => r.status === "pending_approval",
  ).length;

  return (
    <SafeAreaView edges={['bottom']} style={s.container}>
      {/* Tabs */}
      <View style={s.tabs}>
        <TouchableOpacity
          style={[s.tab, tab === "whitelist" && s.tabActive]}
          onPress={() => setTab("whitelist")}
        >
          <Text style={[s.tabText, tab === "whitelist" && s.tabTextActive]}>
            Whitelist
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tab, tab === "requests" && s.tabActive]}
          onPress={() => setTab("requests")}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={[s.tabText, tab === "requests" && s.tabTextActive]}>
              Requests
            </Text>
            {pendingCount > 0 && (
              <View style={s.badge}>
                <Text style={s.badgeText}>{pendingCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={s.errorBanner}>
          <Text style={s.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => setError(null)}>
            <Ionicons name="close" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      )}

      {/* ── WHITELIST ── */}
      {tab === "whitelist" && (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.accent}
            />
          }
          contentContainerStyle={s.listContent}
          ListHeaderComponent={
            <>
              {/* Header */}
              <View style={s.pageHeader}>
                <Text style={s.pageTitle}>Registration Whitelist</Text>
                <Text style={s.pageSub}>
                  Add students with verified identity data before they can
                  register.
                </Text>
              </View>

              {/* Stats */}
              <View style={s.statsRow}>
                <View style={s.statCard}>
                  <Text style={[s.statVal, { color: theme.accent }]}>
                    {total}
                  </Text>
                  <Text style={s.statLabel}>Total</Text>
                </View>
                <View style={s.statCard}>
                  <Text style={s.statVal}>{activeCount}</Text>
                  <Text style={s.statLabel}>Registered</Text>
                </View>
                <View style={s.statCard}>
                  <Text style={s.statVal}>{pendingSeats}</Text>
                  <Text style={s.statLabel}>Pending</Text>
                </View>
              </View>

              {/* Add Button */}
              <TouchableOpacity
                style={s.addBtn}
                onPress={() => setShowAddForm(!showAddForm)}
              >
                <Ionicons name="person-add-outline" size={18} color="#1a1a1a" />
                <Text style={s.addBtnText}>
                  {showAddForm ? "Cancel" : "Add Student"}
                </Text>
              </TouchableOpacity>

              {/* Add Form */}
              {showAddForm && (
                <View style={s.formCard}>
                  {[
                    {
                      key: "studentId",
                      label: "Student ID *",
                      placeholder: "e.g. 2024-10452",
                    },
                    {
                      key: "nationalId",
                      label: "National ID *",
                      placeholder: "14-digit national ID",
                    },
                    {
                      key: "examSeatNumber",
                      label: "Exam Seat Number *",
                      placeholder: "Thanaweyya seat no.",
                    },
                    {
                      key: "email",
                      label: "Email (optional)",
                      placeholder: "student@university.edu",
                    },
                  ].map(({ key, label, placeholder }) => (
                    <View key={key} style={s.fieldWrap}>
                      <Text style={s.fieldLabel}>{label}</Text>
                      <TextInput
                        style={s.input}
                        placeholder={placeholder}
                        placeholderTextColor={theme.textSub}
                        value={form[key]}
                        onChangeText={(v) =>
                          setForm((f) => ({ ...f, [key]: v }))
                        }
                        autoCapitalize="none"
                      />
                    </View>
                  ))}
                  <TouchableOpacity
                    style={s.submitBtn}
                    onPress={handleAdd}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <ActivityIndicator size="small" color="#1a1a1a" />
                    ) : (
                      <Text style={s.submitBtnText}>Add to Whitelist</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {/* Search */}
              <View style={s.searchWrap}>
                <Ionicons
                  name="search-outline"
                  size={16}
                  color={theme.textSub}
                />
                <TextInput
                  style={s.searchInput}
                  placeholder="Search by ID, national ID, seat..."
                  placeholderTextColor={theme.textSub}
                  value={search}
                  onChangeText={setSearch}
                />
              </View>

              <Text style={s.listTitle}>
                Whitelisted Students ({filtered.length})
              </Text>

              {loading && (
                <ActivityIndicator
                  color={theme.accent}
                  style={{ marginVertical: 20 }}
                />
              )}
              {!loading && filtered.length === 0 && (
                <View style={s.empty}>
                  <Ionicons
                    name="people-outline"
                    size={48}
                    color={theme.border}
                  />
                  <Text style={s.emptyText}>No records found.</Text>
                </View>
              )}
            </>
          }
          renderItem={({ item }) => (
            <View style={s.itemCard}>
              <View style={s.itemTop}>
                <Text style={s.itemId}>{item.studentId}</Text>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <View
                    style={[
                      s.regBadge,
                      {
                        backgroundColor: item.isRegistered
                          ? "rgba(34,197,94,0.12)"
                          : "rgba(100,116,139,0.12)",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        s.regBadgeText,
                        { color: item.isRegistered ? "#22c55e" : "#64748b" },
                      ]}
                    >
                      {item.isRegistered ? "Registered" : "Not Registered"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDelete(item._id)}
                    style={s.deleteBtn}
                  >
                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={s.itemDetails}>
                <Text style={s.itemDetail}>
                  National ID:{" "}
                  <Text style={s.itemDetailVal}>{item.nationalId}</Text>
                </Text>
                <Text style={s.itemDetail}>
                  Exam Seat:{" "}
                  <Text style={s.itemDetailVal}>{item.examSeatNumber}</Text>
                </Text>
                {item.email && (
                  <Text style={s.itemDetail}>
                    Email: <Text style={s.itemDetailVal}>{item.email}</Text>
                  </Text>
                )}
                <Text style={s.itemDetail}>
                  Added:{" "}
                  <Text style={s.itemDetailVal}>
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString()
                      : "—"}
                  </Text>
                </Text>
              </View>
            </View>
          )}
        />
      )}

      {/* ── REQUESTS ── */}
      {tab === "requests" && (
        <FlatList
          data={requests}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.accent}
            />
          }
          contentContainerStyle={s.listContent}
          ListHeaderComponent={
            <>
              <View style={s.pageHeader}>
                <Text style={s.pageTitle}>Registration Requests</Text>
              </View>
              {/* Filter */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 16 }}
              >
                {[
                  "pending_approval",
                  "pending_email",
                  "approved",
                  "rejected",
                  "all",
                ].map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[
                      s.filterChip,
                      reqFilter === f && s.filterChipActive,
                    ]}
                    onPress={() => setReqFilter(f)}
                  >
                    <Text
                      style={[
                        s.filterChipText,
                        reqFilter === f && s.filterChipTextActive,
                      ]}
                    >
                      {f.replace(/_/g, " ").toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {loading && (
                <ActivityIndicator
                  color={theme.accent}
                  style={{ marginVertical: 20 }}
                />
              )}
              {!loading && requests.length === 0 && (
                <View style={s.empty}>
                  <Ionicons
                    name="document-outline"
                    size={48}
                    color={theme.border}
                  />
                  <Text style={s.emptyText}>No requests found.</Text>
                </View>
              )}
            </>
          }
          renderItem={({ item }) => {
            const sc = STATUS_COLOR[item.status] || "#64748b";
            return (
              <View style={s.itemCard}>
                <View style={s.itemTop}>
                  <Text style={s.itemId}>{item.studentId}</Text>
                  <View
                    style={[
                      s.statusBadge,
                      { backgroundColor: `${sc}22`, borderColor: `${sc}44` },
                    ]}
                  >
                    <Text style={[s.statusBadgeText, { color: sc }]}>
                      {item.status.replace(/_/g, " ").toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={s.itemDetails}>
                  <Text style={s.itemDetail}>
                    Name: <Text style={s.itemDetailVal}>{item.fullName}</Text>
                  </Text>
                  <Text style={s.itemDetail}>
                    National ID:{" "}
                    <Text style={s.itemDetailVal}>{item.nationalId}</Text>
                  </Text>
                  <Text style={s.itemDetail}>
                    Exam Seat:{" "}
                    <Text style={s.itemDetailVal}>{item.examSeatNumber}</Text>
                  </Text>
                  <Text style={s.itemDetail}>
                    Email Verified:{" "}
                    <Text
                      style={[
                        s.itemDetailVal,
                        { color: item.emailVerified ? "#22c55e" : "#f59e0b" },
                      ]}
                    >
                      {item.emailVerified ? "Yes" : "No"}
                    </Text>
                  </Text>
                </View>
                {item.status === "pending_approval" && (
                  <View style={s.actionRow}>
                    <TouchableOpacity
                      style={s.approveBtn}
                      onPress={() => {
                        setReviewModal({ request: item, action: "approve" });
                        setAdminNote("");
                      }}
                    >
                      <Ionicons name="checkmark" size={16} color="#22c55e" />
                      <Text style={s.approveBtnText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={s.rejectBtn}
                      onPress={() => {
                        setReviewModal({ request: item, action: "reject" });
                        setAdminNote("");
                      }}
                    >
                      <Ionicons name="close" size={16} color="#ef4444" />
                      <Text style={s.rejectBtnText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          }}
        />
      )}

      {/* Review Modal */}
      <Modal
        visible={!!reviewModal}
        transparent
        animationType="fade"
        onRequestClose={() => setReviewModal(null)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modal}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>
                {reviewModal?.action === "approve"
                  ? "Approve Request"
                  : "Reject Request"}
              </Text>
              <TouchableOpacity onPress={() => setReviewModal(null)}>
                <Ionicons name="close" size={22} color={theme.text} />
              </TouchableOpacity>
            </View>
            <Text style={s.modalStudent}>
              Student:{" "}
              <Text style={{ fontWeight: "700", color: theme.text }}>
                {reviewModal?.request?.fullName}
              </Text>{" "}
              ({reviewModal?.request?.studentId})
            </Text>
            <Text style={s.fieldLabel}>Admin Note (optional)</Text>
            <TextInput
              style={[s.input, { height: 80, textAlignVertical: "top" }]}
              multiline
              placeholder={
                reviewModal?.action === "reject"
                  ? "Reason for rejection..."
                  : "Optional note..."
              }
              placeholderTextColor={theme.textSub}
              value={adminNote}
              onChangeText={setAdminNote}
            />
            <View style={s.modalFooter}>
              <TouchableOpacity
                style={s.cancelBtn}
                onPress={() => setReviewModal(null)}
              >
                <Text style={s.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={
                  reviewModal?.action === "approve"
                    ? s.confirmApproveBtn
                    : s.confirmRejectBtn
                }
                onPress={handleReview}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={s.confirmBtnText}>
                    {reviewModal?.action === "approve" ? "Approve" : "Reject"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const makeStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.bg },
    listContent: { padding: 16, paddingBottom: 40 },

    tabs: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      paddingHorizontal: 16,
    },
    tab: { paddingVertical: 12, paddingHorizontal: 16, marginRight: 8 },
    tabActive: { borderBottomWidth: 2, borderBottomColor: theme.accent },
    tabText: { fontSize: 14, color: theme.textSub, fontWeight: "600" },
    tabTextActive: { color: theme.accent },
    badge: {
      backgroundColor: "#f59e0b",
      borderRadius: 10,
      paddingHorizontal: 6,
      paddingVertical: 1,
    },
    badgeText: { fontSize: 11, fontWeight: "800", color: "#1a1a1a" },

    errorBanner: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: "rgba(239,68,68,0.1)",
      borderWidth: 1,
      borderColor: "rgba(239,68,68,0.3)",
      margin: 16,
      padding: 12,
      borderRadius: 8,
    },
    errorText: { fontSize: 13, color: "#ef4444", flex: 1 },

    pageHeader: { marginBottom: 16 },
    pageTitle: { fontSize: 22, fontWeight: "800", color: theme.text },
    pageSub: { fontSize: 13, color: theme.textSub, marginTop: 4 },

    statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
    statCard: {
      flex: 1,
      backgroundColor: "rgba(255,255,255,0.04)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
      borderRadius: 10,
      padding: 14,
      alignItems: "center",
    },
    statVal: { fontSize: 22, fontWeight: "800", color: theme.text },
    statLabel: {
      fontSize: 10,
      color: theme.textSub,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginTop: 2,
    },

    addBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: theme.accent,
      borderRadius: 10,
      padding: 14,
      marginBottom: 12,
    },
    addBtnText: { fontSize: 14, fontWeight: "700", color: "#1a1a1a" },

    formCard: {
      backgroundColor: "rgba(255,255,255,0.04)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    fieldWrap: { marginBottom: 12 },
    fieldLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.textSub,
      marginBottom: 6,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    input: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      color: theme.text,
    },
    submitBtn: {
      backgroundColor: theme.accent,
      borderRadius: 8,
      padding: 14,
      alignItems: "center",
      marginTop: 4,
    },
    submitBtnText: { fontSize: 14, fontWeight: "700", color: "#1a1a1a" },

    searchWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 12,
    },
    searchInput: { flex: 1, fontSize: 14, color: theme.text },

    listTitle: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.textSub,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 10,
    },

    empty: { alignItems: "center", paddingVertical: 40, gap: 10 },
    emptyText: { fontSize: 14, color: theme.textSub },

    itemCard: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
    },
    itemTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    itemId: { fontSize: 16, fontWeight: "800", color: theme.text },
    regBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    regBadgeText: { fontSize: 11, fontWeight: "700" },
    deleteBtn: { padding: 4 },
    itemDetails: { gap: 4 },
    itemDetail: { fontSize: 13, color: theme.textSub },
    itemDetailVal: { color: theme.text, fontWeight: "600" },

    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      borderWidth: 1,
    },
    statusBadgeText: { fontSize: 10, fontWeight: "700" },

    actionRow: { flexDirection: "row", gap: 10, marginTop: 12 },
    approveBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      backgroundColor: "rgba(34,197,94,0.1)",
      borderWidth: 1,
      borderColor: "rgba(34,197,94,0.3)",
      borderRadius: 8,
      padding: 10,
    },
    approveBtnText: { fontSize: 13, fontWeight: "700", color: "#22c55e" },
    rejectBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      backgroundColor: "rgba(239,68,68,0.1)",
      borderWidth: 1,
      borderColor: "rgba(239,68,68,0.3)",
      borderRadius: 8,
      padding: 10,
    },
    rejectBtnText: { fontSize: 13, fontWeight: "700", color: "#ef4444" },

    filterChip: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      marginRight: 8,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.1)",
    },
    filterChipActive: {
      backgroundColor: "rgba(245,158,11,0.12)",
      borderColor: theme.accent,
    },
    filterChipText: { fontSize: 11, fontWeight: "700", color: theme.textSub },
    filterChipTextActive: { color: theme.accent },

    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "center",
      padding: 20,
    },
    modal: { backgroundColor: theme.card, borderRadius: 16, padding: 20 },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    modalTitle: { fontSize: 18, fontWeight: "800", color: theme.text },
    modalStudent: { fontSize: 13, color: theme.textSub, marginBottom: 16 },
    modalFooter: { flexDirection: "row", gap: 10, marginTop: 16 },
    cancelBtn: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
    },
    cancelBtnText: { fontSize: 14, fontWeight: "600", color: theme.textSub },
    confirmApproveBtn: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      backgroundColor: "#22c55e",
      alignItems: "center",
    },
    confirmRejectBtn: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      backgroundColor: "#ef4444",
      alignItems: "center",
    },
    confirmBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  });
