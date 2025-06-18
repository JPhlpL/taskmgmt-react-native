"use client"

import { Header } from "@/components/Header"
import { useModal } from "@/context/ModalContext"
import { useTheme } from "@/context/ThemeContext"
import { ErrorHandler } from "@/utils/ErrorHandler"
import { useSignIn } from "@clerk/clerk-expo"
import { router, useFocusEffect, useLocalSearchParams } from "expo-router"
import { useCallback, useState } from "react"
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

export default function NewPasswordScreen() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const { isDarkMode } = useTheme()
  const { showLoading, hideLoading, showSuccess, showError, showWarning } = useModal()
  const params = useLocalSearchParams()
  const email = params.email as string
  const verified = params.verified as string
  const timestamp = params.timestamp as string

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)

  // Check session state when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      checkResetState()
    }, [isLoaded, signIn]),
  )

  const checkResetState = async () => {
    if (!isLoaded || !signIn) return

    console.log("=== SESSION STATE CHECK ===")
    console.log("SignIn status:", signIn.status)
    console.log("SignIn object keys:", Object.keys(signIn))
    console.log("First factor verification:", signIn.firstFactorVerification)
    console.log("Verified param:", verified)
    console.log("Timestamp param:", timestamp)

    // If we're in needs_first_factor but have recent verification, we need to re-verify
    if (signIn.status === "needs_first_factor" && verified === "true") {
      console.log("⚠️ Session reverted to needs_first_factor - this is the issue!")

      // Check if first factor verification shows as verified
      if (signIn.firstFactorVerification?.status === "verified") {
        console.log("✅ First factor is verified, allowing password reset")
        setIsReady(true)
        setSessionChecked(true)
        return
      }

      // Session has reverted - we need to show error and restart
      if (sessionChecked) return // Prevent multiple error messages

      setSessionChecked(true)
      showError(
        "Your verification session has expired. This is a known issue with the reset flow. Please start the password reset process again.",
        "Session Expired",
      )
      setTimeout(() => {
        router.push("/(auth)/reset-password")
      }, 3000)
      return
    }

    // Check if we're in the correct state for password reset
    if (signIn.status === "needs_new_password") {
      console.log("✅ Session is in needs_new_password state")
      setIsReady(true)
      setSessionChecked(true)
    } else {
      console.log("❌ Session state is not ready for password reset:", signIn.status)

      if (sessionChecked) return // Prevent multiple error messages

      setSessionChecked(true)
      showError(
        "Your reset session is not in the correct state. Please start the password reset process again.",
        "Session Invalid",
      )
      setTimeout(() => {
        router.push("/(auth)/reset-password")
      }, 2000)
    }
  }

  const validatePassword = () => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long"
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter"
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter"
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number"
    }
    return null
  }

  const getPasswordStrength = () => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/(?=.*[a-z])/.test(password)) strength++
    if (/(?=.*[A-Z])/.test(password)) strength++
    if (/(?=.*\d)/.test(password)) strength++
    if (/(?=.*[@$!%*?&])/.test(password)) strength++

    if (strength <= 2) return { level: "Weak", color: "#ef4444" }
    if (strength <= 3) return { level: "Fair", color: "#f59e0b" }
    if (strength <= 4) return { level: "Good", color: "#10b981" }
    return { level: "Strong", color: "#059669" }
  }

  const handleResetPassword = async () => {
    if (!isLoaded || !signIn) {
      showError("Authentication module not ready. Please try again shortly.", "Try Again")
      return
    }

    const passwordError = validatePassword()
    if (passwordError) {
      showWarning(passwordError, "Password Requirements")
      return
    }

    if (password !== confirmPassword) {
      showWarning("Passwords do not match. Please check and try again.", "Password Mismatch")
      return
    }

    showLoading("Setting your new password...")

    try {
      console.log("=== ATTEMPTING PASSWORD RESET ===")
      console.log("SignIn status before reset:", signIn.status)
      console.log("Available methods:", Object.getOwnPropertyNames(signIn))

      // Try different approaches based on session state
      let result

      if (signIn.status === "needs_new_password") {
        console.log("Using resetPassword method...")
        result = await signIn.resetPassword({
          password,
        })
      } else if (signIn.status === "needs_first_factor" && signIn.firstFactorVerification?.status === "verified") {
        console.log("Attempting second factor with new password...")
        // Try to complete the reset using attemptSecondFactor or similar
        try {
          result = await signIn.resetPassword({
            password,
          })
        } catch (resetError) {
          console.log("resetPassword failed, trying alternative approach...")
          // Alternative: try to create a new session with the password
          throw resetError
        }
      } else {
        throw new Error("Session is not in the correct state for password reset")
      }

      console.log("Reset password result:", JSON.stringify(result, null, 2))

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        hideLoading()

        showSuccess(
          "Your password has been successfully reset! You are now signed in with your new password.",
          "Password Reset Complete",
          false,
        )

        // Navigate to home after success
        setTimeout(() => {
          router.replace("/")
        }, 2000)
      } else {
        hideLoading()
        console.log("Password reset incomplete, status:", result.status)
        showError(`Password reset incomplete. Status: ${result.status}. Please try again.`, "Reset Failed")
      }
    } catch (err: any) {
      hideLoading()
      console.error("=== PASSWORD RESET ERROR ===")
      console.error("Error details:", JSON.stringify(err, null, 2))

      const errorConfig = ErrorHandler.parseClerkError(err)

      // Handle specific error cases
      if (err?.errors?.[0]?.code === "client_state_invalid") {
        showError(
          "Your reset session has expired or is invalid. This appears to be a session state issue. Please start the password reset process again.",
          "Session Expired",
        )
        setTimeout(() => {
          router.push("/(auth)/reset-password")
        }, 3000)
        return
      }

      // Handle session timeout or invalid state
      if (err?.status === 400 || err?.errors?.[0]?.code?.includes("invalid")) {
        showError(
          "There was an issue with your reset session state. Please start the password reset process again.",
          "Session Issue",
        )
        setTimeout(() => {
          router.push("/(auth)/reset-password")
        }, 2000)
        return
      }

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

  const handleStartOver = () => {
    router.push("/(auth)/reset-password")
  }

  const passwordStrength = getPasswordStrength()
  const isFormValid = password.length >= 8 && password === confirmPassword && !validatePassword()

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
    secondaryButton: {
      backgroundColor: isDarkMode ? "#1f1f2e" : "#ffffff",
      borderColor: isDarkMode ? "#2d2d4a" : "#d1d5db",
    },
    secondaryButtonText: {
      color: isDarkMode ? "#ffffff" : "#1f2937",
    },
    warningText: {
      color: "#f59e0b",
    },
  }

  if (!sessionChecked) {
    return (
      <SafeAreaView style={[styles.safeArea, dynamicStyles.safeArea]}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
        <Header showBackButton onBackPress={handleBackPress} />
        <View style={[styles.container, dynamicStyles.container, styles.loadingContainer]}>
          <Text style={[styles.loadingText, dynamicStyles.title]}>Checking session state...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.safeArea, dynamicStyles.safeArea]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <Header showBackButton onBackPress={handleBackPress} />
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

              <Text style={[styles.title, dynamicStyles.title]}>Set New Password</Text>
              <Text style={[styles.subtitle, dynamicStyles.subtitle]}>
                Create a strong password for your account {email && `(${email})`}
              </Text>

              {!isReady && (
                <View style={styles.warningContainer}>
                  <Text style={[styles.warningText, dynamicStyles.warningText]}>
                    ⚠️ Session state issue detected. You may need to restart the reset process.
                  </Text>
                </View>
              )}
            </View>

            <View style={[styles.formContainer, dynamicStyles.formContainer]}>
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>New Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    placeholder="Enter your new password"
                    placeholderTextColor={isDarkMode ? "#6b7280" : "#9ca3af"}
                    value={password}
                    onChangeText={setPassword}
                    style={[styles.input, dynamicStyles.input]}
                    secureTextEntry={!showPassword}
                    autoComplete="password-new"
                    autoFocus
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.toggleButton}>
                    <Text style={[styles.toggleText, dynamicStyles.toggleText]}>{showPassword ? "Hide" : "Show"}</Text>
                  </Pressable>
                </View>

                {password.length > 0 && (
                  <View style={styles.strengthContainer}>
                    <View style={styles.strengthBar}>
                      <View
                        style={[
                          styles.strengthFill,
                          {
                            width: `${
                              getPasswordStrength().level === "Weak"
                                ? 25
                                : getPasswordStrength().level === "Fair"
                                  ? 50
                                  : getPasswordStrength().level === "Good"
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
                <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>Confirm Password</Text>
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

                {confirmPassword.length > 0 && password !== confirmPassword && (
                  <Text style={[styles.errorText]}>Passwords do not match</Text>
                )}
              </View>

              <Pressable
                onPress={handleResetPassword}
                style={[styles.resetButton, !isFormValid && styles.buttonDisabled]}
                disabled={!isFormValid}
              >
                <Text style={styles.resetButtonText}>{isReady ? "Reset Password" : "Try Reset (Session Issue)"}</Text>
              </Pressable>

              <Pressable onPress={handleStartOver} style={[styles.secondaryButton, dynamicStyles.secondaryButton]}>
                <Text style={[styles.secondaryButtonText, dynamicStyles.secondaryButtonText]}>Start Over</Text>
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
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
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
  warningContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  warningText: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
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
  resetButton: {
    backgroundColor: "#8b5cf6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12,
    shadowColor: "#8b5cf6",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  secondaryButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  buttonDisabled: {
    backgroundColor: "#9ca3af",
    shadowOpacity: 0,
    elevation: 0,
  },
  resetButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  secondaryButtonText: {
    fontWeight: "600",
    fontSize: 14,
  },
})
