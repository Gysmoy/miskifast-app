// app/(auth)/_layout.js
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

export default function AuthLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack>
      <StatusBar style="dark" />
    </View>
  );
}