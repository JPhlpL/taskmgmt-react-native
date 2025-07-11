"use client"

import { useTheme } from "@/context/ThemeContext"
import type { Task } from "@/types/task"
import type React from "react"
import { useState } from "react"
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native"

interface TaskItemProps {
  task: Task
  onUpdate: (id: string, details: string) => void
  onDelete: (id: string) => void
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onUpdate, onDelete }) => {
  const { isDarkMode } = useTheme()
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(task.details)

  const handleSave = () => {
    if (editText.trim() && editText !== task.details) {
      onUpdate(task.id, editText.trim())
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditText(task.details)
    setIsEditing(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const dynamicStyles = {
    container: {
      backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
      borderColor: isDarkMode ? "#374151" : "#e5e7eb",
    },
    details: {
      color: isDarkMode ? "#ffffff" : "#1f2937",
    },
    input: {
      backgroundColor: isDarkMode ? "#374151" : "#f9fafb",
      color: isDarkMode ? "#ffffff" : "#1f2937",
      borderColor: isDarkMode ? "#4b5563" : "#d1d5db",
    },
    timestamp: {
      color: isDarkMode ? "#9ca3af" : "#6b7280",
    },
    editButton: {
      backgroundColor: isDarkMode ? "#3b82f6" : "#6366f1",
    },
    saveButton: {
      backgroundColor: "#10b981",
    },
    cancelButton: {
      backgroundColor: isDarkMode ? "#6b7280" : "#9ca3af",
    },
    deleteButton: {
      backgroundColor: "#ef4444",
    },
  }

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {isEditing ? (
        <View style={styles.editContainer}>
          <TextInput
            value={editText}
            onChangeText={setEditText}
            style={[styles.input, dynamicStyles.input]}
            multiline
            autoFocus
            placeholder="Enter task details..."
            placeholderTextColor={isDarkMode ? "#6b7280" : "#9ca3af"}
          />
          <View style={styles.editActions}>
            <Pressable style={[styles.actionButton, dynamicStyles.saveButton]} onPress={handleSave}>
              <Text style={styles.actionButtonText}>Save</Text>
            </Pressable>
            <Pressable style={[styles.actionButton, dynamicStyles.cancelButton]} onPress={handleCancel}>
              <Text style={styles.actionButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.content}>
            <Text style={[styles.details, dynamicStyles.details]}>{task.details}</Text>
            <Text style={[styles.timestamp, dynamicStyles.timestamp]}>Created: {formatDate(task.created_at)}</Text>
            {task.updated_at !== task.created_at && (
              <Text style={[styles.timestamp, dynamicStyles.timestamp]}>Updated: {formatDate(task.updated_at)}</Text>
            )}
          </View>
          <View style={styles.actions}>
            <Pressable style={[styles.actionButton, dynamicStyles.editButton]} onPress={() => setIsEditing(true)}>
              <Text style={styles.actionButtonText}>Edit</Text>
            </Pressable>
            <Pressable style={[styles.actionButton, dynamicStyles.deleteButton]} onPress={() => onDelete(task.id)}>
              <Text style={styles.actionButtonText}>Delete</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    marginBottom: 12,
  },
  details: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    marginBottom: 2,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  editContainer: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: "top",
  },
  editActions: {
    flexDirection: "row",
    gap: 8,
  },
})
