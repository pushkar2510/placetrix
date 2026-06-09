"use client"

import React from "react"
import { buildStorageUrl } from "@/lib/storage"
import { cn } from "@/lib/utils"

interface CourseCoverProps {
  coverImagePath?: string | null
  title: string
  className?: string
}

export function CourseCover({ coverImagePath, title, className }: CourseCoverProps) {
  const imageUrl = coverImagePath ? buildStorageUrl("course-covers", coverImagePath) : null

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={title}
        className={cn("w-full h-full object-cover", className)}
      />
    )
  }

  // Determine the cover style dynamically based on course title keywords
  const titleLower = title.toLowerCase()
  let theme: "cs" | "web" | "interview" | "system" = "system"

  if (
    titleLower.includes("react") ||
    titleLower.includes("next") ||
    titleLower.includes("web") ||
    titleLower.includes("frontend") ||
    titleLower.includes("backend") ||
    titleLower.includes("programming") ||
    titleLower.includes("python") ||
    titleLower.includes("code") ||
    titleLower.includes("javascript") ||
    titleLower.includes("js") ||
    titleLower.includes("ts")
  ) {
    theme = "web"
  } else if (
    titleLower.includes("algo") ||
    titleLower.includes("ds") ||
    titleLower.includes("structure") ||
    titleLower.includes("tree") ||
    titleLower.includes("graph") ||
    titleLower.includes("binary") ||
    titleLower.includes("complexity")
  ) {
    theme = "cs"
  } else if (
    titleLower.includes("interview") ||
    titleLower.includes("soft") ||
    titleLower.includes("behavioral") ||
    titleLower.includes("resume") ||
    titleLower.includes("career") ||
    titleLower.includes("communication")
  ) {
    theme = "interview"
  }

  // Clean the title to use as a background graphic text
  const cleanBgText = title.split(/[:—(]/)[0].trim().toUpperCase()

  // All SVGs use preserveAspectRatio="xMidYMid slice" so they fill their
  // container the same way object-cover does for <img> elements.
  const svgProps = {
    className: cn("absolute inset-0 w-full h-full", className),
    viewBox: "0 0 320 180",
    fill: "none" as const,
    xmlns: "http://www.w3.org/2000/svg",
    preserveAspectRatio: "xMidYMid slice" as const,
  }

  const svgContent = (() => {
    switch (theme) {
      case "cs":
        return (
          <svg {...svgProps}>
            <rect width="100%" height="100%" fill="url(#bg-algo-sh)" />
            <defs>
              <linearGradient id="bg-algo-sh" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0b0f19" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
            </defs>
            <g opacity="0.1">
              <path d="M0 20 H320 M0 60 H320 M0 100 H320 M0 140 H320 M40 0 V180 M120 0 V180 M200 0 V180 M280 0 V180" stroke="#818cf8" strokeWidth="0.5" />
            </g>
            <circle cx="160" cy="50" r="10" fill="#6366f1" opacity="0.8" />
            <circle cx="100" cy="100" r="8" fill="#818cf8" opacity="0.8" />
            <circle cx="220" cy="100" r="8" fill="#818cf8" opacity="0.8" />
            <circle cx="60" cy="150" r="6" fill="#a5b4fc" opacity="0.8" />
            <circle cx="140" cy="150" r="6" fill="#a5b4fc" opacity="0.8" />
            <circle cx="180" cy="150" r="6" fill="#a5b4fc" opacity="0.8" />
            <circle cx="260" cy="150" r="6" fill="#a5b4fc" opacity="0.8" />
            <path d="M160 60 L100 92 M160 60 L220 92 M100 108 L60 144 M100 108 L140 144 M220 108 L180 144 M220 108 L260 144" stroke="#818cf8" strokeWidth="1.5" opacity="0.5" />
            <text x="160" y="105" fill="#ffffff" opacity="0.06" fontSize="20" fontWeight="bold" textAnchor="middle" letterSpacing="1.5">{cleanBgText}</text>
          </svg>
        )

      case "web":
        return (
          <svg {...svgProps}>
            <rect width="100%" height="100%" fill="url(#bg-next-sh)" />
            <defs>
              <linearGradient id="bg-next-sh" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0b0f19" />
                <stop offset="100%" stopColor="#064e3b" />
              </linearGradient>
            </defs>
            <g opacity="0.15">
              <path d="M0 40 L320 140 M0 140 L320 40" stroke="#059669" strokeWidth="0.5" />
              <circle cx="80" cy="40" r="20" stroke="#059669" strokeWidth="0.5" />
              <circle cx="240" cy="140" r="20" stroke="#059669" strokeWidth="0.5" />
            </g>
            <path d="M40 90 L280 90 M160 30 L160 150" stroke="#059669" strokeWidth="1.5" opacity="0.3" />
            <circle cx="160" cy="90" r="25" stroke="#34d399" strokeWidth="1.8" fill="#047857" fillOpacity="0.2" />
            <rect x="75" y="60" width="30" height="15" rx="2" fill="#047857" stroke="#10b981" strokeWidth="1" />
            <rect x="215" y="60" width="30" height="15" rx="2" fill="#047857" stroke="#10b981" strokeWidth="1" />
            <rect x="75" y="105" width="30" height="15" rx="2" fill="#047857" stroke="#10b981" strokeWidth="1" />
            <rect x="215" y="105" width="30" height="15" rx="2" fill="#047857" stroke="#10b981" strokeWidth="1" />
            <text x="160" y="95" fill="#ffffff" opacity="0.06" fontSize="18" fontWeight="bold" textAnchor="middle" letterSpacing="1">{cleanBgText}</text>
          </svg>
        )

      case "interview":
        return (
          <svg {...svgProps}>
            <rect width="100%" height="100%" fill="url(#bg-inter-sh)" />
            <defs>
              <linearGradient id="bg-inter-sh" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0b0f19" />
                <stop offset="100%" stopColor="#7c2d12" />
              </linearGradient>
            </defs>
            <g opacity="0.1">
              <circle cx="160" cy="90" r="50" stroke="#d97706" strokeWidth="0.5" />
              <circle cx="160" cy="90" r="70" stroke="#d97706" strokeWidth="0.5" />
            </g>
            <circle cx="120" cy="90" r="22" stroke="#d97706" strokeWidth="1.5" fill="#b45309" opacity="0.2" />
            <circle cx="200" cy="90" r="26" stroke="#f59e0b" strokeWidth="1.5" fill="#d97706" opacity="0.2" />
            <path d="M140 82 Q160 72 180 82" stroke="#f59e0b" strokeWidth="1.5" fill="none" />
            <path d="M140 98 Q160 108 180 98" stroke="#f59e0b" strokeWidth="1.5" fill="none" />
            <text x="160" y="95" fill="#ffffff" opacity="0.06" fontSize="20" fontWeight="bold" textAnchor="middle" letterSpacing="1.5">{cleanBgText}</text>
          </svg>
        )

      case "system":
      default:
        return (
          <svg {...svgProps}>
            <rect width="100%" height="100%" fill="url(#bg-sys-sh)" />
            <defs>
              <linearGradient id="bg-sys-sh" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0b0f19" />
                <stop offset="100%" stopColor="#581c87" />
              </linearGradient>
            </defs>
            <g opacity="0.15">
              <path d="M0 0 L320 180 M0 180 L320 0" stroke="#a855f7" strokeWidth="0.5" />
            </g>
            <rect x="35" y="70" width="45" height="35" rx="3" fill="#6b21a8" stroke="#a855f7" strokeWidth="1" opacity="0.8" />
            <rect x="135" y="40" width="45" height="35" rx="3" fill="#6b21a8" stroke="#a855f7" strokeWidth="1" opacity="0.8" />
            <rect x="135" y="100" width="45" height="35" rx="3" fill="#6b21a8" stroke="#a855f7" strokeWidth="1" opacity="0.8" />
            <rect x="240" y="70" width="45" height="35" rx="3" fill="#6b21a8" stroke="#a855f7" strokeWidth="1" opacity="0.8" />
            <path d="M80 88 L135 58 M80 88 L135 118 M180 58 L240 88 M180 118 L240 88" stroke="#d8b4fe" strokeWidth="1.5" opacity="0.4" />
            <text x="160" y="95" fill="#ffffff" opacity="0.06" fontSize="18" fontWeight="bold" textAnchor="middle" letterSpacing="1">{cleanBgText}</text>
          </svg>
        )
    }
  })()

  // Wrap in a relative container so the absolutely-positioned SVG fills it
  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      {svgContent}
    </div>
  )
}
