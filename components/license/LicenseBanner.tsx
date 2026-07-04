"use client";

import { useLicense } from "@/components/license/LicenseProvider";
import { AlertTriangle, Clock, XCircle, ShieldOff } from "lucide-react";
import { cn } from "@/lib/utils";

type BannerVariant = "expired" | "pending" | "none" | "unverified" | "revoked";

interface BannerConfig {
  icon: React.ReactNode;
  title: string;
  description: string;
  className: string;
}

const BANNER_CONFIG: Record<BannerVariant, BannerConfig> = {
  expired: {
    icon: <XCircle className="h-4 w-4 shrink-0" />,
    title: "License Expired",
    description:
      "Your college's Placetrix license has expired. Please contact Placetrix to renew access.",
    className:
      "border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300",
  },
  pending: {
    icon: <Clock className="h-4 w-4 shrink-0" />,
    title: "License Pending",
    description:
      "Your college's Placetrix license is pending activation. Contact your Placetrix representative to get started.",
    className:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300",
  },
  none: {
    icon: <ShieldOff className="h-4 w-4 shrink-0" />,
    title: "No License",
    description:
      "Your college does not have an active Placetrix license. Contact Placetrix to get set up.",
    className:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300",
  },
  unverified: {
    icon: <AlertTriangle className="h-4 w-4 shrink-0" />,
    title: "Approval Pending",
    description:
      "Your account is pending approval by your college TPO. You'll get full access once approved.",
    className:
      "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300",
  },
  revoked: {
    icon: <XCircle className="h-4 w-4 shrink-0" />,
    title: "License Revoked",
    description:
      "Your college's Placetrix license has been manually suspended or revoked. Please contact support.",
    className:
      "border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300",
  },
};

export function LicenseBanner() {
  const { license, user, isAdmin } = useLicense();

  if (isAdmin) return null;

  let variant: BannerVariant | null = null;

  // 1. License Check
  if (!license || license.status !== "active") {
    const status = license?.status ?? null;
    if (status === "expired") {
      variant = "expired";
    } else if (status === "revoked") {
      variant = "revoked";
    } else if (status === "pending") {
      variant = "pending";
    } else {
      variant = "none";
    }
  } 
  // 2. Student Verification Check (only if license is active)
  else if (user?.account_type === "candidate" && user?.institute_verified !== true) {
    variant = "unverified";
  }

  if (!variant || !BANNER_CONFIG[variant]) return null;

  const config = BANNER_CONFIG[variant];

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3.5 text-sm",
        config.className
      )}
    >
      {config.icon}
      <div className="min-w-0">
        <p className="font-semibold leading-none">{config.title}</p>
        <p className="mt-1 text-xs opacity-80">{config.description}</p>
      </div>
    </div>
  );
}
