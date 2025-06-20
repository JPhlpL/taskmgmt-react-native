"use client"

import { useUser } from "@clerk/clerk-expo"
import React from "react"
import { Animated, Dimensions, Modal, Pressable, StyleSheet, Text, View } from "react-native"
import { useTheme } from "../context/ThemeContext"

interface MenuModalProps {
  visible: boolean
  onClose: () => void
  onSignOut: () => void
  onChangePassword: () => void
}

export const MenuModal: React.FC<MenuModalProps> = ({ visible, onClose, onSignOut, onChangePassword }) => {
  const { isDarkMode } = useTheme()
  const { user } = useUser()
  const fadeAnim = React.useRef(new Animated.Value(0)).current
  const slideAnim = React.useRef(new Animated.Value(-300)).current

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -300,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [visible])

  const dynamicStyles = {
    overlay: {
      backgroundColor: isDarkMode ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.5)",
    },
    menuContainer: {
      backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
    },
    profileSection: {
      backgroundColor: isDarkMode ? "#374151" : "#f9fafb",
    },
    userName: {
      color: isDarkMode ? "#ffffff" : "#1f2937",
    },
    userEmail: {
      color: isDarkMode ? "#d1d5db" : "#6b7280",
    },
    menuItem: {
      borderBottomColor: isDarkMode ? "#374151" : "#e5e7eb",
    },
    menuItemText: {
      color: isDarkMode ? "#ffffff" : "#1f2937",
    },
    menuItemSubtext: {
      color: isDarkMode ? "#9ca3af" : "#6b7280",
    },
  }

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, dynamicStyles.overlay, { opacity: fadeAnim }]}>
        <Pressable style={styles.overlayPress} onPress={onClose} />
        <Animated.View
          style={[styles.menuContainer, dynamicStyles.menuContainer, { transform: [{ translateX: slideAnim }] }]}
        >
          {/* Profile Section */}
          <View style={[styles.profileSection, dynamicStyles.profileSection]}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {user?.emailAddresses[0]?.emailAddress?.charAt(0).toUpperCase() || "U"}
                </Text>
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.userName, dynamicStyles.userName]}>{user?.firstName || "User"}</Text>
              <Text style={[styles.userEmail, dynamicStyles.userEmail]}>
                {user?.emailAddresses[0]?.emailAddress || "user@example.com"}
              </Text>
            </View>
          </View>

          {/* Menu Items */}
          <View style={styles.menuItems}>
            <Pressable style={[styles.menuItem, dynamicStyles.menuItem]} onPress={onChangePassword}>
              <View style={styles.menuItemIcon}>
                <Text style={styles.menuItemEmoji}>🔐</Text>
              </View>
              <View style={styles.menuItemContent}>
                <Text style={[styles.menuItemText, dynamicStyles.menuItemText]}>Change Password</Text>
                <Text style={[styles.menuItemSubtext, dynamicStyles.menuItemSubtext]}>
                  Update your account password
                </Text>
              </View>
              <Text style={[styles.menuItemArrow, dynamicStyles.menuItemText]}>›</Text>
            </Pressable>

            <Pressable
              style={[styles.menuItem, dynamicStyles.menuItem]}
              onPress={() => {
                onClose() // Close menu modal first
                setTimeout(() => {
                  onSignOut() // Then show signout confirmation after a brief delay
                }, 100)
              }}
            >
              <View style={styles.menuItemIcon}>
                <Text style={styles.menuItemEmoji}>🚪</Text>
              </View>
              <View style={styles.menuItemContent}>
                <Text style={[styles.menuItemText, dynamicStyles.menuItemText]}>Sign Out</Text>
                <Text style={[styles.menuItemSubtext, dynamicStyles.menuItemSubtext]}>Sign out of your account</Text>
              </View>
              <Text style={[styles.menuItemArrow, dynamicStyles.menuItemText]}>›</Text>
            </Pressable>
          </View>

          {/* App Info */}
          <View style={styles.appInfo}>
            <Text style={[styles.appName, dynamicStyles.menuItemSubtext]}>TaskMgmt</Text>
            <Text style={[styles.appVersion, dynamicStyles.menuItemSubtext]}>Version 1.0.0</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  )
}

const { width, height } = Dimensions.get("window")

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
  },
  overlayPress: {
    flex: 1,
  },
  menuContainer: {
    width: width * 0.8,
    maxWidth: 320,
    height: height,
    paddingTop: 60,
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  menuItems: {
    flex: 1,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuItemEmoji: {
    fontSize: 20,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  menuItemSubtext: {
    fontSize: 12,
  },
  menuItemArrow: {
    fontSize: 20,
    fontWeight: "300",
  },
  appInfo: {
    padding: 20,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  appName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 12,
  },
})
