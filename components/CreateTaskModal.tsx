"use client"

import { useTheme } from "@/context/ThemeContext"
import React, { useState } from "react"
import { Animated, Dimensions, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native"

interface CreateTaskModalProps {
  visible: boolean
  onClose: () => void
  onCreate: (details: string) => void
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ visible, onClose, onCreate }) => {
  const { isDarkMode } = useTheme()
  const [details, setDetails] = useState("")
  const fadeAnim = React.useRef(new Animated.Value(0)).current
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [visible])

  const handleCreate = () => {
    if (details.trim()) {
      onCreate(details.trim())
      setDetails("")
      onClose()
    }
  }

  const handleClose = () => {
    setDetails("")
    onClose()
  }

  const dynamicStyles = {
    overlay: {
      backgroundColor: isDarkMode ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.5)",
    },
    container: {
      backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
    },
    title: {
      color: isDarkMode ? "#ffffff" : "#1f2937",
    },
    input: {
      backgroundColor: isDarkMode ? "#374151" : "#f9fafb",
      color: isDarkMode ? "#ffffff" : "#1f2937",
      borderColor: isDarkMode ? "#4b5563" : "#d1d5db",
    },
    cancelButton: {
      backgroundColor: isDarkMode ? "#374151" : "#f3f4f6",
    },
    cancelButtonText: {
      color: isDarkMode ? "#d1d5db" : "#4b5563",
    },
  }

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[styles.overlay, dynamicStyles.overlay, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.container, dynamicStyles.container, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.header}>
            <Text style={[styles.title, dynamicStyles.title]}>Create New Task</Text>
          </View>

          <View style={styles.content}>
            <TextInput
              value={details}
              onChangeText={setDetails}
              style={[styles.input, dynamicStyles.input]}
              placeholder="Enter task details..."
              placeholderTextColor={isDarkMode ? "#6b7280" : "#9ca3af"}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              autoFocus
            />
          </View>

          <View style={styles.buttonContainer}>
            <Pressable style={[styles.button, styles.cancelButton, dynamicStyles.cancelButton]} onPress={handleClose}>
              <Text style={[styles.buttonText, dynamicStyles.cancelButtonText]}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.createButton, !details.trim() && styles.buttonDisabled]}
              onPress={handleCreate}
              disabled={!details.trim()}
            >
              <Text style={styles.createButtonText}>Create Task</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  )
}

const { width } = Dimensions.get("window")

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  container: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  content: {
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  createButton: {
    backgroundColor: "#6366f1",
  },
  buttonDisabled: {
    backgroundColor: "#9ca3af",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
})
