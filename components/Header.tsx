"use client"

import { useAuth } from "@clerk/clerk-expo"
import { router } from "expo-router"
import type React from "react"
import { useState } from "react"
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native"
import { useModal } from "../context/ModalContext"
import { useTheme } from "../context/ThemeContext"
import { MenuModal } from "./MenuModal"
import { ThemeToggle } from "./ThemeToggle"

interface HeaderProps {
  title?: string
  showBackButton?: boolean
  onBackPress?: () => void
}

export const Header: React.FC<HeaderProps> = ({ title, showBackButton = false, onBackPress }) => {
  const { isDarkMode } = useTheme()
  const { showModal, hideModal, showLoading, hideLoading } = useModal()
  const { signOut } = useAuth()
  const [showMenu, setShowMenu] = useState(false)

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress()
    } else {
      router.back()
    }
  }

  const handleSignOut = () => {
    showModal({
      type: "warning",
      title: "Sign Out",
      message: "Are you sure you want to sign out of your account?",
      showCancel: true,
      confirmText: "Sign Out",
      onConfirm: async () => {
        try {
          // Hide the confirmation modal first
          hideModal()

          // Show loading state
          showLoading("Signing you out...")

          // Wait for signout to complete
          await signOut()

          // Hide loading
          hideLoading()

          // Navigate to landing page instead of sign-in to avoid auth loops
          router.replace("/landing")
        } catch (error) {
          hideLoading()
          console.error("Sign out error:", error)
          // If signout fails, show error but don't navigate
          showModal({
            type: "error",
            title: "Sign Out Failed",
            message: "There was an error signing you out. Please try again.",
          })
        }
      },
    })
  }

  const handleChangePassword = () => {
    setShowMenu(false)
    router.push("/(auth)/change-password")
  }

  const handleMenuPress = () => {
    setShowMenu(true)
  }

  return (
    <>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? "#0a0a0f" : "#f8fafc" }]}>
        <View style={styles.container}>
          <View style={styles.leftSection}>
            {showBackButton ? (
              <Pressable onPress={handleBackPress} style={styles.backButton}>
                <Text style={[styles.backButtonText, { color: isDarkMode ? "#ffffff" : "#1f2937" }]}>← Back</Text>
              </Pressable>
            ) : (
              <Pressable onPress={handleMenuPress} style={styles.menuButton}>
                <View style={styles.burgerIcon}>
                  <View style={[styles.burgerLine, { backgroundColor: isDarkMode ? "#ffffff" : "#1f2937" }]} />
                  <View style={[styles.burgerLine, { backgroundColor: isDarkMode ? "#ffffff" : "#1f2937" }]} />
                  <View style={[styles.burgerLine, { backgroundColor: isDarkMode ? "#ffffff" : "#1f2937" }]} />
                </View>
              </Pressable>
            )}
            {title && <Text style={[styles.title, { color: isDarkMode ? "#ffffff" : "#1f2937" }]}>{title}</Text>}
          </View>
          <View style={styles.rightSection}>
            <Pressable onPress={handleSignOut} style={styles.signOutButton}>
              <Text style={[styles.signOutText, { color: isDarkMode ? "#ffffff" : "#1f2937" }]}>Sign Out</Text>
            </Pressable>
            <ThemeToggle />
          </View>
        </View>
      </SafeAreaView>

      {/* Menu Modal */}
      {showMenu && (
        <MenuModal
          visible={showMenu}
          onClose={() => setShowMenu(false)}
          onSignOut={handleSignOut}
          onChangePassword={handleChangePassword}
        />
      )}
    </>
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
  menuButton: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  burgerIcon: {
    width: 24,
    height: 18,
    justifyContent: "space-between",
  },
  burgerLine: {
    height: 2,
    width: "100%",
    borderRadius: 1,
  },
  signOutButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: "600",
  },
})
