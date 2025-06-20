"use client"

import { Header } from "@/components/Header"
import { useModal } from "@/context/ModalContext"
import { useTheme } from "@/context/ThemeContext"
import { ErrorHandler } from "@/utils/ErrorHandler"
import { useSignIn } from "@clerk/clerk-expo"
import { router } from "expo-router"
import { useRef, useState } from "react"
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

type ResetStep = "email" | "verification" | "password"

export default function ResetPasswordScreen() {
  const { signIn, isLoaded, setActive } = useSignIn()
  const { isDarkMode } = useTheme()
  const { showLoading, hideLoading, showSuccess, showError, showWarning } = useModal()

  // Step management
  const [currentStep, setCurrentStep] = useState<ResetStep>("email")

  // Email step state
  const [emailAddress, setEmailAddress] = useState("")

  // Verification step state
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""])
  const inputs = Array.from({ length: 6 }, () => useRef<TextInput>(null))
  const inputRefs = useRef(inputs)

  // Password step state
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Email step handler
  const handleSendResetCode = async () => {
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

      // Create the sign-in attempt
      await signIn.create({
        identifier: emailAddress,
      })

      console.log("SignIn created, status:", signIn.status)

      // Get the email factor and prepare first factor
      if (!signIn?.supportedFirstFactors) {
        throw new Error("SignIn or supportedFirstFactors is not available.")
      }

      const emailFactor = signIn.supportedFirstFactors.find((factor) => factor.strategy === "reset_password_email_code")

      if (!emailFactor || !emailFactor.emailAddressId) {
        throw new Error("Email address ID is missing for password reset.")
      }

      await signIn.prepareFirstFactor({
        strategy: "reset_password_email_code",
        emailAddressId: emailFactor.emailAddressId,
      })

      hideLoading()
      showSuccess(
        `Password reset code has been sent to ${emailAddress}. Please check your email.`,
        "Reset Code Sent",
        false,
      )

      // Move to verification step
      setTimeout(() => {
        setCurrentStep("verification")
      }, 1500)
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

  // Verification step handlers
  const handleOtpChange = (text: string, index: number) => {
    if (text.length === 6) {
      const codeArray = text.slice(0, 6).split("")
      setOtp(codeArray)
      return
    }

    const newOtp = [...otp]
    newOtp[index] = text.slice(-1)
    setOtp(newOtp)

    if (text && index < 5) {
      inputRefs.current[index + 1].current?.focus()
    }
  }

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].current?.focus()
    }
  }

  const handleVerifyCode = async () => {
    if (!isLoaded || !signIn) {
      showError("Authentication module not ready. Please try again shortly.", "Try Again")
      return
    }

    const code = otp.join("")
    if (code.length < 6) {
      showWarning("Please enter the complete 6-digit verification code.", "Incomplete Code")
      return
    }

    showLoading("Verifying your code...")

    try {
      console.log("=== ATTEMPTING VERIFICATION ===")
      console.log("Code:", code)
      console.log("SignIn status before verification:", signIn.status)

      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
      })

      console.log("=== VERIFICATION RESULT ===")
      console.log("Result status:", result.status)
      console.log("SignIn status after verification:", signIn.status)

      if (result.status === "needs_new_password") {
        console.log("✅ Verification successful - moving to password step")
        hideLoading()

        showSuccess("Code verified successfully! Now set your new password.", "Verification Complete", false)

        // Move to password step
        setTimeout(() => {
          setCurrentStep("password")
        }, 1500)
      } else if (result.status === "complete") {
        console.log("✅ Verification complete - user signed in")
        hideLoading()
        showSuccess("Verification complete! You are now signed in.", "Success", false)
        setTimeout(() => {
          router.replace("/")
        }, 1500)
      } else {
        console.log("❌ Unexpected verification status:", result.status)
        hideLoading()
        showError(`Verification incomplete. Status: ${result.status}. Please try again.`, "Verification Failed")
      }
    } catch (err: any) {
      hideLoading()
      console.error("=== VERIFICATION ERROR ===")
      console.error("Error details:", JSON.stringify(err, null, 2))

      const errorConfig = ErrorHandler.parseClerkError(err)

      if (errorConfig.type === "warning") {
        showWarning(errorConfig.message, errorConfig.title)
      } else {
        showError(errorConfig.message, errorConfig.title)
      }
    }
  }

  const handleResendCode = async () => {
    if (!isLoaded || !signIn) {
      showError("Unable to resend code. Please try again.", "Error")
      return
    }

    showLoading("Sending new verification code...")

    try {
      console.log("=== RESENDING CODE ===")

      // Get the email factor and prepare first factor again
      if (!signIn?.supportedFirstFactors) {
        throw new Error("SignIn or supportedFirstFactors is not available.")
      }

      const emailFactor = signIn.supportedFirstFactors.find((factor) => factor.strategy === "reset_password_email_code")

      if (!emailFactor || !emailFactor.emailAddressId) {
        throw new Error("Email address ID is missing for password reset.")
      }

      await signIn.prepareFirstFactor({
        strategy: "reset_password_email_code",
        emailAddressId: emailFactor.emailAddressId,
      })

      hideLoading()
      const successConfig = ErrorHandler.getSuccessMessage("reset_code_sent")
      showSuccess(successConfig.message, successConfig.title, true)

      // Clear current OTP
      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0].current?.focus()
    } catch (err: any) {
      hideLoading()
      console.error("Resend code error:", JSON.stringify(err, null, 2))

      const errorConfig = ErrorHandler.parseClerkError(err)
      showError(errorConfig.message, errorConfig.title)
    }
  }

  // Password step handlers
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

      const result = await signIn.resetPassword({
        password,
      })

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

      if (errorConfig.type === "warning") {
        showWarning(errorConfig.message, errorConfig.title)
      } else {
        showError(errorConfig.message, errorConfig.title)
      }
    }
  }

  // Navigation handlers
  const handleBackToSignIn = () => {
    router.back()
  }

  const handleBackStep = () => {
    if (currentStep === "verification") {
      setCurrentStep("email")
      setOtp(["", "", "", "", "", ""])
    } else if (currentStep === "password") {
      setCurrentStep("verification")
      setPassword("")
      setConfirmPassword("")
    }
  }

  const handleStartOver = () => {
    setCurrentStep("email")
    setEmailAddress("")
    setOtp(["", "", "", "", "", ""])
    setPassword("")
    setConfirmPassword("")
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
    otpBox: {
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
    passwordHint: {
      color: isDarkMode ? "#9ca3af" : "#6b7280",
    },
    strengthText: {
      color: isDarkMode ? "#d1d5db" : "#4b5563",
    },
    toggleText: {
      color: "#6366f1",
    },
    resendText: {
      color: isDarkMode ? "#9ca3af" : "#6b7280",
    },
    resendLink: {
      color: "#6366f1",
    },
  }

  const getStepConfig = () => {
    switch (currentStep) {
      case "email":
        return {
          icon: "🔑",
          title: "Reset Password",
          subtitle: "Enter your email address and we'll send you a verification code to reset your password",
          color: "#f59e0b",
        }
      case "verification":
        return {
          icon: "📧",
          title: "Verify Your Code",
          subtitle: `Enter the 6-digit code sent to ${emailAddress}`,
          color: "#10b981",
        }
      case "password":
        return {
          icon: "🔐",
          title: "Set New Password",
          subtitle: `Create a strong password for your account (${emailAddress})`,
          color: "#8b5cf6",
        }
    }
  }

  const stepConfig = getStepConfig()
  const passwordStrength = getPasswordStrength()

  return (
    <SafeAreaView style={[styles.safeArea, dynamicStyles.safeArea]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <Header showBackButton onBackPress={currentStep === "email" ? handleBackToSignIn : handleBackStep} />
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={[styles.container, dynamicStyles.container]}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            {/* Header Section */}
            <View style={styles.headerSection}>
              <View style={styles.logoContainer}>
                <View style={[styles.logoCircle, { backgroundColor: stepConfig.color }]}>
                  <Text style={styles.logoText}>{stepConfig.icon}</Text>
                </View>
              </View>

              <Text style={[styles.title, dynamicStyles.title]}>{stepConfig.title}</Text>
              <Text style={[styles.subtitle, dynamicStyles.subtitle]}>{stepConfig.subtitle}</Text>

              {/* Progress Indicator */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: currentStep === "email" ? "33%" : currentStep === "verification" ? "66%" : "100%",
                        backgroundColor: stepConfig.color,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.progressText, dynamicStyles.helpText]}>
                  Step {currentStep === "email" ? "1" : currentStep === "verification" ? "2" : "3"} of 3
                </Text>
              </View>
            </View>

            {/* Form Container */}
            <View style={[styles.formContainer, dynamicStyles.formContainer]}>
              {/* Email Step */}
              {currentStep === "email" && (
                <>
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
                    We'll send a 6-digit verification code to this email address. Make sure you have access to this
                    email.
                  </Text>

                  <Pressable
                    onPress={handleSendResetCode}
                    style={[
                      styles.primaryButton,
                      { backgroundColor: stepConfig.color },
                      !emailAddress.trim() && styles.buttonDisabled,
                    ]}
                    disabled={!emailAddress.trim()}
                  >
                    <Text style={styles.primaryButtonText}>Send Reset Code</Text>
                  </Pressable>
                </>
              )}

              {/* Verification Step */}
              {currentStep === "verification" && (
                <>
                  <View style={styles.otpContainer}>
                    {otp.map((digit, i) => {
                      const inputRef = inputRefs.current[i]
                      return (
                        <TextInput
                          key={i}
                          ref={inputRef}
                          value={digit}
                          onChangeText={(text) => handleOtpChange(text, i)}
                          onKeyPress={(e) => handleOtpKeyPress(e, i)}
                          keyboardType="number-pad"
                          maxLength={1}
                          style={[styles.otpBox, dynamicStyles.otpBox]}
                          autoFocus={i === 0}
                          textAlign="center"
                          returnKeyType="next"
                        />
                      )
                    })}
                  </View>

                  <Pressable
                    onPress={handleVerifyCode}
                    style={[
                      styles.primaryButton,
                      { backgroundColor: stepConfig.color },
                      otp.join("").length < 6 && styles.buttonDisabled,
                    ]}
                    disabled={otp.join("").length < 6}
                  >
                    <Text style={styles.primaryButtonText}>Verify Code</Text>
                  </Pressable>

                  <View style={styles.resendContainer}>
                    <Text style={[styles.resendText, dynamicStyles.resendText]}>Didn't receive the code? </Text>
                    <Pressable onPress={handleResendCode}>
                      <Text style={[styles.resendLink, dynamicStyles.resendLink]}>Resend Code</Text>
                    </Pressable>
                  </View>
                </>
              )}

              {/* Password Step */}
              {currentStep === "password" && (
                <>
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
                        <Text style={[styles.toggleText, dynamicStyles.toggleText]}>
                          {showPassword ? "Hide" : "Show"}
                        </Text>
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
                        <Text
                          style={[styles.strengthText, dynamicStyles.strengthText, { color: passwordStrength.color }]}
                        >
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
                      <Pressable
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={styles.toggleButton}
                      >
                        <Text style={[styles.toggleText, dynamicStyles.toggleText]}>
                          {showConfirmPassword ? "Hide" : "Show"}
                        </Text>
                      </Pressable>
                    </View>

                    {confirmPassword.length > 0 && password !== confirmPassword && (
                      <Text style={styles.errorText}>Passwords do not match</Text>
                    )}
                  </View>

                  <Pressable
                    onPress={handleResetPassword}
                    style={[
                      styles.primaryButton,
                      { backgroundColor: stepConfig.color },
                      (password.length < 8 || password !== confirmPassword || validatePassword()) &&
                        styles.buttonDisabled,
                    ]}
                    disabled={password.length < 8 || password !== confirmPassword || !!validatePassword()}
                  >
                    <Text style={styles.primaryButtonText}>Reset Password</Text>
                  </Pressable>
                </>
              )}

              {/* Secondary Actions */}
              <View style={styles.secondaryActions}>
                {currentStep !== "email" && (
                  <Pressable onPress={handleStartOver} style={[styles.secondaryButton, dynamicStyles.secondaryButton]}>
                    <Text style={[styles.secondaryButtonText, dynamicStyles.secondaryButtonText]}>Start Over</Text>
                  </Pressable>
                )}
              </View>
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
    justifyContent: "center",
    alignItems: "center",
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
    marginBottom: 24,
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
    gap: 8,
  },
  progressBar: {
    width: "60%",
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
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
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
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
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
    gap: 8,
  },
  otpBox: {
    width: 48,
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 24,
    fontWeight: "bold",
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
    textAlign: "center",
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
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
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  secondaryActions: {
    gap: 12,
  },
  secondaryButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontWeight: "600",
    fontSize: 14,
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  resendText: {
    fontSize: 14,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
})
