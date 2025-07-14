"use client"

import { useModal } from "@/context/ModalContext"
import type { CreateTaskRequest, Task, UpdateTaskRequest } from "@/types/task"
import { useAuth, useUser } from "@clerk/clerk-expo"
import { useCallback, useEffect, useRef, useState } from "react"

export const useTasks = () => {
  const { user } = useUser()
  const { getToken, isLoaded } = useAuth()
  const { showError, showSuccess, showLoading, hideLoading } = useModal()

  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [lastFetch, setLastFetch] = useState<number>(0)
  const [hasInitialLoad, setHasInitialLoad] = useState(false)

  // Cache duration: 5 minutes
  const CACHE_DURATION = 5 * 60 * 1000

  // Debounce timer ref
  const fetchTimeoutRef = useRef<any>(null)

  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true)

  const userEmail = user?.emailAddresses[0]?.emailAddress || ""

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current)
      }
    }
  }, [])

  // Grab the RS256-signed Session JWT you just configured:
  const getValidToken = async (): Promise<string> => {
    if (!isLoaded) {
      throw new Error('Authentication not ready yet')
    }
    // no template name = default Session token
    const token = await getToken({ template: 'taskmgmt-clerk-api-auth-token' })
    console.log('[Auth] fetched JWT:', token);
    if (!token) throw new Error('Failed to get auth token')
    return token
  }

  const fetchTasks = useCallback(
    async (showLoadingModal = false, forceRefresh = false) => {
      if (!userEmail) return

      // Check cache validity (skip if data is fresh and not forcing refresh)
      const now = Date.now()
      if (!forceRefresh && hasInitialLoad && now - lastFetch < CACHE_DURATION) {
        console.log("Using cached tasks, skipping API call")
        return
      }

      // Clear any pending fetch requests
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current)
        fetchTimeoutRef.current = null
      }

      try {
        if (showLoadingModal) {
          showLoading("Loading tasks...")
        } else if (!hasInitialLoad) {
          setLoading(true)
        }

        const token = await getValidToken()

        const response = await fetch(
          `${process.env.EXPO_PUBLIC_DEV_API_URL || process.env.EXPO_PUBLIC_PROD_API_URL}/?email=${encodeURIComponent(userEmail)}`,
          {
            headers: {
               "Authorization": `Bearer ${token}`
            },
          },
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setTasks(data)
          setLastFetch(now)
          setHasInitialLoad(true)
        }
      } catch (error) {
        console.error("Error fetching tasks:", error)
        if (isMountedRef.current) {
          showError("Failed to load tasks. Please try again.", "Error")
        }
      } finally {
        if (isMountedRef.current) {
          if (showLoadingModal) {
            hideLoading()
          } else {
            setLoading(false)
          }
          setRefreshing(false)
        }
      }
    },
    [userEmail, showError, showLoading, hideLoading, hasInitialLoad, lastFetch], // Removed getToken from deps
  )

  // Debounced fetch function
  const debouncedFetch = useCallback(
    (showLoadingModal = false, forceRefresh = false, delay = 1000) => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current)
      }

      fetchTimeoutRef.current = setTimeout(() => {
        fetchTasks(showLoadingModal, forceRefresh)
      }, delay)
    },
    [fetchTasks],
  )

  const createTask = useCallback(
    async (details: string) => {
      if (!userEmail) return

      try {
        showLoading("Creating task...")

        const token = await getValidToken()

        const taskData: CreateTaskRequest = {
          email: userEmail,
          details,
        }

        const response = await fetch(
          `${process.env.EXPO_PUBLIC_DEV_API_URL || process.env.EXPO_PUBLIC_PROD_API_URL}/`,
          {
            method: "POST",
            headers: {
               "Authorization": `Bearer ${token}`,
               "Content-Type": "application/json",  // only on POST/PUT
            },
            body: JSON.stringify(taskData),
          },
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const newTask = await response.json()

        // Optimistic update - add task immediately to UI
        if (isMountedRef.current) {
          setTasks((prev) => [newTask, ...prev])
          setLastFetch(Date.now()) // Update cache timestamp
          showSuccess("Task created successfully!", "Success")
        }
      } catch (error) {
        console.error("Error creating task:", error)
        if (isMountedRef.current) {
          showError("Failed to create task. Please try again.", "Error")
          // Optionally refresh tasks to sync with server
          debouncedFetch(false, true, 500)
        }
      } finally {
        if (isMountedRef.current) {
          hideLoading()
        }
      }
    },
    [userEmail, showError, showSuccess, showLoading, hideLoading, debouncedFetch],
  )

  const updateTask = useCallback(
    async (id: string, details: string) => {
      if (!userEmail) return

      // Store original task for rollback
      const originalTask = tasks.find((task) => task.id === id)
      if (!originalTask) return

      try {
        // Optimistic update - update UI immediately
        const optimisticTask = {
          ...originalTask,
          details,
          updated_at: new Date().toISOString(),
        }

        setTasks((prev) => prev.map((task) => (task.id === id ? optimisticTask : task)))
        showLoading("Updating task...")

        const token = await getValidToken()

        const taskData: UpdateTaskRequest = {
          email: userEmail,
          details,
        }

        const response = await fetch(
          `${process.env.EXPO_PUBLIC_DEV_API_URL || process.env.EXPO_PUBLIC_PROD_API_URL}/${id}`,
          {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",  // only on POST/PUT
            },
            body: JSON.stringify(taskData),
          },
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const updatedTask = await response.json()

        if (isMountedRef.current) {
          setTasks((prev) => prev.map((task) => (task.id === id ? updatedTask : task)))
          setLastFetch(Date.now()) // Update cache timestamp
          showSuccess("Task updated successfully!", "Success")
        }
      } catch (error) {
        console.error("Error updating task:", error)
        if (isMountedRef.current) {
          // Rollback optimistic update
          setTasks((prev) => prev.map((task) => (task.id === id ? originalTask : task)))
          showError("Failed to update task. Please try again.", "Error")
        }
      } finally {
        if (isMountedRef.current) {
          hideLoading()
        }
      }
    },
    [userEmail, showError, showSuccess, showLoading, hideLoading, tasks],
  )

  const deleteTask = useCallback(
    async (id: string) => {
      // Store original task for rollback
      const originalTask = tasks.find((task) => task.id === id)
      if (!originalTask) return

      try {
        // Optimistic update - remove from UI immediately
        setTasks((prev) => prev.filter((task) => task.id !== id))
        showLoading("Deleting task...")

        const token = await getValidToken()

        const response = await fetch(
          `${process.env.EXPO_PUBLIC_DEV_API_URL || process.env.EXPO_PUBLIC_PROD_API_URL}/${id}`,
          {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",  // only on POST/PUT
            },
          },
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        if (isMountedRef.current) {
          setLastFetch(Date.now()) // Update cache timestamp
          showSuccess("Task deleted successfully!", "Success")
        }
      } catch (error) {
        console.error("Error deleting task:", error)
        if (isMountedRef.current) {
          // Rollback optimistic update
          setTasks((prev) =>
            [...prev, originalTask].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
          )
          showError("Failed to delete task. Please try again.", "Error")
        }
      } finally {
        if (isMountedRef.current) {
          hideLoading()
        }
      }
    },
    [showError, showSuccess, showLoading, hideLoading, tasks],
  )

  const refreshTasks = useCallback(() => {
    setRefreshing(true)
    fetchTasks(false, true) // Force refresh, bypass cache
  }, [fetchTasks])

  // Initial fetch - only run once when userEmail is available
  useEffect(() => {
    if (userEmail && !hasInitialLoad && isMountedRef.current) {
      console.log("Initial fetch for user:", userEmail)
      fetchTasks(false, false)
    }
  }, [userEmail, hasInitialLoad]) // Removed fetchTasks from deps to prevent infinite loop

  return {
    tasks,
    loading,
    refreshing,
    createTask,
    updateTask,
    deleteTask,
    refreshTasks,
    fetchTasks: useCallback(() => fetchTasks(true, true), [fetchTasks]), // Manual fetch with loading modal
    hasInitialLoad, // Export this so UI can check if initial load is complete
  }
}
