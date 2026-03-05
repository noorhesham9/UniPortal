import React from "react";
import { View, Text, StyleSheet, Image, Button } from "react-native";

export default function ProfileScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: "https://via.placeholder.com/120" }}
        style={styles.image}
      />

      <Text style={styles.name}>Mohammed Ali</Text>
      <Text style={styles.email}>mohammed@email.com</Text>

      <View style={styles.button}>
        <Button
          title="Go to Settings"
          onPress={() => navigation.navigate("Settings")}
        />
      </View>

      <View style={styles.button}>
        <Button
          title="Contact Us"
          onPress={() => navigation.navigate("Contact Us")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
  },
  email: {
    fontSize: 16,
    color: "gray",
    marginBottom: 20,
  },
  button: {
    width: "70%",
    marginVertical: 5,
  },
});