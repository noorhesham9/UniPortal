import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getAcceptedIDs, addAllowedStudent } from "../../services/idService";
import { useAppTheme } from "../../context/ThemeContext";

export default function AdminScreen() {
  const [ids, setIds]               = useState([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [searchQuery, setSearch]    = useState("");
  const [modalVisible, setModal]    = useState(false);
  const [newId, setNewId]           = useState("");
  const [newEmail, setNewEmail]     = useState("");
  const [adding, setAdding]         = useState(false);
  const { theme: t }                = useAppTheme();

  useEffect(() => { fetchIDs(); }, []);

  const fetchIDs = async () => {
    setLoading(true);
    try {
      const res = await getAcceptedIDs();
      setIds(res.data);
      setTotal(res.total);
    } catch {
      Alert.alert("Error", "Failed to load allowed IDs");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newId.trim()) {
      Alert.alert("Required", "Student ID is required");
      return;
    }
    setAdding(true);
    try {
      await addAllowedStudent(newId.trim(), newEmail.trim() || undefined);
      setModal(false);
      setNewId("");
      setNewEmail("");
      fetchIDs();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to add ID");
    } finally {
      setAdding(false);
    }
  };

  const filtered = ids.filter((item) =>
    (item.studentId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>
      <View style={styles.cardLeft}>
        <View style={[styles.dot, { backgroundColor: item.isRegistered ? "#22c55e" : "#6b7280" }]} />
        <View>
          <Text style={[styles.cardId, { color: t.text }]}>{item.studentId}</Text>
          {item.email ? <Text style={[styles.cardEmail, { color: t.textSub }]}>{item.email}</Text> : null}
        </View>
      </View>
      <View style={[styles.badge, item.isRegistered ? styles.badgeGreen : styles.badgeGray]}>
        <Text style={[styles.badgeText, { color: item.isRegistered ? "#22c55e" : "#9ca3af" }]}>
          {item.isRegistered ? "Registered" : "Pending"}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: t.bg }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: t.text }]}>Admin Panel</Text>
          <Text style={[styles.subtitle, { color: t.textSub }]}>Manage allowed student IDs</Text>
        </View>
        <Ionicons name="shield-checkmark" size={28} color="#FFD700" />
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: t.cardAlt, borderColor: t.border }]}>
          <Text style={[styles.statValue, { color: t.text }]}>{total}</Text>
          <Text style={[styles.statLabel, { color: t.textSub }]}>Total IDs</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: t.cardAlt, borderColor: t.border }]}>
          <Text style={[styles.statValue, { color: t.text }]}>{ids.filter(i => i.isRegistered).length}</Text>
          <Text style={[styles.statLabel, { color: t.textSub }]}>Registered</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: t.cardAlt, borderColor: t.border }]}>
          <Text style={[styles.statValue, { color: t.text }]}>{ids.filter(i => !i.isRegistered).length}</Text>
          <Text style={[styles.statLabel, { color: t.textSub }]}>Pending</Text>
        </View>
      </View>

      <View style={[styles.searchWrap, { backgroundColor: t.input, borderColor: t.inputBorder }]}>
        <Ionicons name="search" size={16} color={t.textSub} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.searchInput, { color: t.text }]}
          placeholder="Search by ID or email..."
          placeholderTextColor={t.textMuted}
          value={searchQuery}
          onChangeText={setSearch}
        />
      </View>

      <TouchableOpacity style={styles.addBtn} onPress={() => setModal(true)}>
        <Ionicons name="add-circle-outline" size={18} color={t.accentFg} />
        <Text style={[styles.addBtnText, { color: t.accentFg }]}>ADD NEW ID</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator color="#FFD700" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item._id?.toString() || item.studentId}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={<Text style={[styles.empty, { color: t.textSub }]}>No IDs found</Text>}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: t.modalBg }]}>
            <View style={[styles.modalHandle, { backgroundColor: t.border }]} />
            <Text style={[styles.modalTitle, { color: t.text }]}>Add New Student ID</Text>
            <Text style={[styles.modalSub, { color: t.textSub }]}>Allow a student to register in the portal</Text>

            <Text style={[styles.inputLabel, { color: t.textSub }]}>Student ID *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: t.input, borderColor: t.inputBorder, color: t.text }]}
              placeholder="e.g. 20210001"
              placeholderTextColor={t.textMuted}
              value={newId}
              onChangeText={setNewId}
              autoCapitalize="none"
            />

            <Text style={[styles.inputLabel, { color: t.textSub }]}>Email (optional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: t.input, borderColor: t.inputBorder, color: t.text }]}
              placeholder="student@university.edu"
              placeholderTextColor={t.textMuted}
              value={newEmail}
              onChangeText={setNewEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.cancelBtn, { borderColor: t.border }]} onPress={() => { setModal(false); setNewId(""); setNewEmail(""); }}>
                <Text style={[styles.cancelText, { color: t.textSub }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleAdd} disabled={adding}>
                {adding
                  ? <ActivityIndicator color={t.accentFg} />
                  : <Text style={[styles.confirmText, { color: t.accentFg }]}>Add ID</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  header:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title:        { fontSize: 22, fontWeight: "700" },
  subtitle:     { fontSize: 13, marginTop: 2 },
  statsRow:     { flexDirection: "row", gap: 10, marginBottom: 16 },
  statCard:     { flex: 1, borderRadius: 12, padding: 14, alignItems: "center", borderWidth: 1 },
  statValue:    { fontSize: 22, fontWeight: "700" },
  statLabel:    { fontSize: 11, marginTop: 2 },
  searchWrap:   { flexDirection: "row", alignItems: "center", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, borderWidth: 1 },
  searchInput:  { flex: 1, fontSize: 14 },
  addBtn:       { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#facc15", borderRadius: 10, paddingVertical: 13, marginBottom: 16 },
  addBtnText:   { fontWeight: "700", fontSize: 14 },
  card:         { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1 },
  cardLeft:     { flexDirection: "row", alignItems: "center", gap: 12 },
  dot:          { width: 10, height: 10, borderRadius: 5 },
  cardId:       { fontSize: 16, fontWeight: "600" },
  cardEmail:    { fontSize: 12, marginTop: 2 },
  badge:        { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeGreen:   { backgroundColor: "rgba(34,197,94,0.12)", borderWidth: 1, borderColor: "rgba(34,197,94,0.3)" },
  badgeGray:    { backgroundColor: "rgba(107,114,128,0.12)", borderWidth: 1, borderColor: "rgba(107,114,128,0.3)" },
  badgeText:    { fontSize: 11, fontWeight: "700" },
  empty:        { textAlign: "center", marginTop: 40 },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  modalSheet:   { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  modalHandle:  { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 20 },
  modalTitle:   { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  modalSub:     { fontSize: 13, marginBottom: 20 },
  inputLabel:   { fontSize: 13, marginBottom: 6, fontWeight: "600" },
  input:        { borderRadius: 10, padding: 14, fontSize: 15, marginBottom: 16, borderWidth: 1 },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 4 },
  cancelBtn:    { flex: 1, padding: 14, borderRadius: 10, borderWidth: 1, alignItems: "center" },
  cancelText:   { fontWeight: "600" },
  confirmBtn:   { flex: 1, padding: 14, borderRadius: 10, backgroundColor: "#facc15", alignItems: "center" },
  confirmText:  { fontWeight: "700", fontSize: 15 },
});
