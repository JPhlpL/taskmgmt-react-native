"use client"

import type { Task } from "@/types/task"
import type React from "react"
import { createContext, useCallback, useContext, useState } from "react"

interface TaskCacheContextType {
  getCachedTasks: (email: string) => Task[] | null
  setCachedTasks: (email: string, tasks: Task[]) => void
  invalidateCache: (email: string) => void
  isCacheValid: (email: string, maxAge?: number) => boolean
}

interface CacheEntry {
  tasks: Task[]
  timestamp: number
}

const TaskCacheContext = createContext<TaskCacheContextType | undefined>(undefined)

export const TaskCacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cache, setCache] = useState<Map<string, CacheEntry>>(new Map())

  const getCachedTasks = useCallback(
    (email: string): Task[] | null => {
      const entry = cache.get(email)
      return entry ? entry.tasks : null
    },
    [cache],
  )

  const setCachedTasks = useCallback((email: string, tasks: Task[]) => {
    setCache((prev) =>
      new Map(prev).set(email, {
        tasks,
        timestamp: Date.now(),
      }),
    )
  }, [])

  const invalidateCache = useCallback((email: string) => {
    setCache((prev) => {
      const newCache = new Map(prev)
      newCache.delete(email)
      return newCache
    })
  }, [])

  const isCacheValid = useCallback(
    (email: string, maxAge = 5 * 60 * 1000): boolean => {
      const entry = cache.get(email)
      if (!entry) return false

      return Date.now() - entry.timestamp < maxAge
    },
    [cache],
  )

  return (
    <TaskCacheContext.Provider
      value={{
        getCachedTasks,
        setCachedTasks,
        invalidateCache,
        isCacheValid,
      }}
    >
      {children}
    </TaskCacheContext.Provider>
  )
}

export const useTaskCache = () => {
  const context = useContext(TaskCacheContext)
  if (context === undefined) {
    throw new Error("useTaskCache must be used within a TaskCacheProvider")
  }
  return context
}
