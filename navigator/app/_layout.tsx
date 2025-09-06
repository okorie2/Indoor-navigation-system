import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFrameworkReady } from "@/hooks/useFrameworkReady";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import useHeading from "@/hooks/useHeading";

export default function RootLayout() {
  useFrameworkReady();

  return (
    <>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </GestureHandlerRootView>
    </>
  );
}
