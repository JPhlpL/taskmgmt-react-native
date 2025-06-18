"use client"

import { Header } from "@/components/Header"
import { useModal } from "@/context/ModalContext"
import { useTheme } from "@/context/ThemeContext"
import { ErrorHandler } from "@/utils/ErrorHandler"
import { useSignIn } from "@clerk/clerk-expo"
import { router } from "expo-router"
import React from "react"
import { Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from "react-native"

export default function ResetPasswordScreen() {
  const { signIn, isLoaded } = useSignIn()
  const { isDarkMode } = useTheme()
  const { showLoading, hideLoading, showSuccess, showError, showWarning } = useModal()

  const [emailAddress, setEmailAddress] = React.useState("")

  const handleResetPassword = async () => {
    if (!emailAddress.trim()) {
      showWarning("Please enter your email address.", "Email Required")
      return
    }

    if (!isLoaded || !signIn) {
      showError("Authentication module not ready. Please try again shortly.", "Try Again")
      return
    }

    showLoading("Sending password reset email...")

    try {
      console.log("=== INITIATING PASSWORD RESET ===")
      console.log("Email:", emailAddress)

      // First, create the sign-in attempt
      await signIn.create({
        identifier: emailAddress,
      })

      console.log("SignIn created, status:", signIn.status)

      // Then prepare the first factor for password reset
      const prepareResult = await signIn.prepareFirstFactor({
        strategy: "reset_password_email_code",
      })

      console.log("Prepare first factor result:", JSON.stringify(prepareResult, null, 2))

      hideLoading()
      showSuccess(
        `Password reset instructions have been sent to ${emailAddress}. Please check your email and enter the verification code on the next screen.`,
        "Reset Email Sent",
        false,
      )

      // Navigate to reset code verification after showing success
      setTimeout(() => {
        router.push({
          pathname: "/(auth)/reset-code",
          params: { email: emailAddress },
        })
      }, 2000)
    } catch (err: any) {
      hideLoading()
      console.error("Reset password error:", JSON.stringify(err, null, 2))

      const errorConfig = ErrorHandler.parseClerkError(err)

      if (errorConfig.type === "warning") {
        showWarning(errorConfig.message, errorConfig.title)
      } else {
        showError(errorConfig.message, errorConfig.title)
      }
    }
  }

  const handleBackToSignIn = () => {
    router.back()
  }

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
    secondaryButton: {
      backgroundColor: isDarkMode ? "#1f1f2e" : "#ffffff",
      borderColor: isDarkMode ? "#2d2d4a" : "#d1d5db",
    },
    secondaryButtonText: {
      color: isDarkMode ? "#ffffff" : "#1f2937",
    },
    helpText: {
      color: isDarkMode ? "#9ca3af" : "#6b7280",
    },
  }

  return (
    <SafeAreaView style={[styles.safeArea, dynamicStyles.safeArea]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <Header showBackButton onBackPress={handleBackToSignIn} />
      <ScrollView style={[styles.container, dynamicStyles.container]}>
        <View style={styles.content}>
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>🔑</Text>
              </View>
            </View>

            <Text style={[styles.title, dynamicStyles.title]}>Reset Password</Text>
            <Text style={[styles.subtitle, dynamicStyles.subtitle]}>
              Enter your email address and we'll send you a verification code to reset your password
            </Text>
          </View>

          <View style={[styles.formContainer, dynamicStyles.formContainer]}>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>Email Address</Text>
              <TextInput
                autoCapitalize="none"
                placeholder="Enter your email address"
                placeholderTextColor={isDarkMode ? "#6b7280" : "#9ca3af"}
                value={emailAddress}
                onChangeText={setEmailAddress}
                style={[styles.input, dynamicStyles.input]}
                keyboardType="email-address"
                autoComplete="email"
                autoFocus
              />
            </View>

            <Text style={[styles.helpText, dynamicStyles.helpText]}>
              We'll send a 6-digit verification code to this email address. Make sure you have access to this email.
            </Text>

            <Pressable
              onPress={handleResetPassword}
              style={[styles.resetButton, !emailAddress.trim() && styles.buttonDisabled]}
              disabled={!emailAddress.trim()}
            >
              <Text style={styles.resetButtonText}>Send Reset Code</Text>
            </Pressable>

            <Pressable onPress={handleBackToSignIn} style={[styles.secondaryButton, dynamicStyles.secondaryButton]}>
              <Text style={[styles.secondaryButtonText, dynamicStyles.secondaryButtonText]}>Back to Sign In</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
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
    backgroundColor: "#f59e0b",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#f59e0b",
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
    marginBottom: 32,
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
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
    textAlign: "center",
  },
  resetButton: {
    backgroundColor: "#f59e0b",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#f59e0b",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  secondaryButton: {
    paddingVertical: 16,
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
    fontWeight: "bold",
    fontSize: 16,
  },
})
