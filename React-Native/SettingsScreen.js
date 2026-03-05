import React from "react";
import { View, Text, StyleSheet, Switch } from "react-native";

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.row}>
        <Text>Enable Notifications</Text>
        <Switch value={true} />
      </View>

      <View style={styles.row}>
        <Text>Dark Mode</Text>
        <Switch value={false} />
      </View>

      <View style={styles.row}>
        <Text>Language: English</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
});