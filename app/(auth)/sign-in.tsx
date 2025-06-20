"use client"

import { AuthHeader } from "@/components/AuthHeader"
import { useModal } from "@/context/ModalContext"
import { useTheme } from "@/context/ThemeContext"
import { ErrorHandler } from "@/utils/ErrorHandler"
import { useSignIn } from "@clerk/clerk-expo"
import { router } from "expo-router"
import React from "react"
import { Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from "react-native"

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const { isDarkMode } = useTheme()
  const { showLoading, hideLoading, showSuccess, showError, showWarning } = useModal()

  const [emailAddress, setEmailAddress] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)

  const onSignInPress = async () => {
    if (!isLoaded) return

    showLoading("Signing you in...")

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      })

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId })
        hideLoading()

        const successConfig = ErrorHandler.getSuccessMessage("signin")
        showSuccess(successConfig.message, successConfig.title, false)

        // Navigate after showing success
        setTimeout(() => {
          router.replace("/")
        }, 1500)
      } else {
        hideLoading()
        console.error("Sign in incomplete:", JSON.stringify(signInAttempt, null, 2))
        showError("Sign in incomplete. Please try again.", "Authentication Failed")
      }
    } catch (err: any) {
      hideLoading()
      console.error("Sign in error:", JSON.stringify(err, null, 2))

      const errorConfig = ErrorHandler.parseClerkError(err)

      if (errorConfig.type === "warning") {
        showWarning(errorConfig.message, errorConfig.title)
      } else {
        showError(errorConfig.message, errorConfig.title)
      }
    }
  }

  const handleSignUpPress = () => {
    router.push("/(auth)/sign-up")
  }

  const handleForgotPassword = () => {
    // Navigate to reset password page
    router.push("/(auth)/reset-password")
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
    forgotPasswordText: {
      color: isDarkMode ? "#9ca3af" : "#6b7280",
    },
    footerText: {
      color: isDarkMode ? "#9ca3af" : "#6b7280",
    },
    toggleText: {
      color: "#6366f1",
    },
  }

  return (
    <SafeAreaView style={[styles.safeArea, dynamicStyles.safeArea]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <AuthHeader />
      <ScrollView style={[styles.container, dynamicStyles.container]}>
        <View style={styles.content}>
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>T</Text>
              </View>
            </View>

            <Text style={[styles.title, dynamicStyles.title]}>Welcome Back</Text>
            <Text style={[styles.subtitle, dynamicStyles.subtitle]}>Sign in to your TaskMgmt account</Text>
          </View>

          <View style={[styles.formContainer, dynamicStyles.formContainer]}>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>Email</Text>
              <TextInput
                autoCapitalize="none"
                placeholder="Enter your email"
                placeholderTextColor={isDarkMode ? "#6b7280" : "#9ca3af"}
                value={emailAddress}
                onChangeText={setEmailAddress}
                style={[styles.input, dynamicStyles.input]}
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.passwordHeader}>
                <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>Password</Text>
                <Pressable onPress={handleForgotPassword}>
                  <Text style={[styles.forgotPasswordLink, dynamicStyles.forgotPasswordText]}>Forgot Password?</Text>
                </Pressable>
              </View>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor={isDarkMode ? "#6b7280" : "#9ca3af"}
                  value={password}
                  secureTextEntry={!showPassword}
                  onChangeText={setPassword}
                  style={[styles.input, dynamicStyles.input]}
                  autoComplete="password"
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.toggleButton}>
                  <Text style={[styles.toggleText, dynamicStyles.toggleText]}>{showPassword ? "Hide" : "Show"}</Text>
                </Pressable>
              </View>
            </View>

            <Pressable
              onPress={onSignInPress}
              style={[styles.signInButton, (!emailAddress || !password) && styles.buttonDisabled]}
              disabled={!emailAddress || !password}
            >
              <Text style={styles.signInButtonText}>Sign In</Text>
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, dynamicStyles.footerText]}>Don't have an account?</Text>
            <Pressable onPress={handleSignUpPress}>
              <Text style={styles.footerLink}>Create Account</Text>
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
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6366f1",
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
    marginBottom: 20,
  },
  passwordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "bold",
  },
  forgotPasswordLink: {
    fontSize: 12,
    textDecorationLine: "underline",
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingRight: 60, // Add space for toggle button
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  signInButton: {
    backgroundColor: "#6366f1",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#6366f1",
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
  signInButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    marginRight: 4,
  },
  footerLink: {
    color: "#6366f1",
    fontWeight: "bold",
    fontSize: 14,
  },
  passwordInputContainer: {
    position: "relative",
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
})
