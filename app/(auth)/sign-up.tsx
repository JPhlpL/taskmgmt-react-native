"use client"

import { Header } from "@/components/Header"
import { useTheme } from "@/context/ThemeContext"
import { useSignUp } from "@clerk/clerk-expo"
import { router } from "expo-router"
import React from "react"
import { Alert, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from "react-native"

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const { isDarkMode } = useTheme()

  const [emailAddress, setEmailAddress] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [code, setCode] = React.useState("")
  const [pendingVerification, setPendingVerification] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const onSignUpPress = async () => {
    if (!isLoaded) return
    setIsLoading(true)

    try {
      const created = await signUp.create({ emailAddress, password })
      console.log("Created user:", created)
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
      setPendingVerification(true)
    } catch (err) {
      console.error("Signup Error:", JSON.stringify(err, null, 2))
      Alert.alert("Error", "Failed to create account. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const onVerifyPress = async () => {
    if (!isLoaded) return
    setIsLoading(true)

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({ code })
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId })
        router.replace("/")
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2))
        Alert.alert("Error", "Verification failed. Please try again.")
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2))
      Alert.alert("Error", "Invalid verification code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignInPress = () => {
    router.push("/(auth)/sign-in")
  }

  const handleBackPress = () => {
    setPendingVerification(false)
    setCode("")
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
    passwordHint: {
      color: isDarkMode ? "#6b7280" : "#9ca3af",
    },
    secondaryButton: {
      backgroundColor: isDarkMode ? "#1f1f2e" : "#ffffff",
      borderColor: isDarkMode ? "#2d2d4a" : "#d1d5db",
    },
    secondaryButtonText: {
      color: isDarkMode ? "#ffffff" : "#1f2937",
    },
    footerText: {
      color: isDarkMode ? "#9ca3af" : "#6b7280",
    },
  }

  return (
    <SafeAreaView style={[styles.safeArea, dynamicStyles.safeArea]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <Header />
      <ScrollView style={[styles.container, dynamicStyles.container]}>
        <View style={styles.content}>
          {pendingVerification ? (
            <>
              <View style={styles.headerSection}>
                <View style={styles.logoContainer}>
                  <View style={styles.logoCircle}>
                    <Text style={styles.logoText}>📧</Text>
                  </View>
                </View>

                <Text style={[styles.title, dynamicStyles.title]}>Check Your Email</Text>
                <Text style={[styles.subtitle, dynamicStyles.subtitle]}>
                  We sent a verification code to {emailAddress}
                </Text>
              </View>

              <View style={[styles.formContainer, dynamicStyles.formContainer]}>
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>Verification Code</Text>
                  <TextInput
                    placeholder="Enter 6-digit code"
                    placeholderTextColor={isDarkMode ? "#6b7280" : "#9ca3af"}
                    value={code}
                    onChangeText={setCode}
                    style={[styles.input, dynamicStyles.input]}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>

                <Pressable
                  onPress={onVerifyPress}
                  style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                  disabled={isLoading || !code}
                >
                  <Text style={styles.primaryButtonText}>{isLoading ? "Verifying..." : "Verify Email"}</Text>
                </Pressable>

                <Pressable onPress={handleBackPress} style={[styles.secondaryButton, dynamicStyles.secondaryButton]}>
                  <Text style={[styles.secondaryButtonText, dynamicStyles.secondaryButtonText]}>Back to Sign Up</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <View style={styles.headerSection}>
                <View style={styles.logoContainer}>
                  <View style={styles.logoCircle}>
                    <Text style={styles.logoText}>T</Text>
                  </View>
                </View>

                <Text style={[styles.title, dynamicStyles.title]}>Create Account</Text>
                <Text style={[styles.subtitle, dynamicStyles.subtitle]}>Join TaskMgmt and boost your productivity</Text>
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
                  <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>Password</Text>
                  <TextInput
                    placeholder="Create a password"
                    placeholderTextColor={isDarkMode ? "#6b7280" : "#9ca3af"}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    style={[styles.input, dynamicStyles.input]}
                    autoComplete="password-new"
                  />
                  <Text style={[styles.passwordHint, dynamicStyles.passwordHint]}>
                    Password must be at least 8 characters
                  </Text>
                </View>

                <Pressable
                  onPress={onSignUpPress}
                  style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                  disabled={isLoading || !emailAddress || !password}
                >
                  <Text style={styles.primaryButtonText}>{isLoading ? "Creating Account..." : "Create Account"}</Text>
                </Pressable>
              </View>

              <View style={styles.footer}>
                <Text style={[styles.footerText, dynamicStyles.footerText]}>Already have an account?</Text>
                <Pressable onPress={handleSignInPress}>
                  <Text style={styles.footerLink}>Sign In</Text>
                </Pressable>
              </View>
            </>
          )}
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
    marginBottom: 20,
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
  passwordHint: {
    fontSize: 12,
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: "#6366f1",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12,
    shadowColor: "#6366f1",
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
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  secondaryButtonText: {
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
})
