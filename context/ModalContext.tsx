"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import { CustomModal, type ModalType } from "../components/Modal"

interface ModalState {
  visible: boolean
  type: ModalType
  title?: string
  message: string
  onConfirm?: () => void
  confirmText?: string
  showCancel?: boolean
  autoClose?: boolean
}

interface ModalContextType {
  showModal: (config: Omit<ModalState, "visible">) => void
  hideModal: () => void
  showLoading: (message?: string) => void
  hideLoading: () => void
  showSuccess: (message: string, title?: string, autoClose?: boolean) => void
  showError: (message: string, title?: string) => void
  showWarning: (message: string, title?: string) => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modalState, setModalState] = useState<ModalState>({
    visible: false,
    type: "info",
    message: "",
  })

  const showModal = (config: Omit<ModalState, "visible">) => {
    setModalState({
      ...config,
      visible: true,
    })
  }

  const hideModal = () => {
    setModalState((prev) => ({
      ...prev,
      visible: false,
    }))
  }

  const showLoading = (message = "Please wait...") => {
    showModal({
      type: "loading",
      message,
      title: "Loading",
    })
  }

  const hideLoading = () => {
    hideModal()
  }

  const showSuccess = (message: string, title?: string, autoClose = true) => {
    showModal({
      type: "success",
      message,
      title,
      autoClose,
      confirmText: "Great!",
    })
  }

  const showError = (message: string, title?: string) => {
    showModal({
      type: "error",
      message,
      title,
      confirmText: "Try Again",
    })
  }

  const showWarning = (message: string, title?: string) => {
    showModal({
      type: "warning",
      message,
      title,
      confirmText: "Understood",
    })
  }

  return (
    <ModalContext.Provider
      value={{
        showModal,
        hideModal,
        showLoading,
        hideLoading,
        showSuccess,
        showError,
        showWarning,
      }}
    >
      {children}
      <CustomModal
        visible={modalState.visible}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        onClose={hideModal}
        onConfirm={modalState.onConfirm}
        confirmText={modalState.confirmText}
        showCancel={modalState.showCancel}
        autoClose={modalState.autoClose}
      />
    </ModalContext.Provider>
  )
}

export const useModal = () => {
  const context = useContext(ModalContext)
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider")
  }
  return context
}
