"use client"

import { Header } from "@/components/Header"
import { useTheme } from "@/context/ThemeContext"
import ApiHealthCheck from "@/infrastructures/ApiHealthCheck"
import { useUser } from "@clerk/clerk-expo"
import { Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native"

export default function Dashboard() {
  const { user } = useUser()
  const { isDarkMode } = useTheme()

  const handleCreateTaskPress = () => {
    // Handle create task action
    console.log("Create task pressed")
  }

  // Dynamic styles based on theme
  const dynamicStyles = {
    safeArea: {
      backgroundColor: isDarkMode ? "#0a0a0f" : "#f8fafc",
    },
    container: {
      backgroundColor: isDarkMode ? "#0a0a0f" : "#f8fafc",
    },
    welcomeSection: {
      backgroundColor: isDarkMode ? "#12121a" : "#ffffff",
    },
    dashboardHeading: {
      color: isDarkMode ? "#ffffff" : "#1f2937",
    },
    welcomeText: {
      color: isDarkMode ? "#9ca3af" : "#6b7280",
    },
    statsCard: {
      backgroundColor: isDarkMode ? "#12121a" : "#ffffff",
    },
    statsIcon: {
      backgroundColor: isDarkMode ? "#1f1f2e" : "#f3f4f6",
    },
    statsTitle: {
      color: isDarkMode ? "#ffffff" : "#1f2937",
    },
    statsSubtitle: {
      color: isDarkMode ? "#9ca3af" : "#6b7280",
    },
    actionCard: {
      backgroundColor: isDarkMode ? "#1a1a2e" : "#f8fafc",
      borderColor: isDarkMode ? "#2d2d4a" : "#e5e7eb",
    },
    actionTitle: {
      color: isDarkMode ? "#ffffff" : "#1f2937",
    },
    actionSubtitle: {
      color: isDarkMode ? "#9ca3af" : "#6b7280",
    },
  }

  return (
    <SafeAreaView style={[styles.safeArea, dynamicStyles.safeArea]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <ApiHealthCheck />
      <Header />
      <View style={[styles.container, dynamicStyles.container]}>
        <ScrollView style={styles.dashboardContainer}>
          <View style={styles.dashboardContent}>
            <View style={styles.header}>
              <View style={[styles.welcomeSection, dynamicStyles.welcomeSection]}>
                <Text style={[styles.dashboardHeading, dynamicStyles.dashboardHeading]}>Dashboard</Text>
                <Text style={[styles.welcomeText, dynamicStyles.welcomeText]}>Welcome back,</Text>
                <Text style={styles.userEmail}>{user?.emailAddresses[0].emailAddress}</Text>
              </View>
            </View>

            <View style={styles.statsContainer}>
              <View style={[styles.statsCard, dynamicStyles.statsCard]}>
                <View style={styles.statsHeader}>
                  <View style={[styles.statsIcon, dynamicStyles.statsIcon]}>
                    <Text style={styles.statsIconText}>📊</Text>
                  </View>
                  <View style={styles.statsContent}>
                    <Text style={[styles.statsTitle, dynamicStyles.statsTitle]}>Quick Stats</Text>
                    <Text style={[styles.statsSubtitle, dynamicStyles.statsSubtitle]}>Your productivity overview</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.actionCard, dynamicStyles.actionCard]}>
                <Text style={[styles.actionTitle, dynamicStyles.actionTitle]}>Ready to be productive?</Text>
                <Text style={[styles.actionSubtitle, dynamicStyles.actionSubtitle]}>
                  Start managing your tasks efficiently
                </Text>
                <Pressable style={styles.actionButton} onPress={handleCreateTaskPress}>
                  <Text style={styles.actionButtonText}>Create Task</Text>
                </Pressable>
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
  dashboardContainer: {
    flex: 1,
  },
  dashboardContent: {
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 32,
  },
  welcomeSection: {
    alignItems: "center",
    padding: 32,
    borderRadius: 20,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dashboardHeading: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 18,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#6366f1",
    fontWeight: "bold",
  },
  statsContainer: {
    marginBottom: 32,
  },
  statsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  statsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  statsIconText: {
    fontSize: 20,
  },
  statsContent: {
    flex: 1,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },
  statsSubtitle: {
    fontSize: 14,
  },
  actionCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  actionSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },
  actionButton: {
    backgroundColor: "#6366f1",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
})
