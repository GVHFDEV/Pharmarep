"use client"

import { useState, useEffect } from "react"
import { Modal } from "./Modal"
import { BottomSheet } from "./BottomSheet"

interface ResponsiveModalProps {
  open: boolean
  onClose: () => void
  title: string
  size?: "sm" | "md" | "lg"
  scrollable?: boolean
  children: React.ReactNode
}

/**
 * Renders Modal on lg+ screens, BottomSheet on smaller screens.
 * Uses client-side media query — only renders after mount (no SSR output).
 */
export function ResponsiveModal({ open, onClose, title, size = "md", scrollable = false, children }: ResponsiveModalProps) {
  const [isDesktop, setIsDesktop] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const mql = window.matchMedia("(min-width: 1024px)")
    setIsDesktop(mql.matches)

    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [])

  // Before mount: render nothing. Since `open` starts false in all usages,
  // server and client both render null — no hydration mismatch.
  if (!mounted || !open) return null

  if (isDesktop) {
    return <Modal open={open} onClose={onClose} title={title} size={size} scrollable={scrollable}>{children}</Modal>
  }

  return <BottomSheet open={open} onClose={onClose} title={title}>{children}</BottomSheet>
}
