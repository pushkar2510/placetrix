// app/(dashboard)/(licensed)/opportunities/[opportunityId]/CandidateOpportunityDetailClient.tsx
"use client"

import { useState, useTransition, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { 
  Briefcase, MapPin, IndianRupee, Calendar, CheckCircle2, 
  XCircle, FileText, ChevronRight, Upload, Info, Loader2, Building2,
  Clock, ArrowLeft
} from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { buildStorageUrl } from "@/lib/storage"
import { applyToOpportunityAction } from "../actions"
import type { CandidateOpportunityListItem } from "../types"

interface CandidateOpportunityDetailClientProps {
  opp: CandidateOpportunityListItem
  candidateAcademic: {
    cgpa: number | null
  }
  profileId: string
}

function PageHeader({ opp, companyName }: { opp: CandidateOpportunityListItem; companyName: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="uppercase text-[10px] tracking-wide">
          {opp.compensation_type.replace("_", " ")}
        </Badge>
        {opp.my_application_id && (
          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 text-[10px] uppercase">
            Applied
          </Badge>
        )}
      </div>
      <h1 className="text-3xl font-bold font-cirka tracking-tight text-foreground mt-1">
        {opp.title}
      </h1>
      <p className="text-sm text-muted-foreground">
        Published by {companyName} • {opp.job_role}
      </p>
    </div>
  )
}

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border bg-muted/20 p-3.5">
      <span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  )
}

