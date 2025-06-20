"use client"

import { AuthHeader } from "@/components/AuthHeader"
import { useTheme } from "@/context/ThemeContext"
import { router } from "expo-router"
import { Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native"

export default function Landing() {
  const { isDarkMode } = useTheme()

  const handleSignInPress = () => {
    router.push("/(auth)/sign-in")
  }

  const handleSignUpPress = () => {
    router.push("/(auth)/sign-up")
  }

  // Dynamic styles based on theme
  const dynamicStyles = {
    safeArea: {
      backgroundColor: isDarkMode ? "#0a0a0f" : "#f8fafc",
    },
    container: {
      backgroundColor: isDarkMode ? "#0a0a0f" : "#f8fafc",
    },
    appTitle: {
      color: isDarkMode ? "#ffffff" : "#1f2937",
    },
    tagline: {
      color: isDarkMode ? "#9ca3af" : "#6b7280",
    },
    secondaryButton: {
      backgroundColor: isDarkMode ? "#1f1f2e" : "#ffffff",
      borderColor: isDarkMode ? "transparent" : "#d1d5db",
    },
    secondaryButtonText: {
      color: isDarkMode ? "#ffffff" : "#1f2937",
    },
    featuresTitle: {
      color: isDarkMode ? "#ffffff" : "#1f2937",
    },
    featureText: {
      color: isDarkMode ? "#9ca3af" : "#6b7280",
    },
  }

  return (
    <SafeAreaView style={[styles.safeArea, dynamicStyles.safeArea]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <AuthHeader />
      <View style={[styles.container, dynamicStyles.container]}>
        <ScrollView style={styles.authContainer}>
          <View style={styles.authContent}>
            <View style={styles.heroSection}>
              <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                  <Text style={styles.logoText}>T</Text>
                </View>
              </View>

              <Text style={[styles.appTitle, dynamicStyles.appTitle]}>TaskMgmt</Text>
              <Text style={[styles.tagline, dynamicStyles.tagline]}>
                Organize your tasks, amplify your productivity
              </Text>
            </View>

            <View style={styles.authButtonGroup}>
              <Pressable style={[styles.authButton, styles.primaryButton]} onPress={handleSignInPress}>
                <Text style={styles.primaryButtonText}>Sign In</Text>
              </Pressable>

              <Pressable
                style={[styles.authButton, styles.secondaryButton, dynamicStyles.secondaryButton]}
                onPress={handleSignUpPress}
              >
                <Text style={[styles.secondaryButtonText, dynamicStyles.secondaryButtonText]}>Create Account</Text>
              </Pressable>
            </View>

            <View style={styles.featuresList}>
              <Text style={[styles.featuresTitle, dynamicStyles.featuresTitle]}>Why choose TaskMgmt?</Text>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✨</Text>
                <Text style={[styles.featureText, dynamicStyles.featureText]}>Simple and intuitive interface</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🚀</Text>
                <Text style={[styles.featureText, dynamicStyles.featureText]}>Boost your productivity</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🔒</Text>
                <Text style={[styles.featureText, dynamicStyles.featureText]}>Secure and private</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
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
  authContainer: {
    flex: 1,
  },
  authContent: {
    padding: 24,
    paddingTop: 20,
    paddingBottom: 100,
  },
  heroSection: {
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
  appTitle: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  tagline: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  authButtonGroup: {
    width: "100%",
    alignItems: "center",
    marginBottom: 40,
  },
  authButton: {
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#6366f1",
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
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  featuresList: {
    marginTop: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 32,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
})
