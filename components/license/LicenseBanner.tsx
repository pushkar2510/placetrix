"use client";

import { useLicense } from "@/components/license/LicenseProvider";
import { AlertTriangle, Clock, XCircle, ShieldOff, AlertCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type BannerVariant = "expired" | "pending" | "none" | "unverified" | "revoked" | "incomplete";

interface BannerConfig {
  icon: React.ReactNode;
  title: string;
  description: string;
  className: string;
}

const BANNER_CONFIG: Record<BannerVariant, BannerConfig> = {
  expired: {
    icon: <XCircle className="h-4 w-4 shrink-0 text-destructive" />,
    title: "License Expired",
    description:
      "Your college's Placetrix license has expired. Please contact Placetrix to renew access.",
    className:
      "border-destructive/20 bg-destructive/10 text-destructive dark:border-destructive/30 dark:bg-destructive/10",
  },
  pending: {
    icon: <Clock className="h-4 w-4 shrink-0 text-warning" />,
    title: "License Pending",
    description:
      "Your college's Placetrix license is pending activation. Contact your Placetrix representative to get started.",
    className:
      "border-warning/20 bg-warning/10 text-warning dark:border-warning/30 dark:bg-warning/10",
  },
  none: {
    icon: <ShieldOff className="h-4 w-4 shrink-0 text-warning" />,
    title: "No License",
    description:
      "Your college does not have an active Placetrix license. Contact Placetrix to get set up.",
    className:
      "border-warning/20 bg-warning/10 text-warning dark:border-warning/30 dark:bg-warning/10",
  },
  unverified: {
    icon: <AlertTriangle className="h-4 w-4 shrink-0 text-info" />,
    title: "Approval Pending",
    description:
      "Your account is pending approval by your college TPO. You'll get full access once approved.",
    className:
      "border-info/20 bg-info/10 text-info dark:border-info/30 dark:bg-info/10",
  },
  revoked: {
    icon: <XCircle className="h-4 w-4 shrink-0 text-destructive" />,
    title: "License Revoked",
    description:
      "Your college's Placetrix license has been manually suspended or revoked. Please contact support.",
    className:
      "border-destructive/20 bg-destructive/10 text-destructive dark:border-destructive/30 dark:bg-destructive/10",
  },
  incomplete: {
    icon: <AlertCircle className="h-5 w-5 shrink-0 animate-pulse text-warning" />,
    title: "Your profile is incomplete!",
    description:
      "Please complete your profile to unlock custom placements, track mock tests, and get verified by your institution.",
    className:
      "border-warning/20 bg-warning/10 text-warning dark:border-warning/30 dark:bg-warning/10",
  },
};

export function LicenseBanner() {
  const { license, user, isAdmin } = useLicense();

  if (isAdmin) return null;

  let variant: BannerVariant | null = null;

  const isProfileComplete = user?.account_type === "institute_candidate"
    ? (user?.profile_complete === true && user?.profile_updated === true)
    : true;

  // 1. Incomplete Profile Check (takes highest priority)
  if (user?.account_type === "institute_candidate" && !isProfileComplete) {
    variant = "incomplete";
  }
  // 2. License Check
  else if (!license || license.status !== "active") {
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
  // 3. Student Verification Check (only if license is active and profile is complete)
  else if (user?.account_type === "institute_candidate" && user?.institute_verified !== true) {
    variant = "unverified";
  }

  if (!variant || !BANNER_CONFIG[variant]) return null;

  const config = BANNER_CONFIG[variant];

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border p-3.5 text-sm",
        config.className
      )}
    >
      <div className="flex items-start gap-3 min-w-0">
        {config.icon}
        <div className="min-w-0">
          <p className="font-semibold leading-none">{config.title}</p>
          <p className="mt-1 text-xs opacity-80 leading-relaxed">{config.description}</p>
        </div>
      </div>
      {variant === "incomplete" && (
        <Button asChild size="sm" className="bg-warning hover:bg-warning/90 text-warning-foreground rounded-full font-semibold px-5 shrink-0 shadow-xs shadow-warning/10 self-start sm:self-center">
          <Link href="/myprofile" className="flex items-center gap-1.5 text-xs">
            Complete Profile
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </Link>
        </Button>
      )}
    </div>
  );
}
