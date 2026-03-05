import React from "react";
import { View, Text, StyleSheet, TextInput, Button } from "react-native";

export default function ContactScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contact Us</Text>

      <TextInput
        placeholder="Your Name"
        style={styles.input}
      />

      <TextInput
        placeholder="Your Email"
        style={styles.input}
      />

      <TextInput
        placeholder="Your Message"
        style={[styles.input, { height: 100 }]}
        multiline
      />

      <Button title="Send Message" onPress={() => alert("Your message has been sent!")} />
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
  input: {
    borderWidth: 1,
    borderColor: "#888",
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
  },
});