// components/ui/mfa-two-factor.tsx
//
// Shared component that handles TOTP MFA management in Settings pages.
//
// States:
//   loading     → fetching factor list on mount
//   idle        → no factor enrolled; shows "Enable 2FA" button
//   enrolling   → enrollment dialog open (QR code + verify code input)
//   enrolled    → factor active; shows badge + "Remove" button
//
// Uses the Supabase default TOTP MFA APIs:
//   mfa.enroll()    → start enrollment, get QR code
//   mfa.challenge() → create challenge ID
//   mfa.verify()    → confirm the 6-digit TOTP code
//   mfa.unenroll()  → remove the factor
//   mfa.listFactors() → check current enrollment status
"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { OTPInput } from "@/components/ui/otp-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  ShieldCheck,
  ShieldOff,
  ShieldPlus,
  Smartphone,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type MfaState = "loading" | "idle" | "enrolling" | "enrolled";

interface TotpFactor {
  id: string;
  friendly_name?: string;
  status: "verified" | "unverified";
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MfaTwoFactor() {
  const supabase = createClient();

  const [mfaState, setMfaState] = useState<MfaState>("loading");
  const [enrolledFactor, setEnrolledFactor] = useState<TotpFactor | null>(null);

  // Enrollment flow state
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [qrCode, setQrCode] = useState(""); // SVG data URI
  const [secret, setSecret] = useState(""); // fallback manual secret
  const [factorId, setFactorId] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  // ─── Load factor status ────────────────────────────────────────────────────

  const loadFactors = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;

      // Only consider 'verified' TOTP factors as active
      const verified = data.totp.find((f) => f.status === "verified");
      if (verified) {
        setEnrolledFactor(verified as TotpFactor);
        setMfaState("enrolled");
      } else {
        setEnrolledFactor(null);
        setMfaState("idle");
      }
    } catch {
      setMfaState("idle");
    }
  }, [supabase]);

  useEffect(() => {
    loadFactors();
  }, [loadFactors]);

  // ─── Enrollment ───────────────────────────────────────────────────────────

  const handleStartEnroll = async () => {
    setVerifyCode("");
    setVerifyError(null);
    setShowSecret(false);

    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Authenticator App",
      });
      if (error) throw error;

      setFactorId(data.id);
      // Supabase returns QR code as SVG — convert to a data URI for <img>
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setMfaState("enrolling");
      setEnrollDialogOpen(true);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to start 2FA setup.");
    }
  };

  const handleVerify = async () => {
    if (verifyCode.length < 6) {
      setVerifyError("Please enter the full 6-digit code.");
      return;
    }
    setVerifyError(null);
    setIsVerifying(true);

    try {
      // Step 1: create a challenge
      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) throw challengeError;

      // Step 2: verify the TOTP code
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verifyCode,
      });
      if (verifyError) throw verifyError;

      // Success — factor is now verified/active
      toast.success("Two-factor authentication enabled!");
      setEnrollDialogOpen(false);
      setVerifyCode("");
      await loadFactors();
    } catch (err: any) {
      const msg = err.message ?? "Invalid code. Please try again.";
      setVerifyError(msg);
      setVerifyCode("");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCancelEnroll = async () => {
    // Clean up the pending (unverified) factor to avoid orphaned entries
    if (factorId) {
      try {
        await supabase.auth.mfa.unenroll({ factorId });
      } catch {
        // Ignore — cleanup is best-effort
      }
    }
    setEnrollDialogOpen(false);
    setVerifyCode("");
    setVerifyError(null);
    await loadFactors();
  };

  // ─── Unenrollment ─────────────────────────────────────────────────────────

  const handleUnenroll = async () => {
    if (!enrolledFactor) return;

    try {
      const { error } = await supabase.auth.mfa.unenroll({
        factorId: enrolledFactor.id,
      });
      if (error) throw error;

      // Refresh session to immediately downgrade AAL from aal2 → aal1
      await supabase.auth.refreshSession();

      toast.success("Two-factor authentication removed.");
      await loadFactors();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to remove 2FA.");
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (mfaState === "loading") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading 2FA status…</span>
      </div>
    );
  }

  return (
    <>
      {/* ── Status row ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm">
              {mfaState === "enrolled"
                ? "Two-factor authentication is active"
                : "Enable two-factor authentication"}
            </p>
            {mfaState === "enrolled" && (
              <Badge className="h-4.5 px-1.5 text-[10px] rounded-sm bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0 font-medium">
                <ShieldCheck className="h-2.5 w-2.5 mr-0.5" />
                Active
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {mfaState === "enrolled"
              ? "A verification code from your authenticator app is required each time you sign in."
              : "Protect your account with an authenticator app (Google Authenticator, Authy, etc.)."}
          </p>
        </div>

        {mfaState === "enrolled" ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="shrink-0 gap-1.5 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5">
                <ShieldOff className="h-3.5 w-3.5" />
                Remove 2FA
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove two-factor authentication?</AlertDialogTitle>
                <AlertDialogDescription>
                  Your account will only be protected by your password after this.
                  You can re-enable 2FA at any time from Settings.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleUnenroll}
                >
                  Remove 2FA
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button
            size="sm"
            className="shrink-0 gap-1.5"
            onClick={handleStartEnroll}
          >
            <ShieldPlus className="h-3.5 w-3.5" />
            Enable 2FA
          </Button>
        )}
      </div>

      {/* ── Enrollment Dialog ──────────────────────────────────────────────── */}
      <Dialog
        open={enrollDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleCancelEnroll();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <Smartphone className="h-4 w-4 text-primary" />
              </div>
              Set up authenticator app
            </DialogTitle>
            <DialogDescription>
              Scan the QR code below with your authenticator app, then enter the
              6-digit code to confirm.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* QR Code */}
            {qrCode && (
              <div className="flex flex-col items-center gap-3">
                <div className="rounded-xl border bg-white p-3 shadow-sm">
                  {/* Supabase returns an SVG string — render as inline img via data URI */}
                  <img
                    src={qrCode}
                    alt="Scan this QR code with your authenticator app"
                    className="h-44 w-44 block"
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center max-w-xs">
                  Use{" "}
                  <span className="font-medium text-foreground">
                    Google Authenticator
                  </span>
                  ,{" "}
                  <span className="font-medium text-foreground">Authy</span>, or
                  any TOTP app to scan this code.
                </p>
              </div>
            )}

            {/* Manual secret toggle */}
            <div className="rounded-lg border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
              <button
                type="button"
                onClick={() => setShowSecret((v) => !v)}
                className="underline underline-offset-4 hover:text-foreground transition-colors"
              >
                {showSecret ? "Hide" : "Can't scan? Enter the code manually"}
              </button>
              {showSecret && (
                <p className="mt-2 font-mono text-foreground break-all select-all">
                  {secret}
                </p>
              )}
            </div>

            {/* Verify code input */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-center">
                Enter the 6-digit code from your app
              </p>
              <OTPInput
                length={6}
                value={verifyCode}
                onChange={(v) => {
                  setVerifyCode(v);
                  if (verifyError) setVerifyError(null);
                }}
                disabled={isVerifying}
              />
              {verifyError && (
                <p className="text-xs text-destructive text-center rounded-md bg-destructive/10 px-3 py-2">
                  {verifyError}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCancelEnroll}
                disabled={isVerifying}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleVerify}
                disabled={isVerifying || verifyCode.length < 6}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying…
                  </>
                ) : (
                  "Activate 2FA"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