export function CandidateOpportunityDetailClient({
  opp,
  candidateAcademic,
  profileId
}: CandidateOpportunityDetailClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [supabase] = useState(() => createClient())

  const [isApplyOpen, setIsApplyOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const deadlineDate = new Date(opp.deadline)
  const isExpired = deadlineDate < new Date()
  const companyName = opp.company?.name || "Unknown Company"

  const cgpaOk = !opp.min_cgpa || (candidateAcademic.cgpa != null && candidateAcademic.cgpa >= opp.min_cgpa)
  const isEligible = !!cgpaOk

  // Helper to format compensation string
  function formatCompensation() {
    if (opp.compensation_type === "full_time" && opp.ctc_lpa) return `${opp.ctc_lpa} LPA`
    if (opp.compensation_type === "internship" && opp.stipend_monthly) return `₹${opp.stipend_monthly.toLocaleString()}/mo`
    if (opp.compensation_type === "stipend_with_ppo" && opp.stipend_monthly) return `₹${opp.stipend_monthly.toLocaleString()}/mo + PPO`
    if (opp.compensation_type === "freelance" && opp.ctc_lpa) return `${opp.ctc_lpa} LPA`
    return "Unpaid / Disclosed later"
  }

  // Handle Apply Submission (File Upload + database insertion)
  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      toast.error("Please upload a resume file.")
      return
    }

    setUploading(true)
    try {
      const fileExt = selectedFile.name.split(".").pop()
      const fileName = `${Date.now()}_resume.${fileExt}`
      const filePath = `${profileId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: true
        })

      if (uploadError) {
        throw new Error(uploadError.message || "Failed to upload resume file.")
      }

      const finalResumeUrl = buildStorageUrl("resumes", filePath)
      if (!finalResumeUrl) {
        throw new Error("Failed to resolve uploaded resume URL.")
      }

      startTransition(async () => {
        try {
          const res = await applyToOpportunityAction(opp.id, finalResumeUrl)
          if (res.success) {
            toast.success("Applied successfully!")
            setIsApplyOpen(false)
            setSelectedFile(null)
            router.refresh()
          }
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Failed to submit application.")
        }
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload resume.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-8 md:px-8 w-full animate-in fade-in duration-500">
      {/* Back Button */}
      <div>
        <Button variant="ghost" asChild className="gap-1.5 -ml-3">
          <Link href="/opportunities">
            <ArrowLeft className="h-4 w-4" /> Back to Opportunities
          </Link>
        </Button>
      </div>

      {/* Page Header */}
      <PageHeader opp={opp} companyName={companyName} />

      {/* Meta Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 mt-2">
        <MetaItem 
          icon={<MapPin className="h-4 w-4" />} 
          label="Location" 
          value={opp.location || "Remote"} 
        />
        <MetaItem 
          icon={<IndianRupee className="h-4 w-4" />} 
          label="Package Details" 
          value={formatCompensation()} 
        />
        <MetaItem 
          icon={<Building2 className="h-4 w-4" />} 
          label="Service Agreement / Bond" 
          value={opp.bond_details || "None"} 
        />
        <MetaItem 
          icon={<Calendar className="h-4 w-4" />} 
          label="Apply Before" 
          value={new Date(opp.deadline).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short"
          })} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start mt-2">
        {/* Job Details Section */}
        <div className="md:col-span-2 space-y-6">
          <Card className="rounded-xl overflow-hidden border">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-base font-semibold">Job Description & Details</h3>
              <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed min-h-[120px]">
                {opp.job_description || "No description provided."}
              </p>
            </CardContent>
          </Card>

          {/* Company Profile (if present) */}
          {opp.company && (
            <Card className="rounded-xl overflow-hidden border">
              <CardContent className="p-5 space-y-3">
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" /> About {opp.company.name}
                </h3>
                {opp.company.website && (
                  <a 
                    href={opp.company.website} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-xs text-primary hover:underline font-medium block mt-1"
                  >
                    Visit Company Website
                  </a>
                )}
                <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                  {opp.company.description || "No company description provided."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Apply & Eligibility widgets (Right column) */}
        <div className="space-y-6">
          {/* Eligibility Screening widget */}
          <Card className="rounded-xl overflow-hidden border">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" /> Eligibility Status
              </h3>
              
              <div className="space-y-3 text-xs">
                <div className="flex items-start justify-between gap-3 bg-muted/20 p-3 rounded-lg">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">CGPA Requirement</p>
                    <p className="font-semibold text-foreground">
                      {opp.min_cgpa > 0 ? `${opp.min_cgpa} or above` : "None"}
                    </p>
                  </div>
                  {isEligible ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-0.5 text-xs"><CheckCircle2 className="h-4 w-4" /> Ok</span>
                  ) : (
                    <span className="text-red-500 font-semibold flex items-center gap-0.5 text-xs"><XCircle className="h-4 w-4" /> Ineligible</span>
                  )}
                </div>

                <div className="bg-muted/10 p-3 rounded-lg">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Your Current CGPA</p>
                  <p className="text-base font-bold text-foreground mt-0.5">
                    {candidateAcademic.cgpa != null ? candidateAcademic.cgpa.toFixed(2) : "N/A"}
                  </p>
                </div>
              </div>

              <div className="pt-2 text-center border-t">
                {isEligible ? (
                  <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Meets eligibility criteria
                  </p>
                ) : (
                  <p className="text-red-500 dark:text-red-400 font-semibold text-xs flex items-center justify-center gap-1.5">
                    <XCircle className="h-4 w-4" /> Does not meet CGPA limit
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action widgets */}
          <Card className="rounded-xl overflow-hidden border">
            <CardContent className="p-5 space-y-4">
              {opp.my_application_id ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border rounded-lg p-3 bg-emerald-500/5 text-xs">
                    <span className="font-medium text-muted-foreground">Status:</span>
                    <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 font-bold border text-[11px] px-2 py-0.5">
                      {opp.my_application_status === "Offered" ? "Offered (Placed)" : opp.my_application_status}
                    </Badge>
                  </div>
                  <a 
                    href={opp.my_application_resume_url || "#"} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full block"
                  >
                    <Button className="w-full gap-2" variant="outline">
                      <FileText className="h-4 w-4" /> View Submitted Resume
                    </Button>
                  </a>
                </div>
              ) : opp.application_link ? (
                <a 
                  href={opp.application_link} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full"
                >
                  <Button className="w-full gap-1.5" disabled={!isEligible || isExpired}>
                    Apply Externally <ChevronRight className="h-4 w-4" />
                  </Button>
                </a>
              ) : (
                <Button 
                  onClick={() => setIsApplyOpen(true)}
                  className="w-full gap-1.5" 
                  disabled={!isEligible || isExpired}
                >
                  {isExpired ? "Application Closed" : "Apply for Job"} <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog: PDF Resume Uploader */}
      <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
        <DialogContent className="w-full sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Apply for Opportunity</DialogTitle>
            <DialogDescription>
              Upload your resume as a PDF file to submit your application.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleApplySubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="resume">Resume PDF File *</Label>
              <div className="border border-dashed rounded-lg p-6 text-center hover:bg-muted/10 cursor-pointer relative group transition-colors">
                <input 
                  type="file" 
                  id="resume"
                  accept=".pdf"
                  required
                  disabled={uploading || isPending}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      if (file.type !== "application/pdf") {
                        toast.error("Please select a PDF file.")
                        setSelectedFile(null)
                      } else {
                        setSelectedFile(file)
                      }
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="h-8 w-8 text-muted-foreground/60 mx-auto mb-2 group-hover:text-primary transition-colors" />
                <p className="text-xs font-semibold text-foreground">
                  {selectedFile ? selectedFile.name : "Click to select PDF resume"}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : "Only PDF file format is allowed."}
                </p>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsApplyOpen(false)}
                disabled={uploading || isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={uploading || isPending || !selectedFile}>
                {uploading || isPending ? (
                  <span className="flex items-center gap-1.5"><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</span>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
