"use client"

import * as React from "react"
import { ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"

interface CartBadgeProps {
  count: number
  className?: string
  onClick?: () => void
  size?: "sm" | "md" | "lg"
  variant?: "default" | "emerald" | "red" | "blue"
}

export function CartBadge({ 
  count, 
  className, 
  onClick, 
  size = "md",
  variant = "emerald" 
}: CartBadgeProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10", 
    lg: "h-12 w-12"
  }

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  }

  const badgeVariants = {
    default: "bg-slate-600 text-white",
    emerald: "bg-emerald-500 text-white",
    red: "bg-red-500 text-white", 
    blue: "bg-blue-500 text-white"
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center justify-center rounded-full border-2 border-white shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2",
        sizeClasses[size],
        "bg-slate-800 hover:bg-slate-700",
        className
      )}
      aria-label={`Shopping cart with ${count} items`}
    >
      {/* Cart Icon */}
      <ShoppingCart className={cn("text-white", iconSizes[size])} />
      
      {/* Badge */}
      {count > 0 && (
        <span
          className={cn(
            "absolute -top-2 -right-2 inline-flex items-center justify-center rounded-full text-xs font-bold shadow-lg border-2 border-white min-w-[20px] h-5 px-1",
            badgeVariants[variant]
          )}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  )
}

// Alternative version with more Material-UI-like styling
export function MaterialStyleCartBadge({ 
  count, 
  className, 
  onClick, 
  size = "md",
  variant = "emerald" 
}: CartBadgeProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10", 
    lg: "h-12 w-12"
  }

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  }

  const badgeVariants = {
    default: "bg-slate-600 text-white",
    emerald: "bg-emerald-500 text-white",
    red: "bg-red-500 text-white", 
    blue: "bg-blue-500 text-white"
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={onClick}
        className={cn(
          "inline-flex items-center justify-center rounded-full transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2",
          sizeClasses[size],
          "bg-slate-100 hover:bg-slate-200 text-slate-700",
          className
        )}
        aria-label={`Shopping cart with ${count} items`}
      >
        <ShoppingCart className={cn(iconSizes[size])} />
      </button>
      
      {/* Badge positioned like Material-UI */}
      {count > 0 && (
        <span
          className={cn(
            "absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full text-xs font-bold min-w-[18px] h-[18px] px-1",
            "border-2 border-white shadow-sm",
            badgeVariants[variant]
          )}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </div>
  )
}

// Premium floating cart badge (like your existing mobile cart)
export function PremiumCartBadge({ 
  count, 
  className, 
  onClick, 
  size = "md",
  variant = "emerald" 
}: CartBadgeProps) {
  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-16 w-16", 
    lg: "h-20 w-20"
  }

  const iconSizes = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  }

  const badgeVariants = {
    default: "bg-slate-600 text-white",
    emerald: "bg-emerald-500 text-white",
    red: "bg-red-500 text-white", 
    blue: "bg-blue-500 text-white"
  }

  return (
    <div className="relative">
      {/* Outer glow effect */}
      <div className={cn(
        "absolute inset-0 rounded-full blur-lg opacity-60 animate-pulse",
        variant === "emerald" && "bg-gradient-to-r from-emerald-400 to-emerald-500",
        variant === "red" && "bg-gradient-to-r from-red-400 to-red-500",
        variant === "blue" && "bg-gradient-to-r from-blue-400 to-blue-500",
        variant === "default" && "bg-gradient-to-r from-slate-400 to-slate-500"
      )}></div>
      
      {/* Main button */}
      <button 
        className={cn(
          "relative rounded-full shadow-2xl transition-all duration-300 hover:scale-110 border-2 border-white/20 backdrop-blur-sm cursor-pointer flex items-center justify-center",
          sizeClasses[size],
          "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 hover:from-slate-600 hover:via-slate-700 hover:to-slate-800",
          className
        )}
        onClick={onClick}
        aria-label={`Shopping cart with ${count} items`}
      >
        {/* Inner shine effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent"></div>
        
        {/* Cart icon with premium styling */}
        <div className="relative z-10">
          <ShoppingCart className={cn("text-white drop-shadow-lg", iconSizes[size])} />
        </div>
        
        {/* Premium quantity badge */}
        {count > 0 && (
          <div className="absolute -top-1 -right-1 z-20">
            <div className="relative">
              {/* Badge glow */}
              <div className={cn(
                "absolute inset-0 rounded-full blur-sm opacity-80",
                variant === "emerald" && "bg-gradient-to-r from-emerald-400 to-emerald-500",
                variant === "red" && "bg-gradient-to-r from-red-400 to-red-500",
                variant === "blue" && "bg-gradient-to-r from-blue-400 to-blue-500",
                variant === "default" && "bg-gradient-to-r from-slate-400 to-slate-500"
              )}></div>
              
              {/* Badge content */}
              <div className={cn(
                "relative text-white text-xs font-bold rounded-full h-7 w-7 flex items-center justify-center border-2 border-white shadow-lg",
                badgeVariants[variant]
              )}>
                {count > 99 ? "99+" : count}
              </div>
            </div>
          </div>
        )}
        
        {/* Subtle animation ring */}
        <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping opacity-20"></div>
      </button>
    </div>
  )
}
