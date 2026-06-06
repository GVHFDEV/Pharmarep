"use client"

import { cn } from "@/lib/utils/cn"

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-border/50",
        className
      )}
      aria-hidden="true"
    />
  )
}

export function SkeletonText({ className }: SkeletonProps) {
  return (
    <Skeleton className={cn("h-4 w-full", className)} />
  )
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <Skeleton className={cn("h-32 w-full rounded-lg", className)} />
  )
}

export function SkeletonCircle({ className }: SkeletonProps) {
  return (
    <Skeleton className={cn("h-10 w-10 rounded-full", className)} />
  )
}
