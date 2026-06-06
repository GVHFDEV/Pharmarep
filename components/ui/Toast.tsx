"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils/cn"

type ToastVariant = "success" | "error" | "warning"

interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  toast: {
    success: (msg: string) => void
    error: (msg: string) => void
    warning: (msg: string) => void
  }
}

const ToastContext = createContext<ToastContextValue | null>(null)

const variantStyles: Record<ToastVariant, string> = {
  success: "bg-success-light border-success-border text-success",
  error: "bg-danger-light border-danger-border text-danger",
  warning: "bg-warning-light border-warning-border text-warning",
}

function ToastNotification({
  item,
  onClose,
}: {
  item: ToastItem
  onClose: (id: string) => void
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg shadow-md border",
        variantStyles[item.variant]
      )}
      role="alert"
    >
      <span className="flex-1 text-sm font-medium">{item.message}</span>
      <button
        onClick={() => onClose(item.id)}
        className="p-0.5 rounded hover:opacity-70 transition-opacity"
        aria-label="Fechar notificação"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    (message: string, variant: ToastVariant) => {
      const id = crypto.randomUUID()
      setToasts((prev) => [...prev, { id, message, variant }])

      setTimeout(() => {
        removeToast(id)
      }, 3000)
    },
    [removeToast]
  )

  const toast = {
    success: (msg: string) => addToast(msg, "success"),
    error: (msg: string) => addToast(msg, "error"),
    warning: (msg: string) => addToast(msg, "warning"),
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((item) => (
          <div key={item.id} className="pointer-events-auto animate-[slideIn_0.2s_ease-out]">
            <ToastNotification item={item} onClose={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
