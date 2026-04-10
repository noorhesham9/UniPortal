import React from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import { useAppTheme } from "../../../context/ThemeContext";

export default function ContactScreen() {
  const { theme: t } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <Text style={[styles.title, { color: t.text }]}>Contact Us</Text>

      <TextInput
        placeholder="Your Name"
        placeholderTextColor={t.textMuted}
        style={[styles.input, { backgroundColor: t.input, borderColor: t.inputBorder, color: t.text }]}
      />
      <TextInput
        placeholder="Your Email"
        placeholderTextColor={t.textMuted}
        style={[styles.input, { backgroundColor: t.input, borderColor: t.inputBorder, color: t.text }]}
      />
      <TextInput
        placeholder="Your Message"
        placeholderTextColor={t.textMuted}
        style={[styles.input, { backgroundColor: t.input, borderColor: t.inputBorder, color: t.text, height: 100 }]}
        multiline
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: t.accent }]}
        onPress={() => Alert.alert("Sent", "Your message has been sent!")}
      >
        <Text style={[styles.buttonText, { color: t.accentFg }]}>Send Message</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, padding: 20 },
  title:      { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  input:      { borderWidth: 1, padding: 10, marginBottom: 15, borderRadius: 8, fontSize: 15 },
  button:     { borderRadius: 10, padding: 14, alignItems: "center" },
  buttonText: { fontSize: 16, fontWeight: "600" },
});
