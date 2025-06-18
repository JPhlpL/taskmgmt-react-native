"use client"

import React from "react"
import { ActivityIndicator, Animated, Dimensions, Modal, Pressable, StyleSheet, Text, View } from "react-native"
import { useTheme } from "../context/ThemeContext"

export type ModalType = "success" | "error" | "warning" | "info" | "loading"

interface CustomModalProps {
  visible: boolean
  type: ModalType
  title?: string
  message: string
  onClose?: () => void
  onConfirm?: () => void
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
  autoClose?: boolean
  autoCloseDelay?: number
}

export const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  type,
  title,
  message,
  onClose,
  onConfirm,
  confirmText = "OK",
  cancelText = "Cancel",
  showCancel = false,
  autoClose = false,
  autoCloseDelay = 3000,
}) => {
  const { isDarkMode } = useTheme()
  const fadeAnim = React.useRef(new Animated.Value(0)).current
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start()

      if (autoClose && type !== "loading") {
        const timer = setTimeout(() => {
          handleClose()
        }, autoCloseDelay)
        return () => clearTimeout(timer)
      }
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [visible, autoClose, autoCloseDelay, type])

  const handleClose = () => {
    if (onClose) {
      onClose()
    }
  }

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    } else {
      handleClose()
    }
  }

  const getModalConfig = () => {
    switch (type) {
      case "success":
        return {
          icon: "✅",
          iconColor: "#10b981",
          title: title || "Success",
        }
      case "error":
        return {
          icon: "❌",
          iconColor: "#ef4444",
          title: title || "Error",
        }
      case "warning":
        return {
          icon: "⚠️",
          iconColor: "#f59e0b",
          title: title || "Warning",
        }
      case "info":
        return {
          icon: "ℹ️",
          iconColor: "#3b82f6",
          title: title || "Information",
        }
      case "loading":
        return {
          icon: null,
          iconColor: "#6366f1",
          title: title || "Loading",
        }
      default:
        return {
          icon: "ℹ️",
          iconColor: "#6b7280",
          title: title || "Notice",
        }
    }
  }

  const config = getModalConfig()

  const dynamicStyles = {
    overlay: {
      backgroundColor: isDarkMode ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.5)",
    },
    container: {
      backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
    },
    title: {
      color: isDarkMode ? "#ffffff" : "#1f2937",
    },
    message: {
      color: isDarkMode ? "#d1d5db" : "#4b5563",
    },
    cancelButton: {
      backgroundColor: isDarkMode ? "#374151" : "#f3f4f6",
    },
    cancelButtonText: {
      color: isDarkMode ? "#d1d5db" : "#4b5563",
    },
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={type !== "loading" ? handleClose : undefined}
    >
      <Animated.View style={[styles.overlay, dynamicStyles.overlay, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.container, dynamicStyles.container, { transform: [{ scale: scaleAnim }] }]}>
          {/* Icon or Loading Spinner */}
          <View style={styles.iconContainer}>
            {type === "loading" ? (
              <ActivityIndicator size="large" color={config.iconColor} />
            ) : (
              <Text style={[styles.icon, { color: config.iconColor }]}>{config.icon}</Text>
            )}
          </View>

          {/* Title */}
          <Text style={[styles.title, dynamicStyles.title]}>{config.title}</Text>

          {/* Message */}
          <Text style={[styles.message, dynamicStyles.message]}>{message}</Text>

          {/* Buttons - Only show if not loading */}
          {type !== "loading" && (
            <View style={styles.buttonContainer}>
              {showCancel && (
                <Pressable
                  style={[styles.button, styles.cancelButton, dynamicStyles.cancelButton]}
                  onPress={handleClose}
                >
                  <Text style={[styles.buttonText, dynamicStyles.cancelButtonText]}>{cancelText}</Text>
                </Pressable>
              )}
              <Pressable style={[styles.button, styles.confirmButton]} onPress={handleConfirm}>
                <Text style={styles.confirmButtonText}>{confirmText}</Text>
              </Pressable>
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  )
}

const { width } = Dimensions.get("window")

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  container: {
    width: width * 0.85,
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: 60,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  confirmButton: {
    backgroundColor: "#6366f1",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
})
