import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressBarProps {
  value: number
  className?: string
  animated?: boolean
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  value, 
  className, 
  animated = true 
}) => {
  return (
    <div className={cn("progress-bar", className)}>
      <div 
        className={cn(
          "progress-bar-inner",
          animated && "transition-all duration-1000 ease-in-out"
        )}
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  )
}
