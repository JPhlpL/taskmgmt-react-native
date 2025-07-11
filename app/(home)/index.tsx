"use client"

import { CreateTaskModal } from "@/components/CreateTaskModal"
import { Header } from "@/components/Header"
import { TaskItem } from "@/components/TaskItem"
import { useTheme } from "@/context/ThemeContext"
import { useTasks } from "@/hooks/useTasks"
import ApiHealthCheck from "@/infrastructures/ApiHealthCheck"
import { useUser } from "@clerk/clerk-expo"
import { useState } from "react"
import { Pressable, RefreshControl, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native"

export default function Dashboard() {
  const { user } = useUser()
  const { isDarkMode } = useTheme()
  const { tasks, loading, refreshing, createTask, updateTask, deleteTask, refreshTasks, hasInitialLoad } = useTasks()
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleCreateTask = (details: string) => {
    createTask(details)
  }

  const handleUpdateTask = (id: string, details: string) => {
    updateTask(id, details)
  }

  const handleDeleteTask = (id: string) => {
    deleteTask(id)
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
    sectionTitle: {
      color: isDarkMode ? "#ffffff" : "#1f2937",
    },
    emptyText: {
      color: isDarkMode ? "#9ca3af" : "#6b7280",
    },
    emptyContainer: {
      backgroundColor: isDarkMode ? "#12121a" : "#ffffff",
      borderColor: isDarkMode ? "#374151" : "#e5e7eb",
    },
  }

  // Determine what to show in the tasks section
  const renderTasksContent = () => {
    if (loading && !hasInitialLoad) {
      // Show loading only on initial load
      return (
        <View style={[styles.emptyContainer, dynamicStyles.emptyContainer]}>
          <Text style={[styles.emptyText, dynamicStyles.emptyText]}>Loading tasks...</Text>
        </View>
      )
    }

    if (hasInitialLoad && tasks.length === 0) {
      // Show empty state only after initial load is complete
      return (
        <View style={[styles.emptyContainer, dynamicStyles.emptyContainer]}>
          <Text style={[styles.emptyText, dynamicStyles.emptyText]}>
            No tasks yet. Create your first task to get started!
          </Text>
        </View>
      )
    }

    if (tasks.length > 0) {
      // Show tasks
      return (
        <View style={styles.tasksList}>
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} onUpdate={handleUpdateTask} onDelete={handleDeleteTask} />
          ))}
        </View>
      )
    }

    // Fallback - shouldn't reach here
    return null
  }

  return (
    <SafeAreaView style={[styles.safeArea, dynamicStyles.safeArea]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <ApiHealthCheck />
      <Header />
      <View style={[styles.container, dynamicStyles.container]}>
        <ScrollView
          style={styles.dashboardContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshTasks}
              tintColor={isDarkMode ? "#ffffff" : "#000000"}
            />
          }
        >
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
                    <Text style={[styles.statsTitle, dynamicStyles.statsTitle]}>Task Summary</Text>
                    <Text style={[styles.statsSubtitle, dynamicStyles.statsSubtitle]}>
                      {hasInitialLoad ? `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"} total` : "Loading..."}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.createTaskSection}>
                <Pressable style={styles.createTaskButton} onPress={() => setShowCreateModal(true)}>
                  <Text style={styles.createTaskButtonText}>+ Create New Task</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.tasksSection}>
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Your Tasks</Text>
              {renderTasksContent()}
            </View>
          </View>
        </ScrollView>
      </View>

      <CreateTaskModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateTask}
      />
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
  createTaskSection: {
    marginBottom: 16,
  },
  createTaskButton: {
    backgroundColor: "#6366f1",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#6366f1",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createTaskButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  tasksSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  tasksList: {
    flex: 1,
  },
  emptyContainer: {
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
})
