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

export default function AcceptedIDs() {
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
      // لو أدمن فعلاً
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

  const filteredIDs = ids.filter((id) => id.idNumber.includes(searchQuery));

  // render card
  const renderItem = ({ item }) => {
    return (
      <View
        style={{
          backgroundColor: "#111",
          padding: 20,
          marginBottom: 15,
          borderRadius: 12,
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 20,
            fontWeight: "bold",
          }}
        >
          {item.idNumber}
        </Text>

        <Text
          style={{
            color: item.firstStatus === "REGISTERED" ? "#22c55e" : "#aaa",
          }}
        >
          {item.firstStatus}
        </Text>
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000", padding: 20 }}>
      <Text
        style={{
          color: "white",
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
            backgroundColor: "#111",
            padding: 20,
            borderRadius: 10,
            width: "48%",
          }}
        >
          <Text style={{ color: "#aaa" }}>Total IDs</Text>
          <Text style={{ color: "#fff", fontSize: 22 }}>{stats.totalIds}</Text>
        </View>

        <View
          style={{
            backgroundColor: "#111",
            padding: 20,
            borderRadius: 10,
            width: "48%",
          }}
        >
          <Text style={{ color: "#aaa" }}>Active Slots</Text>
          <Text style={{ color: "#fff", fontSize: 22 }}>
            {stats.activeSlots}
          </Text>
        </View>
      </View>

      <TextInput
        placeholder="Search ID number"
        placeholderTextColor="#888"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={{
          backgroundColor: "#111",
          color: "white",
          padding: 15,
          borderRadius: 10,
          marginBottom: 20,
        }}
      />

      <TouchableOpacity
        style={{
          backgroundColor: "#FFD700",
          padding: 15,
          borderRadius: 10,
          marginBottom: 20,
        }}
      >
        <Text
          style={{
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          ADD NEW ID
        </Text>
      </TouchableOpacity>

      <Text
        style={{
          color: "#888",
          marginBottom: 10,
        }}
      >
        ALLOWED ID LIST
      </Text>

      <FlatList
        data={filteredIDs}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </SafeAreaView>
  );
}
