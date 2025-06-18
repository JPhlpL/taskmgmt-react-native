import type { ModalType } from "../components/Modal"

export interface ClerkError {
  code: string
  message: string
  longMessage?: string
  meta?: {
    paramName?: string
  }
}

export interface ErrorResponse {
  status?: number
  clerkError?: boolean
  errors?: ClerkError[]
  message?: string
}

export class ErrorHandler {
  static parseClerkError(error: any): { title: string; message: string; type: ModalType } {
    console.log("Parsing Clerk Error:", JSON.stringify(error, null, 2))

    // Handle Clerk-specific errors
    if (error?.errors && Array.isArray(error.errors)) {
      const firstError = error.errors[0]

      switch (firstError.code) {
        case "client_state_invalid":
          return {
            title: "Session Expired",
            message: "Your reset session has expired. Please start the password reset process again.",
            type: "warning",
          }

        case "verification_not_sent":
          return {
            title: "Verification Issue",
            message: "There was an issue with the verification process. Please request a new code and try again.",
            type: "warning",
          }

        case "verification_failed":
          return {
            title: "Invalid Code",
            message: "The verification code is incorrect or has expired. Please check the code or request a new one.",
            type: "error",
          }

        case "verification_expired":
          return {
            title: "Code Expired",
            message: "The verification code has expired. Please request a new one.",
            type: "warning",
          }

        case "form_password_pwned":
          return {
            title: "Password Security Issue",
            message: "This password has been found in a data breach. Please choose a different, more secure password.",
            type: "warning",
          }

        case "form_password_length_too_short":
          return {
            title: "Password Too Short",
            message: "Password must be at least 8 characters long.",
            type: "error",
          }

        case "form_password_validation_failed":
          return {
            title: "Password Requirements",
            message: "Password must contain at least one uppercase letter, one lowercase letter, and one number.",
            type: "error",
          }

        case "form_identifier_exists":
          return {
            title: "Account Already Exists",
            message: "An account with this email address already exists. Please sign in instead.",
            type: "warning",
          }

        case "form_identifier_not_found":
          return {
            title: "Account Not Found",
            message: "No account found with this email address. Please check your email or create a new account.",
            type: "error",
          }

        case "form_password_incorrect":
          return {
            title: "Incorrect Password",
            message: "The password you entered is incorrect. Please try again.",
            type: "error",
          }

        case "session_exists":
          return {
            title: "Already Signed In",
            message: "You are already signed in. Redirecting to dashboard...",
            type: "info",
          }

        case "too_many_requests":
          return {
            title: "Too Many Attempts",
            message: "Too many attempts. Please wait a few minutes before trying again.",
            type: "warning",
          }

        case "captcha_invalid":
          return {
            title: "Security Check Failed",
            message: "Please complete the security verification and try again.",
            type: "warning",
          }

        case "form_identifier_invalid":
          return {
            title: "Invalid Email",
            message: "Please enter a valid email address.",
            type: "error",
          }

        case "account_locked":
          return {
            title: "Account Locked",
            message:
              "Your account has been temporarily locked due to multiple failed attempts. Please try again later or reset your password.",
            type: "warning",
          }

        case "email_not_verified":
          return {
            title: "Email Not Verified",
            message: "Please verify your email address before signing in. Check your inbox for the verification email.",
            type: "warning",
          }

        default:
          return {
            title: "Authentication Error",
            message: firstError.longMessage || firstError.message || "An authentication error occurred.",
            type: "error",
          }
      }
    }

    // Handle network errors
    if (error?.status === 422) {
      return {
        title: "Validation Error",
        message: "Please check your input and try again.",
        type: "error",
      }
    }

    if (error?.status === 429) {
      return {
        title: "Too Many Attempts",
        message: "Too many attempts. Please wait a moment before trying again.",
        type: "warning",
      }
    }

    if (error?.status >= 500) {
      return {
        title: "Server Error",
        message: "Our servers are experiencing issues. Please try again later.",
        type: "error",
      }
    }

    // Generic error fallback
    return {
      title: "Something Went Wrong",
      message: error?.message || "An unexpected error occurred. Please try again.",
      type: "error",
    }
  }

  static parseNetworkError(error: any): { title: string; message: string; type: ModalType } {
    if (!navigator.onLine) {
      return {
        title: "No Internet Connection",
        message: "Please check your internet connection and try again.",
        type: "warning",
      }
    }

    if (error?.code === "NETWORK_ERROR") {
      return {
        title: "Network Error",
        message: "Unable to connect to our servers. Please check your connection.",
        type: "error",
      }
    }

    return {
      title: "Connection Error",
      message: "Failed to connect. Please try again.",
      type: "error",
    }
  }

  static getSuccessMessage(action: string): { title: string; message: string; type: ModalType } {
    switch (action) {
      case "signup":
        return {
          title: "Account Created!",
          message: "Your account has been created successfully. Please check your email for verification.",
          type: "success",
        }

      case "signin":
        return {
          title: "Welcome Back!",
          message: "You have been signed in successfully.",
          type: "success",
        }

      case "verification":
        return {
          title: "Email Verified!",
          message: "Your email has been verified successfully. Welcome to TaskMgmt!",
          type: "success",
        }

      case "reset_code_sent":
        return {
          title: "Reset Code Sent!",
          message: "A new verification code has been sent to your email.",
          type: "success",
        }

      default:
        return {
          title: "Success!",
          message: "Operation completed successfully.",
          type: "success",
        }
    }
  }
}
