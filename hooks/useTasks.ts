"use client"

import { useModal } from "@/context/ModalContext"
import type { CreateTaskRequest, Task, UpdateTaskRequest } from "@/types/task"
import { useAuth, useUser } from "@clerk/clerk-expo"
import Constants from "expo-constants"
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

  // const baseUrl =
  //   process.env.EXPO_PUBLIC_PROD_API_URL ?? // on this one, if you put the prod api url, it will fetches first
  //   process.env.EXPO_PUBLIC_DEV_API_URL

  // pull your prod URL from your EAS env into expoConfig.extra
  const { EXPO_PUBLIC_PROD_API_URL } = (Constants.expoConfig!.extra as {
    EXPO_PUBLIC_PROD_API_URL: string
  })
  const baseUrl = EXPO_PUBLIC_PROD_API_URL

  // Helper: performs a fetch, adds auth header, checks status, returns JSON
  const apiFetch = useCallback(
    async <T>(path: string, opts: RequestInit = {}): Promise<T> => {
      // Grab the RS256-signed Session JWT you just configured:
      if (!isLoaded) throw new Error("Authentication not ready yet")
      const token = await getToken({ template: "taskmgmt-clerk-api-auth-token" })
      console.log("[Auth] fetched JWT:", token)
      if (!token) throw new Error("Failed to get auth token")

      // Merge headers
      const headers = {
        Authorization: `Bearer ${token}`,
        ...(opts.headers || {}),
      }

      const res = await fetch(`${baseUrl}${path}`, {
        ...opts,
        headers,
      })
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      return res.json()
    },
    [baseUrl, getToken, isLoaded]
  )

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

        // GET /?email=…
        const data = await apiFetch<Task[]>(
          `/?email=${encodeURIComponent(userEmail)}`
        )

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
          showLoadingModal ? hideLoading() : setLoading(false)
          setRefreshing(false)
        }
      }
    },
    [
      apiFetch,
      userEmail,
      showError,
      showLoading,
      hideLoading,
      hasInitialLoad,
      lastFetch,
    ]
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
    [fetchTasks]
  )

  const createTask = useCallback(
    async (details: string) => {
      if (!userEmail) return

      try {
        showLoading("Creating task...")
        const newTask = await apiFetch<CreateTaskRequest & Task>(
          `/`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" }, // only on POST/PUT
            body: JSON.stringify({ email: userEmail, details }),
          }
        )

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
    [apiFetch, userEmail, showError, showSuccess, showLoading, hideLoading, debouncedFetch]
  )

  const updateTask = useCallback(
    async (id: string, details: string) => {
      if (!userEmail) return

      const original = tasks.find((t) => t.id === id)
      if (!original) return

      try {
        // Optimistic update
        const optimistic = { ...original, details, updated_at: new Date().toISOString() }
        setTasks((prev) => prev.map((t) => (t.id === id ? optimistic : t)))
        showLoading("Updating task...")

        const updated = await apiFetch<UpdateTaskRequest & Task>(
          `/${id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userEmail, details }),
          }
        )

        if (isMountedRef.current) {
          setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
          setLastFetch(Date.now())
          showSuccess("Task updated successfully!", "Success")
        }
      } catch (error) {
        console.error("Error updating task:", error)
        if (isMountedRef.current) {
          // Rollback
          setTasks((prev) => prev.map((t) => (t.id === id ? original : t)))
          showError("Failed to update task. Please try again.", "Error")
        }
      } finally {
        if (isMountedRef.current) hideLoading()
      }
    },
    [apiFetch, userEmail, showError, showSuccess, showLoading, hideLoading, tasks]
  )

  const deleteTask = useCallback(
    async (id: string) => {
      const original = tasks.find((t) => t.id === id)
      if (!original) return

      try {
        // Optimistic remove
        setTasks((prev) => prev.filter((t) => t.id !== id))
        showLoading("Deleting task...")

        await apiFetch(`/` + id, { method: "DELETE" })

        if (isMountedRef.current) {
          setLastFetch(Date.now())
          showSuccess("Task deleted successfully!", "Success")
        }
      } catch (error) {
        console.error("Error deleting task:", error)
        if (isMountedRef.current) {
          // Rollback
          setTasks((prev) =>
            [...prev, original].sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )
          )
          showError("Failed to delete task. Please try again.", "Error")
        }
      } finally {
        if (isMountedRef.current) hideLoading()
      }
    },
    [apiFetch, showError, showSuccess, showLoading, hideLoading, tasks]
  )

  const refreshTasks = useCallback(() => {
    setRefreshing(true)
    fetchTasks(false, true) // Force refresh, bypass cache
  }, [fetchTasks])

  // Initial fetch
  useEffect(() => {
    if (userEmail && !hasInitialLoad && isMountedRef.current) {
      console.log("Initial fetch for user:", userEmail)
      fetchTasks(false, false)
    }
  }, [userEmail, hasInitialLoad])

  return {
    tasks,
    loading,
    refreshing,
    createTask,
    updateTask,
    deleteTask,
    refreshTasks,
    fetchTasks: useCallback(() => fetchTasks(true, true), [fetchTasks]),
    hasInitialLoad,
  }
}
