"use client";

import { useSearchParams } from "next/navigation";
import { AlertTriangle, Clock, XCircle, ShieldOff } from "lucide-react";
import { cn } from "@/lib/utils";

type BannerVariant = "expired" | "pending" | "none" | "unverified";

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
};

export function LicenseBanner() {
  const searchParams = useSearchParams();
  const licenseParam = searchParams.get("license") as BannerVariant | null;

  if (!licenseParam || !BANNER_CONFIG[licenseParam]) return null;

  const config = BANNER_CONFIG[licenseParam];

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
