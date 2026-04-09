import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";

import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { getAcceptedIDs } from "../../services/idService";
import { authAPI } from "../../utils/api";

export default function AcceptedIDs() {


    useEffect(() => {
    authAPI.getMe()
      .then((res) => {
        const user = res.data.user;
        console.log("[Admin Check] name:", user?.name);
        console.log("[Admin Check] role:", JSON.stringify(user?.role));
        console.log("[Admin Check] is_active:", user?.is_active);
      })
      .catch((err) => console.error("[Admin Check] FAILED:", err.response?.status, err.response?.data?.message));
  }, []);
  const router = useRouter();
  const { isAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [ids, setIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({
    totalIds: 0,
    activeSlots: 42,
    newThisWeek: 0,
  });

  // Admin only
  useEffect(() => {
    if (isAdmin === false) {
      // لو اتأكدنا إنه مش أدمن
      Alert.alert("Access denied", "Admin only");
      router.back();
    } else if (isAdmin === true) {
      fetchIDs();
    }
  }, [isAdmin]);

  const fetchIDs = async () => {
    try {
      setLoading(true);

      const response = await getAcceptedIDs();

      setIds(response.data);

      setStats({
        totalIds: response.total,
        activeSlots: 42,
        newThisWeek: response.newThisWeek,
      });
    } catch (err) {
      Alert.alert("Error", "Failed to load IDs");
    } finally {
      setLoading(false);
    }
  };

  const filteredIDs = ids.filter((id) => (id.studentId || "").includes(searchQuery));

  // render card
  const renderItem = ({ item }) => {
    return (
      <View
        style={{
          backgroundColor: "#ffffff",
          padding: 20,
          marginBottom: 15,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#e2e8f0",
        }}
      >
        <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "bold" }}>
          {item.studentId}
        </Text>
        <Text style={{ color: item.isRegistered ? "#22c55e" : "#94a3b8" }}>
          {item.isRegistered ? "REGISTERED" : "NOT REGISTERED"}
        </Text>
        {item.email && <Text style={{ color: "#64748b", fontSize: 12 }}>{item.email}</Text>}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  // return(<>Bahgat</>)

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff", padding: 20 }}>
      <Text
        style={{
          color: "#0f172a",
          fontSize: 24,
          fontWeight: "bold",
          marginBottom: 20,
        }}
      >
        Accepted IDs
      </Text>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <View
          style={{
            backgroundColor: "#f1f5f9",
            padding: 20,
            borderRadius: 10,
            width: "48%",
            borderWidth: 1,
            borderColor: "#e2e8f0",
          }}
        >
          <Text style={{ color: "#64748b" }}>Total IDs</Text>
          <Text style={{ color: "#0f172a", fontSize: 22 }}>{stats.totalIds}</Text>
        </View>

        <View
          style={{
            backgroundColor: "#f1f5f9",
            padding: 20,
            borderRadius: 10,
            width: "48%",
            borderWidth: 1,
            borderColor: "#e2e8f0",
          }}
        >
          <Text style={{ color: "#64748b" }}>Active Slots</Text>
          <Text style={{ color: "#0f172a", fontSize: 22 }}>
            {stats.activeSlots}
          </Text>
        </View>
      </View>

      <TextInput
        placeholder="Search ID number"
        placeholderTextColor="#94a3b8"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={{
          backgroundColor: "#ffffff",
          color: "#0f172a",
          padding: 15,
          borderRadius: 10,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: "#e2e8f0",
        }}
      />

      <TouchableOpacity
        style={{
          backgroundColor: "#facc15",
          padding: 15,
          borderRadius: 10,
          marginBottom: 20,
        }}
      >
        <Text
          style={{
            textAlign: "center",
            fontWeight: "bold",
            color: "#0f172a",
          }}
        >
          ADD NEW ID
        </Text>
      </TouchableOpacity>

      <Text
        style={{
          color: "#64748b",
          marginBottom: 10,
        }}
      >
        ALLOWED ID LIST
      </Text>

      <FlatList
        data={filteredIDs}
        renderItem={renderItem}
        keyExtractor={(item) => item._id?.toString() || item.studentId}
      />
    </SafeAreaView>
  );
}
