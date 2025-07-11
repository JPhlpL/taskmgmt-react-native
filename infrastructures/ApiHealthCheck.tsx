"use client"

import { useModal } from "@/context/ModalContext"
import API from "@/hooks/api"
import { useEffect } from "react"

export default function ApiHealthCheck() {
  const { showError } = useModal()

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await API.get("/health-check")
      } catch (_e) {
        showError("The app is experiencing some technical difficulty.", "Technical Issue")
      }
    }

    void checkHealth()
  }, [])

  return null
}
