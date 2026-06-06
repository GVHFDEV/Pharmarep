"use client"

import { useState, useEffect } from "react"
import { Modal } from "./Modal"
import { BottomSheet } from "./BottomSheet"

interface ResponsiveModalProps {
  open: boolean
  onClose: () => void
  title: string
  size?: "sm" | "md" | "lg" | "xl"
  scrollable?: boolean
  children: React.ReactNode
}

/**
 * Renders Modal on tablet+ (md/768px+), BottomSheet on phone only.
 * On tablet (md–xl), uses "lg" size for wider modals.
 * On desktop (xl+), uses the provided size prop.
 */
export function ResponsiveModal({ open, onClose, title, size = "md", scrollable = false, children }: ResponsiveModalProps) {
  const [screenType, setScreenType] = useState<"phone" | "tablet" | "desktop">("phone")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    function detect() {
      const w = window.innerWidth
      if (w >= 1280) setScreenType("desktop")
      else if (w >= 768) setScreenType("tablet")
      else setScreenType("phone")
    }
    detect()
    window.addEventListener("resize", detect)
    return () => window.removeEventListener("resize", detect)
  }, [])

  if (!mounted || !open) return null

  // Phone: bottom sheet
  if (screenType === "phone") {
    return <BottomSheet open={open} onClose={onClose} title={title}>{children}</BottomSheet>
  }

  // Tablet: modal with max width
  if (screenType === "tablet") {
    return <Modal open={open} onClose={onClose} title={title} size="xl" scrollable={scrollable}>{children}</Modal>
  }

  // Desktop: modal with original size
  return <Modal open={open} onClose={onClose} title={title} size={size} scrollable={scrollable}>{children}</Modal>
}
