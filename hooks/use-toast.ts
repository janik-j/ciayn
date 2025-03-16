"use client"

import { toast as sonnerToast } from "sonner"

interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "destructive"
  action?: React.ReactNode
}

export function toast({ title, description, variant, action }: ToastProps) {
  const options: any = {
    description: description,
    // Map variant to sonner's style
    style: variant === "destructive" ? { backgroundColor: "var(--destructive)", color: "var(--destructive-foreground)" } : {},
    action: action
  }

  return sonnerToast[variant === "destructive" ? "error" : "message"](title, options)
}

export function useToast() {
  return {
    toast,
    dismiss: sonnerToast.dismiss
  }
}
