"use client"

import { router } from "expo-router"
import type React from "react"
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native"
import { useTheme } from "../context/ThemeContext"
import { ThemeToggle } from "./ThemeToggle"

interface AuthHeaderProps {
  title?: string
  showBackButton?: boolean
  onBackPress?: () => void
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ title, showBackButton = false, onBackPress }) => {
  const { isDarkMode } = useTheme()

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress()
    } else {
      router.back()
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? "#0a0a0f" : "#f8fafc" }]}>
      <View style={styles.container}>
        <View style={styles.leftSection}>
          {showBackButton ? (
            <Pressable onPress={handleBackPress} style={styles.backButton}>
              <Text style={[styles.backButtonText, { color: isDarkMode ? "#ffffff" : "#1f2937" }]}>← Back</Text>
            </Pressable>
          ) : (
            <View style={styles.placeholder} />
          )}
          {title && <Text style={[styles.title, { color: isDarkMode ? "#ffffff" : "#1f2937" }]}>{title}</Text>}
        </View>
        <View style={styles.rightSection}>
          <ThemeToggle />
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    width: "100%",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 56,
  },
  leftSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  placeholder: {
    width: 16,
  },
})
