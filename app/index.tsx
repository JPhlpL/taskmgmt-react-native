"use client"

import { useTheme } from "@/context/ThemeContext"
import { useAuth } from "@clerk/clerk-expo"
import { router } from "expo-router"
import { useEffect } from "react"
import { ActivityIndicator, StyleSheet, View } from "react-native"

export default function RootIndex() {
  const { isSignedIn, isLoaded } = useAuth()
  const { isDarkMode } = useTheme()

  useEffect(() => {
    if (!isLoaded) return // Wait for auth to load

    if (isSignedIn) {
      // User is authenticated, go to dashboard
      router.replace("/(home)")
    } else {
      // User is not authenticated, go to landing page
      router.replace("/landing")
    }
  }, [isSignedIn, isLoaded])

  // Show loading while determining auth state
  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? "#0a0a0f" : "#f8fafc" }]}>
      <ActivityIndicator size="large" color="#6366f1" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})
