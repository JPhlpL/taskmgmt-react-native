"use client"

import { AuthHeader } from "@/components/AuthHeader"
import { useModal } from "@/context/ModalContext"
import { useTheme } from "@/context/ThemeContext"
import { ErrorHandler } from "@/utils/ErrorHandler"
import { useUser } from "@clerk/clerk-expo"
import { router } from "expo-router"
import { useState } from "react"
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"

export default function ChangePasswordScreen() {
  const { user } = useUser()
  const { isDarkMode } = useTheme()
  const { showLoading, hideLoading, showSuccess, showError, showWarning } = useModal()

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const validatePassword = () => {
    if (newPassword.length < 8) {
      return "Password must be at least 8 characters long"
    }
    if (!/(?=.*[a-z])/.test(newPassword)) {
      return "Password must contain at least one lowercase letter"
    }
    if (!/(?=.*[A-Z])/.test(newPassword)) {
      return "Password must contain at least one uppercase letter"
    }
    if (!/(?=.*\d)/.test(newPassword)) {
      return "Password must contain at least one number"
    }
    return null
  }

  const getPasswordStrength = () => {
    let strength = 0
    if (newPassword.length >= 8) strength++
    if (/(?=.*[a-z])/.test(newPassword)) strength++
    if (/(?=.*[A-Z])/.test(newPassword)) strength++
    if (/(?=.*\d)/.test(newPassword)) strength++
    if (/(?=.*[@$!%*?&])/.test(newPassword)) strength++

    if (strength <= 2) return { level: "Weak", color: "#ef4444" }
    if (strength <= 3) return { level: "Fair", color: "#f59e0b" }
    if (strength <= 4) return { level: "Good", color: "#10b981" }
    return { level: "Strong", color: "#059669" }
  }

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      showWarning("Please enter your current password.", "Current Password Required")
      return
    }

    const passwordError = validatePassword()
    if (passwordError) {
      showWarning(passwordError, "Password Requirements")
      return
    }

    if (newPassword !== confirmPassword) {
      showWarning("New passwords do not match. Please check and try again.", "Password Mismatch")
      return
    }

    if (currentPassword === newPassword) {
      showWarning("New password must be different from your current password.", "Same Password")
      return
    }

    showLoading("Updating your password...")

    try {
      await user?.updatePassword({
        currentPassword,
        newPassword,
      })

      hideLoading()
      showSuccess(
        "Your password has been successfully updated! Please use your new password for future sign-ins.",
        "Password Updated",
        false,
      )

      // Navigate back after success
      setTimeout(() => {
        router.back()
      }, 2000)
    } catch (err: any) {
      hideLoading()
      console.error("Change password error:", JSON.stringify(err, null, 2))

      const errorConfig = ErrorHandler.parseClerkError(err)

      if (errorConfig.type === "warning") {
        showWarning(errorConfig.message, errorConfig.title)
      } else {
        showError(errorConfig.message, errorConfig.title)
      }
    }
  }

  const handleBackPress = () => {
    router.back()
  }

  const passwordStrength = getPasswordStrength()
  const isFormValid =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    newPassword === confirmPassword &&
    !validatePassword() &&
    currentPassword !== newPassword

  // Dynamic styles based on theme
  const dynamicStyles = {
    safeArea: {
      backgroundColor: isDarkMode ? "#0a0a0f" : "#f8fafc",
    },
    container: {
      backgroundColor: isDarkMode ? "#0a0a0f" : "#f8fafc",
    },
    title: {
      color: isDarkMode ? "#ffffff" : "#1f2937",
    },
    subtitle: {
      color: isDarkMode ? "#9ca3af" : "#6b7280",
    },
    formContainer: {
      backgroundColor: isDarkMode ? "#12121a" : "#ffffff",
    },
    inputLabel: {
      color: isDarkMode ? "#ffffff" : "#1f2937",
    },
    input: {
      backgroundColor: isDarkMode ? "#1f1f2e" : "#f9fafb",
      color: isDarkMode ? "#ffffff" : "#1f2937",
      borderColor: isDarkMode ? "#2d2d4a" : "#e5e7eb",
    },
    passwordHint: {
      color: isDarkMode ? "#9ca3af" : "#6b7280",
    },
    strengthText: {
      color: isDarkMode ? "#d1d5db" : "#4b5563",
    },
    toggleText: {
      color: "#6366f1",
    },
    warningText: {
      color: "#f59e0b",
    },
  }

  return (
    <SafeAreaView style={[styles.safeArea, dynamicStyles.safeArea]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <AuthHeader showBackButton onBackPress={handleBackPress} title="Change Password" />
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={[styles.container, dynamicStyles.container]}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            <View style={styles.headerSection}>
              <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                  <Text style={styles.logoText}>🔐</Text>
                </View>
              </View>

              <Text style={[styles.title, dynamicStyles.title]}>Change Password</Text>
              <Text style={[styles.subtitle, dynamicStyles.subtitle]}>
                Update your password to keep your account secure
              </Text>
            </View>

            <View style={[styles.formContainer, dynamicStyles.formContainer]}>
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>Current Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    placeholder="Enter your current password"
                    placeholderTextColor={isDarkMode ? "#6b7280" : "#9ca3af"}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    style={[styles.input, dynamicStyles.input]}
                    secureTextEntry={!showCurrentPassword}
                    autoComplete="current-password"
                    autoFocus
                  />
                  <Pressable onPress={() => setShowCurrentPassword(!showCurrentPassword)} style={styles.toggleButton}>
                    <Text style={[styles.toggleText, dynamicStyles.toggleText]}>
                      {showCurrentPassword ? "Hide" : "Show"}
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>New Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    placeholder="Enter your new password"
                    placeholderTextColor={isDarkMode ? "#6b7280" : "#9ca3af"}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    style={[styles.input, dynamicStyles.input]}
                    secureTextEntry={!showNewPassword}
                    autoComplete="password-new"
                  />
                  <Pressable onPress={() => setShowNewPassword(!showNewPassword)} style={styles.toggleButton}>
                    <Text style={[styles.toggleText, dynamicStyles.toggleText]}>
                      {showNewPassword ? "Hide" : "Show"}
                    </Text>
                  </Pressable>
                </View>

                {newPassword.length > 0 && (
                  <View style={styles.strengthContainer}>
                    <View style={styles.strengthBar}>
                      <View
                        style={[
                          styles.strengthFill,
                          {
                            width: `${
                              passwordStrength.level === "Weak"
                                ? 25
                                : passwordStrength.level === "Fair"
                                  ? 50
                                  : passwordStrength.level === "Good"
                                    ? 75
                                    : 100
                            }%`,
                            backgroundColor: passwordStrength.color,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.strengthText, dynamicStyles.strengthText, { color: passwordStrength.color }]}>
                      {passwordStrength.level}
                    </Text>
                  </View>
                )}

                <Text style={[styles.passwordHint, dynamicStyles.passwordHint]}>
                  Password must be at least 8 characters with uppercase, lowercase, and numbers
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>Confirm New Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    placeholder="Confirm your new password"
                    placeholderTextColor={isDarkMode ? "#6b7280" : "#9ca3af"}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    style={[styles.input, dynamicStyles.input]}
                    secureTextEntry={!showConfirmPassword}
                    autoComplete="password-new"
                  />
                  <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.toggleButton}>
                    <Text style={[styles.toggleText, dynamicStyles.toggleText]}>
                      {showConfirmPassword ? "Hide" : "Show"}
                    </Text>
                  </Pressable>
                </View>

                {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                  <Text style={styles.errorText}>Passwords do not match</Text>
                )}

                {currentPassword.length > 0 && newPassword.length > 0 && currentPassword === newPassword && (
                  <Text style={[styles.warningText, dynamicStyles.warningText]}>
                    New password must be different from current password
                  </Text>
                )}
              </View>

              <Pressable
                onPress={handleChangePassword}
                style={[styles.changeButton, !isFormValid && styles.buttonDisabled]}
                disabled={!isFormValid}
              >
                <Text style={styles.changeButtonText}>Update Password</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 20,
    paddingBottom: 100,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 48,
  },
  logoContainer: {
    marginBottom: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#8b5cf6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#8b5cf6",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  formContainer: {
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  passwordInputContainer: {
    position: "relative",
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingRight: 60,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  toggleButton: {
    position: "absolute",
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
  },
  strengthContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 12,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    overflow: "hidden",
  },
  strengthFill: {
    height: "100%",
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "600",
    minWidth: 50,
  },
  passwordHint: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 4,
  },
  warningText: {
    fontSize: 12,
    marginTop: 4,
  },
  changeButton: {
    backgroundColor: "#8b5cf6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#8b5cf6",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: "#9ca3af",
    shadowOpacity: 0,
    elevation: 0,
  },
  changeButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
})
